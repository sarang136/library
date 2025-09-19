
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authMiddleware = async (req, res, next) => {

    const { token } = req.cookies;
    if (!token) {
        return res.status(400).json({ message: "Invalid token" });
    }
    const decoded = jwt.verify(token, process.env.JWT);
    const { _id } = decoded;
    const user = await User.findById({ _id });
    // console.log("user", user)
    if (!user) {
        return res.status(400).json({ message: "User Not Found" });
    }
    req.user = user;
    next();
}


module.exports = authMiddleware;