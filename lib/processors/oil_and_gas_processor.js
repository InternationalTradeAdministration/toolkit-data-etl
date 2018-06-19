const _ = require('lodash')

const Processor = require('../processors/processor')
const Transformer = require('../transformer')

const PROJECT_PHASE = 'Project Phase'
const CATEGORY = 'Equipment/Service Category'
const EQUIPMENT = 'Equipment/Service'
const PROVIDER = 'Provider'

const PROJECT_PHASE_ID = 'phase_id'
const CATEGORY_ID = 'category_id'
const EQUIPMENT_ID = 'equipment_id'
const PROVIDER_ID = 'provider_id'

class OilAndGasProcessor extends Processor {
  constructor (programId) {
    super(
      'oil_and_gas',
      programId,
      [PROJECT_PHASE, CATEGORY, EQUIPMENT, PROVIDER],
      [PROJECT_PHASE_ID, CATEGORY_ID, EQUIPMENT_ID, PROVIDER_ID])
  }

  buildFilters () {
    let promiseData = {}
    return this._queryAssets()
      .then((assets) => {
        promiseData.assets = assets
        return this._extractWebResources(assets)
      })
      .then((webResourcesByProductId) => {
        _.forEach(promiseData.assets, (asset) => {
          let category = this._buildFilterFromProductClass(
            CATEGORY,
            CATEGORY_ID,
            asset)
          let equipment = this._buildFilterFromProduct(
            EQUIPMENT,
            EQUIPMENT_ID,
            asset)
          let provider = this._buildFilterFromProvider(
            PROVIDER,
            PROVIDER_ID,
            asset)

          _.forEach(webResourcesByProductId[asset.Product2.Id], (webResource) => {
            let projectPhase = this._buildFilterFromWebResource(
              PROJECT_PHASE,
              PROJECT_PHASE_ID,
              webResource)

            Transformer.transform(
              projectPhase,
              category,
              equipment,
              provider)
          })
        })
        return this._filterMapByType
      })
  }
}

module.exports = OilAndGasProcessor
