const API = 'https://estilo-back.onrender.com'; // <--- COLOQUE SEU LINK DO RENDER AQUI

let allProducts = [];
let cart = JSON.parse(localStorage.getItem('ilha_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    updateCartUI();
});

async function fetchData() {
    try {
        const [pRes, cRes, bRes] = await Promise.all([
            fetch(`${API}/products`), fetch(`${API}/categories`), fetch(`${API}/banners`)
        ]);
        allProducts = await pRes.json();
        renderProducts(allProducts);
        renderSidebar(await cRes.json());
        renderBanners(await bRes.json());
    } catch (e) {
        console.error(e);
        document.getElementById('product-grid').innerHTML = '<p class="col-span-full text-center text-red-600 font-bold uppercase py-20">Erro ao carregar produtos. Verifique o Backend.</p>';
    }
}

function renderProducts(list) {
    const grid = document.getElementById('product-grid');
    if(!grid) return;
    grid.innerHTML = list.map(p => `
        <div class="cursor-pointer group" onclick="window.location.href='product.html?id=${p._id}'">
            <div class="relative aspect-square rounded-[24px] overflow-hidden bg-[#111] mb-4">
                <img src="${p.imagem_url}" class="w-full h-full object-cover transition group-hover:scale-110">
                <button onclick="event.stopPropagation(); addToCart('${p._id}', '${p.nome}', ${p.preco}, '${p.imagem_url}')" class="absolute bottom-4 right-4 bg-white text-black w-10 h-10 rounded-full font-black text-xl shadow-xl">+</button>
            </div>
            <p class="text-[9px] font-black text-red-600 uppercase mb-1">${p.categoria}</p>
            <h4 class="text-xs font-black uppercase">R$ ${p.preco.toFixed(2)} | ${p.nome}</h4>
        </div>
    `).join('');
}

function renderBanners(banners) {
    const slider = document.getElementById('banner-slider');
    if (!slider || banners.length === 0) return;
    slider.innerHTML = banners.map(b => `<img src="${b.imagem_url}" class="w-full h-full object-cover flex-shrink-0" onclick="window.open('${b.imagem_url}', '_blank')">`).join('');
}

function renderSidebar(cats) {
    const nav = document.getElementById('sidebar-nav');
    if(!nav) return;
    nav.innerHTML = cats.map(c => `<button class="text-left text-white font-black uppercase text-xl hover:text-red-600 transition">${c.nome}</button>`).join('');
}

function addToCart(id, nome, preco, imagem) {
    const item = cart.find(i => i.id === id);
    item ? item.qty++ : cart.push({ id, nome, preco, imagem, qty: 1 });
    localStorage.setItem('ilha_cart', JSON.stringify(cart));
    updateCartUI();
    toggleCart(true);
}

function updateCartUI() {
    const container = document.getElementById('cart-items');
    if(!container) return;
    container.innerHTML = cart.map(i => `
        <div class="flex justify-between items-center bg-[#080808] p-4 rounded-xl border border-white/5">
            <div class="flex gap-4 items-center">
                <img src="${i.imagem}" class="w-12 h-12 rounded-lg object-cover">
                <div><h5 class="text-[10px] font-black uppercase">${i.nome}</h5><p class="text-[9px] text-gray-500">${i.qty}x R$ ${i.preco.toFixed(2)}</p></div>
            </div>
            <button onclick="removeFromCart('${i.id}')" class="text-red-600 font-bold">×</button>
        </div>
    `).join('');
    document.getElementById('cart-count').innerText = cart.reduce((acc, i) => acc + i.qty, 0);
    document.getElementById('total-final').innerText = `R$ ${cart.reduce((acc, i) => acc + (i.preco * i.qty), 0).toFixed(2)}`;
}

function removeFromCart(id) { cart = cart.filter(i => i.id !== id); localStorage.setItem('ilha_cart', JSON.stringify(cart)); updateCartUI(); }
function toggleMenu(o) { document.getElementById('sidebar').classList.toggle('open', o); document.getElementById('menu-overlay').classList.toggle('active', o); }
function toggleCart(o) { document.getElementById('cart-drawer').classList.toggle('open', o); document.getElementById('menu-overlay').classList.toggle('active', o); }
document.getElementById('menu-overlay').addEventListener('click', () => { toggleMenu(false); toggleCart(false); });