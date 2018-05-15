const _ = require('lodash');
const provider_url = 'https://www.export.gov/provider?id=';

postProcessFields = (all_entries, config_entry) => {
	let new_entries = _.compact(_.map(all_entries, (entry) => {
		if(entry.type === 'Provider'){
			if(_.isEmpty(entry[config_entry.low_level+'_id'])) // Exclude providers with no active Solutions
				return null;
			entry = processProviderEntry(entry);
		} 
		else if(!_.isEmpty(entry.links)){
			entry = processLinks(entry);
		}
		if(!entry.summary)
			entry.summary = null;
		entry = _.omit(entry, ['productIds', 'linksSize', 'id', 'attributes', 'Id']);
		return entry;
	}))
	return new_entries;
}

processProviderEntry = (entry) => {
	entry.summary = entry.Company_Description__c;
	entry.name = entry.Name;
	entry.links = [{url: provider_url+entry.Id, display_name: entry.name}];
	delete entry.Company_Description__c;
	delete entry.Name;
	delete entry.Website__c;
	return entry;
}

processLinks = (entry) => {
	entry.links = _.map(entry.links, (link) => { 
		link.display_name = link.name;
		delete link.id;
		delete link.name;
		return link;
	})
	return entry;
}

module.exports = postProcessFields;