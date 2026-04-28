const API = 'https://estilo-back.onrender.com/';
let allProducts = [];
let cart = JSON.parse(localStorage.getItem('ilha_cart')) || [];
let currentSlide = 0;

document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    updateCartUI();
    setupSearch();
});

async function fetchData() {
    try {
        const [prodRes, catRes, banRes] = await Promise.all([
            fetch(`${API}/products`), fetch(`${API}/categories`), fetch(`${API}/banners`)
        ]);
        allProducts = await prodRes.json();
        renderProducts(allProducts);
        renderSidebar(await catRes.json());
        renderBanners(await banRes.json());
    } catch (e) { console.error("Erro na API"); }
}

// --- BUSCA ---
function setupSearch() {
    const input = document.getElementById('search-input');
    const search = () => {
        const term = input.value.toLowerCase().trim();
        const filtered = allProducts.filter(p => p.nome.toLowerCase().includes(term) || p.categoria.toLowerCase().includes(term));
        renderProducts(filtered);
        document.getElementById('product-grid').scrollIntoView({ behavior: 'smooth' });
    };
    document.querySelector('header button.bg-white').onclick = search;
    input.onkeypress = (e) => e.key === 'Enter' && search();
}

// --- CATEGORIAS ---
function filterByCategory(cat) {
    toggleMenu(false);
    const filtered = cat === 'TODOS' ? allProducts : allProducts.filter(p => p.categoria.toUpperCase() === cat.toUpperCase());
    renderProducts(filtered);
    document.getElementById('product-grid').scrollIntoView({ behavior: 'smooth' });
}

// --- BANNER COM MODAL (O QUE MUDOU) ---
function renderBanners(banners) {
    const slider = document.getElementById('banner-slider');
    if (!slider || banners.length === 0) return;
    slider.innerHTML = banners.map(b => `<img src="${b.imagem_url}" onclick="openImageModal('${b.imagem_url}')">`).join('');
    document.getElementById('banner-dots').innerHTML = banners.map((_, i) => `<button onclick="goToSlide(${i})" class="dot w-2 h-2 rounded-full bg-white/20 transition-all"></button>`).join('');
    goToSlide(0);
    setInterval(() => { currentSlide = (currentSlide + 1) % banners.length; goToSlide(currentSlide); }, 5000);
}

function openImageModal(url) {
    const modal = document.getElementById('image-modal');
    const img = document.getElementById('modal-img');
    img.src = url;
    modal.style.display = 'flex';
}

function goToSlide(i) {
    const slider = document.getElementById('banner-slider');
    const dots = document.querySelectorAll('.dot');
    if (slider) slider.style.transform = `translateX(-${i * 100}%)`;
    dots.forEach((d, idx) => { d.style.background = idx === i ? '#ff0000' : 'rgba(255,255,255,0.2)'; d.style.width = idx === i ? '24px' : '8px'; });
}

// --- VITRINE ---
function renderProducts(list) {
    const grid = document.getElementById('product-grid');
    if (list.length === 0) { grid.innerHTML = `<div class="col-span-full py-20 text-center font-black opacity-30">SEM RESULTADOS</div>`; return; }
    grid.innerHTML = list.map(p => `
        <div class="cursor-pointer group" onclick="window.location.href='product.html?id=${p._id}'">
            <div class="relative aspect-square rounded-[24px] overflow-hidden bg-[#111] mb-4">
                <img src="${p.imagem_url}" class="w-full h-full object-cover transition duration-500 group-hover:scale-110">
                <button onclick="event.stopPropagation(); addToCart('${p._id}', '${p.nome}', ${p.preco}, '${p.imagem_url}')" class="absolute bottom-4 right-4 bg-white text-black w-10 h-10 rounded-full font-black text-xl shadow-xl hover:bg-red-600 hover:text-white transition">+</button>
            </div>
            <p class="text-[9px] font-black text-red-600 uppercase mb-1 tracking-widest">${p.categoria}</p>
            <h4 class="text-xs font-black uppercase tracking-tighter">R$ ${p.preco.toFixed(2)} | ${p.nome}</h4>
        </div>
    `).join('');
}

