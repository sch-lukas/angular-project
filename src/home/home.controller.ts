// Copyright (C) 2025 - present Juergen Zimmermann, Hochschule Karlsruhe
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
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

/**
 * Das Modul besteht aus der Controller-Klasse für die Home-Seite.
 * @packageDocumentation
 */

import { Controller, Get, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { type Response } from 'express';
import { Public } from 'nest-keycloak-connect';

@Controller()
@ApiTags('Home')
export class HomeController {
    @Get('/')
    @Public()
    @ApiOperation({ summary: 'Home-Seite der SPA' })
    getHome(@Res() response: Response): void {
        const html = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>SPA Appserver</title>
</head>
<body>
    <h1>SPA Appserver läuft</h1>
    <p>NestJS Backend • Port 3000 • HTTPS aktiv</p>
</body>
</html>`;

        response.type('text/html').send(html);
    }
}
