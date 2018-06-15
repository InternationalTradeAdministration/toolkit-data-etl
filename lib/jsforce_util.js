const jsforce = require('jsforce')

var JsforceUtil = {
  login: () => {
    return new Promise((resolve) => {
      var conn = new jsforce.Connection({
        loginUrl: 'https://trade.my.salesforce.com'
      })

      console.log('before login')
      conn.login(process.env.SF_USERNAME, process.env.SF_PASSWORD, function (err) {
        if (err) throw err
        resolve(conn)
      })
    })
  },

  queryAssets: (programId) => {
    console.log('calling queryAssets')
    return JsforceUtil.login()
      .then((conn) => {
        console.log('executing query on Asset')
        return new Promise((resolve) => {
          conn.sobject('Asset')
            .find(
              {
                Program__c: programId,
                Status: 'Active',
                'Product2.IsActive': true
              },
              '*, Participant__r.*, Product2.*'
            )
            .sort({'Product2.Name': 'ASC'})
            .execute((err, assets) => {
              if (err) throw err
              console.log('fetched Assets: ' + assets.length)
              resolve(assets)
            })
        })
      })
  },

  queryRelatedResources: (productIds) => {
    console.log('calling queryRelatedResources')
    return JsforceUtil.login()
      .then((conn) => {
        console.log('executing query on Related_Resource__c')
        return new Promise((resolve) => {
          conn.sobject('Related_Resource__c')
            .find(
              {
                Product__c: {
                  $in: productIds
                },
                'Primary_Web_Resource__r.Id': {
                  $ne: null
                }
              },
              '*, Primary_Web_Resource__r.*, Related_Web_Resource__r.*'
            )
            .sort({'Related_Resource__c.Product__c': 'ASC'})
            .execute((err, relatedResources) => {
              if (err) throw err
              console.log('fetched RelatedResources: ' + relatedResources.length)
              resolve(relatedResources)
            })
        })
      })
  },

  queryWebResourceLinks: (webResourceIds) => {
    console.log('calling queryWebResourceLinks')
    return JsforceUtil.login()
      .then((conn) => {
        console.log('executing query on Web_Resource_Link__c')
        return new Promise((resolve) => {
          conn.sobject('Web_Resource_Link__c')
            .find(
              {
                Web_Resource__c: {
                  $in: webResourceIds
                },
                Status__c: 'Published'
              },
              '*'
            )
            .sort({Web_Resource__c: 'ASC', Sort_Order__c: 'NULLS LAST', DisplayName__c: 'ASC'})
            .execute((err, webResourceLinks) => {
              if (err) throw err
              console.log('fetched WebResourceLinks: ' + webResourceLinks.length)
              resolve(webResourceLinks)
            })
        })
      })
  }
}

module.exports = JsforceUtil
