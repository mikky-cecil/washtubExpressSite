var expect = require('expect');
var should = require('should');
var assert = require('assert');
var request = require('supertest');
var server = require("../bin/www");
var monk = require('monk');
var async = require('async');
require('./helper.js');

var url = 'http://localhost:5000';

describe('Get Machines', function(){
	before(function (done){
		db = monk('localhost:27017/washtubexpresssite');

		// clear out anything leftover from previous tests
		var collection = db.get('machinelist');
		collection.remove();

		var newMachines = [
		{
			type: 'Washer',
			load: '10',
			cost: '1.25'
		},
		{
			type: 'Dryer',
			load: '10',
			cost: '1.50'
		}
		];

		// adds test users
		async.each(newMachines, function(machine, callback){
			addMachine(db, machine, callback);
		}, done);
	});

	it('Gets all machines', function (done){
		request(url)
		.get('/api/machines/machinelist')
		.expect(200)
		.end(function (err, res){
			if(err){
				console.log(JSON.stringify(res));
				throw err;
			}
			var machines = JSON.parse(res.text);
			expect(machines.length).toEqual(2);
			done();
		});
	});

	it('Gets one machine', function (done){
		var collection = db.get('machinelist');
		collection.findOne({ 'type': 'Washer' }, function (err, doc) {
			if (err){
				throw err;
			}
			expect(doc)
			.toExist()
			.toIncludeKey('_id');

			var newMachine = doc;
			var machineId = doc._id;
			request(url)
			.get('/api/machines/machine/' + machineId)
			.expect(200)
			.end(function (err, res){
				if(err){
					console.log(JSON.stringify(res));
					throw err;
				}
				expect(res.body).toBeA('object');
				expect(removeId(res.body)).toEqual(removeId(newMachine));
				done();
			});
		});
	});

	after(function (done){
		db.close();
		done();
	});
});