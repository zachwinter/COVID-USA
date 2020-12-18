const Parser = require('node-dbf').default
const fs = require('fs')

function parseCensus () {
  return new Promise(resolve => {
    const parser = new Parser(__dirname + '/census.dbf')
    const records = {}
    parser.on('record', record => {
      records[record.GEOID10] = record.DP0010001
    })
    parser.on('end', () => resolve(records))
    parser.parse()
  })
}

parseCensus().then(data => {
  fs.writeFileSync('census.json', JSON.stringify(data, null, 2))
})