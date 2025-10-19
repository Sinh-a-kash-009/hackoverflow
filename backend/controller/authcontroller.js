const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const userModel=require('../models/userModel');

exports.login=async (req,res)=>{
    try {
        const {email,password}=req.body;
        console.log(email ,"  ",password);
        const user=await userModel.findOne({email});
        if(!user){
            return res.status(401).json({message :'invalid email'})
        }
        const isPasswordValid=await bcrypt.compare(password,user.password);
        if(!isPasswordValid){
            return res.status(401).json({message :'invalid password'});
        }
        if(!user && !isPasswordValid){
            return res.status(401).json({message :"user not found check both credentials"});
        }
        const token=jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});
        res.cookie('token',token,{httpOnly:true,secure:true,maxAge :7*24*60*60*1000});
        return res.status(200).json({message:'login successful'});
    } catch (error) {
        return res.status(500).json({message:'internal server error'});
    }
}
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password} = req.body;
    if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if(password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters long" });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email address" });
        }
        const usernameRegex = /^[a-zA-Z0-9]+$/;
        if(!usernameRegex.test(username)) {
            return res.status(400).json({ message: "Invalid username" });   
        }
    const existing = await userModel.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 8);
    const newUser = new userModel({ name, email, password: hashed });
    await newUser.save();
     const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  
};
exports.logout=async (req,res)=>{
    try{
        res.clearCookie('token');
        return res.status(200).json({message:'logout successful'});
    } catch (error) {
        return res.status(500).json({message:'internal server error in logout'});
    }
}
exports.deleteUser=async (req,res)=>{
 try {
    const {_id}=req.user;
    await userModel.findByIdAndDelete(_id);
    res.clearCookie('token');
    return res.status(200).json({message:'user deleted successfully'});
 } catch (error) {
    // Log the error for server-side debugging
    console.error('Error during account deletion:', error);
    // Send a 500 Internal Server Error response to the client
    return res.status(500).json({ message: "Internal server error during account deletion." });
}
}