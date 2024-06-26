const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../config/generateToken')

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, pic } = req.body;
  
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please Enter all the Feilds");
    }
  
    const userExists = await User.findOne({ email });
  
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }
  
    const user = await User.create({
      name,
      email,
      password,
      pic,
    });
  
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("User not found");
    }
  });


  const authUser = asyncHandler(async(req,res) => {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email })
    if(user && (await user.matchPassword(password))){
      res.json({
        _id:user._id,
        name:user.name,
        email:user.email,
        pic:user.pic,
        token:generateToken(user._id)
      });
    } 
    else{
      res.status(401);
      throw new Error("Invalid Email or Password");

    }
  });

  const allUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search ? {
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } },
        ],
      }
    : {};
  
    const users = await User.find({ _id: { $ne: req.user._id }});
    res.send(users); 
  });
  
  const changeStatus = async (req, res) => {
    const { email, value } = req.body;
    const user = await User.findOne({ email });
    console.log(user);
    if (user) {
      await User.updateOne({ email: email }, { $set: { status: value } });
      res.status(200).json({ message: "Value updated successfully" });
    } else {
        res.status(401).json({ error: "Invalid Email" });
    }
};

  const getStatus = async (req, res) => {
    const { email } = req.query;
    console.log(req.query);
    const user = await User.findOne({ email });
    console.log(user);
    let currStatus;
    if (user) {
      try {
        currStatus = await User.findOne({ status });        
      } catch (error) {
        currStatus = 0
      }
        res.status(200).json({ message: "Value updated successfully" , status : currStatus});
    } else {
        res.status(401).json({ error: "Invalid Email" });
    }
};

module.exports = { registerUser, authUser, allUsers, changeStatus, getStatus };