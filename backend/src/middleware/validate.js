export const validate = (schema) => (req, res, next) => {
  try {
    // Parse the body
    schema.parse(req.body);
    next();
  } catch (err) {
    // Return structured 400 error
    return res.status(400).json({
      error: "Erreur de validation",
      details: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }))
    });
  }
};
