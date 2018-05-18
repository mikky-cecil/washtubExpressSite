var express = require('express');
var router = express.Router();
var forEach = require('foreach');

isCurrencyValid = function(currency){
	if (currency.match(/^[0-9]+\.[0-9]{2}$/)){
		var cash = parseFloat(currency); 
		if (cash == NaN){
			return false;
		}else{
			currency = cash;
			return true;
		}
	}else{
		return false;
	}
}

isMachineInfoValid = function(machine){
    // check required fields
    var requiredFields = ['type', 'cost', 'load'];
    forEach(requiredFields, function (field){
        if (!(field in machine)){
            return false;
        }
    });
    
    // validate load field
    if (parseInt(machine.load) == NaN){
        return false;
    }

    // validate cost field
    if (!isCurrencyValid(machine.cost)){
        return false;
    }

    return true;
};

isMachineUpdateInfoValid = function(machine){
    // validate cost field if it's being updated
    if (('cost' in machine) && !isCurrencyValid(machine.cost)){
        return false;
    }

    return true;
};

/* GET machines listing. */
router.get('/machinelist', function(req, res) {
    var db = req.db;
    var collection = db.get('machinelist');
    collection.find({},{},function(e,docs){
        res.json(docs);
    });
});

/*
 * GET one machine.
 */
router.get('/machine/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('machinelist');
    var machineToGet = req.params.id;
    collection.findOne({ '_id': machineToGet }, function(err, docs){
        if (err){
            res.status(500).send({ msg: 'error: ' + err });
        }else{
            res.status(200).send(docs);
        }
    });

});

/*
 * POST to adduser.
 */
router.post('/addmachine', function(req, res) {
    if (isMachineInfoValid(req.body)){
        var db = req.db;
        var collection = db.get('machinelist');
        collection.insert(req.body, function(err, result){
            if (err){
                res.status(500).send({ msg: 'error: ' + err });
            }else{
                res.status(201).location('/machine/' + result._id).send(result);
            }
        });
    }else{
        res.status(400).send({ msg: 'error: invalid machine info'});
    }
});

/*
 * DELETE to delete machine.
 */
router.delete('/deletemachine/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('machinelist');
    var machineToDelete = req.params.id;
    
    collection.remove({ '_id' : machineToDelete }, function(err, doc) {
        console.log(doc.deletedCount);
        if (err){
            res.status(500).send({ msg: 'error: ' + err });
        }else if (doc.deletedCount == 0){
            res.status(400).send({ msg: 'error: machine doesn\'t exist' });
        }else{
            res.status(200).send({});
        }
    });
});

/*
 * PUT to update machine.
 */
router.put('/updatemachine/:id', function(req, res) {
    if (isMachineUpdateInfoValid(req.body)){
        var db = req.db;
        var collection = db.get('machinelist');
        var machineToUpdate = req.params.id;
    
        collection.findOneAndUpdate({ '_id': machineToUpdate }, req.body, function (err, doc){
            if (err){
                res.send({ msg: 'error: ' + err });
            }else if (doc === null){
                res.status(400).send({ msg: 'error: machine doesn\'t exist' });
            }else{
                res.status(200).send(doc);
            }
        });    
    }else{
        res.status(400).send({ msg: 'error: invalid machine info'});
    }
});


module.exports = router;
