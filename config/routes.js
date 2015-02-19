var request = require('request')
var portal = 'https://portal.vn.teslamotors.com'
var routes = {}

routes.login = function(req, res, next){
  var loginOptions = {
    method: 'POST',
    url: portal + '/login',
    form: {
      "user_session[email]": req.body.email,
      "user_session[password]": req.body.password,
    }
  }

  request(loginOptions, function(error, response, body){
    // Stringify body because Tesla API always gives HTML on /login
    var body = JSON.stringify(body)
    if( body.indexOf("You do not have access.") > 0 ){
      error = new Error("You do not have access. Invalid credentials")
    }
    if(error){ next(error) }else{

      /****************************************************
       *  Grab cookie from Tesla API & pass onto client.  *
       *    user_credentials = <encrypted string>         *
       *  sets expiration date, path, makes accessible to *
       *  client through JS & doens't require client send *
       *  cookie through https                            *
       ****************************************************/

      var responseCookie = response.headers["set-cookie"][0].split("; ")
      var name = responseCookie[0].split("=")[0]
      var value = responseCookie[0].split("=")[1]

      if( name === "user_credentials" ){
        var cookie = {
          name: name,
          value: value
        }

        var cookieOptions = {
          expires: new Date(responseCookie[2].split("=")[1]),
          path: responseCookie[1].split("=")[1],
          httpOnly: false,
          secure: false
        }

        res.cookie(cookie.name, cookie.value, cookieOptions)
        res.status(200).json('logged in!')
      }
    }
  })
}

routes.location = function(req, res){
  var locationUrl = portal + '/vehicles/' + req.vehicleID
  + '/command/drive_state'

  // Pass cookie from client to Tesla API
  var j = request.jar()
  var cookie = {
    name: "user_credentials",
    value: req.cookies.user_credentials,
    path: "/"
  }
  j.add(cookie)

  var requestOptions = {
    url: locationUrl,
    jar: j
  }

  request(requestOptions , function(error, response, body){
    if(error){ next(error) }

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

  // Pass cookie from client to Tesla API
  var j = request.jar()
  var cookie = {
    name: "user_credentials",
    value: req.cookies.user_credentials,
    path: "/"
  }
  j.add(cookie)

  var requestOptions = {
    url: batteryUrl,
    jar: j
  }

  request(requestOptions, function(error, response, body){
    if(error){ next(error) }

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
    if(error){ next(error) }

    var trip = JSON.parse(body).routes[0].legs[0]
    var distance = trip.distance
    var origin = trip.start_location
    var destination = trip.end_location

    var elevationUrl = 'https://maps.googleapis.com/maps/api/elevation/json'
      + '?locations=' + origin.lat + ',' + origin.lng + '|' + destination.lat
      + ',' + destination.lng

    request(elevationUrl, function(error, response, body){
      if(error){ next(error) }

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