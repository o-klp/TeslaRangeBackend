var request = require('request')
var express = require('express')
var bodyParser = require('body-parser')

var credentials = require('./credentials.js')

var portal = 'https://portal.vn.teslamotors.com'
var app = express()

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

var vehicleID
var batterySize

app.use(function(req, res, next){
  request({
    method: 'POST',
    url: portal + '/login',
    form: {
      "user_session[email]": credentials.email,
      "user_session[password]": credentials.password,
    }
  }, function(error, response, body){
    if(error) { throw new Error(error) }
    request(portal + '/vehicles', function(error, response, body){
      if(error) { throw new Error(error) }
      body = JSON.parse(body)[0]
      vehicleID = body.id
      batterySize = body.option_codes.split("BT")[1].split(",")[0]
      next()
    })
  })
})

app.listen(3000)

// var test = m.request({
//   method: 'POST',
//   url:'http://localhost:3000',
//   serialize: function(data) {return data},
//   deserialize: function(value) {return value},
//   data: data,
//   config: xhrConfig
// }).then(function(response){
//   console.log(response);
// })
// var xhrConfig = function(xhr) {
//     xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
// }