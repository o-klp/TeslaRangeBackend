var request = require('request');

var credentials = require('./credentials.js');

var portal = 'https://portal.vn.teslamotors.com';

var all = function(options, cb) {
  if (!cb) cb = function(error, response, body) {/* jshint unused: false */};

  request({ method                     : 'POST',
            url                        : portal + '/login',
            form                       :
            { "user_session[email]"    : options.email,
              "user_session[password]" : options.password
            }
          }, function (error, response, body) {

    request(portal + '/vehicles', cb);
  });
};

// returns first vehicle in list
var vehicles = function(options, cb) {
  if (!cb) cb = function(data) {/* jshint unused: false */};

  all(options, function (error, response, body) {
    var data = JSON.parse(body);

    data = data[0];
    cb((!!data.id) ? data : (new Error('expecting vehicle ID from Tesla Motors cloud service')));
  });
};

vehicles(credentials, function(data){
  console.log('start my\n\n', data);
});
