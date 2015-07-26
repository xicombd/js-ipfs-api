var assert = require('assert')

var path = require('path')
var File = require('vinyl')
var ipfsApi = require('../index.js')
var apiPort = require('./apiPort')

/*global describe, before, it*/

var TestfileContent = 'Plz add me!'

describe('ipfs node api', function () {
  var ipfs = ipfsApi('localhost', apiPort)

  it('has the api object', function () {
    assert(ipfs)
    assert(ipfs.id)
  })

  var fileAdded
  var expectedHash = 'QmVBNto88F5oo1znbKXi7AGZLSMyNYwBoRTcB13hu5aBLU'
  var fileName = __dirname + '/testfile.txt'

  before(function (done) {
    var file = new File({
      cwd: path.dirname(fileName),
      base: path.dirname(fileName),
      path: fileName,
      contents: new Buffer(TestfileContent)
    })
    ipfs.add(file, function (err, res) {
      if (err) throw err
      fileAdded = res
      done()
    })
  })

  it('add file', function () {
    assert.equal(fileAdded[0].Hash, expectedHash)
    assert.equal(fileAdded[0].Name, path.basename(fileName))
  })

  var bufferAdded
  before(function (done) {
    var buf = Buffer(TestfileContent)
    ipfs.add(buf, function (err, res) {
      if (err) throw err
      bufferAdded = res
      done()
    })
  })

  it('add buffer', function () {
    assert.equal(bufferAdded[0].Hash, expectedHash)
  })

  var catted
  before(function (done) {
    ipfs.cat(expectedHash, function (err, stream) {
      if (err) throw err
      var buf = ''
      stream
        .on('error', function (err) { throw err })
        .on('data', function (data) { buf += data })
        .on('end', function () {
          catted = buf
          done()
        })
    })
  })

  it('cat', function () {
    assert.equal(catted, TestfileContent)
  })

  var dir
  before(function (done) {
    ipfs.ls('Qmcqtw8FfrVSBaRmbWwHxt3AuySBhJLcvmFYi3Lbc4xnwj', function (err, res) {
      if (err) throw err
      dir = res
      done()
    })
  })

  it('ls', function () {
    assert.equal(dir.Objects[0].Hash, 'Qmcqtw8FfrVSBaRmbWwHxt3AuySBhJLcvmFYi3Lbc4xnwj')
    assert.equal(dir.Objects[0].Links.length, 6)
    assert.equal(dir.Objects[0].Links[0].Name, 'about')
    assert.equal(dir.Objects[0].Links[5].Name, 'security-notes')
  })

  // var testConfPath = __dirname + '/testconfig.json'
  // var testConf = fs.readFileSync(testConfPath).toString()
  // var readConf
  // before(function (done) {
  //   ipfs.config.replace(testConfPath, function (err) {
  //     if (err) throw err
  //     ipfs.config.show(function (err, res) {
  //       if (err) throw err
  //       readConf = res
  //       done()
  //     })
  //   })
  // })

  // it('config replace/show', function () {
  //   assert.equal(testConf,
  //                readConf)
  // })

  var confKey = 'arbitrary'
  var confVal = 'arbitrary'
  var confGot

  before(function (done) {
    ipfs.config.set(confKey, confVal, function (err, res) {
      if (err) throw err
      ipfs.config.get(confKey, function (err, res) {
        if (err) throw err
        confGot = res
        done()
      })
    })
  })

  it('config set/get', function () {
    assert.equal(confGot.Value, confVal)
  })

  var store, retrieve

  before(function (done) {
    var blorb = Buffer('blorb')
    ipfs.block.put(blorb, function (err, res) {
      if (err) throw err
      store = res.Key

      ipfs.block.get(res.Key, function (err, res) {
        if (err) throw err
        var buf = ''
        res
          .on('data', function (data) { buf += data })
          .on('end', function () {
            retrieve = buf
            done()
          })
      })
    })
  })
  it('block.put', function () {
    assert.equal(store, 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ')
  })
  it('block.get', function () {
    assert.equal(retrieve, 'blorb')
  })

  var toAdd = Buffer(JSON.stringify({Data: 'testdata', Links: []}))
  var putObject
  var gotObject
  var objHash = 'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD'

  before(function (done) {
    ipfs.object.put(toAdd, 'json', function (err, res) {
      if (err) throw err
      putObject = res
      done()
    })
  })

  it('object.put', function () {
    assert.equal(putObject.Hash, objHash)
    assert.equal(putObject.Links.length, 0)
  })

  before(function (done) {
    ipfs.object.get(objHash, function (err, res) {
      if (err) throw err
      gotObject = res
      done()
    })
  })

  it('object.get', function () {
    assert.equal(gotObject.Data, 'testdata')
    assert.equal(gotObject.Links.length, 0)
  })

  var data
  before(function (done) {
    ipfs.object.data(objHash, function (err, stream) {
      if (err) throw err
      var buf = ''
      stream
        .on('error', function (err) { throw err })
        .on('data', function (data) { buf += data })
        .on('end', function () {
          data = buf
          done()
        })
    })
  })

  it('object.data', function () {
    assert.equal(data, 'testdata')
  })

  var id
  before(function (done) {
    ipfs.id(function (err, res) {
      if (err) throw err
      id = res
      done()
    })
  })

  it('id', function () {
    assert(id.ID)
    assert(id.PublicKey)
  })
})
