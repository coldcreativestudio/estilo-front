const API = 'https://estilo-back.onrender.com/api'; 
const SEU_WHATSAPP = '5598984360341';

let allProducts = [];
let cart = JSON.parse(localStorage.getItem('ilha_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    updateCartUI();
    setupCheckout();
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
    } catch (e) { console.error("Erro na API"); }
}

function setupCheckout() {
    const form = document.getElementById('checkout-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (cart.length === 0) return alert("Sacola vazia!");

        // 1. Gerar Número do Pedido
        const now = new Date();
        const datePart = now.getFullYear() + (now.getMonth() + 1).toString().padStart(2, '0') + now.getDate().toString().padStart(2, '0');
        const orderId = `#PED-${datePart}-${Math.floor(100 + Math.random() * 900)}`;

        // 2. Capturar Dados
        const nome = document.getElementById('cust-nome').value;
        const tel = document.getElementById('cust-tel').value;
        const endereco = document.getElementById('cust-endereco').value;
        const entrega = document.querySelector('input[name="entrega"]:checked').value;
        const frete = parseFloat(document.querySelector('input[name="entrega"]:checked').dataset.price);
        const pagamento = document.querySelector('input[name="pagamento"]:checked').value;
        
        const subtotal = cart.reduce((acc, i) => acc + (i.preco * i.qty), 0);
        const total = subtotal + frete;

        // 3. Montar Mensagem Formatada (O seu fluxo)
        let msg = `Olá! Gostaria de fazer o seguinte pedido:\n\n`;
        msg += `🛍 *PEDIDO ${orderId}*\n\n`;
        msg += `📦 *Itens:*\n`;
        
        cart.forEach(item => {
            msg += `• ${item.nome} x${item.qty} - R$ ${(item.preco * item.qty).toFixed(2)}\n`;
        });

        msg += `\n💰 *Total: R$ ${total.toFixed(2)}*\n\n`;
        msg += `🚚 *Entrega:* ${entrega}\n`;
        if (endereco) msg += `📍 *Endereço:* ${endereco}\n`;
        msg += `\n💳 *Pagamento:* ${pagamento}\n\n`;
        msg += `👤 *Cliente:* ${nome}\n`;
        msg += `📞 *Tel:* ${tel}`;

        // 4. Redirecionar
        const zapUrl = `https://wa.me/${SEU_WHATSAPP}?text=${encodeURIComponent(msg)}`;
        window.location.href = zapUrl;
    });
}

// RENDERIZAÇÃO
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

function addToCart(id, nome, preco, imagem) {
    const item = cart.find(i => i.id === id);
    item ? item.qty++ : cart.push({ id, nome, preco, imagem, qty: 1 });
    localStorage.setItem('ilha_cart', JSON.stringify(cart));
    updateCartUI();
    toggleCart(true);
}

function updateCartUI() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('total-final');
    if (container) {
        container.innerHTML = cart.map(i => `
            <div class="flex justify-between items-center bg-[#080808] p-4 rounded-xl border border-white/5 mb-2">
                <div class="flex gap-4 items-center">
                    <img src="${i.imagem}" class="w-12 h-12 rounded-lg object-cover">
                    <div><h5 class="text-[10px] font-black uppercase">${i.nome}</h5><p class="text-[9px] text-gray-500">${i.qty}x R$ ${i.preco.toFixed(2)}</p></div>
                </div>
                <button onclick="removeFromCart('${i.id}')" class="text-red-600 font-bold">×</button>
            </div>
        `).join('');
    }
    const subtotal = cart.reduce((acc, i) => acc + (i.preco * i.qty), 0);
    const frete = parseFloat(document.querySelector('input[name="entrega"]:checked')?.dataset.price || 0);
    if (totalEl) totalEl.innerText = `R$ ${(subtotal + frete).toFixed(2)}`;
    document.getElementById('cart-count').innerText = cart.reduce((acc, i) => acc + i.qty, 0);
}

function removeFromCart(id) { cart = cart.filter(i => i.id !== id); localStorage.setItem('ilha_cart', JSON.stringify(cart)); updateCartUI(); }
function toggleMenu(o) { document.getElementById('sidebar').classList.toggle('open', o); document.getElementById('menu-overlay').classList.toggle('active', o); }
function toggleCart(o) { document.getElementById('cart-drawer').classList.toggle('open', o); document.getElementById('menu-overlay').classList.toggle('active', o); }

// Adicionado Listener para atualizar preço no checkout ao mudar entrega
document.querySelectorAll('input[name="entrega"]').forEach(radio => {
    radio.addEventListener('change', updateCartUI);
});