const API = 'https://estilo-back.onrender.com/api'; 

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadCategories();
    loadBanners();
});

// --- GESTÃO DE PRODUTOS ---
const productForm = document.getElementById('product-form');
if (productForm) {
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-submit');
        const imgInput = document.getElementById('image-input');
        
        if (!imgInput.files[0]) return alert("Selecione uma foto!");

        btn.innerText = "LANÇANDO...";
        btn.disabled = true;

        const fd = new FormData();
        fd.append('nome', document.getElementById('nome').value);
        fd.append('preco', document.getElementById('preco').value.replace(',', '.'));
        fd.append('estoque', document.getElementById('estoque').value);
        fd.append('categoria', document.getElementById('categoria-select').value);
        fd.append('descricao', document.getElementById('descricao').value);
        fd.append('image', imgInput.files[0]);

        try {
            const res = await fetch(`${API}/products`, { method: 'POST', body: fd });
            if (res.ok) {
                alert("PRODUTO LANÇADO!");
                location.reload();
            } else {
                alert("Erro ao lançar. Verifique os campos.");
            }
        } catch (err) {
            alert("Erro de conexão com o servidor.");
        } finally {
            btn.innerText = "LANÇAR NA VITRINE";
            btn.disabled = false;
        }
    });
}

async function loadProducts() {
    try {
        const res = await fetch(`${API}/products`);
        const data = await res.json();
        const list = document.getElementById('admin-product-list');
        list.innerHTML = data.map(p => `
            <div class="product-item">
                <img src="${p.imagem_url}">
                <div class="flex-1">
                    <h4 class="text-[11px] font-black uppercase leading-none">${p.nome}</h4>
                    <p class="text-[10px] text-red-600 font-bold mt-1 uppercase">${p.categoria} | R$ ${p.preco.toFixed(2)}</p>
                </div>
                <button onclick="deleteProduct('${p._id}')" class="btn-delete">Remover</button>
            </div>
        `).join('');
    } catch (e) { console.error("Erro ao carregar produtos"); }
}

async function deleteProduct(id) {
    if (!confirm("Deseja remover este produto?")) return;
    await fetch(`${API}/products/${id}`, { method: 'DELETE' });
    loadProducts();
}

// --- GESTÃO DE CATEGORIAS ---
async function loadCategories() {
    try {
        const res = await fetch(`${API}/categories`);
        const cats = await res.json();
        
        document.getElementById('category-list').innerHTML = cats.map(c => `
            <div class="flex justify-between items-center bg-[#111] p-3 rounded-lg border border-white/5">
                <span class="text-[10px] font-bold uppercase">${c.nome}</span>
                <button onclick="deleteCategory('${c._id}')" class="text-red-600 font-black">X</button>
            </div>
        `).join('');

        document.getElementById('categoria-select').innerHTML = cats.map(c => `
            <option value="${c.nome}">${c.nome}</option>
        `).join('');
    } catch (e) { console.error("Erro categorias"); }
}

async function addCategory() {
    const nome = document.getElementById('new-cat').value;
    if (!nome) return;
    await fetch(`${API}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome })
    });
    document.getElementById('new-cat').value = '';
    loadCategories();
}

async function deleteCategory(id) {
    await fetch(`${API}/categories/${id}`, { method: 'DELETE' });
    loadCategories();
}

// --- GESTÃO DE BANNERS ---
async function loadBanners() {
    const res = await fetch(`${API}/banners`);
    const data = await res.json();
    document.getElementById('banner-list').innerHTML = data.map(b => `
        <div class="relative rounded-xl overflow-hidden group">
            <img src="${b.imagem_url}" class="w-full h-24 object-cover opacity-50 group-hover:opacity-100 transition">
            <button onclick="deleteBanner('${b._id}')" class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition text-[10px] font-black uppercase">Remover Banner</button>
        </div>
    `).join('');
}

async function uploadBanner(input) {
    if (!input.files[0]) return;
    const fd = new FormData();
    fd.append('image', input.files[0]);
    await fetch(`${API}/banners`, { method: 'POST', body: fd });
    loadBanners();
}

async function deleteBanner(id) {
    await fetch(`${API}/banners/${id}`, { method: 'DELETE' });
    loadBanners();
}