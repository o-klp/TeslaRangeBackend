var request = require('request')
var express = require('express')
var bodyParser = require('body-parser')

var portal = 'https://portal.vn.teslamotors.com'
var app = express()

app.use(bodyParser.json())

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

app.use(function(req, res, next){
  if( req.method === "OPTIONS" ){ return res.status(200).end() }
  if( req.body.email && req.body.password ){
    var loginOptions = {
      method: 'POST',
      url: portal + '/login',
      form: {
        "user_session[email]": req.body.email,
        "user_session[password]": req.body.password,
      }
    }

    request(loginOptions, function(error, response, body){
      if(error){ return res.status(400).end() }

      request(portal + '/vehicles', function(error, response, body){
        if(error){ return res.status(400).end() }
        try {
          body = JSON.parse(body)[0]
        } catch(e) {
          return res.status(400).end()
        }

        req.vehicleID = body.id
        req.batterySize = body.option_codes.split("BT")[1].split(",")[0]
        next()
      })
    })
  }else{
    res.status(400).end()
  }
})

module.exports = app