'use strict'

const CivilNuclearProcessor = require('./lib/processors/civil_nuclear_processor')
const NextGenProcessor = require('./lib/processors/next_gen_processor')
const SmartGridProcessor = require('./lib/processors/smart_grid_processor')

module.exports = {
  handler: () => {
    Promise.all([
      new NextGenProcessor('a31t0000000CyDG').process(),
      new CivilNuclearProcessor('a31t0000000CyDB').process(),
      new SmartGridProcessor('a31t0000000CyDV').process()])
      .then(() => {
        console.log('all done')
      })
  }
}
