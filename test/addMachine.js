var expect = require('expect');
var should = require('should');
var assert = require('assert');
var request = require('supertest');
var server = require("../bin/www");
var monk = require('monk');
var objectAssign = require('object-assign');
var async = require('async');
var forEach = require('foreach');
require('./helper.js');

var url = 'http://localhost:3000';
var db;

describe('Add Machine', function(){
	before(function (done){
		db = monk('localhost:27017/washtubexpresssite');
		
		// clear out anything leftover from previous tests
		var collection = db.get('machinelist');
		collection.remove();

		done();
	});

	it('Adds a new machine with type \'Change\'', function (done){
		var newMachine = {
			type: 'Change',
			load: '10',
			cost: '0.25'
			};
		
		request(url)
		.post('/machines/addmachine')
			.send(newMachine)
			.expect(201) // TODO: add location header
			.expect(function (res){
				// check that it returns the new object with an assigned id
				expect(res.body).toBeA('object');
				expect(res.body).toIncludeKey('_id');
				expect(removeId(res.body)).toEqual(newMachine);
				// check that it returns the location of the new user
				expect(res.header).toIncludeKey('location');
				expect(res.header.location).toInclude('/machine/');
			})
			.end(function(err, res){
				if(err){
					console.log(JSON.stringify(res));
					throw err;
				}

				done();
			});
	});

	it('Attempts to add a new machine with incorrectly formatted cost', function (done){
		var machineList = [];
		var newMachine = {
			type: 'Washer',
			load: '10',
			};

		var badCosts = ['two dollars', '2', '5.0'];

		// attempt to create a machine with each bad cost
		async.each(badCosts, function (cost, callback){
			newMachine['cost'] = cost;
			request(url)
				.post('/machines/addmachine')
				.send(newMachine)
				.expect(400, { msg: 'error: invalid machine info'})
				.end(function (err, res){
					if (err){
						console.log(JSON.stringify(res));
						throw err;
					}
					callback();
				});
		}, done);
	});

	after(function (done){
		db.close();
		done();
	});
});