/**
 *
 * @licstart  The following is the entire license notice for the JavaScript code in this file.
 *
 * Modular OAI-PMH server
 *
 * Copyright (C) 2017 University Of Helsinki (The National Library Of Finland)
 *
 * This file is part of oai-pmh-server
 *
 * oai-pmh-server program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * oai-pmh-server is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this file.
 *
 */

/* eslint-disable no-unused-vars */

'use strict';

import xml from 'xml';

function generateResponse(req, code) {
	const responseObj = {
		'OAI-PMH': [
			{_attr:
			{xmlns: 'http://www.openarchives.org/OAI/2.0/',
				'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
				'xsi:schemaLocation': 'http://www.openarchives.org/OAI/2.0/ \nhttp://www.openarchives.org/OAI/2.0/OAI-PMH.xsd'}
			},
			{responseDate: new Date().toISOString()},
			{request: req},
			{error: [{_attr: {code}}, EXCEPTIONS.code]}
		]};
	return xml(responseObj, {declaration: true});
}

export default generateResponse;

