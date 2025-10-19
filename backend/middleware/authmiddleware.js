const jwt = require('jsonwebtoken');
const userModel = require('../model/user');

exports.protectRoute = async(req, res, next)=>{
    try {
        const token = req.cookies.token;
        console.log("recieved token of the current user",token);
        if(!token){
            return res.status(401).json({ message: "Unauthorized-no token provided" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({ message: "Unauthorized-invalid token" });
        }
        const user = await userModel.findById(decoded.userId).select('-password');
        if(!user){
            return res.status(401).json({ message: "Unauthorized-user not found" });
        }
        req.user = user;
        console.log("user in auth middleware",req.user);
        next();
    } catch (error) {
    console.error('Error in protectRoute middleware:', error);
    
    // Check if the error is related to JWT (e.g., token expired, invalid signature)
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
         return res.status(401).json({ message: "Unauthorized-invalid or expired token" });
    }
    
    // Default to 500 for true server errors (e.g., database connection failure)
    res.status(500).json({ message: "Internal server error" });
}
}