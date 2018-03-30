const sf = require('jsforce');
const AWS = require('aws-sdk');
const request = require('request');
const s3 = new AWS.S3();
const fs = require('fs');
const _ = require('lodash');

const sf_username = process.env.SF_USERNAME;
const sf_password = process.env.SF_PASSWORD;
const conn = new sf.Connection({
	loginUrl: 'https://trade.my.salesforce.com'
});

conn.login(sf_username, sf_password, function(err, res){
	if (err) { return console.error(err); }

	getObjects();
});

getObjects = function() {
	// Environmental Solutions: 
	conn.apex.post('/ToolkitSearch/', {programId: 'a31t0000000CyD6', languageIso: 'en'}, function(err, res){
		if (err) { return console.error(err); }
		processESEntries(res);
	});
	/*
	// Civil Nuclear
	conn.apex.post('/ToolkitSearch/', {programId: 'a31t0000000CyDB'}, function(err, res){
		if (err) { return console.error(err); }
		processCNEntries(res);
	});
	// NextGen
	conn.apex.post('/ToolkitSearch/', {programId: 'a31t0000000CyDG'}, function(err, res){
		if (err) { return console.error(err); }
		processNGEntries
	});
	// SmartGrid
	conn.apex.post('/ToolkitSearch/', {programId: 'a31t0000000CyDV'}, function(err, res){
		if (err) { return console.error(err); }
		processSGEntries(res);
	});
	// Oil & Gas
	conn.apex.post('/ToolkitSearch/', {programId: 'a31t0000000CyDL'}, function(err, res){
		if (err) { return console.error(err); }
		processOGEntries(res);
	});
	// Renewable Energy
	conn.apex.post('/ToolkitSearch/', {programId: 'a31t0000000CyDQ'}, function(err, res){
		if (err) { return console.error(err); }
		processREEntries(res);
	});
	*/
}

initializeFields = function(item, fields){
	for (let key in fields){
		item[key] = fields[key];
	}
}

processESEntries = function(res) {
	const issues = _.map(res.filterGroups[0].filterItems, function(item, index) {
		let fields = { issue_id: index, regulation_ids: [], solution_ids: [], type: 'Environmental Issue' };
		initializeFields(item, fields);
		return item;
	});

	const regulations = _.map(res.filterGroups[1].filterItems, function(item, index) {
		let fields = { regulation_id: index, issue_ids: [], solution_ids: [], type: 'EPA Regulation' };
		initializeFields(item, fields);
		return item;
	});;

	const solutions = _.map(res.filterGroups[2].filterItems, function(item, index) {
		let fields = { solution_id: index, regulation_ids: [], issue_ids: [], type: 'Solution'};
		initializeFields(item, fields);
		return item;
	});;

	for (let key in issues){
		let issue = issues[key];

		// Find Regulations that match each Issue:
		let regs = _.filter(regulations, {productIds: issue.productIds});
		let reg_ids = _.map(regs, 'regulation_id');

		// Find Solutions that are contained by an Issue:
		let sols = _.filter(solutions, function(item){
			return issue.productIds.includes(item.productIds[0]);
		});
		let sol_ids = _.map(sols, 'solution_id');

		// Add Ids for the matching regulations to the Issue:
		issue.regulation_ids = issue.regulation_ids.concat(reg_ids);
		// Add solution ids to the issue
		issue.solution_ids = issue.solution_ids.concat(sol_ids);

		// Add Ids for the Issue and Solutions to the matching Regs:
		regs = _.map(regs, function(reg) {
			reg.issue_ids.push(issue.issue_id);
			reg.solution_ids = reg.solution_ids.concat(sol_ids);
			return reg;
		});

		// Add Ids for the Issue and Regulations to the matching solutions:
		sols = _.map(sols, function(sol) {
			sol.issue_ids.push(issue.issue_id);
			sol.regulation_ids = sol.regulation_ids.concat(reg_ids);
			return sol;
		});

	}
	//console.log(JSON.stringify(issues, null, 4))
	//console.log(JSON.stringify(regulations, null, 4))
	//console.log(JSON.stringify(solutions, null, 4))
}

processCNEntries = function(res) {

}

processNGEntries = function(res) {

}

processSGEntries = function(res){

}

processOGEntries = function(res){
	
}

processREEntries = function(res){
	
}

writeToFile = function(name, data) {
	fs.writeFile(name + ".json", JSON.stringify(data, null, 4), function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The " + name + " file was saved!");
	}); 
}

// For development/testing purposes
exports.handler = function(event, context, callback) {
  console.log('Running index.handler');
  console.log('==================================');
  console.log('event', event);
  console.log('==================================');
  console.log('Stopping index.handler');
  callback(null, event);
  // or
  // callback( 'some error type' );
};
