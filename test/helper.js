objectAssign = require('object-assign');

addMachine = function(db, machine, callback){
	// generic test machine
	var testMachine = {
		type: 'Washer',
		load: '10',
		cost: '1.25'
	};
	// add/overwrite any properties passed in
	objectAssign(testMachine, machine);

	var collection = db.get('machinelist');
	collection.insert(testMachine, function (err, res){
		if (err){
			throw err;
			console.log(err);
		}

		callback();
	});
};

removeId = function (object){
	if ('_id' in object){
		var objWithoutId = objectAssign({}, object);
		delete objWithoutId['_id'];
		return objWithoutId;
	}else{
		return object;
	}
};