const _ = require('lodash')
const request = require('request')

var Endpointme = {
  freshen: (logger, toolkitPath) => {
    return new Promise((resolve, reject) => {
      let freshenUrl = `https://api.trade.gov/v1/${toolkitPath}/freshen.json?api_key=${process.env.API_KEY}`
      request(freshenUrl, (_err, _res, bodyString) => {
        let body = JSON.parse(bodyString)
        if (!_.isNil(body.success)) {
          logger.log(body.success)
          resolve(body)
        } else {
          reject(body)
        }
      })
    })
  }
}

module.exports = Endpointme
