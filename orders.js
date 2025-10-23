const express = require('express');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');
const router = express.Router();

// create order
router.post('/', protect, async (req,res)=>{
  try{
    const { items } = req.body;
    if(!items || !items.length) return res.status(400).json({message:'No items'});
    let total = 0;
    const itemsData = items.map(it => {
      total += it.price * it.qty;
      return { product: it.product, qty: it.qty, price: it.price };
    });
    const order = await Order.create({ user: req.user._id, items: itemsData, total });
    res.json(order);
  }catch(err){ console.error(err); res.status(500).json({message:'Server error'}); }
});

// list user's orders
router.get('/', protect, async (req,res)=>{
  const orders = await Order.find({ user: req.user._id }).populate('items.product');
  res.json(orders);
});

module.exports = router;