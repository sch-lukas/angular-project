// Copyright (C) 2016 - present Juergen Zimmermann, Hochschule Karlsruhe
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

/**
 * Das Modul besteht aus der Klasse {@linkcode BuchService}.
 * @packageDocumentation
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import {
    BuchFile,
    Prisma,
    PrismaClient,
} from '../../generated/prisma/client.js';
import { type BuchInclude } from '../../generated/prisma/models/Buch.js';
import { getLogger } from '../../logger/logger.js';
import { type Pageable } from './pageable.js';
import { PrismaService } from './prisma-service.js';
import { type Slice } from './slice.js';
import { type Suchparameter, suchparameterNamen } from './suchparameter.js';
import { WhereBuilder } from './where-builder.js';

// Typdefinition für `findById`
type FindByIdParams = {
    // ID des gesuchten Buchs
    readonly id: number;
    /** Sollen die Abbildungen mitgeladen werden? */
    readonly mitAbbildungen?: boolean;
};

export type BuchMitTitel = Prisma.BuchGetPayload<{
    include: { titel: true };
}>;

export type BuchMitTitelUndAbbildungen = Prisma.BuchGetPayload<{
    include: {
        titel: true;
        abbildungen: true;
    };
}>;

/**
 * Die Klasse `BuchService` implementiert das Lesen für Bücher und greift
 * mit _Prisma_ auf eine relationale DB zu.
 */
@Injectable()
export class BuchService {
    static readonly ID_PATTERN = /^[1-9]\d{0,10}$/u;

