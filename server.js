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
      req.vehicleID = body.id
      req.batterySize = body.option_codes.split("BT")[1].split(",")[0]
      next()
    })
  })
})

app.get('/location', function(req, res){
  request(portal + '/vehicles/' + req.vehicleID + '/command/drive_state', function(error, response, body){
    if(error) { throw new Error(error) }
    body = JSON.parse(body)
    var latitude = body.latitude
    var longitude = body.longitude
    var timestamp = body.gps_as_of

    res.json({
      latitude: latitude,
      longitude: longitude,
      timestamp: timestamp
    })
  })
})

app.get('/battery', function(req, res){
  request(portal + '/vehicles/' + req.vehicleID + '/command/charge_state', function(error, response, body){
    if(error) { throw new Error(error) }
    body = JSON.parse(body)
    var batteryRange = body.battery_range
    var estimatedBatteryRange = body.est_battery_range
    var batteryLevel = body.battery_level

    res.json({
      batteryRange: batteryRange,
      estimatedBatteryRange: estimatedBatteryRange,
      batteryLevel: batteryLevel / 100,
      batterySize: parseInt(req.batterySize)
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