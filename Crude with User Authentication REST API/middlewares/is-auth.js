 const jwt = require('jsonwebtoken');



 module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
      return res.status(401).json({ error: 'Not Authenticated' });
    }
    const token = req.get('Authorization').split(' ')[1];
    let decodedToken;
  
    try {
      decodedToken = jwt.verify(token, 'somesupersecretsecret');
    } catch (error) {
      console.log(error);
      next(error);
    }
    if (!decodedToken) {
      return res.status(401).json({ error: 'Not Authenticated' });
    }
    req.userId = decodedToken.userId;
    next();
  };
