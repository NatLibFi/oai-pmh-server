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

import url from 'url';
import xml from 'xml';
import xmldom from 'simple-xml-dom';
import {findKey} from 'lodash';
import {ERRORS} from '@natlibfi/oai-pmh-server-backend-module-prototype';

const EXCEPTIONS = {
	badArgument: 'Illegal query parameter',
	badResumptionToken: 'The resumption token is invalid',
	badVerb: 'Illegal OAI verb',
	cannotDisseminateFormat: 'The metadata format identified by the value given for the metadataPrefix argument is not supported by the item or by the repository.',
	idDoesNotExist: 'The value of the identifier argument is unknown or illegal in this repository.',
	noRecordsMatch: 'The combination of the values of the from, until, set and metadataPrefix arguments results in an empty list.',
	noMetadataFormats: 'There are no metadata formats available for the specified item.',
	noSetHierarchy: 'The repository does not support sets.'
};

const responseTemplate = {
	'OAI-PMH': [
		{_attr:
		{xmlns: 'http://www.openarchives.org/OAI/2.0/',
			'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
			'xsi:schemaLocation': 'http://www.openarchives.org/OAI/2.0/ \nhttp://www.openarchives.org/OAI/2.0/OAI-PMH.xsd'}
		},
		{responseDate: new Date().toISOString()}
	]};

/**
 * Parse a full http request string.
 * @param {object} req - A HTTP request object
 * @returns {string} - The parsed full query URL
 */
const parseFullUrl = req => {
	return url.format({
		protocol: req.protocol,
		host: req.get('host')
	}) + req.originalUrl;
};

/**
 * Parse and return an XML response to request.
 * @param {object} req - An HTTP request object
 * @param {object} responseContent - The body of the response
 * @return {string} - Parsed XML response
 */
function generateResponse(req, responseContent, recordData) {
	const newResponse = JSON.parse(JSON.stringify(responseTemplate));
	newResponse['OAI-PMH'].push({request: [{_attr: req.query}, parseFullUrl(req)]});
	newResponse['OAI-PMH'].push(responseContent);
	const xmlString = xml(newResponse, {declaration: true});

	/* The metadata xml cannot be serialized by the 'xml' module because it's already serialized! */
	if (recordData) {
		const records = [].concat(recordData);
		const document = xmldom.parse(xmlString);
		const metadataNodes = document.getElementsByTagName('metadata');

		for (let i = 0; i < metadataNodes.length; i++) {
			const node = metadataNodes.item(i);
			const recordNode = xmldom.parse(records[i]);
			node.appendChild(document.importNode(recordNode, true));
		}

		return xmldom.serialize(document);
	}
	return xmlString;
}

/**
 * Generate an XML exception.
 * @param {object} req - An HTTP request object
 * @param {string} errors - OAI-PMH error codes
 * @return {string} - Parsed XML exception
 */
const generateException = (req, errors) => {	
	/**
	 * Validate the argument types.
	 */
	if (req === undefined || errors === undefined) {
		throw new Error(`Function arguments are missing: request ${req}, errors: ${errors}`);
	}	
	if (!(req instanceof Object)) {
		throw new TypeError(`Invalid request: ${req}`);
	}
	if (!Object.hasOwnProperty.call(req, 'originalUrl')) {
		throw new Error(`No original URL provided in request: ${req}`);
	}
	
	const newException = JSON.parse(JSON.stringify(responseTemplate));
	const codes = errors.map(error => {
		const code = Object.keys(ERRORS).find(key => ERRORS[key] === error);
		if (Object.keys(EXCEPTIONS).indexOf(code) === -1) {
			throw new Error(`Unknown exception type: ${code}`);
		}
		return code;
	});	
		
	newException['OAI-PMH'].push({request: req.originalUrl});	
	codes.forEach(code => newException['OAI-PMH'].push({error: [{_attr: {code}}, EXCEPTIONS[code]]}));

	return xml(newException, {declaration: true});
};

export {generateException, generateResponse};
