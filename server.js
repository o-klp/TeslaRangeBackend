var routes = require('./config/routes.js')
var utils = require('./config/utils.js')
var app = require('./config/middleware.js')

app.all('/location', routes.location)
app.all('/battery', routes.battery)
app.all('/distance', routes.distance)

app.use(utils.errorHandler)

app.listen(3000)
