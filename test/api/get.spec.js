/* eslint-env mocha */
/* globals apiClients */
'use strict'

const expect = require('chai').expect
const isNode = require('detect-node')
const fs = require('fs')

const path = require('path')
const streamEqual = require('stream-equal')

let testfile
let testfileBig

if (isNode) {
  testfile = fs.readFileSync(path.join(__dirname, '/../testfile.txt'))
  testfileBig = fs.createReadStream(path.join(__dirname, '/../15mb.random'), { bufferSize: 128 })
} else {
  testfile = require('raw!../testfile.txt')
}

describe('.get', () => {
  it('get', (done) => {
    apiClients.a
      .get('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', (err, tarStream) => {
        expect(err).to.not.exist

        tarStream.on('entry', (header, stream, cb) => {
          let buf = ''
          stream
            .on('error', (err) => {
              expect(err).to.not.exist
            })
            .on('data', (data) => {
              buf += data
            })
            .on('end', () => {
              expect(buf).to.equal(testfile.toString())
              cb()
            })

          stream.resume() // just auto drain the stream
        })

        tarStream.on('finish', done)
      })
  })

  it.skip('get BIG file', (done) => {
    if (!isNode) {
      return done()
    }

    apiClients.a.get('Qme79tX2bViL26vNjPsF3DP1R9rMKMvnPYJiKTTKPrXJjq', (err, res) => {
      expect(err).to.not.exist

      // Do not blow out the memory of nodejs :)
      streamEqual(res, testfileBig, (err, equal) => {
        expect(err).to.not.exist
        expect(equal).to.be.true
        done()
      })
    })
  })

  describe('promise', () => {
    it.skip('get', (done) => {
      return apiClients.a.get('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
        .then((res) => {
          let buf = ''
          res
            .on('error', (err) => {
              throw err
            })
            .on('data', (data) => {
              buf += data
            })
            .on('end', () => {
              expect(buf).to.contain(testfile.toString())
              done()
            })
        })
    })
  })
})
