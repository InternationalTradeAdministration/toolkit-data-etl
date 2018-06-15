const _ = require('lodash')

const IdFactory = require('../id_factory')
const Processor = require('../processors/processor')
const Transformer = require('../transformer')

const CAPABILITY = 'Capability'
const PIA = 'Performance Improvement Area'
const PROVIDER = 'Provider'
const SOLUTION = 'Solution'

const CAPABILITY_ID = 'capability_id'
const PIA_ID = 'improvement_area_id'
const PROVIDER_ID = 'provider_id'
const SOLUTION_ID = 'solution_id'

class NextGenProcessor extends Processor {
  constructor (programId) {
    super('next_gen', programId)
    this._filterMapByType = {
      Capability: {},
      'Performance Improvement Area': {},
      Solution: {},
      Provider: {}
    }
    this._idFactory = new IdFactory(
      PIA_ID,
      CAPABILITY_ID,
      SOLUTION_ID,
      PROVIDER_ID)
  }

  buildFilters () {
    let promiseData = {}
    return this._queryAssets()
      .then(assets => {
        promiseData.assets = assets
        return this._extractWebResources(assets)
      })
      .then(webResourcesByProductId => {
        console.log('processing webResourcesByProductId')
        _.forEach(promiseData.assets, (asset) => {
          let capability = this._buildFilterFromProductClass(
            CAPABILITY,
            CAPABILITY_ID,
            asset)
          let product = this._buildFilterFromProduct(
            SOLUTION,
            SOLUTION_ID,
            asset)
          let provider = this._buildFilterFromProvider(
            PROVIDER,
            PROVIDER_ID,
            asset)
          _.forEach(webResourcesByProductId[asset.Product2.Id], (webResource) => {
            let pia = this._buildFilterFromWebResource(
              PIA,
              PIA_ID,
              webResource)
            Transformer.transform(pia, capability, product, provider)
          })
        })
        return this._filterMapByType
      })
  }
}

module.exports = NextGenProcessor