const _ = require('lodash')

const IdFactory = require('../id_factory')
const Processor = require('../processors/processor')
const Transformer = require('../transformer')

const PRODUCT = 'Product'
const PROVIDER = 'Provider'
const SECTOR = 'Sector'
const SUB_SECTOR = 'Sub-Sector'

const PRODUCT_ID = 'product_id'
const PROVIDER_ID = 'provider_id'
const SECTOR_ID = 'sector_id'
const SUB_SECTOR_ID = 'sub_sector_id'

class CivilNuclearProcessor extends Processor {
  constructor (programId) {
    super('civil_nuclear', programId)
    this._filterMapByType = {
      Sector: {},
      'Sub-Sector': {},
      Product: {},
      Provider: {}
    }
    this._idFactory = new IdFactory(PRODUCT_ID, PROVIDER_ID, SECTOR_ID, SUB_SECTOR_ID)
  }

  buildFilters () {
    return this._queryAssets(this.programId)
      .then((assets) => {
        _.forEach(assets, (asset) => {
          let sector = this._buildFilterFromProductClass(
            SECTOR,
            SECTOR_ID,
            asset)
          let subSector = this._buildFilterFromProductCategory(
            SUB_SECTOR,
            SUB_SECTOR_ID,
            asset)
          let product = this._buildFilterFromProduct(
            PRODUCT,
            PRODUCT_ID,
            asset)
          let provider = this._buildFilterFromProvider(
            PROVIDER,
            PROVIDER_ID,
            asset)
          Transformer.transform(product, provider, sector, subSector)
        })
        return this._filterMapByType
      })
  }
}

module.exports = CivilNuclearProcessor
