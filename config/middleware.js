var request = require('request')
var express = require('express')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')

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
      if(error){ next(error) }

      var responseCookie = response.headers["set-cookie"][0].split("; ")
      var cookie = {}
      cookie.name = responseCookie[0].split("=")[0]
      cookie.value = responseCookie[0].split("=")[1]

      var cookieOptions = {
        expires: new Date(responseCookie[2].split("=")[1]),
        httpOnly: false,
        path: responseCookie[1].split("=")[1],
        secure: false
      }

      res.cookie(cookie.name, cookie.value, cookieOptions)

      request(portal + '/vehicles', function(error, response, body){
        if(error){ next(error) }
        try {
          body = JSON.parse(body)[0]
        } catch(e) {
          return next(new Error('Invalid credentials'))
        }

        req.vehicleID = body.id
        req.batterySize = body.option_codes.split("BT")[1].split(",")[0]
        next()
      })
    })
  }else if( req.cookies.user_credentials ){
    var j = request.jar()
    var cookie = {
      name: "user_credentials",
      value: req.cookies.user_credentials,
      path: "/",
      expires: new Date("Sun, 17-May-2015 20:05:45 GMT")
    }
    j.add(cookie)

    var requestOptions = {
      url: portal + '/vehicles',
      jar: j
    }

    request(requestOptions, function(error, response, body){
      if(error){ next(error) }

      try {
        body = JSON.parse(body)[0]
      } catch(e) {
        return next(e)
      }

      req.vehicleID = body.id
      req.batterySize = body.option_codes.split("BT")[1].split(",")[0]
      next()
    })
  }else{
    next(new Error('Must send email & password'))
  }
})

module.exports = app