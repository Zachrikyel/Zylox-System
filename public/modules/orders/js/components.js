const OrdersUI = {
    state: {
        products: [],
        tempProduct: null,
        currentView: 'home'
    },

    init: async () => {
        OrdersUI.loadHomeStats();
    },

    loadHomeStats: async () => {
        const supabase = window.supabaseClient;
        if (!supabase) return;

        const { count: total } = await supabase.from('orders').select('*', { count: 'exact', head: true });
        const { count: manual } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_source', 'manual_pos');

        const elTotal = document.getElementById('stats-total-orders');
        const elManual = document.getElementById('stats-manual-orders');

        if (elTotal) elTotal.innerText = total || 0;
        if (elManual) elManual.innerText = manual || 0;
    },

    switchView: (viewName) => {
        ['view-home', 'view-pos', 'view-history'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.add('hidden');
                el.classList.remove('flex');
            }
        });

        const target = document.getElementById(`view-${viewName}`);
        if (target) {
            target.classList.remove('hidden');
            target.classList.add('flex');
        }

        if (viewName === 'pos') {
            OrdersUI.loadProductsForPOS();
        } else if (viewName === 'history') {
            OrdersUI.loadHistory();
        }
    },

    // --- CARGA DE PRODUCTOS (POS) ---
    loadProductsForPOS: async () => {
        // Evitar recargar si ya hay datos, para velocidad
        if (OrdersUI.state.products.length > 0) return;

        const container = document.getElementById('product-grid');
        container.innerHTML = '<div class="col-span-full text-center text-zinc-500 animate-pulse mt-10 font-mono text-xs">Sincronizando Catálogo...</div>';

        const { data, error } = await window.supabaseClient
            .from('products')
            .select(`
                id, name, sku, base_price, sale_price, card_middle_url,
                product_colors ( id, color_name, hex_code )
            `)
            .eq('is_published', true)
            .order('display_order');

        if (error) {
            container.innerHTML = `<div class="text-red-500 text-xs">Error: ${error.message}</div>`;
            return;
        }

        OrdersUI.state.products = data;
        OrdersUI.renderProductGrid(data);
    },

    renderProductGrid: (products) => {
        const container = document.getElementById('product-grid');
        if (products.length === 0) {
            container.innerHTML = '<div class="col-span-full text-center text-zinc-600 mt-10 text-xs">No hay productos.</div>';
            return;
        }

        container.innerHTML = products.map(p => {
            const hasVariants = p.product_colors && p.product_colors.length > 0;
            const price = p.sale_price || p.base_price;

            // Lógica de Imagen: Prioridad card_middle_url
            let imgUrl = null;
            const rawUrl = p.card_middle_url;
            if (rawUrl) {
                const id = Utils.extractDriveId(rawUrl); // Usamos el helper de utils
                if (id) imgUrl = `/api/drive-proxy?id=${id}`;
            }

            // Card HTML
            return `
            <div onclick="OrdersUI.openAddModal(${p.id})" 
                 class="group bg-zinc-900 border border-zinc-800 hover:border-[#39FF14] transition-all cursor-pointer relative flex flex-col h-48 overflow-hidden cyber-shape">
                
                <div class="absolute top-2 right-2 z-10">
                    <span class="bg-black/90 text-[#39FF14] text-[10px] font-mono px-1.5 py-0.5 border border-[#39FF14]/30 font-bold">
                        ${Utils.formatCurrency(price)}
                    </span>
                </div>

                <div class="flex-1 bg-gradient-to-b from-zinc-800/30 to-black/50 flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-300">
                    ${imgUrl
                    ? `<img src="${imgUrl}" class="max-h-full object-contain drop-shadow-xl" loading="lazy">`
                    : `<i class="ph ph-image text-4xl text-zinc-700"></i>`
                }
                </div>

                <div class="p-3 bg-zinc-950 border-t border-zinc-800 relative">
                    ${hasVariants
                    ? `<div class="absolute -top-3 left-3 bg-purple-900/90 text-purple-200 text-[8px] px-1.5 py-0.5 border border-purple-500/50 uppercase tracking-wider">Variantes</div>`
                    : ''}
                    <h3 class="text-[10px] font-bold text-white uppercase leading-tight line-clamp-2 h-6">${p.name}</h3>
                    <span class="text-[9px] text-zinc-500 font-mono block mt-1">${p.sku}</span>
                </div>
            </div>`;
        }).join('');
    },

    // --- MODAL LOGIC ---
    openAddModal: (productId) => {
        const p = OrdersUI.state.products.find(x => x.id === productId);
        if (!p) return;

        OrdersUI.state.tempProduct = p;
        document.getElementById('modal-product-name').innerText = p.name;
        document.getElementById('modal-qty').value = 1;

        // Render Variantes (Colores)
        const colorSection = document.getElementById('modal-color-section');
        const colorGrid = document.getElementById('modal-colors-grid');
        const variantNameDisplay = document.getElementById('modal-selected-variant-name');

        variantNameDisplay.innerText = "--";
        document.getElementById('selected-color-id').value = '';
        document.getElementById('selected-color-name').value = '';

        if (p.product_colors && p.product_colors.length > 0) {
            colorSection.style.display = 'block';
            colorGrid.innerHTML = p.product_colors.map(c => `
                <button onclick="OrdersUI.selectColor(this, '${c.id}', '${c.color_name}')" 
                        class="color-btn h-12 border border-zinc-600 bg-zinc-800 hover:border-white transition-all flex flex-col items-center justify-center gap-1 group relative overflow-hidden">
                    <div class="w-full h-1/2 absolute top-0 left-0 opacity-50" style="background-color: ${c.hex_code}"></div>
                    <span class="relative z-10 mt-4 text-[9px] font-bold text-zinc-300 uppercase group-hover:text-white">${c.color_name}</span>
                </button>
            `).join('');
        } else {
            // Si no tiene variantes, ocultamos la sección y pre-seleccionamos "Base"
            colorSection.style.display = 'none';
            document.getElementById('selected-color-id').value = 'null';
            document.getElementById('selected-color-name').value = 'Base';
        }

        const modal = document.getElementById('variant-modal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    },

    closeModal: () => {
        const modal = document.getElementById('variant-modal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        OrdersUI.state.tempProduct = null;
    },

    selectColor: (btn, id, name) => {
        // Limpiar selección previa
        document.querySelectorAll('.color-btn').forEach(b => {
            b.classList.remove('ring-2', 'ring-[#39FF14]', 'border-[#39FF14]');
            b.classList.add('border-zinc-600');
        });

        // Marcar nueva
        btn.classList.remove('border-zinc-600');
        btn.classList.add('ring-2', 'ring-[#39FF14]', 'border-[#39FF14]');

        document.getElementById('selected-color-id').value = id;
        document.getElementById('selected-color-name').value = name;
        document.getElementById('modal-selected-variant-name').innerText = name;
    },

    adjustQty: (delta) => {
        const input = document.getElementById('modal-qty');
        let val = parseInt(input.value) || 1;
        val += delta;
        if (val < 1) val = 1;
        input.value = val;
    },

    // Historial (Simple render)
    loadHistory: async () => {
        const container = document.getElementById('history-container');
        container.innerHTML = '<div class="text-center text-zinc-500 text-xs mt-4">Cargando...</div>';

        const { data, error } = await window.supabaseClient
            .from('orders')
            .select(`id, created_at, total_amount, guest_info, order_items (quantity, product:products(name))`)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) return container.innerHTML = 'Error';

        container.innerHTML = data.map(o => {
            const summary = o.order_items.map(i => `${i.quantity}x ${i.product?.name}`).join(', ');
            return `
            <div class="bg-zinc-900 border border-zinc-800 p-3 flex justify-between items-center hover:border-zinc-600">
                <div>
                    <div class="flex items-center gap-2">
                        <span class="text-[#39FF14] font-mono font-bold text-xs">#${o.id}</span>
                        <span class="text-[9px] text-zinc-500 uppercase">${new Date(o.created_at).toLocaleDateString()}</span>
                    </div>
                    <div class="text-[10px] text-zinc-400 truncate w-48">${summary}</div>
                </div>
                <div class="text-right">
                    <div class="text-white font-mono font-bold text-sm">${Utils.formatCurrency(o.total_amount)}</div>
                    <div class="text-[8px] text-zinc-500 uppercase">${o.guest_info || '-'}</div>
                </div>
            </div>`;
        }).join('');
    }
};