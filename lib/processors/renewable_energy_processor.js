const _ = require('lodash')

const Processor = require('../processors/processor')
const Transformer = require('../transformer')

const SECTOR = 'Sector'
const PROJECT_TYPE = 'Project Type'
const OFFERING = 'Offering'
const EQUIPMENT_TYPE = 'Equipment/Service Type'
const EQUIPMENT = 'Specific Equipment/Service'
const PROVIDER = 'Provider'

const SECTOR_ID = 'sector_id'
const PROJECT_TYPE_ID = 'project_type_id'
const OFFERING_ID = 'offering_id'
const EQUIPMENT_TYPE_ID = 'equipment_type_id'
const EQUIPMENT_ID = 'equipment_id'
const PROVIDER_ID = 'provider_id'

class RenewableEnergyProcessor extends Processor {
  constructor (programId) {
    super(
      'renewable_energy',
      programId,
      [SECTOR, PROJECT_TYPE, OFFERING, EQUIPMENT_TYPE, EQUIPMENT, PROVIDER],
      [SECTOR_ID, PROJECT_TYPE_ID, OFFERING_ID, EQUIPMENT_TYPE_ID, EQUIPMENT_ID, PROVIDER_ID])
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
          let projectType = this._buildFilterFromProductClass(
            PROJECT_TYPE,
            PROJECT_TYPE_ID,
            asset)
          let offering = this._buildFilterFromProductOffering(
            OFFERING,
            OFFERING_ID,
            asset)
          let equipmentType = this._buildFilterFromProductCategory(
            EQUIPMENT_TYPE,
            EQUIPMENT_TYPE_ID,
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
            let sector = this._buildFilterFromWebResource(
              SECTOR,
              SECTOR_ID,
              webResource)

            Transformer.transform(
              sector,
              projectType,
              offering,
              equipmentType,
              equipment,
              provider)
          })
        })
        return this._filterMapByType
      })
  }
}

module.exports = RenewableEnergyProcessor
