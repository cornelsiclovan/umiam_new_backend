const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = async (req, res, next) => {
    req.isEmployee = 0;

    try {
        const user = await User.findByPk(req.userId);

        if(!user) {
            const error = new Error("This user does not exist");
            error.statusCode = 400;
            throw error;
        }

        req.isEmployee = user.isEmployee;

    } catch(error) {
        next(error);
    }

    next();
}