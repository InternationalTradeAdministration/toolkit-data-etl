const jsforce = require('jsforce')

const ASSET_FIELDS = [
  'Name',
  'Product2.Id',
  'Product2.Name',
  'Product2.Class__c',
  'Product2.Category__c',
  'Product2.ProductOffering__c',
  'Participant__c',
  'Participant__r.Id',
  'Participant__r.Name'
].join()

const RELATED_RESOURCE_FIELDS = [
  'Product__c',
  'Primary_Web_Resource__c',
  'Primary_Web_Resource__r.Type__c',
  'Primary_Web_Resource__r.Name',
  'Primary_Web_Resource__r.Id',
  'Primary_Web_Resource__r.Summary__c',
  'Related_Web_Resource__c',
  'Related_Web_Resource__r.Type__c',
  'Related_Web_Resource__r.Name',
  'Related_Web_Resource__r.Id',
  'Related_Web_Resource__r.Summary__c'
].join()

const WEB_RESOURCE_LINK_FIELDS = [
  'DisplayName__c',
  'Id',
  'Sort_Order__c',
  'Status__c',
  'URL__c',
  'Web_Resource__c'
].join()

var JsforceUtil = {
  login: (logger) => {
    return new Promise((resolve) => {
      var conn = new jsforce.Connection({
        loginUrl: 'https://trade.my.salesforce.com'
      })

      logger.log('before login')
      conn.login(process.env.SF_USERNAME, process.env.SF_PASSWORD, function (err) {
        if (err) throw err
        logger.log('logged in')
        resolve(conn)
      })
    })
  },

  queryAssets: (logger, programId) => {
    logger.log('calling queryAssets')
    return JsforceUtil.login(logger)
      .then((conn) => {
        logger.log('executing query on Asset')
        return new Promise((resolve) => {
          conn.sobject('Asset')
            .find(
              {
                Program__c: programId,
                Status: 'Active',
                'Product2.IsActive': true
              },
              ASSET_FIELDS
            )
            .sort({'Product2.Name': 'ASC'})
            .execute((err, assets) => {
              if (err) throw err
              logger.log(`fetched Assets: ${assets.length}`)
              resolve(assets)
            })
        })
      })
  },

  queryRelatedResources: (logger, productIds) => {
    logger.log('calling queryRelatedResources')
    return JsforceUtil.login(logger)
      .then((conn) => {
        logger.log('executing query on Related_Resource__c')
        return new Promise((resolve) => {
          conn.sobject('Related_Resource__c')
            .find(
              {
                Product__c: {
                  $in: productIds
                }
              },
              RELATED_RESOURCE_FIELDS
            )
            .sort({'Related_Resource__c.Product__c': 'ASC'})
            .execute((err, relatedResources) => {
              if (err) throw err
              logger.log('fetched RelatedResources: ' + relatedResources.length)
              resolve(relatedResources)
            })
        })
      })
  },

  queryWebResourceLinks: (logger, webResourceIds) => {
    logger.log('calling queryWebResourceLinks')
    return JsforceUtil.login(logger)
      .then((conn) => {
        logger.log('executing query on Web_Resource_Link__c')
        return new Promise((resolve) => {
          conn.sobject('Web_Resource_Link__c')
            .find(
              {
                Web_Resource__c: {
                  $in: webResourceIds
                },
                Status__c: 'Published'
              },
              WEB_RESOURCE_LINK_FIELDS
            )
            .sort({Web_Resource__c: 'ASC', Sort_Order__c: 'NULLS LAST', DisplayName__c: 'ASC'})
            .execute((err, webResourceLinks) => {
              if (err) throw err
              logger.log('fetched WebResourceLinks: ' + webResourceLinks.length)
              resolve(webResourceLinks)
            })
        })
      })
  }
}

module.exports = JsforceUtil
