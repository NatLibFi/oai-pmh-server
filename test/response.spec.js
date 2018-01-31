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

/* eslint-disable no-undef, max-nested-callbacks, no-unused-expressions */

'use strict';

import chai, {expect} from 'chai';
import chaiXml from 'chai-xml';
import {ERRORS} from '@natlibfi/oai-pmh-server-backend-module-prototype';
import {generateException} from '../src/response';

chai.use(chaiXml);

describe('response', () => {
	describe('generateResponse', () => {
	});

	describe('generateException', () => {
		const dummyRequest = {
			originalUrl: 'http://melinda.kansalliskirjasto.fi/api?search=metallica',
			query: {},
			get: () => {}
		};
		const erroneousDummyRequest = {auto: 'Audi'};

		it('Should throw because the provided error type is invalid', () => {
			expect(() => {
				return generateException(dummyRequest, ['foobar']);
			}).to.throw(Error, /^Unknown exception type: argumentMissing$/);
		});

		it('Should throw because exception generator is fed only one argument', () => {
			expect(() => {
				return generateException('argumentMissing');
			}).to.throw(Error, /^Function arguments are missing:/);
		});

		it('Should throw because the provided request object is not valid', () => {
			expect(() => {
				return generateException('Numa numa jee', 'badVerb');
			}).to.throw(Error, /^Invalid request: Numa numa jee$/);
		});

		it('Should throw because the provided request does not contain original query URL', () => {
			expect(() => {
				return generateException(erroneousDummyRequest, 'badVerb');
			}).to.throw(Error, /^No original URL provided in request:/);
		});

		it('Should return a valid XML response', () => {
			expect(generateException(dummyRequest, ['badArgument'])).xml.to.be.valid();
			expect(generateException(dummyRequest, ['badVerb'])).xml.to.be.valid();
			expect(generateException(dummyRequest, ['badResumptionToken'])).xml.to.be.valid();
			expect(generateException(dummyRequest, ['cannotDisseminateFormat'])).xml.to.be.valid();
			expect(generateException(dummyRequest, ['idDoesNotExist'])).xml.to.be.valid();
			expect(generateException(dummyRequest, ['noRecordsMatch'])).xml.to.be.valid();
			expect(generateException(dummyRequest, ['noMetadataFormats'])).xml.to.be.valid();
			expect(generateException(dummyRequest, ['noSetHierarchy'])).xml.to.be.valid();
		});

		it('Exceptions created with different codes should look different', () => {
			const testException = generateException(dummyRequest, 'badVerb');
			expect(testException).to.not.equal(generateException(dummyRequest, 'badArgument'));
		});
	});
});
