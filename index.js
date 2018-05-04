const sf = require('jsforce')
const AWS = require('aws-sdk')
const request = require('request')
const s3 = new AWS.S3()
const fs = require('fs')
const _ = require('lodash')
const config = require('./config')
const postProcessFields = require('./post_process_fields')
const preProcessFields = require('./pre_process_fields')
const assignIds  = require('./id_relationships')

const bucket_name = 'toolkits-data'
const api_key = process.env.API_KEY

const sf_username = process.env.SF_USERNAME
const sf_password = process.env.SF_PASSWORD
const conn = new sf.Connection({
	loginUrl: 'https://trade.my.salesforce.com'
})

const provider_url = 'https://www.export.gov/provider?id='

getObjects = () => {
	_.forEach(config, (config_entry) => {
		const query_result = {}

		// Fetch filter groups:
		conn.apex.post('/ToolkitSearch/', {programId: config_entry.program_id }, (err, res) => {
			if (err) { return console.error(err) }
			query_result.filter_groups = res.filterGroups

			// Fetch providers:
			conn.query(`SELECT ID, Name, Company_Description__c FROM Participation__c WHERE Program__c IN ('${config_entry.program_id}')`, (err, res) => {
				if (err) { return console.error(err) }
				query_result.filter_groups.push({name: 'Provider', filterItems: res.records})

				// Fetch solutions with related provider ids:
				conn.query(`SELECT ID, Name, Participant__c FROM Asset WHERE Program__c IN ('${config_entry.program_id}')`, (err, res) => {
					if (err) { return console.error(err) }
					query_result.solutions_with_providers = res.records
	
					try {
						processEntries(query_result, config_entry)
					}
					catch(err) {
						console.log(err)
					}
				})
			})
		})
	})
}

processEntries = (query_result, config_entry) => {
	const data = preProcessFields(query_result, config_entry)
	
	assignIds(data, config_entry)
	let all_entries = _.flatten(_.values(_.omit(data, ['solutions_with_providers'])))

	all_entries = postProcessFields(all_entries)
	writeToBucket(all_entries, config_entry)
}

writeToBucket = (entries, config_entry) => {
	const params = {
		Body: JSON.stringify(entries, null, 2),
		Bucket: bucket_name,
		Key: `${config_entry.file_name}.json`,
		ACL: 'public-read',
		ContentType: 'application/json'
	}
	s3.putObject(params, (err, data) => {
		if (err) { return console.error(err) }
		console.log('File successfully uploaded:  ' + config_entry.file_name)
		freshenEndpoint(config_entry.freshen_url)
	})
}

freshenEndpoint = (freshen_url) => {
	request(freshen_url+api_key, (err, res, body) => {
		if (err || (res && res.statusCode!= '200')) { return console.error('An error occurred while freshening the endpoint.') }
		console.log(res.statusCode)
		console.log('Endpoint successfully updated:  ' + freshen_url)
	})
}

writeToFile = (name, data) => {
	fs.writeFile(name + ".json", JSON.stringify(data, null, 4), (err) => {
    if(err) {
        return console.log(err)
    }
    console.log("The " + name + " file was saved!")
	}) 
}

exports.handler = (event, context, callback) => {
  conn.login(sf_username, sf_password, (err, res) => {
		if (err) { return console.error(err) }

		getObjects()
	})
}
