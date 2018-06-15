const _ = require('lodash')

require('../../spec_helper')

const CivilNuclearProcessor = require('../../../lib/processors/civil_nuclear_processor')

describe('CivilNuclearProcessor', function () {
  describe('.buildFilters()', function () {
    context('when multiple asset.Product2 with the same Name are present', function () {
      let processor, spy

      beforeEach(() => {
        let assets = [
          {
            Product2: {
              Id: 'sfdc_product_1',
              Name: 'Product Name',
              Class__c: 'Product class 1',
              Category__c: 'Product category 1'
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

        processor = new CivilNuclearProcessor('sfdc_program_1')
        spy = jest.spyOn(processor, '_queryAssets').mockImplementation(() => {
          return Promise.resolve(assets)
        })
      })

      afterEach(() => {
        spy.mockReset()
        spy.mockRestore()
      })

      it('returns Sector filters', function () {
        return processor.buildFilters('sfdc_program_1')
          .then((filterMapByType) => {
            expect(spy).toHaveBeenCalledWith('sfdc_program_1')

            let sectors = _.values(filterMapByType.Sector)
            expect(sectors).toHaveLength(2)

            let sector = sectors[1].asJson()
            let expectedSector = {
              name: 'Product class 2',
              type: 'Sector',
              summary: null,
              sfdc_id: [],
              product_id: [1],
              provider_id: [2],
              sector_id: [2],
              links: []
            }
            expect(sector).toEqual(expectedSector)
          })
      })

      it('returns Sub-Sector filters', function () {
        return processor.buildFilters('sfdc_program_1')
          .then((filterMapByType) => {
            let subSectors = _.values(filterMapByType['Sub-Sector'])
            expect(subSectors).toHaveLength(1)

            let subSector = subSectors[0].asJson()
            let expectedSubSector = {
              name: 'Product category 1',
              type: 'Sub-Sector',
              summary: null,
              sfdc_id: [],
              product_id: [1],
              provider_id: [1],
              sector_id: [1],
              sub_sector_id: [1],
              links: []
            }
            expect(subSector).toEqual(expectedSubSector)
          })
      })

      it('returns a Product filter with multiple sfdc_id', function () {
        return processor.buildFilters()
          .then((filterMapByType) => {
            expect(spy).toHaveBeenCalledWith('sfdc_program_1')

            let products = _.values(filterMapByType.Product)
            expect(products).toHaveLength(1)

            let product = products[0].asJson()
            let expectedProduct = {
              type: 'Product',
              name: 'Product Name',
              summary: null,
              sfdc_id: ['sfdc_product_1', 'sfdc_product_2'],
              sector_id: [1, 2],
              sub_sector_id: [1],
              product_id: [1],
              provider_id: [1, 2],
              links: []
            }
            expect(product).toEqual(expectedProduct)
          })
      })

      it('returns Provider filters', function () {
        return processor.buildFilters('sfdc_program_1')
          .then((filterMapByType) => {
            expect(spy).toHaveBeenCalledWith('sfdc_program_1')

            let providers = _.values(filterMapByType.Provider)
            expect(providers).toHaveLength(2)

            let provider = providers[0].asJson()
            let expectedProvider = {
              name: 'Same Name Different ID',
              type: 'Provider',
              summary: null,
              sfdc_id: ['sfdc_participant_1'],
              product_id: [1],
              provider_id: [1],
              sector_id: [1],
              sub_sector_id: [1],
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
