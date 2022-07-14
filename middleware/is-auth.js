const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if(!authHeader) {
        const error = new Error('Not authenticated');
        error.statusCode = 401;
        throw error;
    }

    const token = authHeader.split(" ")[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, "secret");
        
        if(!decodedToken) {
            const error = new Error("Not authenticated");
            error.statusCode = 401;
            throw error;
        }
    } catch(error) {
        error.statusCode = 500;
        next(error);
    }

    req.userId = decodedToken.userId;
    next();
}