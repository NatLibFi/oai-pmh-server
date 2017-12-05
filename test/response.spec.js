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
import {generateException} from '../src/response';

chai.use(chaiXml);

const dummyRequest = {originalUrl: 'http://melinda.kansalliskirjasto.fi/api?search=metallica'};
const erroneousDummyRequest = {auto: 'Audi'};

describe('responses', () => {
	it('Should throw because the provided error type is invalid', () => {
		expect(() => {
			return generateException(dummyRequest, 'argumentMissing');
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

	// DEBUG:
	// console.log(generateException(dummyRequest, 'badVerb'))

	it('Should return a valid XML response', () => {
		expect(generateException(dummyRequest, 'badArgument')).xml.to.be.valid();
		expect(generateException(dummyRequest, 'badVerb')).xml.to.be.valid();
		expect(generateException(dummyRequest, 'badResumptionToken')).xml.to.be.valid();
		expect(generateException(dummyRequest, 'cannotDisseminateFormat')).xml.to.be.valid();
		expect(generateException(dummyRequest, 'idDoesNotExist')).xml.to.be.valid();
		expect(generateException(dummyRequest, 'noRecordsMatch')).xml.to.be.valid();
		expect(generateException(dummyRequest, 'noMetadataFormats')).xml.to.be.valid();
		expect(generateException(dummyRequest, 'noSetHierarchy')).xml.to.be.valid();
	});

	const testException = generateException(dummyRequest, 'badVerb');
	// Const otherTestException = generateException(dummyRequest, 'badVerb');

//	It('Exceptions created right after each other with same parameters should not be equal', () => {
//		expect(testException).to.not.equal(otherTestException);
//	});

	it('Exceptions created with different codes should look different', () => {
		expect(testException).to.not.equal(generateException(dummyRequest, 'badArgument'));
	});
});
