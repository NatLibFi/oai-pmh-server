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

import chai, {expect, request} from 'chai';
import chaiXml from 'chai-xml';
import { generateException, generateResponse } from '../source/response';

chai.use(chaiXml);

describe('responses', () => {
	it('Should throw because the error type is invalid', () => {
		expect(() => {
			return generateException({}, 'argumentMissing');
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

	const testException = generateException({}, 'badVerb');
	const otherTestException = generateException({}, 'badVerb');

	it('Should return a valid XML response', () => {
		expect(testException).xml.to.be.valid();
		expect(otherTestException).xml.to.be.valid();
		expect(generateException({}, 'badResumptionToken')).xml.to.be.valid();
	});

	it('Should fail because two responses should not be equal due to difference in timestamps', () => {
		expect(testException).to.not.equal(otherTestException);
	});
});
