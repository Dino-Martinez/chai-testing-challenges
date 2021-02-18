const express = require('express')
const router = express.Router()

const User = require('../models/user')
const Message = require('../models/message')

/** Route to get all messages. */
router.get('/', (req, res) => {
  Message.find({}).then((messages) => {
    res.send(messages)
  })
})

/** Route to get one message by id. */
router.get('/:messageId', (req, res) => {
  Message.findById(req.params.messageId).then((message) => {
    res.send(message)
  })
})

/** Route to add a new message. */
router.post('/', (req, res) => {
  const message = new Message(req.body)
  message
    .save()
    .then((message) => {
      return User.findById(message.author)
    })
    .then((user) => {
      user.messages.unshift(message)
      return user.save()
    })
    .then(() => {
      return res.send(message)
    })
    .catch((err) => {
      throw err.message
    })
})

/** Route to update an existing message. */
router.put('/:messageId', (req, res) => {
  // TODO: Update the matching message using `findByIdAndUpdate`
  // TODO: Return the updated Message object as JSON
  Message.findByIdAndUpdate(req.params.messageId, req.body, (message) => {
    return res.send(message)
  })
})

/** Route to delete a message. */
router.delete('/:messageId', (req, res) => {
  // TODO: Delete the specified Message using `findByIdAndDelete`. Make sure
  // to also delete the message from the User object's `messages` array
  // TODO: Return a JSON object indicating that the Message has been deleted
  Message.findByIdAndDelete(req.params.messageId)
    .then((message) => {
      return res.send(message)
    })
    .catch((err) => {
      throw err.message
    })
})

module.exports = router
