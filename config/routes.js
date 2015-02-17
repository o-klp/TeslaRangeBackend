var request = require('request')
var portal = 'https://portal.vn.teslamotors.com'
var routes = {}

routes.location = function(req, res){
  var locationUrl = portal + '/vehicles/' + req.vehicleID
  + '/command/drive_state'

  request(locationUrl , function(error, response, body){
    if(error) { res.status(400).end() }   // CHANGE TO `next(error)`

    body = JSON.parse(body)
    var latitude = body.latitude
    var longitude = body.longitude
    var timestamp = body.gps_as_of
    var heading = body.heading
    var speed = body.speed

    res.status(200).json({
      latitude: latitude,
      longitude: longitude,
      timestamp: timestamp,
      heading: heading,
      speed: speed
    })
  })
}

routes.battery = function(req, res){
  var batteryUrl = portal + '/vehicles/' + req.vehicleID
  + '/command/charge_state'

  request(batteryUrl, function(error, response, body){
    if(error) { res.status(400).end() }   // CHANGE TO `next(error)`

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
}

routes.distance = function(req, res){
  var directionsUrl = 'https://maps.googleapis.com/maps/api/directions/json'
    + '?origin=' + req.body.origin + '&destination=' + req.body.destination

  request(directionsUrl, function(error, response, body){
    if(error) { res.status(400).end() }   // CHANGE TO `next(error)`

    var trip = JSON.parse(body).routes[0].legs[0]
    var distance = trip.distance
    var origin = trip.start_location
    var destination = trip.end_location

    var elevationUrl = 'https://maps.googleapis.com/maps/api/elevation/json'
      + '?locations=' + origin.lat + ',' + origin.lng + '|' + destination.lat
      + ',' + destination.lng

    request(elevationUrl, function(error, response, body){
      if(error) { res.status(400).end() }   // CHANGE TO `next(error)`

      var results = JSON.parse(body).results
      origin.elevation = results[0].elevation
      destination.elevation = results[1].elevation

      res.status(200).json({
        distance: distance,
        origin: origin,
        destination: destination,
      })
    })
  })
}

module.exports = routes