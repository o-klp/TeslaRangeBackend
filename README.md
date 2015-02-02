#TeslaRange backend

Serves as middle-man b/w Tesla & google maps APIs. Consistent format & error handling. All requests must be `POST` requests with `email` and `password` fields corresponding to valid teslamotors.com login credentials.

##Routes:

###`/location`
Gives current location of car, as well as timestamp, heading & speed.
ex (using mithril, see below for curl exampls):
```
m.request({
  method: "POST",
  url: "http://localhost:3000/location",
  data: {
    email: "myTeslaEmail",
    password: "myTeslaPassword"
  }
}).then(function(results){ console.log(results) })

// logs:
{
  latitude: 39.104726,
  longitude: -77.1528,
  timestamp: 1422857573,
  heading: 154,
  speed: null
}
```

###`/battery`
Gives battery size, current range & estimate range, as well as battery level
ex:
```
m.request({
  method: "POST",
  url: "http://localhost:3000/battery",
  data: {
    email: "myTeslaEmail",
    password: "myTeslaPassword"
  }
}).then(function(results){ console.log(results) })

// logs:
{
  batteryRange: 116.88,           // mi
  estimatedBatteryRange: 95.47,   // mi
  batteryLevel: 0.46,             // %
  batterySize: 85000              // kWh
}
```

###`/distance`
Grabs distance between start & end points, as well as the elevation for each point. Requires a origin & destination, in either coordinates or english address.
ex:
```
m.request({
  method: "POST",
  url: "http://localhost:3000/distance",
  data: {
    email: "myTeslaEmail",
    password: "myTeslaPassword",
    origin: "San Francisco, CA",
    destination: "37.5482486,-121.9885313"
  }
}).then(function(results){ console.log(results) })

// logs:
{
  destination: {
    elevation: 16.64860725402832,   // meters
    lat: 37.5482486,
    lng: -121.9885313
  },
  distance: {
    text: "6.0 mi",
    value: 9609                     // meters
  }
  origin: {
    elevation: 6.076697826385498,   // meters
    lat: 37.4934132,
    lng: -121.9457625
  }
}
```

Examples using curl:
```
curl -H "Content-Type: application/json" -d '{"email": "myTeslaEmail", "password": "myTeslaPassword"}' http://localhost:3000/location

curl -H "Content-Type: application/json" -d '{"email": "myTeslaEmail", "password": "myTeslaPassword"}' http://localhost:3000/battery

curl -H "Content-Type: application/json" -d '{"email": "myTeslaEmail", "password": "myTeslaPassword", "origin": "San Francisco, CA", "destination": "37.5482486,-121.9885313"}' http://localhost:3000/battery
```
