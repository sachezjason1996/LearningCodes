module.exports = (err, req, res, next) => {
    if (res.headersSent) {
      return next(err);
    }
  
    console.error(err.stack); // Log the error stack for debugging
  
    res.status(500).json({ error: 'Internal Server Error' });
  };