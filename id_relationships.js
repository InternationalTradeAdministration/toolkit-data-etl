const _ = require('lodash')

assignIds = (data, config_entry) => {
	_.forEach(data[config_entry.low_level+'s'], (solution) => {
	
		let provider_raw_ids = _.compact(data.solutions_with_providers[solution.name]);
		let providers = _.filter(data.providers, (provider) => { return provider_raw_ids.includes(provider.Id) });
		let provider_id = _.map(providers, (provider) => { return provider.provider_id[0] });
		
		// Get the non-provider related entries for the solution:
		const related_entries = {};
		_.forEach(config_entry.additional, (filter_name) => {
			let id_field = _.filter(config_entry.id_fields, (field) => { return field === filter_name+'_id' });
			related_entries[filter_name] = {};
			related_entries[filter_name].entries = _.filter(data[filter_name+'s'], (entry) => { return entry.productIds.includes(solution.id)});
			related_entries[filter_name].ids = _.map(related_entries[filter_name].entries, (entry) => { return entry[id_field][0] });
		})

		for(let key in related_entries){
			let related_entry = related_entries[key];
			// Get the other related entries besides the current one:
			let ommited_related = _.omit(related_entries, [key]);
		
			_.forEach(ommited_related, (value, key) => {
				let id_field = _.filter(config_entry.id_fields, (field) => { return field === key+'_id' });
				// Assign all 'besides the current one' ids to the current related entries:
				related_entry.entries = _.map(related_entry.entries, (entry) => {
					entry[id_field] = _.uniq(entry[id_field].concat(value.ids));
					return entry;
				})
			})
			
			let id_field = _.filter(config_entry.id_fields, (field) => { return field === key+'_id' });

			// Assign related solution and provider ids to current related entries:
			related_entry.entries = _.map(related_entry.entries, (entry) => {
				entry.provider_id = _.uniq(entry.provider_id.concat(provider_id));
				entry[config_entry.low_level+'_id'] = _.uniq(entry[config_entry.low_level+'_id'].concat(solution[config_entry.low_level+'_id']));
				return entry;
			})
			// Add ids for the current related entries to the solution and each related provider:
			solution[id_field] = solution[id_field].concat(related_entry.ids);
			providers = _.map(providers, (prov) => {
				prov[id_field] = _.uniq(prov[id_field].concat(related_entry.ids));
				return prov;
			})
		}
		// Add solution ids to each related provider
		providers = _.map(providers, (prov) => {
			prov[config_entry.low_level+'_id'] = _.uniq(prov[config_entry.low_level+'_id'].concat(solution[config_entry.low_level+'_id']));
			return prov;
		})
		// Add related provider ids to the current solution:
		solution.provider_id = solution.provider_id.concat(provider_id);
	})
}

module.exports = assignIds