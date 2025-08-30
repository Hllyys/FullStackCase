const { ZodError } = require('zod');

function errorHandler(err, _req, res, _next) {
  console.error(err);
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: { message: 'Validation error', details: err.errors }
    });
  }
  const status = err.status || 500;
  const message = err.message || 'Unexpected error';
  res.status(status).json({ error: { message } });
}
module.exports = { errorHandler };
