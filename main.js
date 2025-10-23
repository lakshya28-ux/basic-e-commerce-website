// Simple product loader + cart using localStorage
const PRODUCTS_URL = "products.json";
const API_PRODUCTS = "/api/products";


let products = [];
let cart = JSON.parse(localStorage.getItem("cart_v1") || "{}");

function saveCart(){ localStorage.setItem("cart_v1", JSON.stringify(cart)); renderCartCount(); renderCart(); }


function fetchProducts(){
  // Try backend API first, fallback to local products.json
  return fetch(API_PRODUCTS).then(r=>{
    if(!r.ok) throw new Error('api fail');
    return r.json();
  }).then(data=>{ products = data; renderProducts(); })
  .catch(()=> fetch(PRODUCTS_URL).then(r=>r.json()).then(data=>{ products = data; renderProducts(); }));
}


function renderProducts(filter=""){
  const grid = document.getElementById("product-grid");
  grid.innerHTML = "";
  const q = filter.trim().toLowerCase();
  products.filter(p => !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    .forEach(p=>{
      const card = document.createElement("div"); card.className = "card";
      card.innerHTML = `
        <img src="${p.image}" alt="${p.title}" loading="lazy" />
        <h4>${p.title}</h4>
        <p>${p.description}</p>
        <div class="price-row">
          <div class="badge">₹${p.price.toFixed(2)}</div>
          <div>
            <button data-id="${p.id}" class="add-btn">Add</button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  document.querySelectorAll(".add-btn").forEach(b=>b.addEventListener("click", e=>{
    const id = e.currentTarget.dataset.id;
    addToCart(id);
  }));
}

function addToCart(id){
  const p = products.find(x=>x.id==id);
  if(!p) return;
  cart[id] = (cart[id]||0) + 1;
  saveCart();
}

function renderCartCount(){
  const count = Object.values(cart).reduce((s,n)=>s+n,0);
  document.getElementById("cart-count").textContent = count;
}

function renderCart(){
  const container = document.getElementById("cart-items");
  container.innerHTML = "";
  if(Object.keys(cart).length===0){ container.innerHTML = "<p>Your cart is empty.</p>"; document.getElementById("cart-total").textContent = "0.00"; return; }
  let total = 0;
  for(const [id,qty] of Object.entries(cart)){
    const p = products.find(x=>x.id==id);
    if(!p) continue;
    total += p.price * qty;
    const el = document.createElement("div"); el.className = "cart-item";
    el.innerHTML = `
      <img src="${p.image}" alt="${p.title}" />
      <div style="flex:1">
        <div>${p.title}</div>
        <div style="color:#666;font-size:13px">₹${p.price.toFixed(2)} × ${qty} = ₹${(p.price*qty).toFixed(2)}</div>
        <div class="qty">
          <button data-id="${id}" class="dec">-</button>
          <div style="min-width:28px;text-align:center">${qty}</div>
          <button data-id="${id}" class="inc">+</button>
          <button data-id="${id}" class="remove" style="margin-left:8px;background:#ff6961">Remove</button>
        </div>
      </div>
    `;
    container.appendChild(el);
  }
  document.getElementById("cart-total").textContent = total.toFixed(2);
  // attach events
  container.querySelectorAll(".inc").forEach(b=>b.addEventListener("click", e=>{
    const id = e.currentTarget.dataset.id; cart[id] = (cart[id]||0)+1; saveCart();
  }));
  container.querySelectorAll(".dec").forEach(b=>b.addEventListener("click", e=>{
    const id = e.currentTarget.dataset.id; cart[id] = Math.max(0,(cart[id]||0)-1); if(cart[id]===0) delete cart[id]; saveCart();
  }));
  container.querySelectorAll(".remove").forEach(b=>b.addEventListener("click", e=>{
    const id = e.currentTarget.dataset.id; delete cart[id]; saveCart();
  }));
}

document.getElementById("cart-toggle").addEventListener("click", ()=>{
  document.getElementById("cart-panel").classList.add("open");
  document.getElementById("cart-panel").setAttribute("aria-hidden","false");
});

document.getElementById("close-cart").addEventListener("click", ()=>{
  document.getElementById("cart-panel").classList.remove("open");
  document.getElementById("cart-panel").setAttribute("aria-hidden","true");
});

document.getElementById("checkout-btn").addEventListener("click", ()=>{
  alert("Checkout simulated — this demo does not process payments. Cart will be cleared.");
  cart = {}; saveCart();
});

document.getElementById("search").addEventListener("input", (e)=>{
  renderProducts(e.target.value);
});

// initialize
fetchProducts().then(()=>{ renderCartCount(); renderCart(); });
