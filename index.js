const sf = require('jsforce');
const AWS = require('aws-sdk');
const request = require('request');
const s3 = new AWS.S3();
const fs = require('fs');
const _ = require('lodash');

const bucket_name = 'environmental-solutions';
const freshen_url = 'https://api.trade.gov/v1/environmental_solutions/freshen.json?api_key=';
const api_key = process.env.API_KEY;

const sf_username = process.env.SF_USERNAME;
const sf_password = process.env.SF_PASSWORD;
const conn = new sf.Connection({
	loginUrl: 'https://trade.my.salesforce.com'
});

const provider_url = 'https://www.export.gov/provider?id='

getObjects = function() {
	// Environmental Solutions: 
	const data = {};
	conn.apex.post('/ToolkitSearch/', {programId: 'a31t0000000CyD6', languageIso: 'en', }, function(err, res){
		if (err) { return console.error(err); }
		//writeToFile('environmental_solutions', res);
		data.api_results = res;
		conn.query("SELECT ID, Name, Company_Description__c FROM Participation__c WHERE Program__c IN ('a31t0000000CyD6')", function(err, res){
			if (err) { return console.error(err); }
			//writeToFile('providers', res);
			data.providers = res;
			conn.query("SELECT ID, Name, Participant__c FROM Asset WHERE Program__c IN ('a31t0000000CyD6')", function(err, res){
				if (err) { return console.error(err); }
				//writeToFile('products_and_providers', res);
				data.solutions_with_provider = res;
				processESEntries(data);
			});
		});
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

processESEntries = function(data) {
	const issues = _.map(data.api_results.filterGroups[0].filterItems, function(item, index) {
		let fields = { issue_id: [index], regulation_id: [], solution_id: [], provider_id: [], type: 'Environmental Issue' };
		initializeFields(item, fields);
		return item;
	});

	const regulations = _.map(data.api_results.filterGroups[1].filterItems, function(item, index) {
		let fields = { regulation_id: [index], issue_id: [], solution_id: [], provider_id: [], type: 'EPA Regulation' };
		initializeFields(item, fields);
		return item;
	});;

	const solutions = _.map(data.api_results.filterGroups[2].filterItems, function(item, index) {
		let fields = { solution_id: [index], regulation_id: [], issue_id: [], provider_id: [], type: 'Solution'};
		initializeFields(item, fields);
		return item;
	});;

	const providers = _.map(data.providers.records, function(item, index) {
		let fields = { solution_id: [], regulation_id: [], issue_id: [], provider_id: [index], type: 'Provider'};
		initializeFields(item, fields);
		return item;
	});

	const solutions_with_provider = buildSolutionsWithProvider(data.solutions_with_provider.records);

	assignESIds(solutions, issues, regulations, providers, solutions_with_provider)

	let all_entries = solutions.concat(issues).concat(regulations).concat(providers)
	all_entries = processESFields(all_entries)

	writeToBucket(all_entries)
}

buildSolutionsWithProvider = function(entries) {
	const solutions_with_provider = {}

	_.forEach(entries, function(item){
		if(solutions_with_provider[item.Name]) {
			solutions_with_provider[item.Name].push(item.Participant__c);
		}
		else {
			solutions_with_provider[item.Name] = [item.Participant__c];
		}
	})
	return solutions_with_provider
}


assignESIds = function(solutions, issues, regulations, providers, solutions_with_provider){

	_.forEach(solutions, function(solution) {
		
		let iss = _.filter(issues, function(issue){ return issue.productIds.includes(solution.id)})
		let regs = _.filter(regulations, function(regulation){ return regulation.productIds.includes(solution.id)})

		let reg_ids = _.map(regs, function(reg) { return reg.regulation_id[0] });
		let issue_id = _.map(iss, function(issue) { return issue.issue_id[0] });

		let provider_raw_ids = _.compact(solutions_with_provider[solution.name]);
		let provs = _.filter(providers, function(provider) { return provider_raw_ids.includes(provider.Id) })
		let provider_id = _.map(provs, function(provider) { return provider.provider_id[0] });

		//Add all ids to solution:
		solution.regulation_id = solution.regulation_id.concat(reg_ids)
		solution.issue_id = solution.issue_id.concat(issue_id)
		solution.provider_id = solution.provider_id.concat(provider_id)

		//Add all ids to each issue:
		iss = _.map(iss, function(issue){
			issue.solution_id = issue.solution_id.concat(solution.solution_id)
			issue.regulation_id = _.uniq(issue.regulation_id.concat(reg_ids))
			issue.provider_id = _.uniq(issue.provider_id.concat(provider_id))
			return issue
		})

		//Add all ids to each regulation:
		regs = _.map(regs, function(reg){
			reg.solution_id = reg.solution_id.concat(solution.solution_id)
			reg.issue_id = _.uniq(reg.issue_id.concat(issue_id))
			reg.provider_id = _.uniq(reg.provider_id.concat(provider_id))
			return reg
		})

		//Add all ids to each Provider:
		provs = _.map(provs, function(prov){
			prov.solution_id = prov.solution_id.concat(solution.solution_id)
			prov.issue_id = _.uniq(prov.issue_id.concat(issue_id))
			prov.regulation_id = _.uniq(prov.regulation_id.concat(reg_ids))
			return prov
		})

	})
}

processESFields = function(all_entries) {
	let new_entries = _.map(all_entries, function(entry) {
		if(entry.type === 'Provider'){
			entry = processProviderEntry(entry)
		} 
		else if(!_.isEmpty(entry.links)){
			entry = processLinks(entry)
		}
		if(!entry.summary)
			entry.summary = null
		entry = _.omit(entry, ['productIds', 'linksSize', 'id', 'attributes', 'Id'])
		return entry
	})
	return new_entries
}

processProviderEntry = function(entry) {
	entry.summary = entry.Company_Description__c;
	entry.name = entry.Name;
	entry.links = [{url: provider_url+entry.Id, display_name: entry.name}]
	delete entry.Company_Description__c
	delete entry.Name
	delete entry.Website__c
	return entry
}

processLinks = function(entry) {
	entry.links = _.map(entry.links, function(link){ 
		link.display_name = link.name
		delete link.id
		delete link.name
		return link
	})
	return entry
}

writeToBucket = function(entries) {
	const params = {
		Body: JSON.stringify(entries, null, 2),
		Bucket: bucket_name,
		Key: 'results.json',
		ACL: 'public-read',
		ContentType: 'application/json'
	};
	s3.putObject(params, function(err, data){
		if (err) { return console.error(err); }
		console.log('File successfully uploaded!');
		freshenEndpoint();
	});
}

freshenEndpoint = function() {
	request(freshen_url+api_key, function(err, res, body) {
		if (err || (res && res.statusCode!= '200')) { return console.error('An error occurred while freshening the endpoint.'); }
		console.log(res.statusCode)
		console.log('Endpoint successfully updated!')
	});
}


exports.handler = function(event, context, callback) {
  conn.login(sf_username, sf_password, function(err, res){
		if (err) { return console.error(err); }

		getObjects();
	});
};

writeToFile = function(name, data) {
	fs.writeFile(name + ".json", JSON.stringify(data, null, 4), function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The " + name + " file was saved!");
	}); 
}
