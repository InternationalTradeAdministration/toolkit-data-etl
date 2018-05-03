const sf = require('jsforce')
const AWS = require('aws-sdk')
const request = require('request')
const s3 = new AWS.S3()
const fs = require('fs')
const _ = require('lodash')
const config = require('./config')

const bucket_name = 'toolkits-data'
const api_key = process.env.API_KEY

const sf_username = process.env.SF_USERNAME
const sf_password = process.env.SF_PASSWORD
const conn = new sf.Connection({
	loginUrl: 'https://trade.my.salesforce.com'
})

const provider_url = 'https://www.export.gov/provider?id='

getObjects = () => {
	// Environmental Solutions: 
	_.forEach(config, (config_entry) => {
		const query_result = {}
		conn.apex.post('/ToolkitSearch/', {programId: config_entry.program_id }, (err, res) => {
			if (err) { return console.error(err) }
			//writeToFile('environmental_solutions', res)
			query_result.filter_groups = res.filterGroups

			conn.query(`SELECT ID, Name, Company_Description__c FROM Participation__c WHERE Program__c IN ('${config_entry.program_id}')`, (err, res) => {
				if (err) { return console.error(err) }
				query_result.filter_groups.push({name: 'Provider', filterItems: res.records})
				
				conn.query(`SELECT ID, Name, Participant__c FROM Asset WHERE Program__c IN ('${config_entry.program_id}')`, (err, res) => {
					if (err) { return console.error(err) }
					query_result.solutions_with_providers = res.records
					processEntries(query_result, config_entry)
				})
			})
		})

	})
}

processEntries = (query_result, config_entry) => {
	const data = {}
	_.forEach(query_result.filter_groups, (group) => {
		const filter = _.filter(config_entry.filters, (filter) => {
			return filter.api_name === group.name
		})[0]

		data[filter.name+'s'] = _.map(group.filterItems, (item, index) => {
			const fields = {}
			_.forEach(config_entry.id_fields, (field) => {
				fields[field] = []
			})
			fields[filter.name+'_id'].push(index)
			fields.type = filter.api_name
			initializeFields(item, fields)
			return item
		})
	})
	data.solutions_with_providers = buildSolutionsWithProvider(query_result.solutions_with_providers)

	assignIds(data, config_entry)
	let all_entries = _.flatten(_.values(_.omit(data, ['solutions_with_providers'])))
	all_entries = processFields(all_entries)
	writeToBucket(all_entries, config_entry)
}

assignIds = (data, config_entry) => {
	_.forEach(data[config_entry.low_level+'s'], (solution) => {
	
		let provider_raw_ids = _.compact(data.solutions_with_providers[solution.name])
		let providers = _.filter(data.providers, (provider) => { return provider_raw_ids.includes(provider.Id) })
		let provider_id = _.map(providers, (provider) => { return provider.provider_id[0] })
		
		// Get the non-provider related entries for the solution:
		const related_entries = {}
		_.forEach(config_entry.additional, (filter_name) => {
			let id_field = _.filter(config_entry.id_fields, (field) => { return field === filter_name+'_id' })
			related_entries[filter_name] = {}
			related_entries[filter_name].entries = _.filter(data[filter_name+'s'], (entry) => { return entry.productIds.includes(solution.id)})
			related_entries[filter_name].ids = _.map(related_entries[filter_name].entries, (entry) => { return entry[id_field][0] })
		})

		for(let key in related_entries){
			let related_entry = related_entries[key]
			// Get the other related entries besides the current one:
			let ommited_related = _.omit(related_entries, [key])
		
			_.forEach(ommited_related, (value, key) => {
				let id_field = _.filter(config_entry.id_fields, (field) => { return field === key+'_id' })
				// Assign all 'besides the current one' ids to the current related entries:
				related_entry.entries = _.map(related_entry.entries, (entry) => {
					entry[id_field] = _.uniq(entry[id_field].concat(value.ids))
					return entry
				})
			})
			
			let id_field = _.filter(config_entry.id_fields, (field) => { return field === key+'_id' })

			// Assign related solution and provider ids to current related entries:
			related_entry.entries = _.map(related_entry.entries, (entry) => {
				entry.provider_id = _.uniq(entry.provider_id.concat(provider_id))
				entry[config_entry.low_level+'_id'] = _.uniq(entry[config_entry.low_level+'_id'].concat(solution[config_entry.low_level+'_id']))
				return entry
			})
			// Add ids for the current related entries to the solution and each related provider:
			solution[id_field] = solution[id_field].concat(related_entry.ids)
			providers = _.map(providers, (prov) => {
				prov[id_field] = _.uniq(prov[id_field].concat(related_entry.ids))
				return prov
			})
		}
		// Add solution ids to each related provider
		providers = _.map(providers, (prov) => {
			prov[config_entry.low_level+'_id'] = _.uniq(prov[config_entry.low_level+'_id'].concat(solution[config_entry.low_level+'_id']))
			return prov
		})
		// Add related provider ids to the current solution:
		solution.provider_id = solution.provider_id.concat(provider_id)
	})
}

initializeFields = (item, fields) => {
	for (let key in fields){
		item[key] = fields[key]
	}
}

buildSolutionsWithProvider = (entries) => {
	const solutions_with_provider = {}

	_.forEach(entries, (item) => {
		if(solutions_with_provider[item.Name]) {
			solutions_with_provider[item.Name].push(item.Participant__c)
		}
		else {
			solutions_with_provider[item.Name] = [item.Participant__c]
		}
	})
	return solutions_with_provider
}

processFields = (all_entries) => {
	let new_entries = _.map(all_entries, (entry) => {
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

processProviderEntry = (entry) => {
	entry.summary = entry.Company_Description__c
	entry.name = entry.Name
	entry.links = [{url: provider_url+entry.Id, display_name: entry.name}]
	delete entry.Company_Description__c
	delete entry.Name
	delete entry.Website__c
	return entry
}

processLinks = (entry) => {
	entry.links = _.map(entry.links, (link) => { 
		link.display_name = link.name
		delete link.id
		delete link.name
		return link
	})
	return entry
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


exports.handler = (event, context, callback) => {
  conn.login(sf_username, sf_password, (err, res) => {
		if (err) { return console.error(err) }

		getObjects()
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
