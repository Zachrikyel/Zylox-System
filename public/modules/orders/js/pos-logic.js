const CartManager = {
    items: [],

    confirmAddToCard: () => {
        const p = OrdersUI.state.tempProduct;
        if (!p) return;

        const colorId = document.getElementById('selected-color-id').value;
        const colorName = document.getElementById('selected-color-name').value;
        const qty = parseInt(document.getElementById('modal-qty').value);

        // Validación: Si el producto tiene colores y no seleccionó
        if (p.product_colors && p.product_colors.length > 0 && (!colorId || colorId === '')) {
            // Animación de error sutil
            const section = document.getElementById('modal-color-section');
            section.classList.add('animate-pulse', 'text-red-500');
            setTimeout(() => section.classList.remove('animate-pulse', 'text-red-500'), 500);
            return;
        }

        const item = {
            uniqueId: Date.now(),
            productId: p.id,
            name: p.name,
            sku: p.sku,
            basePrice: p.sale_price || p.base_price,
            qty: qty,
            colorName: colorName || 'Base',
            colorId: colorId === 'null' ? null : colorId
        };

        CartManager.items.push(item);
        CartManager.renderCart();
        OrdersUI.closeModal();

        // Feedback Visual en el Carrito (Destello Verde)
        const cartPanel = document.querySelector('#cart-items');
        cartPanel.parentElement.classList.add('border-[#39FF14]');
        setTimeout(() => cartPanel.parentElement.classList.remove('border-[#39FF14]'), 300);
    },

    renderCart: () => {
        const container = document.getElementById('cart-items');
        if (CartManager.items.length === 0) {
            container.innerHTML = `
                <div class="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50">
                    <i class="ph ph-basket text-4xl mb-2"></i>
                    <span class="text-[10px] font-mono uppercase">Carrito Vacío</span>
                </div>`;
            document.getElementById('cart-subtotal').innerText = "$0";
            return;
        }

        let subtotal = 0;
        container.innerHTML = CartManager.items.map(item => {
            const itemTotal = item.basePrice * item.qty;
            subtotal += itemTotal;
            return `
            <div class="bg-zinc-950 border border-zinc-800 p-2 flex justify-between group hover:border-zinc-600 transition-colors">
                <div class="flex-1">
                    <div class="text-[10px] font-bold text-white uppercase truncate">${item.name}</div>
                    <div class="flex gap-2 text-[9px] text-zinc-500 font-mono mt-0.5">
                        <span class="text-[#39FF14]">${item.qty} x ${Utils.formatCurrency(item.basePrice)}</span>
                        <span>|</span>
                        <span class="text-zinc-400 uppercase">${item.colorName}</span>
                    </div>
                </div>
                <button onclick="CartManager.removeItem(${item.uniqueId})" class="text-zinc-600 hover:text-red-500 px-2">
                    <i class="ph ph-trash"></i>
                </button>
            </div>`;
        }).join('');

        document.getElementById('cart-subtotal').innerText = Utils.formatCurrency(subtotal);
        CartManager.recalc();
    },

    removeItem: (uid) => {
        CartManager.items = CartManager.items.filter(x => x.uniqueId !== uid);
        CartManager.renderCart();
    },

    clear: () => {
        if (confirm("¿Vaciar Orden?")) {
            CartManager.items = [];
            document.getElementById('input-total-manual').value = '';
            document.getElementById('input-profit-manual').value = '';
            document.getElementById('input-client-info').value = '';
            CartManager.renderCart();
        }
    },

    recalc: () => {
        const totalManual = parseFloat(document.getElementById('input-total-manual').value) || 0;
        let subtotalCatalog = CartManager.items.reduce((acc, item) => acc + (item.basePrice * item.qty), 0);

        // Estimación básica de ganancia (30% base + sobreprecio)
        const estimatedBaseProfit = subtotalCatalog * 0.30;
        const difference = totalManual - subtotalCatalog;
        const finalProfit = totalManual > 0 ? (estimatedBaseProfit + difference) : 0;

        document.getElementById('input-profit-manual').value = Math.round(finalProfit);
    },

    checkout: async () => {
        if (CartManager.items.length === 0) return alert("Carrito vacío");
        const totalCobrado = parseFloat(document.getElementById('input-total-manual').value);
        if (!totalCobrado) return alert("Ingresa el Total Cobrado");

        const btn = document.querySelector('button[onclick="CartManager.checkout()"]');
        const originalText = btn.innerText;
        btn.disabled = true;
        btn.innerText = "PROCESANDO...";

        try {
            const supabase = window.supabaseClient;

            // 1. Header
            const { data: order, error } = await supabase.from('orders').insert([{
                user_id: window.SYSTEM_USER_ID,
                total_amount: totalCobrado,
                total_profit: document.getElementById('input-profit-manual').value || 0,
                status: 'paid',
                payment_method: 'cash_pos',
                shipping_address: {},
                guest_info: document.getElementById('input-client-info').value || "Mostrador",
                order_source: 'manual_pos'
            }]).select().single();

            if (error) throw error;

            // 2. Items
            const factor = (CartManager.items.reduce((s, i) => s + i.basePrice * i.qty, 0) || 1);
            const ratio = totalCobrado / factor;

            const itemsPayload = CartManager.items.map(i => ({
                order_id: order.id,
                product_id: i.productId,
                quantity: i.qty,
                unit_price: i.basePrice * ratio,
                subtotal: (i.basePrice * i.qty) * ratio,
                selected_color: i.colorName
            }));

            await supabase.from('order_items').insert(itemsPayload);

            // 3. Stock
            for (const item of CartManager.items) {
                const { data: p } = await supabase.from('products').select('stock_quantity').eq('id', item.productId).single();
                if (p) {
                    await supabase.from('products').update({ stock_quantity: Math.max(0, p.stock_quantity - item.qty) }).eq('id', item.productId);
                }
            }

            alert(`Venta #${order.id} Registrada`);
            CartManager.items = []; // Limpiar items sin preguntar
            CartManager.renderCart();
            document.getElementById('input-total-manual').value = '';
            document.getElementById('input-profit-manual').value = '';

            // Refrescar widgets del home
            OrdersUI.loadHomeStats();

        } catch (e) {
            console.error(e);
            alert("Error: " + e.message);
        } finally {
            btn.disabled = false;
            btn.innerText = originalText;
        }
    }
};