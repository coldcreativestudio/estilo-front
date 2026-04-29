// AQUI ESTÁ O SEGREDO: O link precisa do /api no final!
const API = 'https://estilo-back.onrender.com/api'; 

let allProducts = [];
let cart = JSON.parse(localStorage.getItem('ilha_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    updateCartUI();
});

async function fetchData() {
    try {
        console.log("Conectando à Ilha em:", API);
        
        // Fazendo os pedidos para os links certos
        const [pRes, cRes, bRes] = await Promise.all([
            fetch(`${API}/products`),
            fetch(`${API}/categories`),
            fetch(`${API}/banners`)
        ]);

        // Se algum falhar (404), avisa no console
        if (!pRes.ok || !cRes.ok || !bRes.ok) {
            throw new Error(`Erro na API: ${pRes.status}`);
        }

        allProducts = await pRes.json();
        const categories = await cRes.json();
        const banners = await bRes.json();

        renderProducts(allProducts);
        renderSidebar(categories);
        renderBanners(banners);
        
        console.log("✅ Dados carregados com sucesso!");
    } catch (e) {
        console.error("❌ ERRO CRÍTICO:", e);
        const grid = document.getElementById('product-grid');
        if (grid) grid.innerHTML = `
            <div class="col-span-full py-20 text-center">
                <p class="text-red-600 font-black uppercase text-xl">Erro ao carregar a vitrine</p>
                <p class="text-gray-500 text-xs mt-2">Verifique se o link da API no main.js está correto.</p>
            </div>`;
    }
}

// ... (Restante das funções de renderProducts, renderSidebar, toggleMenu que já tens)
function renderProducts(list) {
    const grid = document.getElementById('product-grid');
    if(!grid) return;
    grid.innerHTML = list.map(p => `
        <div class="cursor-pointer group" onclick="window.location.href='product.html?id=${p._id}'">
            <div class="relative aspect-square rounded-[24px] overflow-hidden bg-[#111] mb-4">
                <img src="${p.imagem_url}" class="w-full h-full object-cover transition group-hover:scale-110">
                <button onclick="event.stopPropagation(); addToCart('${p._id}', '${p.nome}', ${p.preco}, '${p.imagem_url}')" class="absolute bottom-4 right-4 bg-white text-black w-10 h-10 rounded-full font-black text-xl shadow-xl">+</button>
            </div>
            <p class="text-[9px] font-black text-red-600 uppercase mb-1 tracking-widest">${p.categoria}</p>
            <h4 class="text-xs font-black uppercase">R$ ${p.preco.toFixed(2)} | ${p.nome}</h4>
        </div>
    `).join('');
}
// Mantenha as outras funções (renderSidebar, renderBanners, etc) como estavam.