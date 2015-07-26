var mocha = new (require('mocha'))

var fs = require('fs')
var ipfsd = require('ipfsd-ctl')

var mocha = new (require('mocha'))
var mochify = require('mochify')

var opts = {env: {'API_ORIGIN': '*'}}

ipfsd.disposable(opts, function (err, node) {
  if (err) throw err
  console.log('starting daemon')
  node.startDaemon(function (err, ignore) {
    if (err) throw err
    var port = node.apiAddr.split('/')[4]
    fs.writeFileSync('test/apiPort',
                     'module.exports = "' + port + '"\n')

    mocha.files = [__dirname + '/test/test.js']
    mocha.run(function (status) {
      if (status !== 0) {
        process.exit(status)
      }

      // in browser
      mochify({
        'web-security': false
      }).bundle(function (err, result) {
        console.log(result + '')
        if (err) process.exit(err)
        process.exit(0)
      })
    })
  })
})
