const API = 'https://estilo-back.onrender.com/api';

document.addEventListener('DOMContentLoaded', async () => {
    // Pega o ID da URL (?id=...)
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        window.location.href = 'index.html';
        return;
    }

    try {
        // Busca todos os produtos e filtra (ou cria uma rota específica se preferir)
        const res = await fetch(`${API}/products`);
        const products = await res.json();
        const p = products.find(prod => prod._id === id);

        if (!p) {
            document.getElementById('product-detail').innerHTML = `<p class="text-center py-20 font-black">PRODUTO NÃO ENCONTRADO</p>`;
            return;
        }

        renderDetail(p);
    } catch (e) {
        console.error(e);
    }
});

function renderDetail(p) {
    const container = document.getElementById('product-detail');
    // --- DENTRO DA FUNÇÃO renderDetail(p) NO JS/PRODUCT.JS ---
container.innerHTML = `
    <div class="flex flex-col md:flex-row gap-10 items-start">
        <div class="w-full md:w-1/2">
            <img src="${p.imagem_url}" class="rounded-[30px] w-full object-cover shadow-2xl">
        </div>
        <div class="flex-1 w-full">
            <p class="text-red-600 font-black uppercase text-xs mb-2 tracking-widest">${p.categoria}</p>
            <h1 class="text-4xl font-black uppercase mb-4 leading-tight">${p.nome}</h1>
            <p class="text-2xl font-black mb-6 text-white">R$ ${p.preco.toFixed(2)}</p>
            <p class="text-gray-400 leading-relaxed mb-8">${p.descricao}</p>
            <button onclick="addToCartAndGo('${p._id}', '${p.nome}', ${p.preco}, '${p.imagem_url}')" 
                class="bg-red-600 w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-red-600/20">
                Adicionar à Sacola
            </button>
        </div>
    </div>
`;
}

function addToCartAndGo(id, nome, preco, imagem) {
    let cart = JSON.parse(localStorage.getItem('ilha_cart')) || [];
    const item = cart.find(i => i.id === id);
    item ? item.qty++ : cart.push({ id, nome, preco, imagem, qty: 1 });
    localStorage.setItem('ilha_cart', JSON.stringify(cart));
    
    // Redireciona para o index com a sacola aberta
    window.location.href = 'index.html?openCart=true';
}