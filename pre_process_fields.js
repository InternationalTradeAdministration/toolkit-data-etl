const _ = require('lodash');

preProcessFields = (query_result, config_entry) => {
	const data = {};
	_.forEach(query_result.filter_groups, (group) => {
		// Get short name of filter from full name:
		const filter = _.filter(config_entry.filters, (filter) => {
			return filter.api_name === group.name;
		})[0]

		data[filter.name+'s'] = _.map(group.filterItems, (item, index) => {
			return addIdAndTypeFields(item, index, filter, config_entry);
		})
	})
	data.solutions_with_providers = buildSolutionsWithProvider(query_result.solutions_with_providers);

	return data;
}

addIdAndTypeFields = (item, index, filter, config_entry) => {
	const fields = {};
	_.forEach(config_entry.id_fields, (field) => {
		fields[field] = [];
	})
	fields[filter.name+'_id'].push(index);
	fields.type = filter.api_name;
	initializeFields(item, fields);
	return item;
}

initializeFields = (item, fields) => {
	for (let key in fields){
		item[key] = fields[key];
	}
}

buildSolutionsWithProvider = (entries) => {
	const solutions_with_provider = {};

	_.forEach(entries, (item) => {
		if(solutions_with_provider[item.Name]) {
			solutions_with_provider[item.Name].push(item.Participant__c);
		}
		else {
			solutions_with_provider[item.Name] = [item.Participant__c];
		}
	})
	return solutions_with_provider;
}

module.exports = preProcessFields;