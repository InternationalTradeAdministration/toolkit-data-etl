require('../../spec_helper')

const NextGenProcessor = require('../../../lib/processors/next_gen_processor')

const _ = require('lodash')

describe('NextGenProcessor', function () {
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

        processor = new NextGenProcessor('sfdc_program_1')

        queryAssetSpy = jest.spyOn(processor, '_queryAssets').mockImplementation(() => {
          return Promise.resolve(assets)
        })

        let webResources = {
          sfdc_product_1: {
            'Performance Improvement Area': [
              {
                Id: 'sfdc_web_resource_1',
                Name: 'Web Resource 1',
                links: []
              }
            ]
          },
          sfdc_product_2: {
            'Performance Improvement Area': [
              {
                Id: 'sfdc_web_resource_2',
                Name: 'Web Resource 2',
                Summary__c: 'Web Resource 2 Summary',
                links: []
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

      it('returns a Performance Improvement Area filter', function () {
        return processor.buildFilters()
          .then((filterMapByType) => {
            expect(queryAssetSpy).toHaveBeenCalled()
            expect(extractWebResourcesSpy).toHaveBeenCalledWith(assets)

            let areas = _.values(filterMapByType['Performance Improvement Area'])
            expect(areas).toHaveLength(2)

            let area = areas[1].asJson()
            let expectedArea = {
              name: 'Web Resource 2',
              type: 'Performance Improvement Area',
              summary: 'Web Resource 2 Summary',
              sfdc_id: ['sfdc_web_resource_2'],
              improvement_area_id: [2],
              capability_id: [2],
              solution_id: [1],
              provider_id: [2],
              links: []
            }

            expect(area).toEqual(expectedArea)
          })
      })

      it('returns Capability filters', function () {
        return processor.buildFilters()
          .then((filterMapByType) => {
            expect(queryAssetSpy).toHaveBeenCalled()
            expect(extractWebResourcesSpy).toHaveBeenCalledWith(assets)

            let capabilities = _.values(filterMapByType.Capability)
            expect(capabilities).toHaveLength(2)

            let capability = capabilities[1].asJson()
            let expectedCapability = {
              name: 'Product class 2',
              type: 'Capability',
              summary: null,
              sfdc_id: [],
              improvement_area_id: [2],
              capability_id: [2],
              solution_id: [1],
              provider_id: [2],
              links: []
            }

            expect(capability).toEqual(expectedCapability)
          })
      })

      it('returns a Solution filter', function () {
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
              improvement_area_id: [1, 2],
              capability_id: [1, 2],
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

            let provider = providers[1].asJson()
            let expectedProvider = {
              name: 'Same Name Different ID',
              type: 'Provider',
              summary: null,
              sfdc_id: ['sfdc_participant_2'],
              improvement_area_id: [2],
              capability_id: [2],
              solution_id: [1],
              provider_id: [2],
              links: [
                {
                  display_name: 'Same Name Different ID',
                  url: 'https://www.export.gov/provider?id=sfdc_participant_2'
                }
              ]
            }
            expect(provider).toEqual(expectedProvider)
          })
      })
    })
  })
})
