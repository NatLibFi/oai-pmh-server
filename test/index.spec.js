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
import simple from 'simple-mock';
import {get as httpGet} from 'http';
import chaiHttp from 'chai-http';
import chaiXml from 'chai-xml';
import oaiPmhServer from '../source/index';
import {generateException, generateResponse} from '../source/response';
import {factory} from 'oai-pmh-server-backend-module-prototype';

chai.use(chaiHttp);
chai.use(chaiXml);

describe('index', () => {
	it('Should throw because backend module factory is not a function', () => {
		expect(() => {
			return oaiPmhServer({});
		}).to.throw(Error, /^backendModuleFactory is not a function$/);
	});

	it('Should throw because mandatory parameters are missing', () => {
		expect(() => {
			return oaiPmhServer(simple.stub());
		}).to.throw(Error, /^Mandatory parameters missing: /);
	});

	it('Should throw because parameters are invalid', () => {
		expect(() => {
			return oaiPmhServer(simple.stub(), {
				repositoryName: 'moro',
				baseURL: 'http://google.com',
				adminEmail: 6423});
		}).to.throw(Error, /^Invalid parameters:/);
	});
	it('Should throw because creating the backend module failed', () => {
		expect(() => {
			return oaiPmhServer(simple.stub().throwWith(new Error('foo')), {
				repositoryName: 'moro',
				baseURL: 'http://google.com',
				adminEmail: 'admin@hotmail.com'});
		}).to.throw(Error, /^Creating the backend module failed: /);
	});

	/* An instance of the object produced oai-pmh-server-backend-module-prototype */

	it('Should throw because backend module is not a valid instance', () => {
		expect(() => {
			return oaiPmhServer(simple.stub().returnWith({foo: 'bar'}), {
				repositoryName: 'foo',
				baseURL: 'http://localhost',
				adminEmail: 'foo@bar'
			});
		}).to.throw(Error, /^Backend module is not an instance of the backend module prototype$/);
	});
});

// Run the server
const parameters = {
	repositoryName: 'foo',
	baseURL: 'http://localhost',
	adminEmail: 'foo@bar.com'
};

oaiPmhServer(factory, parameters);

describe('OAI-PMH verbs: Identify', () => {
	it('Should get a valid response for a HTTP request', done => {
		chai.request('http://localhost:1337')
			.get('/')
			.query({verb: 'Identify'})
			.end((err, res) => {
				expect(err).to.be.null;
				expect(res).to.have.status(200);
				expect(res.text).to.be.valid.xml;
				done();
			});
	});

	it('Should get a proper XML error response with a bad parameter', done => {
		chai.request('http://localhost:1337')
			.get('/')
			.query({verb: 'Identify', audi: 'Das Auto'})
			.end((err, res) => {
				expect(err).to.be.null;
				expect(res.text).to.be.valid.xml;
				done();
			});
	});

	it('Should respond with properly formatted XML to Identify', done => {
		chai.request('http://localhost:1337')
			.get('/')
			.query({verb: 'Identify'})
			.end((err, res) => {
				expect(err).to.be.null;
				expect(res.text).to.be.valid.xml;
				done();
			});
	});
});

describe('OAI-PMH verbs: ListMetadataFormats', () => {
	it('Should return a properly formatted XML response', done => {
		chai.request('http://localhost:1337')
			.get('/')
			.query({verb: 'ListMetadataFormats'})
			.end((err, res) => {
				expect(err).to.be.null;
				expect(res).to.have.status(200);
				expect(res.text).to.be.valid.xml;
				done();
			});
	});
	it('Should get a proper XML error response with a bad parameter', done => {
		chai.request('http://localhost:1337')
			.get('/')
			.query({verb: 'ListMetadataFormats', metal: 'Open sesame'})
			.end((err, res) => {
				expect(err).to.be.null;
				expect(res).to.have.status(200);
				expect(res.text).to.be.valid.xml;
				done();
			});
	});
});

describe('OAI-PMH verbs: GetRecord', () => {
	it('Should get a proper XML error response with a missing parameters', done => {
		chai.request('http://localhost:1337')
			.get('/')
			.query({verb: 'GetRecord'})
			.end((err, res) => {
				expect(err).to.be.null;
				expect(res).to.have.status(200);
				expect(res.text).to.be.valid.xml;
				done();
			});
	});

	it('Should get a proper XML error response with a bad parameters', done => {
		chai.request('http://localhost:1337')
			.get('/')
			.query({verb: 'GetRecord', metal: 'Open sesame', yamma: 'Flamma', babu: 'Lambda'})
			.end((err, res) => {
				expect(err).to.be.null;
				expect(res).to.have.status(200);
				expect(res.text).to.be.valid.xml;
				done();
			});
	});

	it.skip('Should return a record in the desired format');
});

describe('OAI-PMH verbs: ListSets', () => {
	it('Should get a proper XML error response with a missing parameters', done => {
		chai.request('http://localhost:1337')
			.get('/')
			.query({verb: 'ListSets'})
			.end((err, res) => {
				expect(err).to.be.null;
				expect(res).to.have.status(200);
				expect(res.text).to.be.valid.xml;
				done();
			});
	});

	it('Should get a proper XML error response with a bad parameters', done => {
		chai.request('http://localhost:1337')
			.get('/')
			.query({verb: 'ListSets', metadataPrefix: 'ummagumma'})
			.end((err, res) => {
				expect(err).to.be.null;
				expect(res).to.have.status(200);
				expect(res.text).to.be.valid.xml;
				done();
			});
	});
});

describe('OAI-PMH verbs: ListIdentifiers', () => {

	// It('Should get a proper XML error response with a missing parameters', (done) => {
	//	chai.request("http://localhost:1337")
	//		.get('/')
	//		.query({verb: 'ListIdentifiers'})
	//		.end((err, res) => {
	//			expect(err).to.be.null;
	//			expect(res).to.have.status(200);
	//			expect(res.text).to.be.valid.xml;
	//			done();
	//		});
	// });

});

describe('OAI-PMH verbs: ListRecords', () => {

	// It('Should get a proper XML error response with a missing parameters', (done) => {
	//	chai.request("http://localhost:1337")
	//		.get('/')
	//		.query({verb: 'ListRecords'})
	//		.end((err, res) => {
	//			expect(err).to.be.null;
	//			expect(res).to.have.status(200);
	//			expect(res.text).to.be.valid.xml;
	//			done();
	//		});
	// });

});
