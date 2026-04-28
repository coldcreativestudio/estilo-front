const API_URL = 'https://estilo-back.onrender.com/';
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

let quantity = 1;

document.addEventListener('DOMContentLoaded', async () => {
    if (!productId) {
        window.location.href = 'index.html';
        return;
    }
    
    try {
        const res = await fetch(`${API_URL}/${productId}`);
        const product = await res.json();
        renderProductDetails(product);
        fetchRelated(product.categoria);
    } catch (err) {
        console.error("Erro ao carregar produto.");
    }
});

function renderProductDetails(p) {
    const container = document.getElementById('product-container');
    document.getElementById('full-desc').innerText = p.descricao;

    container.innerHTML = `
        <div class="space-y-6">
            <div class="aspect-square bg-[#0a0a0a] rounded-[30px] overflow-hidden border border-white/5">
                <img src="${p.imagem_url}" class="w-full h-full object-cover">
            </div>
        </div>

        <div class="flex flex-col justify-center">
            <span class="text-red-600 font-black text-[10px] uppercase tracking-[0.3em] mb-4">${p.categoria}</span>
            <h2 class="text-5xl font-[900] uppercase tracking-tighter leading-none mb-6">${p.nome}</h2>
            
            <div class="mb-10">
                <p class="text-4xl font-black text-white mb-2">R$ ${p.preco.toFixed(2)}</p>
                <p class="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Ou 3x de R$ ${(p.preco/3).toFixed(2)} sem juros</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div class="space-y-4">
                    <p class="text-[10px] font-black uppercase tracking-widest text-gray-500">Tamanho:</p>
                    <div class="flex gap-2">
                        ${['P', 'M', 'G', 'GG'].map(t => `
                            <button class="w-12 h-12 border border-white/10 rounded-lg font-black text-xs hover:border-red-600 focus:bg-red-600 transition-all uppercase">${t}</button>
                        `).join('')}
                    </div>
                </div>
                <div class="space-y-4">
                    <p class="text-[10px] font-black uppercase tracking-widest text-gray-500">Quantidade:</p>
                    <div class="flex items-center gap-6 bg-[#111] p-3 rounded-xl border border-white/5 w-fit">
                        <button onclick="changeQty(-1)" class="font-black text-xl hover:text-red-600 px-2 cursor-pointer">-</button>
                        <span id="qty-val" class="font-black text-lg">${quantity}</span>
                        <button onclick="changeQty(1)" class="font-black text-xl hover:text-red-600 px-2 cursor-pointer">+</button>
                    </div>
                </div>
            </div>

            <button onclick="buyNow('${p._id}', '${p.nome}', ${p.preco}, '${p.imagem_url}')" class="bg-red-600 hover:bg-red-700 text-white py-6 rounded-2xl font-[900] uppercase tracking-[0.2em] transition-all transform active:scale-95 shadow-2xl shadow-red-600/20">
                COMPRAR AGORA
            </button>

            <div class="mt-10 space-y-4 border-t border-white/5 pt-8">
                <div class="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <span class="text-red-600 text-lg">📦</span> Retirada grátis na loja
                </div>
                <div class="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <span class="text-red-600 text-lg">🚚</span> Envio para todo o Brasil
                </div>
            </div>
        </div>
    `;
}

function changeQty(val) {
    quantity = Math.max(1, quantity + val);
    const qtyEl = document.getElementById('qty-val');
    if (qtyEl) qtyEl.innerText = quantity;
}

function buyNow(id, nome, preco, imagem) {
    let cart = JSON.parse(localStorage.getItem('ilha_cart')) || [];
    const existing = cart.find(i => i.id === id);
    
    if (existing) {
        existing.qty += quantity;
    } else {
        cart.push({ id, nome, preco, imagem, qty: quantity });
    }
    
    localStorage.setItem('ilha_cart', JSON.stringify(cart));
    // Redireciona para a home com o parâmetro para abrir a sacola
    window.location.href = 'index.html?openCart=true';
}

async function fetchRelated(cat) {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        const related = data.filter(p => p.categoria === cat && p._id !== productId).slice(0, 4);
        const grid = document.getElementById('related-grid');
        if (!grid) return;
        
        grid.innerHTML = related.map(p => `
            <div onclick="window.location.href='product.html?id=${p._id}'" class="cursor-pointer group">
                <div class="aspect-square rounded-2xl overflow-hidden bg-[#111] mb-6">
                    <img src="${p.imagem_url}" class="w-full h-full object-cover group-hover:scale-110 transition duration-700">
                </div>
                <h4 class="font-[900] uppercase text-xs mb-1">${p.nome}</h4>
                <p class="text-red-600 font-[900]">R$ ${p.preco.toFixed(2)}</p>
            </div>
        `).join('');
    } catch (err) {
        console.error("Erro ao carregar relacionados.");
    }
}