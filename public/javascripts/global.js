function fillTable(){
	// un-select any machine info being shown
	$('#alertMachineInfoEmpty').show();
	$('#machineInfo p').hide();

	$('#machineList tbody tr').remove(); // clear table first

	$.ajax({
		url: '/machines/machinelist',
		type: 'GET',
		dataType: 'json'
	}).done(function(data){
		if (data.length == 0){
			$('#alertEmptyMachineList').show();
			$('#machineList table').hide();
		}else{
			$('#alertEmptyMachineList').hide();
			$('#machineList table').show();
		}

		var rows = [];
		for (var i = 0; i < data.length; i++){
			var row = $('<tr>');
			var cols = [];

			var machine = data[i];
			cols.push($('<td>').html('<a href="" class="linkShowMachine" rel=' + machine._id + '>' + machine.type + '</a>'));
			cols.push($('<td>').text(machine.load + 'lbs'));
			cols.push($('<td>').html('<a href="" class="linkDeleteMachine text-danger" rel=' + machine._id + '>Delete</a>'));
			
			row.append(cols);
			rows.push(row);
		}

		$('#machineList table').append(rows);
	}).fail(function(){
		console.log('Error loading machine list');
	});

}

function showMachineInfo(event){
	event.preventDefault();
	$('#alertMachineInfoError').hide();
	$('#alertMachineInfoEmpty').hide();
	$('#machineInfo p').show();

	var machineId = $(event.target).attr('rel');

	$.ajax({
		url: '/machines/machine/' + machineId,
		type: 'GET',
		dataType: 'json'
	}).done(function(data){
		console.log(data);

		$('#machineInfoType').text(data.type);
		$('#machineInfoLoad').text(data.load + 'lbs');
		$('#machineInfoCost').text('$' + data.cost);
	}).fail(function(){
		$('#alertMachineInfoError').show();
		console.log('Error loading machine');
	});	
}

function isCurrencyValid(currency){
	if (currency.match(/^[0-9]+\.[0-9]{2}$/)){
		var cash = parseFloat(currency); 
		if (cash == NaN){
			return false;
		}else{
			return true;
		}
	}else{
		return false;
	}
}

function addMachine(event){
	event.preventDefault();

	var machine = {
		type: $('#inputMachineType').val(),
		load: $('#inputMachineLoad').val(),
		cost: $('#inputMachineCost').val(),
	};

	$('#inputMachineCost, #inputMachineLoad').removeClass('is-invalid');

	var error = false;
	if (!isCurrencyValid(machine.cost)){
		error = true;
		console.log('Cost not in valid USD format');
		$('#inputMachineCost').addClass('is-invalid');
	}
	if (machine.load == '' || parseInt(machine.load) == NaN){
		error = true;
		console.log('Load not a whole number');
		$('#inputMachineLoad').addClass('is-invalid');
	}
	if (error){
		return;
	}

	$.ajax({
		url: '/machines/addmachine',
		type: 'POST',
		dataType: 'json',
		data: machine
	}).done(function(data){
		$('#addMachine input').val('');

		fillTable();
	}).fail(function(){
		console.log('Error adding machine');
	});
}

function deleteMachine(){
	event.preventDefault();
	var machineId = $(event.target).attr('rel');

	$.ajax({
		url: '/machines/deletemachine/' + machineId,
		type: 'DELETE',
		dataType: 'json'
	}).done(function(data){
		console.log(data);

		fillTable();
	}).fail(function(){
		console.log('Error deleting machine');
	});
}

$(document).ready(function(){
	fillTable();

	$('#alertMachineInfoError').hide();
	$('#alertEmptyMachineList').hide();
	$('#machineInfo p').hide();

	$('#machineList tbody').on('click', 'a.linkShowMachine', showMachineInfo);
	$('#btnAddMachine').on('click', addMachine);
	$('#machineList tbody').on('click', 'a.linkDeleteMachine', deleteMachine);
});