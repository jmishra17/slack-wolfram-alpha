import mocha from 'mocha';
import {assert, should, expect} from 'chai';
import request from 'supertest';
import apiServer from '../apiServer';

describe('Inegration tests', function(){
	let appObj = apiServer.app;
	describe('testing posts to wolfram server ', function(){
		this.timeout(0); //disabling timeout coz Wolfram|Alpha takes way too long in comparison to  Mocha's optimism
		let textObj = {text: "wolfram parabola"};
		it("posts 'wolfram parabola' and gets 200", function(done){
			let textObj = {text: "wolfram parabola"};
			request(appObj)
			.post('/wolframBot')
			.type('form')
			.send(textObj)
			.end( (err, res) => {
				if(err) return done(err);
				expect(res.body.attachments).to.exist;
				expect(res.body.attachments).have.length.above(0);
				done();
			});
		});

		it("posts 'wofram What bands have recorded a version of Eleanor Rigby?' and gets 200 with response", function(done){
			let textObj = {text: 'wolfram What bands have recorded a version of Eleanor Rigby?'};
			request(appObj)
			.post('/wolframBot')
			.type('form')
			.send(textObj)
			.end(function(err, res){
				if(err) return done(err);
				expect(res.body.attachments).to.exist;
				expect(res.body.attachments).have.length.above(0);
				done();
			});
		});

		it("post 'wofram wqruohsabfkasbfas and returns res.200 with tips response", function(done){
			let textObj = {text: 'wqruohsabfkasbfas'};
			request(appObj)
			.post('/wolframBot')
			.type('form')
			.send(textObj)
			.end(function(err, res){
				if(err) return done(err);
				expect(res.body.text).to.equal('Error while processing query');
				done();
			});
		});

		it("posts 'wolfram something something on something' and returns didyoumeans", function(done){
			let textObj = {text: 'wolfram something something on something'};
			request(appObj)
			.post('/wolframBot')
			.type('form')
			.send(textObj)
			.end(function(err, res){
				if(err) return done(err);
				expect(res.body.text).to.equal('Oops! did you mean any of the following:'
											+' If so then try again by typing either of the following options');
				done();
			});
		});
	});
});


