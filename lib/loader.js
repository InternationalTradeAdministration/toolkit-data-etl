const fs = require('fs')
const S3 = require('aws-sdk/clients/s3')

const Endpointme = require('./endpointme')

var Loader = {
  load: (logger, toolkitPath, filters) => {
    let filtersString = JSON.stringify(filters, null, 2)
    return Loader.loadToFs(logger, toolkitPath, filtersString)
      .then(() => Loader.loadToS3Bucket(logger, toolkitPath, filtersString))
      .then(() => Endpointme.freshen(logger, toolkitPath))
  },

  loadToFs: (logger, toolkitPath, filtersString) => {
    return new Promise((resolve) => {
      if (fs.existsSync('./output')) {
        let filename = `${toolkitPath}.json`
        logger.log(`writing ${filename}`)
        fs.writeFile(`./output/${filename}`, filtersString, (err) => {
          if (err) throw err
          logger.log(`Successfully saved ${filename}`)
          resolve()
        })
      } else {
        logger.log('skipping loadToFs: output directory is not present')
        resolve()
      }
    })
  },

  loadToS3Bucket: (logger, toolkitPath, filtersString) => {
    return new Promise((resolve) => {
      let filename = `${toolkitPath}.json`
      logger.log(`loading ${filename} to S3`)
      let params = {
        Body: filtersString,
        Bucket: process.env.S3_BUCKET,
        Key: filename,
        ACL: 'public-read',
        ContentType: 'application/json'
      }
      let s3 = new S3()
      s3.putObject(params, (err) => {
        if (err) throw err
        logger.log(`File successfully uploaded: ${filename}`)
        resolve()
      })
    })
  }
}

module.exports = Loader
