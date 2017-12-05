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

import quacksLike from 'little-quacker';
import express from 'express';
import {findKey, has as hasPath} from 'lodash';
import {HARVESTING_GRANULARITY, DELETED_RECORDS_SUPPORT, ERRORS, factory as backendModulePrototypeFactory} from '@natlibfi/oai-pmh-server-backend-module-prototype';
import {generateException, generateResponse} from './response';

const PROTOCOL_VERSION = '2.0';
const MANDATORY_PARAMETERS = ['repositoryName', 'baseURL', 'adminEmail'];
const DEFAULT_PARAMETERS = {
	port: 1337,
	description: '',
	backendModule: {}
};

function initParameters(parameters) {
	const missingParameters = MANDATORY_PARAMETERS.filter(key => {
		return !Object.hasOwnProperty.call(parameters, key);
	});

	if (missingParameters.length > 0) {
		throw new Error('Mandatory parameters missing: ' + missingParameters.join());
	} else {
		parameters = Object.assign(JSON.parse(JSON.stringify(DEFAULT_PARAMETERS)), JSON.parse(JSON.stringify(parameters)));

		const invalidParameters = Object.keys(parameters).filter(key => {
			let result;

			switch (key) {
				case 'repositoryName':
					result = typeof parameters[key] !== 'string';
					break;
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
* @param {oai-pmh-server-backend-module-prototype} backendModuleFactory - Factory function used to create the backend module
* @param {object} parameters - Parameters for the server and the backend module factory. For the server parameters see  @{link https://www.openarchives.org/OAI/openarchivesprotocol.html#Identify}
* @param {number} parameters.port - Port the server listens on
* @param {string} parameters.repositoryName - A human readable name for the repository
* @param {string} parameters.baseURL - The base URL of the repository
* @param {string|string[]} parameters.adminEmail - The e-mail address or addresses of the administrators of the repository
* @param {string} [parameters.description] - Description of the repository
* @param {object} parameters.backendModule - Backend module specific parameters
* @returns {void}
*/
export default async function oaiPmhServer(backendModuleFactory, parameters) {
	let backendModule = {};
	const backendModulePrototype = backendModulePrototypeFactory();

	if (typeof backendModuleFactory !== 'function') {
		throw new TypeError('backendModuleFactory is not a function');
	}

	parameters = initParameters(typeof parameters === 'object' ? parameters : {});

	try {
		backendModule = backendModuleFactory(parameters.backendModule);
	} catch (err) {
		throw new Error('Creating the backend module failed: ' + err.message);
	}

	if (quacksLike(backendModule, backendModulePrototype)) {
		const app = express();
		app.get('/', async (req, res) => {
			res.set('Content-Type', 'text/xml');
			/**
			* All provided query parameters are collected into the 'queryParameters' array.
			*/
			const queryParameters = Object.keys(req.query).map(key => req.query[key]);
			// DEBUG
			// console.log("Queryparameters: " + queryParameters)
			// console.log("req.query.verb" + req.query.verb)
			// console.log(parameters)

			/**
			* A list of possible parameters that ListIdentifiers or ListRecords can take.
			*/
			const possibleParams = ['verb', 'from', 'until', 'metadataPrefix', 'set', 'resumptionToken'];

			switch (req.query.verb) {
				case 'Identify':
				/**
				* Parameters: none
				* exceptions: badArgument
				*/
					if (queryParameters.length > 1) {
						res.send(generateException(req, [ERRORS.badArgument]));
					} else {
						backendModule.getCapabilities().then(capabilities => {
							const responseContent = {
								Identify: [
								{repositoryName: parameters.repositoryName},
								{baseURL: parameters.baseURL},
								{protocolVersion: PROTOCOL_VERSION},
								{adminEmail: parameters.adminEmail},
								{earliestDatestamp: capabilities.earliestDatestamp},
								{deletedRecord: capabilities.deletedRecordsSupport},
								{granularity: capabilities.harvestingGranularity}
								]
							};
							res.send(generateResponse(req, responseContent));
						// Console.log(generateResponse(req, responseContent))
						});
					}
					break;
				case 'ListMetadataFormats':
				/**
				* Parameters: identifier (optional)
				* exceptions: badArgument, idDoesNotExist, noMetadataFormats
				*/
					if (queryParameters.length > 2 || (queryParameters.length === 2 && !hasPath(req.query, 'identifier'))) {
						res.send(generateException(req, [ERRORS.badArgument]));
					} else {
						const args = hasPath(req.query, 'identifier') ? req.query.identifier : undefined;
						const formats = await backendModule.getMetadataFormats(args);
						const responseContent = {
							ListMetadataFormats: formats.map(format => {
								return {metadataFormat: [
								{metadataPrefix: format.prefix},
								{schema: format.schema},
								{metadataNamespace: format.namespace}
								]};
							})
						};
						res.send(generateResponse(req, responseContent));
					// Console.log(generateResponse(req, responseContent));
					}
					break;
				case 'ListSets':
				/**
				* Parameters: resumptionToken (exclusive)
				* exceptions: badArgument, badResumptionToken, noSetHierarchy
				*/
					if (queryParameters.length > 2 || (queryParameters.length === 2 && !hasPath(req.query, 'resumptionToken'))) {
						res.send(generateException(req, [ERRORS.badArgument]));
					} else {
					/**
					* @todo: Implement set functionality. Currently not supported by
					* the backend.
					*/
						const args = hasPath(req.query, 'resumptionToken') ? req.query.resumptionToken : undefined;
						res.send(generateException(req, [ERRROS.noSetHierarchy]));
					}
					break;
				case 'ListIdentifiers':
				/**
				* Parameters: from (optional),
				* until (optional),
				* metadataPrefix (required),
				* set (optional),
				* resumptionToken (exclusive)
				*
				* exceptions: badArgument,
				* badResumptionToken,
				* cannotDisseminateFormat,
				* noRecordsMatch,
				* noSetHierarchy
				*/
					if ((queryParameters.length > 6 || queryParameters.length < 2) ||
				(queryParameters.length === 2 && (!hasPath(req.query, 'metadataFormat') && !hasPath(req.query, 'resumptionToken'))) ||
				(!Object.keys(req.query).every(key => possibleParams.includes(key)))) {
						res.send(generateException(req, [ERRORS.badArgument]));
					} else {
						try {
							const data = await backendModule.getIdentifiers(req.query);
							const formattedData = {
								ListIdentifiers: data.records
							};

							if (data.token) {
								formattedData.ListIdentifiers.push({resumptionToken: [data.token]});
							}

							res.send(generateResponse(req, formattedData));
						} catch (err) {
							if (hasPath(err, 'errors')) {					
								res.send(generateException(req, err.errors));
							} else {
								res.sendStatus(500);
							}
						}
					}
					break;
				case 'ListRecords':
					/**
					* Parameters: from (optional),
					* until (optional),
					* metadataPrefix (required),
					* set (optional),
					* resumptionToken (exclusive)
					*
					* exceptions: badArgument,
					* badResumptionToken,
					* cannotDisseminateFormat,
					* noRecordsMatch,
					* noSetHierarchy
					*/
					if (
						(queryParameters.length > 6 || queryParameters.length < 2) ||
						(queryParameters.length === 2 && (!hasPath(req.query, 'metadataFormat') && !hasPath(req.query, 'resumptionToken'))) ||
						(!Object.keys(req.query).every(key => possibleParams.includes(key)))) {
						res.send(generateException(req, [ERRORS.badArgument]));
					} else {
						res.send(generateException(req, [ERRORS.noRecordsMatch]));
					}
					break;
					break;
				case 'GetRecord':
					/**
					* Parameters: identifier (required),
					* metadataPrefix (required)
					*
					* exceptions: badArgument,
					* cannotDisseminateFormat,
					* idDoesNotExist
					*/
					if (queryParameters.length !== 3 || !hasPath(req.query, 'identifier') || !hasPath(req.query, 'metadataPrefix')) {
						res.send(generateException(req, [ERRORS.badArgument]));
					} else {
						try {
							const data = await backendModule.getRecord(req.query.identifier, req.query.metadataPrefix);
							res.send(generateResponse(req, {
								GetRecord: [
									{
										header: [
											{identifier: req.query.identifier},
											{datestamp: data.timestamp}
										]
									},
									{
										metadata: []
									}
								]
							}, data.record));
						} catch (err) {
							if (hasPath(err, 'errors')) {
								res.send(generateException(req, findKey(ERRORS, err.errors)));
							} else {
								console.error(err);
								res.sendStatus(500);
							}
						}
					}
					break;
				default:
					res.send(generateException(req, [ERRORS.badVerb]));
			}
		});
		console.log(`Server started, listening to port ${parameters.port}...`);
		app.listen(parameters.port);
	} else {
		throw new Error('Backend module is not an instance of the backend module prototype');
	}
}
