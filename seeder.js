

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const fs = require('fs');
async function run(){
  await mongoose.connect(process.env.MONGO_URI);
  const data = JSON.parse(fs.readFileSync('../products.json','utf-8'));
  await Product.deleteMany({});
  const mapped = data.map(p => ({
    title: p.title, description: p.description, price: p.price, image: p.image, countInStock: 20
  }));
  await Product.insertMany(mapped);
  console.log('Seeded products:', mapped.length);
  process.exit(0);
}
run().catch(err=>{ console.error(err); process.exit(1); });