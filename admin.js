const express = require('express');
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();


const storage = multer.diskStorage({
  destination: function(req,file,cb){ cb(null, path.join(__dirname,'..','uploads')); },
  filename: function(req,file,cb){ cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage });


router.post('/product', protect, admin, upload.single('image'), async (req,res)=>{
  try{
    const { title, description, price, countInStock } = req.body;
    const imagePath = req.file ? '/uploads/' + req.file.filename : req.body.image || '';
    const p = await Product.create({ title, description, price, image: imagePath, countInStock: countInStock || 0 });
    res.json(p);
  }catch(err){ console.error(err); res.status(500).json({message:'Server error'}); }
});

// update product (admin)
router.put('/product/:id', protect, admin, upload.single('image'), async (req,res)=>{
  try{
    const p = await Product.findById(req.params.id);
    if(!p) return res.status(404).json({message:'Not found'});
    p.title = req.body.title || p.title;
    p.description = req.body.description || p.description;
    p.price = req.body.price || p.price;
    p.countInStock = req.body.countInStock || p.countInStock;
    if(req.file) p.image = '/uploads/' + req.file.filename;
    await p.save();
    res.json(p);
  }catch(err){ console.error(err); res.status(500).json({message:'Server error'}); }
});

// delete product (admin)
router.delete('/product/:id', protect, admin, async (req,res)=>{
  try{
    const p = await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'deleted' });
  }catch(err){ console.error(err); res.status(500).json({message:'Server error'}); }
});

module.exports = router;