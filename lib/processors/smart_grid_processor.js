const _ = require('lodash')

const IdFactory = require('../id_factory')
const Processor = require('../processors/processor')
const Transformer = require('../transformer')

const SUB_SECTOR = 'Sub-Sector'
const CATEGORY = 'Category'
const PRODUCT_TYPE = 'Product Type'
const PROVIDER = 'Provider'

const SUB_SECTOR_ID = 'sub_sector_id'
const CATEGORY_ID = 'category_id'
const PRODUCT_TYPE_ID = 'product_type_id'
const PROVIDER_ID = 'provider_id'

class SmartGridProcessor extends Processor {
  constructor (programId) {
    super('smart_grid', programId)
    this._filterMapByType = {
      'Sub-Sector': {},
      Category: {},
      'Product Type': {},
      Provider: {}
    }
    this._idFactory = new IdFactory(
      SUB_SECTOR_ID,
      CATEGORY_ID,
      PRODUCT_TYPE_ID,
      PROVIDER_ID)
  }

  buildFilters () {
    let promiseData = {}
    return this._queryAssets()
      .then((assets) => {
        promiseData.assets = assets
        return this._extractWebResources(assets)
      })
      .then((webResourcesByProductId) => {
        console.log('processing webResourcesByProductId')
        _.forEach(promiseData.assets, (asset) => {
          let category = this._buildFilterFromProductClass(
            CATEGORY,
            CATEGORY_ID,
            asset)
          let productType = this._buildFilterFromProduct(
            PRODUCT_TYPE,
            PRODUCT_TYPE_ID,
            asset)
          let provider = this._buildFilterFromProvider(
            PROVIDER,
            PROVIDER_ID,
            asset)

          _.forEach(webResourcesByProductId[asset.Product2.Id], (webResource) => {
            let subSector = this._buildFilterFromWebResource(
              SUB_SECTOR,
              SUB_SECTOR_ID,
              webResource)

            Transformer.transform(
              subSector,
              category,
              productType,
              provider)
          })
        })
        return this._filterMapByType
      })
  }
}

module.exports = SmartGridProcessor
