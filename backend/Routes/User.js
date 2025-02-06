require("dotenv").config();
const express = require("express");
const route = express.Router();
const userModel = require("../Models/userModel");
const documentModel = require("../Models/Document")
const bcrypt = require("bcryptjs");
const sendMail = require("../utils/emailAuth");
const crypto = require("crypto");
const tokenModel = require("../Models/token");
const jwt = require("jsonwebtoken");
const authorization = require("../middleware/aut");

//user signup
route.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ msg: "Please provide all required fields" });
  }
  try {
    //password hashing
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({
      name,
      email,
      hashedPassword,
    });

    await user.save();

    //generating token for email verification

    const verifyToken = crypto.randomBytes(32).toString("hex");

    const token = await new tokenModel({
      userId: user.id,
      token: verifyToken,
    });
    await token.save();

    const verifyUrl = `https://project-u6cs.onrender.com/api/users/${user.id}/${token.token}`;
    //sending email
    sendMail(email, verifyUrl);

    res.status(201).json({
      user: { name: user.name },
      msg: "click on the verification link in your mail for verification",
    });
  } catch (e) {
    res.status(409).json({ msg: "email already exits" });
  }
});
// user loginn
route.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  
  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      
      return res.status(404).json({ msg: "invalid cridentials" });
      
      
      
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isPasswordValid) {
     
      return res.status(401).json({ msg: "invalid cridentials" });
      
    }
    if (!user.verified) {
      //generating token for email verification
     
    const verifyToken = crypto.randomBytes(32).toString("hex");

    const token = await new tokenModel({
      userId: user.id,
      token: verifyToken,
    });
    await token.save();

    const verifyUrl = `https://project-u6cs.onrender.com/api/users/${user.id}/${token.token}`;
    //sending email
    sendMail(email, verifyUrl);
      return res.status(403).json({ msg: "please verify your email" });

    }

    // adding values to payload for jwt signing
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
    };
    const signedToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      algorithm: "HS256",
      expiresIn: "7d",
    });
    
    const userId = user.id;
    //sending cookie
    res.cookie("token", signedToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        path: "/",
      })
      .status(200)
      .json({userId});
    
        
  } catch (err) {
    console.log(err);
    
    res.status(500).json({ msg: "server down" });
  }
});
//verify email route
route.get("/:id/:token", async (req, res) => {
  const { id, token } = req.params;

  try {
    const user = await userModel.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({ msg: "user not found" });
    }
    const tokenValid = await tokenModel.findOne({ userId: id, token });
    if (!tokenValid) {
      return res.status(400).json({ msg: "invalid or expired token" });
    }
    user.verified = true;
    await user.save();

    await tokenModel.deleteOne({ _id: tokenValid.id });
    res.status(200).json({ msg: "user verified" });
  } catch (error) {
    res.status(500).json({ msg: "internal server error" });
  }
});
//dashboard
route.get("/dashboard", authorization, async (req, res) => {
  const user = req.user;
  console.log("from dashboard",user);
  
  res.status(200).json({user});
});

//Load user data

route.get('/getDocument',authorization,async(req,res)=>{
 try{const user = req.user.id;
 const userDocument = await documentModel.find({userId:user});
 res.status(200).json(userDocument);
 }catch(Err){
  console.log(Err);
  
 }
 
  
})

route.post("/logout", async (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      path: "/",
    })
    .status(200)
    .end();
});
module.exports = route;
