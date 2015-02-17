var utils = {}

utils.errorHandler = function(err, req, res, next){
  res.status(500).send({ error: err.message })
}

module.exports = utils