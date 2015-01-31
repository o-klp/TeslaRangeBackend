var request = require('request')
var express = require('express')
var bodyParser = require('body-parser')

var portal = 'https://portal.vn.teslamotors.com'
var app = express()

app.use(bodyParser.json())

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

app.use(function(req, res, next){

  if( req.method === "OPTIONS" ) {
    res.status(200).end()
  } else if( req.body.email && req.body.password ) {
    request({
      method: 'POST',
      url: portal + '/login',
      form: {
        "user_session[email]": req.body.email,
        "user_session[password]": req.body.password,
      }
    }, function(error, response, body){
      if(error) { return res.status(400).end() }
      request(portal + '/vehicles', function(error, response, body){
        if(error) { return res.status(400).end() }
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
  } else {
    res.status(400).end()
  }

})

app.all('/location', function(req, res){

  request(portal + '/vehicles/' + req.vehicleID + '/command/drive_state', function(error, response, body){

    if(error) { res.status(400).end() }
    body = JSON.parse(body)
    var latitude = body.latitude
    var longitude = body.longitude
    var timestamp = body.gps_as_of

    res.status(200).json({
      latitude: latitude,
      longitude: longitude,
      timestamp: timestamp
    })

  })

})

app.all('/battery', function(req, res){

  request(portal + '/vehicles/' + req.vehicleID + '/command/charge_state', function(error, response, body){

    if(error) { res.status(400).end() }
    body = JSON.parse(body)
    var batteryRange = body.battery_range
    var estimatedBatteryRange = body.est_battery_range
    var batteryLevel = body.battery_level

    res.status(200).json({
      batteryRange: batteryRange,
      estimatedBatteryRange: estimatedBatteryRange,
      batteryLevel: batteryLevel / 100,
      batterySize: parseInt(req.batterySize) * 1000
    })

  })

})

app.listen(3000)
