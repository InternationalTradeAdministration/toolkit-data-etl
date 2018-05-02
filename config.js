var config = [
	{
		program_id: 'a31t0000000CyD6',
		languages: ['en'],
		id_fields: ['solution_id', 'provider_id', 'issue_id', 'regulation_id'],
		filters: [
			{
				api_name: 'Environmental Issue',
				name: 'issue'
			},
			{
				api_name: 'EPA Regulation',
				name: 'regulation'
			},
			{
				api_name: 'Solution',
				name: 'solution'
			},			
			{
				api_name: 'Provider',
				name: 'provider'
			}
		],
		low_level: 'solution',
		additional: ['regulation', 'issue']
	}
]

module.exports = config;