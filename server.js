var routes = require('./config/routes.js')
var utils = require('./config/utils.js')
var app = require('./config/middleware.js')

app.post('/login', routes.login)
app.get('/location', routes.location)
app.get('/battery', routes.battery)
app.post('/distance', routes.distance)

app.use(utils.errorHandler)

app.listen(3000)
