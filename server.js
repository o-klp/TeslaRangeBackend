var routes = require('./config/routes.js')
var utils = require('./config/utils.js')
var app = require('./config/middleware.js')

app.get('/location', routes.location)
app.get('/battery', routes.battery)
app.all('/distance', routes.distance)

app.use(utils.errorHandler)

app.listen(3000)
