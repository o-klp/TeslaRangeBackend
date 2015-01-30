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

app.get('/', function(req, res){
  res.status(200).send('hello world')
})

app.post('/', function(req, res){
  console.log(req.body)
  res.status(200).send('posted')
})

app.listen(3000)

// var all = function(options, cb) {
//   if (!cb) cb = function(error, response, body) {/* jshint unused: false */};

//   request({ method                     : 'POST',
//             url                        : portal + '/login',
//             form                       :
//             { "user_session[email]"    : options.email,
//               "user_session[password]" : options.password
//             }
//           }, function (error, response, body) {

//     request(portal + '/vehicles', cb);
//   });
// };

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