const { ZodError } = require('zod');

function validateQuery(schema) {
  return (req, res, next) => {
    try { req.query = schema.parse(req.query); next(); }
    catch (e) {
      if (e instanceof ZodError) return res.status(400).json({ error: { message: 'Invalid query params', details: e.errors } });
      next(e);
    }
  };
}
function validateBody(schema) {
  return (req, res, next) => {
    try { req.body = schema.parse(req.body); next(); }
    catch (e) {
      if (e instanceof ZodError) return res.status(400).json({ error: { message: 'Invalid request body', details: e.errors } });
      next(e);
    }
  };
}
module.exports = { validateQuery, validateBody };