function renderSidebar(cats) {
    const nav = document.getElementById('sidebar-nav');
    let h = `<button onclick="filterByCategory('TODOS')" class="text-left text-white font-[900] uppercase text-2xl hover:text-red-600 transition tracking-tighter border-b border-white/5 pb-2">VER TUDO</button>`;
    h += cats.map(c => `<button onclick="filterByCategory('${c.nome}')" class="text-left text-white font-[900] uppercase text-2xl hover:text-red-600 transition tracking-tighter border-b border-white/5 pb-2">${c.nome}</button>`).join('');
    nav.innerHTML = h;
}

// --- CARRINHO ---
function addToCart(id, nome, preco, imagem) {
    const item = cart.find(i => i.id === id);
    item ? item.qty++ : cart.push({ id, nome, preco, imagem, qty: 1 });
    localStorage.setItem('ilha_cart', JSON.stringify(cart));
    updateCartUI();
    toggleCart(true);
}

function updateCartUI() {
    const container = document.getElementById('cart-items');
    if (!container) return;
    container.innerHTML = cart.map(i => `
        <div class="flex justify-between items-center bg-[#080808] p-4 rounded-xl border border-white/5">
            <div class="flex gap-4 items-center"><img src="${i.imagem}" class="w-14 h-14 rounded-lg object-cover"><div><h5 class="text-[10px] font-black uppercase">${i.nome}</h5><p class="text-[9px] text-gray-500 font-bold">${i.qty}x R$ ${i.preco.toFixed(2)}</p></div></div>
            <button onclick="removeFromCart('${i.id}')" class="text-red-600 font-black p-2">×</button>
        </div>
    `).join('');
    const subtotal = cart.reduce((acc, i) => acc + (i.preco * i.qty), 0);
    const frete = parseFloat(document.querySelector('input[name="entrega"]:checked')?.dataset.price || 0);
    document.getElementById('subtotal-val').innerText = `R$ ${subtotal.toFixed(2)}`;
    document.getElementById('frete-val').innerText = `R$ ${frete.toFixed(2)}`;
    document.getElementById('total-final').innerText = `R$ ${(subtotal + frete).toFixed(2)}`;
    document.getElementById('cart-count').innerText = cart.reduce((acc, i) => acc + i.qty, 0);
}

// --- WHATSAPP ---
document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    const subtotal = cart.reduce((acc, i) => acc + (i.preco * i.qty), 0);
    const entrega = document.querySelector('input[name="entrega"]:checked');
    const total = subtotal + parseFloat(entrega.dataset.price);
    const orderID = `#PED-${new Date().getTime()}`;
    let msg = `Olá! Gostaria de fazer o seguinte pedido:\n\n🛍 *PEDIDO ${orderID}*\n\n📦 *Itens:*\n`;
    cart.forEach(i => msg += `• ${i.nome} x${i.qty} - R$ ${(i.preco * i.qty).toFixed(2)}\n`);
    msg += `\n💰 *Total: R$ ${total.toFixed(2)}*\n\n🚚 *Entrega:* ${entrega.value}\n👤 *Cliente:* ${document.getElementById('cust-nome').value}`;
    window.location.href = `https://wa.me/5598984360341?text=${encodeURIComponent(msg)}`;
});

function removeFromCart(id) { cart = cart.filter(i => i.id !== id); localStorage.setItem('ilha_cart', JSON.stringify(cart)); updateCartUI(); }
function toggleMenu(o) { document.getElementById('sidebar').classList.toggle('open', o); document.getElementById('menu-overlay').classList.toggle('active', o); }
function toggleCart(o) { document.getElementById('cart-drawer').classList.toggle('open', o); document.getElementById('menu-overlay').classList.toggle('active', o); }
document.getElementById('menu-overlay').addEventListener('click', () => { toggleMenu(false); toggleCart(false); });
document.querySelectorAll('input[name="entrega"]').forEach(r => r.addEventListener('change', updateCartUI));
function clearCart() { cart = []; localStorage.removeItem('ilha_cart'); updateCartUI(); toggleCart(false); }