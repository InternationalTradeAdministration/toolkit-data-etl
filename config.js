var config = [
	{
		program_id: 'a31t0000000CyD6',
		language: 'ar',
		id_fields: ['solution_id', 'provider_id', 'issue_id', 'regulation_id'],
		filters: [
			{
				api_name: 'قضية بيئية',
				name: 'issue'
			},
			{
				api_name: 'لائحة وكالة حماية البيئة',
				name: 'regulation'
			},
			{
				api_name: 'حل',
				name: 'solution'
			},			
			{
				api_name: 'Provider',
				name: 'provider'
			}
		],
		low_level: 'solution',
		additional: ['regulation', 'issue'],
		freshen_url: 'https://api.trade.gov/v1/environmental_solutions_ar/freshen.json?api_key=',
		file_name: 'es_arabic'
	},
	{
		program_id: 'a31t0000000CyD6',
		language: 'zh',
		id_fields: ['solution_id', 'provider_id', 'issue_id', 'regulation_id'],
		filters: [
			{
				api_name: '环境问题',
				name: 'issue'
			},
			{
				api_name: '环保署管制',
				name: 'regulation'
			},
			{
				api_name: '解决方案',
				name: 'solution'
			},			
			{
				api_name: 'Provider',
				name: 'provider'
			}
		],
		low_level: 'solution',
		additional: ['regulation', 'issue'],
		freshen_url: 'https://api.trade.gov/v1/environmental_solutions_zh/freshen.json?api_key=',
		file_name: 'es_chinese'
	},
		{
		program_id: 'a31t0000000CyD6',
		language: 'fr',
		id_fields: ['solution_id', 'provider_id', 'issue_id', 'regulation_id'],
		filters: [
			{
				api_name: 'Problème environnemental',
				name: 'issue'
			},
			{
				api_name: "Régulation de l'EPA",
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
		additional: ['regulation', 'issue'],
		freshen_url: 'https://api.trade.gov/v1/environmental_solutions_fr/freshen.json?api_key=',
		file_name: 'es_french'
	},
	{
		program_id: 'a31t0000000CyD6',
		language: 'pt',
		id_fields: ['solution_id', 'provider_id', 'issue_id', 'regulation_id'],
		filters: [
			{
				api_name: 'Questão Ambiental',
				name: 'issue'
			},
			{
				api_name: "EPA Regulamento",
				name: 'regulation'
			},
			{
				api_name: 'Solução',
				name: 'solution'
			},			
			{
				api_name: 'Provider',
				name: 'provider'
			}
		],
		low_level: 'solution',
		additional: ['regulation', 'issue'],
		freshen_url: 'https://api.trade.gov/v1/environmental_solutions_pt/freshen.json?api_key=',
		file_name: 'es_portuguese'
	},
	{
		program_id: 'a31t0000000CyD6',
		language: 'es',
		id_fields: ['solution_id', 'provider_id', 'issue_id', 'regulation_id'],
		filters: [
			{
				api_name: 'Cuestión Ambiental',
				name: 'issue'
			},
			{
				api_name: "Reglamento de la EPA",
				name: 'regulation'
			},
			{
				api_name: 'Solución',
				name: 'solution'
			},			
			{
				api_name: 'Provider',
				name: 'provider'
			}
		],
		low_level: 'solution',
		additional: ['regulation', 'issue'],
		freshen_url: 'https://api.trade.gov/v1/environmental_solutions_es/freshen.json?api_key=',
		file_name: 'es_spanish'
	},
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
		additional: ['regulation', 'issue'],
		freshen_url: 'https://api.trade.gov/v1/environmental_solutions/freshen.json?api_key=',
		file_name: 'environmental_solutions'
	},
	{
		program_id: 'a31t0000000CyD6',
		languages: ['ru'],
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
		additional: ['regulation', 'issue'],
		freshen_url: 'https://api.trade.gov/v1/environmental_solutions_ru/freshen.json?api_key=',
		file_name: 'es_russian'
	},
	{
		program_id: 'a31t0000000CyDL',
		languages: 'en',
		id_fields: ['equipment_id', 'provider_id', 'phase_id', 'category_id'],
		filters: [
			{
				api_name: 'Equipment/Service Category',
				name: 'category'
			},
			{
				api_name: 'Project Phase',
				name: 'phase'
			},
			{
				api_name: 'Equipment/Service',
				name: 'equipment'
			},			
			{
				api_name: 'Provider',
				name: 'provider'
			}
		],
		low_level: 'equipment',
		additional: ['phase', 'category'],
		freshen_url: 'https://api.trade.gov/v1/oil_and_gas/freshen.json?api_key=',
		file_name: 'oil_and_gas'
	},
	{
		program_id: 'a31t0000000CyDQ',
		language: 'en',
		id_fields: ['equipment_id', 'provider_id', 'sector_id', 'offering_id', 'equipment_type_id', 'project_type_id'],
		filters: [
			{
				api_name: 'Project Type',
				name: 'project_type'
			},
			{
				api_name: 'Equipment/Service Type',
				name: 'equipment_type'
			},
			{
				api_name: 'Offering',
				name: 'offering'
			},	
			{
				api_name: 'Sector',
				name: 'sector'
			},
			{
				api_name: 'Specific Equipment/Service',
				name: 'equipment'
			},
			{
				api_name: 'Provider',
				name: 'provider'
			}
		],
		low_level: 'equipment',
		additional: ['sector', 'offering', 'equipment_type', 'project_type'],
		freshen_url: 'https://api.trade.gov/v1/renewable_energy/freshen.json?api_key=',
		file_name: 'renewable_energy'
	},
	{
		program_id: 'a31t0000000CyDG',
		language: 'en',
		id_fields: ['capability_id', 'improvement_area_id', 'solution_id', 'provider_id'],
		filters: [
			{
				api_name: 'Performance Improvement Area',
				name: 'improvement_area'
			},
			{
				api_name: 'Capability',
				name: 'capability'
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
		additional: ['capability', 'improvement_area'],
		freshen_url: 'https://api.trade.gov/v1/next_gen/freshen.json?api_key=',
		file_name: 'next_gen'
	},
	{
		program_id: 'a31t0000000CyDV',
		language: 'en',
		id_fields: ['category_id', 'sub_sector_id', 'product_type_id', 'provider_id'],
		filters: [
			{
				api_name: 'Category',
				name: 'category'
			},
			{
				api_name: 'Sub-Sector',
				name: 'sub_sector'
			},	
			{
				api_name: 'Product Type',
				name: 'product_type'
			},
			{
				api_name: 'Provider',
				name: 'provider'
			}
		],
		low_level: 'product_type',
		additional: ['sub_sector', 'category'],
		freshen_url: 'https://api.trade.gov/v1/smart_grid/freshen.json?api_key=',
		file_name: 'smart_grid'
	},
	{
		program_id: 'a31t0000000CyDB',
		language: 'en',
		id_fields: ['sector_id', 'sub_sector_id', 'product_id', 'provider_id'],
		filters: [
			{
				api_name: 'Sector',
				name: 'sector'
			},
			{
				api_name: 'Sub-sector',
				name: 'sub_sector'
			},	
			{
				api_name: 'Product',
				name: 'product'
			},
			{
				api_name: 'Provider',
				name: 'provider'
			}
		],
		low_level: 'product',
		additional: ['sub_sector', 'sector'],
		freshen_url: 'https://api.trade.gov/v1/civil_nuclear/freshen.json?api_key=',
		file_name: 'civil_nuclear'
	}
];

module.exports = config;