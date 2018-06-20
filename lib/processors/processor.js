const _ = require('lodash')

const CoreExtractor = require('../core_extractor')
const IdFactory = require('../id_factory')
const JsforceUtil = require('../jsforce_util')
const Loader = require('../loader')
const WebResourceCollector = require('../web_resource_collector')

class Processor {
  constructor (type, programId, filterTypes, idFieldNames) {
    this.type = type
    this.programId = programId
    this._filterMapByType = _.reduce(
      filterTypes,
      (filterMapByType, filterType) => {
        filterMapByType[filterType] = {}
        return filterMapByType
      },
      {})
    this._idFactory = new IdFactory(idFieldNames)
  }

  process () {
    return new Promise((resolve, reject) => {
      this.buildFilters()
        .then(() => Loader.load(this, this.type, this._jsonFilters()))
        .then(results => resolve(results))
        .catch((err) => {
          this.log(err)
          reject(err)
        })
    })
  }

  _jsonFilters () {
    return _.flatten(_.map(_.values(this._filterMapByType), (values) => {
      return _.map(values, (filter) => {
        return filter.asJson()
      })
    }))
  }

  _queryAssets () {
    return JsforceUtil.queryAssets(this, this.programId)
  }

  _extractWebResources (assets) {
    let collector = new WebResourceCollector(this, assets)
    return collector.collect()
  }

  _buildFilterFromProductClass (type, idType, asset) {
    let params = this._buildExtractParams(type, idType, asset)
    params.productAttributeName = 'Class__c'
    return CoreExtractor.extractProductAttribute(params)
  }

  _buildFilterFromProductCategory (type, idType, asset) {
    let params = this._buildExtractParams(type, idType, asset)
    params.productAttributeName = 'Category__c'
    return CoreExtractor.extractProductAttribute(params)
  }

  _buildFilterFromProductOffering (type, idType, asset) {
    let params = this._buildExtractParams(type, idType, asset)
    params.productAttributeName = 'ProductOffering__c'
    return CoreExtractor.extractProductAttribute(params)
  }

  _buildFilterFromWebResource (type, idType, webResource) {
    let params = this._buildExtractParams(type, idType, webResource)
    return CoreExtractor.extractWebResource(params)
  }

  _buildFilterFromProduct (type, idType, asset) {
    let params = this._buildExtractParams(type, idType, asset)
    return CoreExtractor.extractProduct(params)
  }

  _buildFilterFromProvider (type, idType, asset) {
    let params = this._buildExtractParams(type, idType, asset)
    return CoreExtractor.extractProvider(params)
  }

  _buildExtractParams (type, idType, sfdcObject) {
    return {
      filterMapByType: this._filterMapByType,
      idFactory: this._idFactory,
      sfdcObject: sfdcObject,
      type: type,
      idType: idType
    }
  }

  log (message) {
    console.log(`[${this.type}] ${message}`)
  }

  warn (message) {
    console.warn(`[${this.type}] ${message}`)
  }
}

module.exports = Processor
