function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const response = {
    message: err.message || 'Unexpected error',
  };

  if (req.app.get('env') !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  res.status(status).json(response);
}

module.exports = errorHandler;
