const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// register
router.post('/register', async (req,res)=>{
  try{
    const {name,email,password} = req.body;
    if(!name||!email||!password) return res.status(400).json({message:'Missing fields'});
    let user = await User.findOne({email});
    if(user) return res.status(400).json({message:'User already exists'});
    const hashed = await bcrypt.hash(password, 10);
    user = await User.create({name,email,password:hashed});
    const token = jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn:'7d'});
    res.json({token, user:{id:user._id,name:user.name,email:user.email,role:user.role}});
  }catch(err){ console.error(err); res.status(500).json({message:'Server error'}); }
});

// login
router.post('/login', async (req,res)=>{
  try{
    const {email,password} = req.body;
    const user = await User.findOne({email});
    if(!user) return res.status(400).json({message:'Invalid credentials'});
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) return res.status(400).json({message:'Invalid credentials'});
    const token = jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn:'7d'});
    res.json({token, user:{id:user._id,name:user.name,email:user.email,role:user.role}});
  }catch(err){ console.error(err); res.status(500).json({message:'Server error'}); }
});

module.exports = router;