const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // 1. Get the token from the header
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ error: 'No token, authorization denied.' });
    }

    const token = authHeader.replace('Bearer ', '');

    // 2. Verify the token using your Secret Key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach the User ID to the request object
    req.userId = decoded.id; 
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid.' });
  }
};

module.exports = auth;