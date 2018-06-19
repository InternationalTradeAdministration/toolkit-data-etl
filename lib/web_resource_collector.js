const _ = require('lodash')

const CoreExtractor = require('./core_extractor')
const JsforceUtil = require('./jsforce_util')

class WebResourceCollector {
  constructor (logger, assets) {
    this._logger = logger
    this._assets = assets
  }

  collect () {
    let promiseData = {}
    let productIds = _.uniq(CoreExtractor.extractProductIds(this._assets))
    return this._queryRelatedResources(productIds)
      .then(relatedResources => {
        promiseData.relatedResources = relatedResources
        return this._getWebResourceIds(relatedResources)
      })
      .then(webResourceIds => this._queryWebResourceLinks(webResourceIds))
      .then(webResourceLinks => this._mapWebResourceLinksByWebResourceId(webResourceLinks))
      .then(webResourceLinksByWebResourceId => {
        return this._mapWebResourceById(
          promiseData.relatedResources,
          webResourceLinksByWebResourceId)
      })
      .then(webResourcesById => {
        return this._mapWebResourcesByProductId(
          promiseData.relatedResources,
          webResourcesById)
      })
  }

  _queryRelatedResources (productIds) {
    return JsforceUtil.queryRelatedResources(this._logger, productIds)
  }

  _getWebResourceIds (relatedResources) {
    let webResourceIds = _.concat(
      _.map(relatedResources, 'Primary_Web_Resource__c'),
      _.map(relatedResources, 'Related_Web_Resource__c')
    )
    return _.uniq(_.compact(webResourceIds))
  }

  _queryWebResourceLinks (webResourceIds) {
    return JsforceUtil.queryWebResourceLinks(this._logger, webResourceIds)
  }

  _mapWebResourceLinksByWebResourceId (webResourceLinks) {
    let webResourceLinksByWebResourceId = {}
    _.forEach(webResourceLinks, (webResourceLink) => {
      let webResourceId = webResourceLink.Web_Resource__c
      let links = webResourceLinksByWebResourceId[webResourceId]
      if (_.isNil(links)) links = []
      links.push(webResourceLink)
      webResourceLinksByWebResourceId[webResourceId] = links
    })
    return webResourceLinksByWebResourceId
  }

  _mapWebResourceById (relatedResources, webResourceLinksByWebResourceId) {
    let webResources = _.concat(
      _.map(relatedResources, 'Primary_Web_Resource__r'),
      _.map(relatedResources, 'Related_Web_Resource__r')
    )
    let webResourceBySfdcId = _.keyBy(_.compact(webResources), 'Id')
    this._assignLinksToWebResource(webResourceBySfdcId, webResourceLinksByWebResourceId)
    return webResourceBySfdcId
  }

  _assignLinksToWebResource (webResourceBySfdcId, webResourceLinksByWebResourceId) {
    _.forEach(webResourceBySfdcId, (webResource, sfdcId) => {
      let links = webResourceLinksByWebResourceId[sfdcId]
      if (_.isNil(links)) links = []
      webResource.links = links
    })
  }

  _mapWebResourcesByProductId (relatedResources, webResourcesById) {
    let webResourcesByProductId = {}
    _.forEach(relatedResources, (relatedResource) => {
      let productId = relatedResource.Product__c
      let webResources = webResourcesByProductId[productId]
      if (_.isNil(webResources)) webResources = []
      webResources.push(webResourcesById[relatedResource.Primary_Web_Resource__c])
      webResources.push(webResourcesById[relatedResource.Related_Web_Resource__c])
      webResourcesByProductId[productId] = _.uniqBy(_.compact(webResources), 'Id')
    })
    return webResourcesByProductId
  }
}

module.exports = WebResourceCollector
