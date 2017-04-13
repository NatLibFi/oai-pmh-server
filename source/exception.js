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

/**
* A map of exceptions codes and their human readable error messages.
* Note: the error messages are not standardized.
*/

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

export default function generateException(req, code) {
  const exceptionObj =
    {'OAI PMH': [
      {_attr: {
        xmlns: 'http://www.openarchives.org/OAI/2.0/',
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xsi:schemaLocation': 'http://www.openarchives.org/OAI/2.0/ \nhttp://www.openarchives.org/OAI/2.0/OAI-PMH.xsd'}},
      {responseDate: new Date().toISOString()},
      {request: req},
      {error: [{_attr: {code: code}}, EXCEPTIONS[code]]}
    ]};
  return xml(exceptionObj, {declaration: true});
}
