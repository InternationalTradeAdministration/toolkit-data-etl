require('../../spec_helper')

const EnvironmentalSolutionsProcessor = require('../../../lib/processors/environmental_solutions_processor')

const _ = require('lodash')

describe('EnvironmentalSolutionsProcessor', function () {
  describe('.buildFilters()', function () {
    context('when multiple asset.Product2 with the same Name are present', function () {
      let assets, processor, queryAssetSpy, extractWebResourcesSpy

      beforeEach(() => {
        assets = [
          {
            Product2: {
              Id: 'sfdc_product_1',
              Name: 'Product Name',
              Class__c: 'Product class 1'
            },
            Participant__r: {
              Id: 'sfdc_participant_1',
              Name: 'Same Name Different ID'
            }
          },
          {
            Product2: {
              Id: 'sfdc_product_2',
              Name: 'Product Name',
              Class__c: 'Product class 2'
            },
            Participant__r: {
              Id: 'sfdc_participant_2',
              Name: 'Same Name Different ID'
            }
          }
        ]

        processor = new EnvironmentalSolutionsProcessor('sfdc_program_1')

        queryAssetSpy = jest.spyOn(processor, '_queryAssets').mockImplementation(() => {
          return Promise.resolve(assets)
        })

        const sfdcIssue = {
          Type__c: 'Environmental Issue',
          Id: 'sfdc_web_resource_1',
          Name: 'Web Resource Environmental Issue 1',
          Summary__c: 'Web Resource Environmental Issue 1 Summary',
          links: [
            {
              Id: 'web_resource_link_id_1',
              Web_Resource__c: 'sfdc_web_resource_1',
              DisplayName__c: 'Environmental Issue Link 1',
              URL__c: 'https://example.org/environmental_issue_link_1'
            },
            {
              Id: 'web_resource_link_id_3',
              Web_Resource__c: 'sfdc_web_resource_1',
              DisplayName__c: 'Environmental Issue Link 3',
              URL__c: 'https://example.org/environmental_issue_link_3'
            }
          ]
        }

        let webResources = {
          sfdc_product_1: {
            'Environmental Issue': [sfdcIssue],
            'EPA Regulation': [
              {
                Type__c: 'EPA Regulation',
                Id: 'sfdc_web_resource_2',
                Name: 'Web Resource EPA Regulation A',
                links: [
                  {
                    Id: 'web_resource_link_id_2',
                    Web_Resource__c: 'sfdc_web_resource_2',
                    DisplayName__c: 'Link 2',
                    URL__c: 'https://example.org/link_2'
                  }
                ]
              },
              {
                Type__c: 'EPA Regulation',
                Id: 'sfdc_web_resource_3',
                Name: 'Web Resource EPA Regulation B',
                Summary__c: 'Web Resource EPA Regulation B Summary',
                links: [
                  {
                    Id: 'web_resource_link_id_3',
                    Web_Resource__c: 'sfdc_web_resource_3',
                    DisplayName__c: 'EPA Regulation 3 Link',
                    URL__c: 'https://example.org/epa_regulation_link_3'
                  }
                ]
              }
            ]
          },
          sfdc_product_2: {
            'Environmental Issue': [sfdcIssue],
            'EPA Regulation': [
              {
                Type__c: 'EPA Regulation',
                Id: 'sfdc_web_resource_3',
                Name: 'Web Resource EPA Regulation B',
                links: [
                  {
                    Id: 'web_resource_link_id_3',
                    Web_Resource__c: 'sfdc_web_resource_3',
                    DisplayName__c: 'Link 3',
                    URL__c: 'https://example.org/link_3'
                  }
                ]
              }
            ]
          }
        }

        extractWebResourcesSpy = jest.spyOn(processor, '_extractWebResources').mockImplementation(() => {
          return Promise.resolve(webResources)
        })
      })

      afterEach(() => {
        extractWebResourcesSpy.mockReset()
        extractWebResourcesSpy.mockRestore()
        queryAssetSpy.mockReset()
        queryAssetSpy.mockRestore()
      })

      it('returns Environmental Issue filters', function () {
        return processor.buildFilters()
          .then((filterMapByType) => {
            expect(queryAssetSpy).toHaveBeenCalled()
            expect(extractWebResourcesSpy).toHaveBeenCalledWith(assets)

            let issues = _.values(filterMapByType['Environmental Issue'])
            expect(issues).toHaveLength(1)

            let issue = issues[0].asJson()
            let expectedIssue = {
              type: 'Environmental Issue',
              name: 'Web Resource Environmental Issue 1',
              summary: 'Web Resource Environmental Issue 1 Summary',
              sfdc_id: ['sfdc_web_resource_1'],
              issue_id: [1],
              regulation_id: [1, 2],
              solution_id: [1],
              provider_id: [1, 2],
              links: [
                {
                  display_name: 'Environmental Issue Link 1',
                  url: 'https://example.org/environmental_issue_link_1'
                },
                {
                  display_name: 'Environmental Issue Link 3',
                  url: 'https://example.org/environmental_issue_link_3'
                }
              ]
            }

            expect(issue).toEqual(expectedIssue)
          })
      })

      it('returns EPA Regulation filters', function () {
        return processor.buildFilters()
          .then((filterMapByType) => {
            expect(queryAssetSpy).toHaveBeenCalled()
            expect(extractWebResourcesSpy).toHaveBeenCalledWith(assets)

            let regulations = _.values(filterMapByType['EPA Regulation'])
            expect(regulations).toHaveLength(2)

            let regulation = regulations[1].asJson()
            let expectedRegulation = {
              type: 'EPA Regulation',
              name: 'Web Resource EPA Regulation B',
              summary: 'Web Resource EPA Regulation B Summary',
              sfdc_id: ['sfdc_web_resource_3'],
              issue_id: [1],
              regulation_id: [2],
              solution_id: [1],
              provider_id: [1, 2],
              links: [
                {
                  display_name: 'EPA Regulation 3 Link',
                  url: 'https://example.org/epa_regulation_link_3'
                }
              ]
            }

            expect(regulation).toEqual(expectedRegulation)
          })
      })

      it('returns Solution filters', function () {
        return processor.buildFilters()
          .then((filterMapByType) => {
            expect(queryAssetSpy).toHaveBeenCalled()
            expect(extractWebResourcesSpy).toHaveBeenCalledWith(assets)

            let solutions = _.values(filterMapByType.Solution)
            expect(solutions).toHaveLength(1)

            let solution = solutions[0].asJson()
            let expectedSolution = {
              name: 'Product Name',
              type: 'Solution',
              summary: null,
              sfdc_id: [
                'sfdc_product_1',
                'sfdc_product_2'
              ],
              issue_id: [1],
              regulation_id: [1, 2],
              solution_id: [1],
              provider_id: [1, 2],
              links: []
            }

            expect(solution).toEqual(expectedSolution)
          })
      })

      it('returns Provider filters', function () {
        return processor.buildFilters('sfdc_program_1')
          .then((filterMapByType) => {
            expect(queryAssetSpy).toHaveBeenCalled()
            expect(extractWebResourcesSpy).toHaveBeenCalledWith(assets)

            let providers = _.values(filterMapByType.Provider)
            expect(providers).toHaveLength(2)

            let provider = providers[0].asJson()
            let expectedProvider = {
              name: 'Same Name Different ID',
              type: 'Provider',
              summary: null,
              sfdc_id: ['sfdc_participant_1'],
              issue_id: [1],
              regulation_id: [1, 2],
              solution_id: [1],
              provider_id: [1],
              links: [
                {
                  display_name: 'Same Name Different ID',
                  url: 'https://www.export.gov/provider?id=sfdc_participant_1'
                }
              ]
            }
            expect(provider).toEqual(expectedProvider)
          })
      })
    })
  })
})
