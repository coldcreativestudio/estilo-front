// AQUI ESTÁ O SEGREDO: COLOQUE O LINK DO RENDER AQUI!
const API = 'https://estilo-back.onrender.com'; 

let allProducts = [];
let cart = JSON.parse(localStorage.getItem('ilha_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    updateCartUI();
});

async function fetchData() {
    try {
        console.log("Tentando conectar em:", API);
        const [pRes, cRes, bRes] = await Promise.all([
            fetch(`${API}/products`), fetch(`${API}/categories`), fetch(`${API}/banners`)
        ]);

        allProducts = await pRes.json();
        renderProducts(allProducts);
        renderSidebar(await cRes.json());
        renderBanners(await bRes.json());
    } catch (e) {
        console.error("ERRO DE CONEXÃO COM O RENDER:", e);
        document.getElementById('product-grid').innerHTML = '<p class="col-span-full text-center text-red-600 font-bold">ERRO AO CARREGAR PRODUTOS. VERIFIQUE O BACKEND.</p>';
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
    slider.innerHTML = banners.map(b => `<img src="${b.imagem_url}" onclick="window.open('${b.imagem_url}', '_blank')">`).join('');
    // Forçar altura no JS se o CSS falhar
    document.querySelector('.hero-container').style.height = '60vh';
}

// ... (Outras funções toggleMenu, toggleCart, updateCartUI que já temos) ...
function toggleMenu(o) { document.getElementById('sidebar').classList.toggle('open', o); document.getElementById('menu-overlay').classList.toggle('active', o); }
function toggleCart(o) { document.getElementById('cart-drawer').classList.toggle('open', o); document.getElementById('menu-overlay').classList.toggle('active', o); }
function updateCartUI() { document.getElementById('cart-count').innerText = cart.reduce((acc, i) => acc + i.qty, 0); }