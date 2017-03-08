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

import 'babel-polyfill'; // eslint-disable-line import/no-unassigned-import
import quacksLike from 'little-quacker';
import {HARVESTING_GRANULARITY, DELETED_RECORDS_SUPPORT, ERRORS, factory as backendModulePrototypeFactory} from 'oai-pmh-server-backend-module-prototype';

const PROTOCOL_VERSION = '2.0';
const MANDATORY_PARAMETERS = ['repositoryName', 'baseURL', 'adminEmail'];
const DEFAULT_PARAMETERS = {
	port: 1337,
	description: '',
	backendModule: {}
};

function initParameters(parameters) {
	var missingParameters = MANDATORY_PARAMETERS.filter(key => {
		return !Object.hasOwnProperty.call(parameters, key);
	});

	if (missingParameters.length > 0) {
		throw new Error('Mandatory parameters missing: ' + missingParameters.join());
	} else {
		parameters = Object.assign(JSON.parse(JSON.stringify(DEFAULT_PARAMETERS)), JSON.parse(JSON.stringify(parameters)));

		let invalidParameters = Object.keys(parameters).filter(key => {
			let result;

			switch (key) {
				case 'repositoryName':
				case 'baseURL':
					result = typeof parameters[key] !== 'string';
					break;
				case 'port':
					result = typeof parameters[key] !== 'number';
					break;
				case 'adminEmail':
					result = typeof parameters[key] !== 'string' && !Array.isArray(parameters[key]);
					break;
				case 'description':
					result = Object.hasOwnProperty.call(parameters, key) && typeof parameters[key] !== 'string';
					break;
				case 'backendModule':
					result = Object.hasOwnProperty.call(parameters, key) && typeof parameters[key] !== 'object';
					break;
				default:
					break;
			}

			return result;
		});

		if (invalidParameters.length > 0) {
			throw new Error('Invalid parameters: ' + invalidParameters.join());
		} else {
			return parameters;
		}
	}
}

/**
* @external {oai-pmh-server-backend-module-prototype} https://github.com/natlibfi/oai-pmh-server-backend-module-prototype.wiki/API
*/
/**
* Run the OAI-PMH server
* @param {oai-pmh-server-backend-module-prototype} backendModuleFactory - Factory function used to create the backend  module
* @param {object} parameters - Parameters for the server and the backend module factory. For the server parameters see  @{link https://www.openarchives.org/OAI/openarchivesprotocol.html#Identify}
* @param {number} parameters.port - Port the server listens on
* @param {string} parameters.repositoryName - A human readable name for the repository
* @param {string} parameters.baseURL - The base URL of the repository
* @param {string|string[]} parameters.adminEmail - The e-mail address or addresses of the administrators of the repository
* @param {string} [parameters.description] - Description of the repository
* @param {object} parameters.backendModule - Backend module specific parameters
* @returns {void}
*/
export default function oaiPmhServer(backendModuleFactory, parameters) {
	var backendModule;
	var backendModulePrototype = backendModulePrototypeFactory();

	if (typeof backendModuleFactory !== 'function') {
		throw new Error('backendModuleFactory is not a function');
	}

	initParameters(typeof parameters === 'object' ? parameters : {});

	try {
		backendModule = backendModuleFactory(parameters.backendModule);
	} catch (err) {
		throw new Error('Creating the backend module failed: ' + err.message);
	}

	/**
	* @todo Logic & Express.js initialization starts here
	*/
	if (quacksLike(backendModule, backendModulePrototype)) {
		/* placeholder */
		return;
	}
	throw new Error('Backend module is not an instance of the backend module prototype');
}
