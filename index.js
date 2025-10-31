
// SmartCart COD-Only Server (Express + SQLite)
import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import bodyParser from 'body-parser';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const dbPromise = open({
  filename: './shop.db',
  driver: sqlite3.Database
});

// Home Page
app.get('/', async (req, res) => {
  const db = await dbPromise;
  await db.exec('CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT, price INTEGER)');
  const count = await db.get('SELECT COUNT(*) as c FROM products');
  if (count.c === 0) {
    await db.run('INSERT INTO products (name, price) VALUES (?, ?), (?, ?), (?, ?)', ['Shoes', 999, 'Watch', 1499, 'Bag', 799]);
  }
  const products = await db.all('SELECT * FROM products');
  let html = `<h1>🛍 SmartCart</h1><p>Cash on Delivery Only</p><ul>`;
  for (let p of products) {
    html += `<li>${p.name} - ₹${p.price} <button onclick="addToCart('${p.name}', ${p.price})">Add to Cart</button></li>`;
  }
  html += `</ul><script>
  function addToCart(name, price){
    alert('Added '+name+' to cart (₹'+price+')');
  }
  </script>`;
  res.send(html);
});

// Checkout (COD only)
app.post('/checkout', async (req, res) => {
  res.json({ message: 'Order placed successfully! (Cash on Delivery)' });
});

app.listen(port, () => console.log(`SmartCart COD running on port ${port}`));
