require('dotenv').config()
const app = require('../server.js')
const mongoose = require('mongoose')
const chai = require('chai')
const chaiHttp = require('chai-http')
const assert = chai.assert

const User = require('../models/user.js')
const Message = require('../models/message.js')

chai.config.includeStack = true

const expect = chai.expect
const should = chai.should()
chai.use(chaiHttp)
const agent = chai.request.agent(app)
const AUTHOR_ID = '601875d515345b492dfe0845'
const SAMPLE_ID = '601975d415345f492dfe0845'
/**
 * root level hooks
 */
after((done) => {
  // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
  mongoose.models = {}
  mongoose.modelSchemas = {}
  mongoose.connection.close()
  done()
})

describe('Message API endpoints', () => {
  beforeEach((done) => {
    const sampleMessage = new Message({
      title: 'beast',
      body: 'feast',
      author: AUTHOR_ID,
      _id: SAMPLE_ID,
    })
    const anotherSampleMessage = new Message({
      title: 'beast 2',
      body: 'feast 3',
      author: AUTHOR_ID,
    })

    sampleMessage
      .save()
      .then(() => {
        return anotherSampleMessage.save()
      })
      .then(() => {
        done()
      })
  })

  afterEach((done) => {
    Message.deleteMany({ title: { $ne: '' } }).then(() => {
      done()
    })
  })

  it('should post a new message', (done) => {
    const message = {
      title: 'beast 2',
      body: 'feast 2',
      author: '60188f0e9ca4ac47c54aaaff',
    }
    agent
      .post('/messages')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send(message)
      .then((res) => {
        expect(res.status).to.equal(200)
        expect(res.body).to.be.an('object')
        done()
      })
      .catch((err) => {
        done(err)
      })
  })

  it('should load all messages', (done) => {
    agent.get('/messages').end((error, response) => {
      if (error) done(error)
      expect(response).to.have.status(200)
      const body = response.body
      expect(body).to.be.an('array')
      expect(body).with.lengthOf(2)
      done()
    })
  })

  it('should get one specific message', (done) => {
    agent.get(`/messages/${SAMPLE_ID}`).end((error, response) => {
      if (error) done(error)
      expect(response).to.have.status(200)
      const body = response.body
      expect(body).is.instanceof(Object)
      done()
    })
  })

  it('should update a message', (done) => {
    // TODO: Complete this
    const message = {
      title: 'not beast',
      body: 'not feast',
    }

    agent
      .put(`/messages/${SAMPLE_ID}`)
      .set('content-type', 'application/x-www-form-urlencoded')
      .send(message)
      .then((res) => {
        expect(res.status).to.equal(200)
        return Message.findById(SAMPLE_ID)
      })
      .then((message) => {
        expect(message.title).to.equal('not beast')
        expect(message.body).to.equal('not feast')
        done()
      })
      .catch((err) => {
        done(err)
      })
  })

  it('should delete a message', (done) => {
    agent
      .delete(`/messages/${SAMPLE_ID}`)
      .then((res) => {
        expect(res.status).to.equal(200)
        expect(res).to.be.an('object')
        return Message.find({})
      })
      .then((messages) => {
        expect(messages).with.lengthOf(1)
        done()
      })
      .catch((err) => {
        done(err)
      })
  })
})