    readonly #prisma: PrismaClient;
    readonly #whereBuilder: WhereBuilder;
    readonly #includeTitel: BuchInclude = { titel: true };
    readonly #includeTitelUndAbbildungen: BuchInclude = {
        titel: true,
        abbildungen: true,
    };

    readonly #logger = getLogger(BuchService.name);

    constructor(prisma: PrismaService, whereBuilder: WhereBuilder) {
        this.#prisma = prisma.client;
        this.#whereBuilder = whereBuilder;
    }

    // Rueckgabetyp Promise bei asynchronen Funktionen
    //    ab ES2015
    //    vergleiche Task<> bei C#
    // Status eines Promise:
    //    Pending: das Resultat ist noch nicht vorhanden, weil die asynchrone
    //             Operation noch nicht abgeschlossen ist
    //    Fulfilled: die asynchrone Operation ist abgeschlossen und
    //               das Promise-Objekt hat einen Wert
    //    Rejected: die asynchrone Operation ist fehlgeschlagen and das
    //              Promise-Objekt wird nicht den Status "fulfilled" erreichen.
    //              Im Promise-Objekt ist dann die Fehlerursache enthalten.

    /**
     * Ein Buch asynchron anhand seiner ID suchen
     * @param id ID des gesuchten Buches
     * @returns Das gefundene Buch in einem Promise aus ES2015.
     * @throws NotFoundException falls kein Buch mit der ID existiert
     */
    // https://2ality.com/2015/01/es6-destructuring.html#simulating-named-parameters-in-javascript
    async findById({
        id,
        mitAbbildungen,
    }: FindByIdParams): Promise<Readonly<BuchMitTitelUndAbbildungen>> {
        this.#logger.debug('findById: id=%d', id);

        // Das Resultat ist null, falls kein Datensatz gefunden
        // Lesen: Keine Transaktion erforderlich
        const include = mitAbbildungen
            ? this.#includeTitelUndAbbildungen
            : this.#includeTitel;
        const buch: BuchMitTitelUndAbbildungen | null =
            await this.#prisma.buch.findUnique({
                where: { id },
                include,
            });
        if (buch === null) {
            this.#logger.debug('Es gibt kein Buch mit der ID %d', id);
            throw new NotFoundException(`Es gibt kein Buch mit der ID ${id}.`);
        }
        // nullish coalescing operator
        buch.schlagwoerter ??= [];

        this.#logger.debug('findById: buch=%o', buch);
        return buch;
    }

    /**
     * Binärdatei zu einem Buch suchen.
     * @param buchId ID des zugehörigen Buchs.
     * @returns Binärdatei oder undefined als Promise.
     */
    async findFileByBuchId(
        buchId: number,
    ): Promise<Readonly<BuchFile> | undefined> {
        this.#logger.debug('findFileByBuchId: buchId=%d', buchId);
        const buchFile: BuchFile | null =
            await this.#prisma.buchFile.findUnique({ where: { buchId } });
        if (buchFile === null) {
            this.#logger.debug('findFileByBuchId: Keine Datei gefunden');
            return;
        }

        this.#logger.debug(
            'findFileByBuchId: id=%s, byteLength=%d, filename=%s, mimetype=%s, buchId=%d',
            buchFile.id,
            buchFile.data.byteLength,
            buchFile.filename,
            buchFile.mimetype,
            buchFile.buchId,
        );

        // als Datei im Wurzelverzeichnis des Projekts speichern:
        // import { writeFile } from 'node:fs/promises';
        // await writeFile(buchFile.filename, buchFile.data);

        return buchFile;
    }

    /**
     * Bücher asynchron suchen.
     * @param suchparameter JSON-Objekt mit Suchparameter.
     * @param pageable Maximale Anzahl an Datensätzen und Seitennummer.
     * @returns Ein JSON-Array mit den gefundenen Büchern.
     * @throws NotFoundException falls keine Bücher gefunden wurden.
     */
    async find(
        suchparameter: Suchparameter | undefined,
        pageable: Pageable,
    ): Promise<Readonly<Slice<Readonly<BuchMitTitel>>>> {
        this.#logger.debug(
            'find: suchparameter=%s, pageable=%o',
            JSON.stringify(suchparameter),
            pageable,
        );

        // Keine Suchparameter?
        if (suchparameter === undefined) {
            return await this.#findAll(pageable);
        }
        const keys = Object.keys(suchparameter);
        if (keys.length === 0) {
            return await this.#findAll(pageable);
        }

        // Falsche Namen fuer Suchparameter?
        if (!this.#checkKeys(keys) || !this.#checkEnums(suchparameter)) {
            this.#logger.debug('Ungueltige Suchparameter');
            throw new NotFoundException('Ungueltige Suchparameter');
        }

        // Das Resultat ist eine leere Liste, falls nichts gefunden
        // Lesen: Keine Transaktion erforderlich
        const where = this.#whereBuilder.build(suchparameter);
        const orderBy = this.#buildOrderBy(suchparameter.sort);
        const { number, size } = pageable;
        const buecher: BuchMitTitel[] = await this.#prisma.buch.findMany({
            where,
            skip: number * size,
            take: size,
            include: this.#includeTitel,
            orderBy,
        });
        if (buecher.length === 0) {
            this.#logger.debug('find: Keine Buecher gefunden');
            throw new NotFoundException(
                `Keine Buecher gefunden: ${JSON.stringify(suchparameter)}, Seite ${pageable.number}}`,
            );
        }
        // Zähle nur die gefilterten Bücher, nicht alle
        const totalElements = await this.#prisma.buch.count({ where });
        return this.#createSlice(buecher, totalElements);
    }

    /**
     * Anzahl aller Bücher zurückliefern.
     * @returns Ein JSON-Array mit den gefundenen Büchern.
     */
    async count() {
        this.#logger.debug('count');
        const count = await this.#prisma.buch.count();
        this.#logger.debug('count: %d', count);
        return count;
    }

    async #findAll(pageable: Pageable): Promise<Readonly<Slice<BuchMitTitel>>> {
        const { number, size } = pageable;
        const buecher: BuchMitTitel[] = await this.#prisma.buch.findMany({
            skip: number * size,
            take: size,
            include: this.#includeTitel,
            orderBy: { id: 'asc' },
        });
        if (buecher.length === 0) {
            this.#logger.debug('#findAll: Keine Buecher gefunden');
            throw new NotFoundException(`Ungueltige Seite "${number}"`);
        }
        const totalElements = await this.count();
        return this.#createSlice(buecher, totalElements);
    }

    #buildOrderBy(sort: string | undefined): any {
        if (!sort) {
            return { id: 'asc' }; // Standard-Sortierung
        }

        // Format: "feldname,richtung" z.B. "preis,asc" oder "preis,desc"
        const [field, direction] = sort.split(',');

        if (!field || !direction) {
            return { id: 'asc' };
        }

        const sortDirection =
            direction.toLowerCase() === 'desc' ? 'desc' : 'asc';

        // Validiere erlaubte Felder
        const allowedFields = ['id', 'preis', 'rating', 'datum', 'isbn'];
        if (!allowedFields.includes(field)) {
            this.#logger.debug(
                '#buildOrderBy: ungueltiges Sortierfeld "%s"',
                field,
            );
            return { id: 'asc' };
        }

        return { [field]: sortDirection };
    }

    #createSlice(
        buecher: BuchMitTitel[],
        totalElements: number,
    ): Readonly<Slice<BuchMitTitel>> {
        for (const buch of buecher) {
            buch.schlagwoerter ??= [];
        }
        const buchSlice: Slice<BuchMitTitel> = {
            content: buecher,
            totalElements,
        };
        this.#logger.debug('createSlice: buchSlice=%o', buchSlice);
        return buchSlice;
    }

    #checkKeys(keys: string[]) {
        this.#logger.debug('#checkKeys: keys=%o', keys);
        // Ist jeder Suchparameter auch eine Property von Buch oder "schlagwoerter"?
        let validKeys = true;
        for (const key of keys) {
            if (
                !suchparameterNamen.includes(key) &&
                key !== 'javascript' &&
                key !== 'typescript' &&
                key !== 'java' &&
                key !== 'python'
            ) {
                this.#logger.debug(
                    '#checkKeys: ungueltiger Suchparameter "%s"',
                    key,
                );
                validKeys = false;
            }
        }

        return validKeys;
    }

    #checkEnums(suchparameter: Suchparameter) {
        const { art } = suchparameter;
        this.#logger.debug('#checkEnums: Suchparameter "art=%s"', art);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        return (
            art === undefined ||
            art === 'EPUB' ||
            art === 'HARDCOVER' ||
            art === 'PAPERBACK'
        );
    }

    /**
     * Gibt Statistiken über alle Bücher zurück.
     *
     * @returns Promise mit Statistiken
     */
    async getStats() {
        this.#logger.debug('getStats');

        // Gesamtanzahl
        const totalCount = await this.#prisma.buch.count();

        // Bestes Buch (höchstes Rating)
        const bestBookRaw = await this.#prisma.buch.findFirst({
            where: { rating: { gt: 0 } },
            orderBy: { rating: 'desc' },
            include: this.#includeTitel,
        });

        // Günstigstes Buch (niedrigster Preis)
        const cheapestBookRaw = await this.#prisma.buch.findFirst({
            where: { preis: { gt: 0 } },
            orderBy: { preis: 'asc' },
            include: this.#includeTitel,
        });

        const bestBook = bestBookRaw
            ? {
                  id: bestBookRaw.id,
                  titel: bestBookRaw.titel?.titel ?? 'Unbekannt',
                  rating: bestBookRaw.rating,
              }
            : null;

        const cheapestBook = cheapestBookRaw
            ? {
                  id: cheapestBookRaw.id,
                  titel: cheapestBookRaw.titel?.titel ?? 'Unbekannt',
                  preis: Number(cheapestBookRaw.preis),
              }
            : null;

        const stats = {
            totalCount,
            bestBook,
            cheapestBook,
        };

        this.#logger.debug('getStats: stats=%o', stats);
        return stats;
    }
}
