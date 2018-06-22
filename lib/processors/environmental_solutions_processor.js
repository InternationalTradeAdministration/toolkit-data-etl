const _ = require('lodash')

const Processor = require('../processors/processor')
const Transformer = require('../transformer')

const ISSUE = 'Environmental Issue'
const REGULATION = 'EPA Regulation'
const SOLUTION = 'Solution'
const PROVIDER = 'Provider'

const ISSUE_ID = 'issue_id'
const REGULATION_ID = 'regulation_id'
const SOLUTION_ID = 'solution_id'
const PROVIDER_ID = 'provider_id'

class EnvironmentalSolutionsProcessor extends Processor {
  constructor (programId) {
    super(
      'environmental_solutions',
      programId,
      [ISSUE, REGULATION, SOLUTION, PROVIDER],
      [ISSUE_ID, REGULATION_ID, SOLUTION_ID, PROVIDER_ID])
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
          let solution = this._buildFilterFromProduct(
            SOLUTION,
            SOLUTION_ID,
            asset)
          let provider = this._buildFilterFromProvider(
            PROVIDER,
            PROVIDER_ID,
            asset)

          let webResourcesByType = webResourcesByProductId[asset.Product2.Id]

          _.forEach(webResourcesByType[ISSUE], (issueWebResource) => {
            let issue = this._buildFilterFromWebResource(
              ISSUE,
              ISSUE_ID,
              issueWebResource)

            _.forEach(webResourcesByType[REGULATION], (regulationWebResource) => {
              let regulation = this._buildFilterFromWebResource(
                REGULATION,
                REGULATION_ID,
                regulationWebResource)

              Transformer.transform(
                issue,
                regulation,
                solution,
                provider)
            })
          })
        })
        return this._filterMapByType
      })
  }
}

module.exports = EnvironmentalSolutionsProcessor
