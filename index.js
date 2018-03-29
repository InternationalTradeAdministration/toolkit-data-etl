const sf = require('jsforce');
const AWS = require('aws-sdk');
const request = require('request');
const s3 = new AWS.S3();
var fs = require('fs');

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
	
}

processESEntries = function(res) {

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
