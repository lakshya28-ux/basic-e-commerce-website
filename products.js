const express = require('express');
const Product = require('../models/Product');
const router = express.Router();
const { protect } = require('../middleware/auth');

// list products (public)
router.get('/', async (req,res)=>{
  const q = req.query.q || '';
  const filter = q ? { $or: [
    { title: new RegExp(q, 'i') },
    { description: new RegExp(q, 'i') }
  ] } : {};
  const products = await Product.find(filter).limit(200);
  res.json(products);
});

// get product by id
router.get('/:id', async (req,res)=>{
  const p = await Product.findById(req.params.id);
  if(!p) return res.status(404).json({message:'Not found'});
  res.json(p);
});

module.exports = router;