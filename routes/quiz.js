const express = require('express')
const router = express.Router()
const debug = require('debug')('a2u-vastaus:quiz-router');
const url = require('url')
const db = require('../data/quizdao')
const config = require('../config/config')

router
  .route('')
  .get(async (req, res) => {
    try {
      const data = await db.getAllQuizAnswers()
      res.json(data)
    } catch (err) {
      handleError(res, err, 'Error with database')
    }
  })
  .post(async (req, res) => {
    const answer = req.body
    if (
      !answer.student ||
      typeof(answer.quiz_number) === 'undefined' ||
      typeof(answer.question) === 'undefined' ||
      typeof(answer.answered) === 'undefined'
    ) {
      res.status(400).json({ error: 'missing required field' })
      return
    }
    try {
      const created = await db.saveQuizAnswer(answer)
      debug('Created', created)
      const requestedUrl = url.format({
        protocol: req.protocol,
        host: req.get('host'),
        pathname: req.originalUrl
      })
      res.setHeader('location', `${requestedUrl}/${created.id}`)
      res.status(201).json({ answer: created })
    } catch (err) {
      handleError(res, err, 'Error with database')
    }
  })

router.route('/:id')
.get((req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    req.status(400).send();
  } else {
    db.getOneAnswer(id).then(one=> {
      if (one) {
        res.json(one);
      } else {
        res.status(404).send();
      }
    })
}
})
.delete(async (req, res) => {
  const id = req.params.id
  try {
    const deleted = await db.deleteAnswer(id)
    if (deleted === 1) {
      res.status(204).send()
    } else if (deleted === 0) {
      res.status(404).json({ message: `No quiz score with id ${id}` })
    } else {
      res.status(500).json({ message: 'unexpected amount of deletions' })
    }
  } catch(err) {
    handleError(res, err, 'Error with database')
  }
})
.put(async (req, res)=> {
  const id = req.params.id
  try {
    const updated = await db.updateAnswer(id, req.body);
    if (updated === 1) {
      res.status(204).send()
    } else if (updated === 0) {
      res.status(404).json({ message: `No quiz score with id ${id}` })
    } else {
      res.status(500).json({ message: 'unexpected amount of updates' })
    }
  } catch(err) {
    handleError(res, err, 'Error with database')
  }
})

function handleError (res, err, message) {
  res.locals.message = config.app.development
    ? err.message
    : message || 'Undisclosed error'
  res.locals.error = config.app.development ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.json(res.locals)
}
module.exports = router
