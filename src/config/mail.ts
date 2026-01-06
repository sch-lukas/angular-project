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
 * Das Modul enthält die Konfiguration für den Mail-Client mit _nodemailer_.
 * @packageDocumentation
 */

import { type Options } from 'nodemailer/lib/smtp-transport/index.js';
import { config } from './app.js';
import { logLevel } from './logger.js';

const { mail } = config;

const activated = mail?.activated === undefined || mail?.activated === true;

if (mail !== undefined) {
    if (mail.host !== undefined && typeof mail.host !== 'string') {
        throw new TypeError('Der konfigurierte Mailserver ist kein String');
    }
    if (mail.port !== undefined && typeof mail.port !== 'number') {
        throw new TypeError(
            'Der konfigurierte Port für den Mailserver ist keine Zahl',
        );
    }
}
// "Optional Chaining" und "Nullish Coalescing"
const host = (mail?.host as string | undefined) ?? 'smtp';
const port = (mail?.port as number | undefined) ?? 25; // eslint-disable-line @typescript-eslint/no-magic-numbers
const logger = mail?.log === true;

/**
 * Konfiguration für den Mail-Client mit _nodemailer_.
 */
// TODO records als "deeply immutable data structure" (Stage 2)
// https://github.com/tc39/proposal-record-tuple
export const options: Options = {
    host,
    port,
    secure: false,

    // Timeout-Einstellungen um hängende Verbindungen zu vermeiden
    connectionTimeout: 2000,
    greetingTimeout: 2000,
    socketTimeout: 2000,

    // Googlemail:
    // service: 'gmail',
    // auth: {
    //     user: 'Meine.Benutzerkennung@gmail.com',
    //     pass: 'mypassword'
    // }

    priority: 'normal',
    logger,
} as const;
export const mailConfig = {
    activated,
    options,
};
Object.freeze(options);
if (logLevel === 'debug') {
    console.debug('mailConfig = %o', mailConfig);
}
