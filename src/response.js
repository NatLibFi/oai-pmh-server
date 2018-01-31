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
import XMLWriter from 'xml-writer';
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

/**
 * Parse a full http request string.
 * @param {object} req - A HTTP request object
 * @returns {string} - The parsed full query URL
 */
const parseFullUrl = req => url.format({
	protocol: req.protocol,
	host: req.get('host'),
	pathname: req.path
});

const createResponseTemplate = (writer, req) => {
	writer.startDocument();

	writer.startElement('OAI-PMH')
	.writeAttribute('xmlns', 'http://www.openarchives.org/OAI/2.0/')
	.writeAttribute('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
	.writeAttribute('xsi:schemaLocation', 'http://www.openarchives.org/OAI/2.0/ http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd');

	writer.writeElement('responseDate', new Date().toISOString());
	writer.startElement('request');
	Object.keys(req.query).forEach(key => writer.writeAttribute(key, req.query[key]));
	writer.text(parseFullUrl(req));
	writer.endElement();
};

/**
 * Parse and return an XML response to request.
 * @param {object} req - An HTTP request object
 * @param {string} responseContent - The body of the response
 * @return {string} - Parsed XML response
 */
const generateResponse = (req, responseContent) => {
	const writer = new XMLWriter();
	createResponseTemplate(writer, req);
	writer.writeRaw(responseContent);
	return writer.toString();
};

/**
 * Generate an XML exception.
 * @param {object} req - An HTTP request object
 * @param {array} errors - OAI-PMH error codes
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

	const writer = new XMLWriter();
	createResponseTemplate(writer, req);

	const codes = errors.map(error => {
		const code = Object.keys(ERRORS).find(key => ERRORS[key] === error);
		if (Object.keys(EXCEPTIONS).indexOf(code) === -1) {
			throw new Error(`Unknown exception type: ${error}`);
		}
		return code;
	});

	codes.forEach(code => {
		writer.startElement('error').writeAttribute('code', code).text(EXCEPTIONS[code]);
	});

	return writer.toString();
};

export {generateException, generateResponse};
