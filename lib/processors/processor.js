const _ = require('lodash')

const CoreExtractor = require('../core_extractor')
const JsforceUtil = require('../jsforce_util')
const Loader = require('../loader')
const WebResourceCollector = require('../web_resource_collector')

class Processor {
  constructor (type, programId) {
    this.type = type
    this.programId = programId
  }

  process () {
    return this.buildFilters()
      .then(() => Loader.load(this.type, this._jsonFilters()))
  }

  _jsonFilters () {
    return _.flatten(_.map(_.values(this._filterMapByType), (values) => {
      return _.map(values, (filter) => {
        return filter.asJson()
      })
    }))
  }

  _queryAssets () {
    return JsforceUtil.queryAssets(this.programId)
  }

  _extractWebResources (assets) {
    let collector = new WebResourceCollector(assets)
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
}

module.exports = Processor
