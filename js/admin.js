const API = 'https://estilo-back.onrender.com/';

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadCategories();
    loadBanners();
});

// PRODUTOS
const productForm = document.getElementById('product-form');
if (productForm) {
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = document.getElementById('btn-lançar');
        const imgInput = document.getElementById('image-input');
        const descValue = document.getElementById('descricao').value.trim();

        if (!imgInput.files[0]) return alert("Selecione a foto!");
        if (!descValue) return alert("A descrição é obrigatória!");

        btn.innerText = "LANÇANDO...";
        btn.disabled = true;

        const fd = new FormData();
        fd.append('nome', document.getElementById('nome').value);
        fd.append('preco', document.getElementById('preco').value.replace(',', '.'));
        fd.append('estoque', document.getElementById('estoque').value);
        fd.append('categoria', document.getElementById('categoria-select').value);
        fd.append('descricao', descValue); // Envia a descrição aqui
        fd.append('image', imgInput.files[0]);

        try {
            const res = await fetch(`${API}/products`, { method: 'POST', body: fd });
            if (res.ok) {
                alert("PRODUTO LANÇADO!");
                location.reload();
            } else {
                const errorData = await res.json();
                console.error("Erro do servidor:", errorData);
                alert("Erro ao lançar: " + (errorData.details || errorData.error));
            }
        } catch (err) {
            console.error("Erro de conexão:", err);
            alert("Erro de conexão com o servidor.");
        } finally {
            btn.innerText = "LANÇAR PRODUTO";
            btn.disabled = false;
        }
    });
}

// CATEGORIAS
async function loadCategories() {
    const res = await fetch(`${API}/categories`);
    const cats = await res.json();
    const list = document.getElementById('category-list');
    const select = document.getElementById('categoria-select');
    
    list.innerHTML = cats.map(c => `
        <div class="flex justify-between items-center bg-[#111] p-3 rounded-lg border border-white/5">
            <span class="text-[10px] font-bold uppercase">${c.nome}</span>
            <button onclick="deleteCategory('${c._id}')" class="text-red-600 font-black px-2">X</button>
        </div>
    `).join('');
    
    select.innerHTML = cats.map(c => `<option value="${c.nome}">${c.nome}</option>`).join('');
}

async function addCategory() {
    const nome = document.getElementById('new-cat').value;
    if(!nome) return;
    await fetch(`${API}/categories`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ nome })
    });
    document.getElementById('new-cat').value = '';
    loadCategories();
}

async function deleteCategory(id) {
    if(confirm("Remover categoria?")) {
        await fetch(`${API}/categories/${id}`, { method: 'DELETE' });
        loadCategories();
    }
}

// BANNERS
async function loadBanners() {
    const res = await fetch(`${API}/banners`);
    const banners = await res.json();
    document.getElementById('banner-list').innerHTML = banners.map(b => `
        <div class="relative group rounded-lg overflow-hidden border border-white/10 mb-2">
            <img src="${b.imagem_url}" class="w-full h-32 object-cover">
            <button onclick="deleteBanner('${b._id}')" class="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 transition flex items-center justify-center font-black text-[10px]">REMOVER</button>
        </div>
    `).join('');
}

async function uploadBanner(input) {
    if(!input.files[0]) return;
    const fd = new FormData();
    fd.append('image', input.files[0]);
    await fetch(`${API}/banners`, { method: 'POST', body: fd });
    loadBanners();
}

async function deleteBanner(id) {
    await fetch(`${API}/banners/${id}`, { method: 'DELETE' });
    loadBanners();
}

// LISTAGEM PRODUTOS
async function loadProducts() {
    const res = await fetch(`${API}/products`);
    const data = await res.json();
    document.getElementById('admin-product-list').innerHTML = data.map(p => `
        <div class="product-item" style="display:flex; align-items:center; gap:15px; background:#050505; padding:15px; border-radius:12px; margin-bottom:10px; border:1px solid rgba(255,255,255,0.05)">
            <img src="${p.imagem_url}" class="w-12 h-12 object-cover rounded-lg">
            <div style="flex:1"><h4 class="text-[11px] font-black uppercase">${p.nome}</h4><p class="text-[9px] text-gray-500 font-bold text-white">R$ ${p.preco.toFixed(2)}</p></div>
            <button onclick="deleteProduct('${p._id}')" class="text-red-600 font-bold text-[10px] uppercase">Remover</button>
        </div>
    `).join('');
}

async function deleteProduct(id) {
    if(confirm("Excluir produto?")) {
        await fetch(`${API}/products/${id}`, { method: 'DELETE' });
        loadProducts();
    }
}