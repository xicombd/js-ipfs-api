'use strict'

const tar = require('tar-stream')

module.exports = (send) => {
  return (arg, opts, cb) => {
    if (typeof (opts) === 'function') {
      cb = opts
      opts = {}
    }

    return send('get', arg, opts, null, (err, res) => {
      if (err) {
        return cb(err)
      }

      const tarStream = tar.extract()
      res.pipe(tarStream)
      cb(null, tarStream)
    })
  }
}
