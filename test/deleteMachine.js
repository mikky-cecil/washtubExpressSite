var expect = require('expect');
var should = require('should');
var assert = require('assert');
var request = require('supertest');
var server = require("../bin/www");
var monk = require('monk');
var async = require('async');
require('./helper.js');

var url = 'http://localhost:3000';

describe('Delete Machine', function () {
	before(function (done){
		db = monk('localhost:27017/washtubexpresssite');
		console.log('Adding machine with type \'Washer\' to the database');
		
		var newMachines = [
		{ 
			type: 'Washer' 
		}
		];

		// adds test machines
		async.each(newMachines, function(machine, callback){
			addMachine(db, machine, callback);
		}, done);
	});

	it('deletes the \'Washer\' from the database', function (done) {
		var collection = db.get('machinelist');
		collection.findOne({ type: 'Washer' }, function (err, doc) {
			if (err)
				throw err;

			var machineId = doc._id;
			request(url)
				.delete('/machines/deletemachine/' + machineId)
				.expect(200)
				.end(function (err, res) {
					if (err) {
						console.log(JSON.stringify(res));
						throw err;
					}
					done();
				});
		});
	});

	it('attempts to delete a machine that doesn\'t exist from the database', function (done) {
		var collection = db.get('machinelist');
		var machineId = monk.id();

		// make *sure* user doesn't already exist
		collection.count({ '_id': machineId }, function (err, count){
			if (err)
				throw err;
			expect(count).toEqual(0);
		});

		request(url)
			.delete('/machines/deletemachine/' + machineId)
			.expect(400, { msg: 'error: machine doesn\'t exist' })
			.end(function (err, res) {
				if (err)
					throw err;
				done();
			});
	});

	after(function (done){
		db.close();
		done();
	});
});