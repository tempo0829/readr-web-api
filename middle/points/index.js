const Cookies = require('cookies')
const config = require('../../config')
const debug = require('debug')('READR-API:api:points')
const express = require('express')
const router = express.Router()
const superagent = require('superagent')
const { API_PROTOCOL, API_HOST, API_PORT, API_TIMEOUT, } = require('../../config')
const { get, } = require('lodash')
const { handlerError, } = require('../../comm')

const apiHost = API_PROTOCOL + '://' + API_HOST + ':' + API_PORT

router.get('/current', (req, res) => {
  debug('Going to fecth personal points.')
  const url = `${apiHost}/member/${req.user.id}`
  superagent
  .get(url)
  .end((err, response) => {
    if (!err && response) {
      debug(response.body)
      res.json({
        points: get(response, 'body._items.0.points'),
      })
    } else {
      const err_wrapper = handlerError(err, response)
      res.status(err_wrapper.status).json(err_wrapper.text)      
      console.error(`Error occurred when fetching member's points: ${req.user.id}`)
      console.error(err)
    }
  })
})

router.get('/:type', (req, res, next) => {
  debug('Got a points call with type.')
  debug(req.params.type)
  const member = req.user.id
  req.url = `/${member}${req.url}`
  debug(req.url)
  next()
})

router.get('/', (req, res) => {
  debug('Got a points call.')
  debug(req.params.type)
  const member = req.user.id
  const url = `${apiHost}/points/${member}${req.url}`
  superagent
  .get(url)
  .timeout(API_TIMEOUT)
  .end((e, r) => {
    if (!e && r) {
      const resData = JSON.parse(r.text)
      res.json(resData)
    } else {
      const err_wrapper = handlerError(e, r)
      res.status(err_wrapper.status).json(err_wrapper.text)      
      console.error(`Error occurred when fetching points records from : ${member}`)
      console.error(e)
    }
  })
})

router.post('/', (req, res, next) => {
  debug('Got a point reward call!!')
  debug('req.url', req.url)

  const member_id = req.user.id
  const member_mail = req.user.email
  const url = `${apiHost}/points`

  const lastfour = get(req, 'body.lastfour')
  const payload = Object.assign({}, req.body, {
    member_id,
    member_mail,
  })
  delete payload.lastfour

  debug('payload', member_id)
  debug('payload', member_mail)
  debug('payload', lastfour)
  debug(payload)

  superagent
  .post(url)
  .send(payload)
  .timeout(API_TIMEOUT)
  .end((e, r) => {
    if (!e && r) {
      const resData = JSON.parse(r.text)
      res.json(resData)
    } else {
      const err_wrapper = handlerError(e, r)
      res.status(err_wrapper.status).json(err_wrapper.text)      
      console.error(`Error occurred when depositing for member ${member}`)
      console.error(e)
    }
  })  
})

module.exports = router