var request = require('request')
var express = require('express')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')

var utils = require('./utils.js')
var portal = 'https://portal.vn.teslamotors.com'
var app = express()

request.defaults({ jar: true })

app.use(bodyParser.json())
app.use(cookieParser())

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:8000")
  res.header("Access-Control-Allow-Credentials", true)
  res.header("Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

app.use(utils.checkAuth)

app.use(function(req, res, next){
  if( req.path === "/login" || req.path === "/distance" ){
    next()
  }else{

    /*********************************************************************
     * Grab the vehicle id & battery size before checking location or    *
     * battery. Hand cookie from client to Tesla API. Avoid using global *
     * cookie jar because every user hits server. Each req has its own   *
     * cookie jar w/ 1 cookie                                            *
     *********************************************************************/

    var j = request.jar()
    var cookie = {
      name: "user_credentials",
      value: req.cookies.user_credentials,
      path: "/"
    }
    j.add(cookie)

    var requestOptions = {
      url: portal + '/vehicles',
      jar: j
    }

    request(requestOptions, function(error, response, body){
      if(error){ next(error) }

      // Check if body is valid JSON (if an error Tesla API gives html back)
      try {
        body = JSON.parse(body)[0]      // TODO: allow user to choose which car
      } catch(e) {
        return next(new Error('Invalid credentials'))
      }

      req.vehicleID = body.id
      req.batterySize = body.option_codes.split("BT")[1].split(",")[0]
      next()
    })
  }
})

// expose app for use in server.js
module.exports = app