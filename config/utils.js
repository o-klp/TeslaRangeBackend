var utils = {}

utils.checkAuth = function(req, res, next){
  if( req.method === "OPTIONS" ){
    res.status(200).end()
  }else if( req.path === "/login" ){
    next()
  }else{
    if( req.cookies["user_credentials"] ){
      next()
    }else{
      next(new Error("Please login"))
    }
  }
}

utils.errorHandler = function(err, req, res, next){
  res.status(500).send({ error: err.message })
}

module.exports = utils