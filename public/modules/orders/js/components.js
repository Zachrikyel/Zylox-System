const OrdersUI = {
    state: {
        products: [],
        selectedProductIds: new Set(),
        currentView: 'home',
        currentStep: 0
    },

    init: async () => {
        OrdersUI.loadHomeStats();
        OrdersUI.fetchProducts();
    },

    fetchProducts: async () => {
        if (OrdersUI.state.products.length > 0) return;

        // Query con price_adjustment
        const { data, error } = await window.supabaseClient
            .from('products')
            .select(`
                id, name, sku, base_price, sale_price, stock_quantity, card_middle_url, display_order,
                product_colors ( id, color_name, hex_code, price_adjustment )
            `)
            .eq('is_published', true)
            .order('display_order', { ascending: true });

        if (!error && data) {
            OrdersUI.state.products = data;
        } else if (error) {
            console.error("Error fetching products:", error);
            Utils.notify("Error DB al cargar productos.", "error");
        }
    },

    loadHomeStats: async () => {
        const supabase = window.supabaseClient;
        if (!supabase) return;
        const { count: total } = await supabase.from('orders').select('*', { count: 'exact', head: true });
        const { count: manual } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_source', 'manual_pos');
        document.getElementById('stats-total-orders').innerText = total || 0;
        document.getElementById('stats-manual-orders').innerText = manual || 0;
    },

    startPosWizard: async () => {
        await OrdersUI.fetchProducts();
        OrdersUI.state.selectedProductIds.clear();
        CartManager.cart = [];
        WizardLogic.goToStep(1);
    },

    switchView: (viewName) => {
        document.getElementById('view-home').classList.add('hidden');
        document.getElementById('view-pos').classList.add('hidden');
        document.getElementById('view-history').classList.add('hidden');

        if (viewName === 'home') {
            document.getElementById('view-home').classList.remove('hidden');
            OrdersUI.updateParentHeader('home');
        } else if (viewName === 'history') {
            document.getElementById('view-history').classList.remove('hidden');
            document.getElementById('view-history').classList.add('flex');
            OrdersUI.loadHistory();
            OrdersUI.updateParentHeader('history');
        }
    },

    updateParentHeader: (context, stepNum) => {
        if (!window.parent) return;
        let titleText = "";
        if (context === 'home') titleText = "";
        if (context === 'history') titleText = "HISTORIAL";
        if (context === 'wizard') titleText = `PASO ${stepNum} DE 4`;

        try {
            const header = window.parent.document.querySelector('header');
            if (header) {
                let titleEl = header.querySelector('#module-stage-title');
                if (!titleEl) {
                    titleEl = document.createElement('div');
                    titleEl.id = 'module-stage-title';
                    titleEl.className = "absolute left-1/2 transform -translate-x-1/2 text-white font-mono text-xs uppercase tracking-widest font-bold pointer-events-none";
                    header.appendChild(titleEl);
                }
                titleEl.innerText = titleText;
            }
        } catch (e) { }

        if (context === 'home') {
            window.parent.stageBack = null;
            window.parent.stageModuleHome = null;
        } else if (context === 'history') {
            window.parent.stageBack = () => OrdersUI.switchView('home');
            window.parent.stageModuleHome = () => OrdersUI.switchView('home');
        } else if (context === 'wizard') {
            window.parent.stageModuleHome = () => {
                showConfirmModal("¿Salir de la venta? Se perderán los datos.", () => OrdersUI.switchView('home'));
            };
            window.parent.stageBack = () => {
                if (stepNum > 1) WizardLogic.goToStep(stepNum - 1);
                else OrdersUI.switchView('home');
            };
        }
    },

    renderStep1: () => {
        const container = document.getElementById('step1-grid');
        const selected = OrdersUI.state.selectedProductIds;
        container.innerHTML = OrdersUI.state.products.map(p => {
            const isSelected = selected.has(p.id);
            const price = p.sale_price || p.base_price;
            let imgUrl = null;
            if (p.card_middle_url) {
                const id = Utils.extractDriveId(p.card_middle_url);
                if (id) imgUrl = `/api/drive-proxy?id=${id}`;
            }

            return `
            <div onclick="WizardLogic.toggleProductSelection(${p.id})" 
                 class="group relative h-56 border cursor-pointer transition-all flex flex-col cyber-shape bg-zinc-900 overflow-hidden
                 ${isSelected ? 'border-[#39FF14] ring-1 ring-[#39FF14]' : 'border-zinc-800 hover:border-zinc-500'}">
                <div class="absolute top-0 left-0 bg-zinc-800 text-zinc-500 text-[9px] px-2 py-0.5 font-mono z-10 border-b border-r border-zinc-700">#${p.display_order || '0'}</div>
                ${isSelected ? `<div class="absolute top-2 right-2 text-[#39FF14] z-10 bg-black/80 rounded-full p-1"><i class="ph-fill ph-check-circle text-xl"></i></div>` : ''}
                <div class="flex-1 flex items-center justify-center p-4 bg-gradient-to-b from-black/20 to-zinc-900/50">
                    ${imgUrl ? `<img src="${imgUrl}" class="max-h-full object-contain drop-shadow-lg ${isSelected ? 'scale-110' : ''} transition-transform">` : '<i class="ph ph-image text-3xl text-zinc-700"></i>'}
                </div>
                <div class="p-3 bg-zinc-950 border-t border-zinc-800 relative">
                     <h3 class="text-[10px] font-bold text-white uppercase leading-tight line-clamp-2 h-6">${p.name}</h3>
                     <div class="flex justify-between items-end mt-2">
                        <span class="text-[#39FF14] font-mono font-bold text-xs">${Utils.formatCurrency(price)}</span>
                        <span class="text-[9px] text-zinc-600 uppercase">Stock: ${p.stock_quantity || 0}</span>
                     </div>
                </div>
            </div>`;
        }).join('');
        WizardLogic.updateNextButtonState();
    },

    // --- STEP 2: CORREGIDO VISUALMENTE ---
    renderStep2: () => {
        const container = document.getElementById('step2-list');
        const selectedIds = Array.from(OrdersUI.state.selectedProductIds);
        const products = OrdersUI.state.products.filter(p => selectedIds.includes(p.id));

        container.innerHTML = products.map(p => {
            const hasVariants = p.product_colors && p.product_colors.length > 0;
            const defaultPrice = p.sale_price || p.base_price;

            let imgUrl = null;
            if (p.card_middle_url) {
                const id = Utils.extractDriveId(p.card_middle_url);
                if (id) imgUrl = `/api/drive-proxy?id=${id}`;
            }

            let variantHtml = '';
            if (hasVariants) {
                variantHtml = `
                <div class="mt-4">
                    <label class="text-[9px] text-zinc-500 uppercase block mb-2 font-bold tracking-wider">Variante Requerida:</label>
                    <div class="flex flex-wrap gap-2">
                        ${p.product_colors.map(c => {
                    const adjustment = parseFloat(c.price_adjustment) || 0;
                    const vPrice = defaultPrice + adjustment;
                    return `
                            <button onclick="WizardLogic.selectVariantForProduct(${p.id}, '${c.color_name}', '${c.id}', ${vPrice}, this)" 
                                    class="variant-btn variant-btn-${p.id} h-9 px-4 border border-zinc-700 bg-zinc-900 hover:border-zinc-500 text-[10px] uppercase text-zinc-400 flex items-center gap-2 rounded-sm"
                                    data-color-id="${c.id}" data-color-name="${c.color_name}">
                                <span class="w-3 h-3 rounded-full border border-zinc-600 shadow-sm" style="background:${c.hex_code}"></span>
                                ${c.color_name}
                            </button>`;
                }).join('')}
                    </div>
                </div>`;
            } else {
                variantHtml = `<div class="mt-4 p-2 bg-zinc-900/50 border border-zinc-800 text-[9px] text-zinc-500 italic text-center">Este producto es único (Sin variantes)</div>`;
            }

            // AQUI ESTA LA CORRECCION VISUAL DE LA CANTIDAD
            return `
            <div class="bg-black/40 border border-zinc-800 p-4 flex gap-5 cyber-shape product-config-card transition-colors duration-300" id="config-card-${p.id}" data-id="${p.id}" data-has-variants="${hasVariants}" data-final-price="${defaultPrice}">
                
                <div class="w-24 h-24 bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 p-2 relative overflow-hidden group">
                     ${imgUrl ? `<img src="${imgUrl}" class="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform">` : '<i class="ph ph-image text-2xl text-zinc-700"></i>'}
                </div>
                
                <div class="flex-1 flex flex-col justify-center">
                    <h3 class="text-sm font-black text-white uppercase italic tracking-wider">${p.name}</h3>
                    <div id="price-display-${p.id}" class="text-[#39FF14] font-mono text-xs mb-1 font-bold transition-all">
                        ${Utils.formatCurrency(defaultPrice)}
                    </div>
                    
                    ${variantHtml}

                    <div class="mt-5 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <label class="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Cantidad:</label>
                        
                        <div class="flex items-center border border-zinc-700 bg-zinc-900 w-full max-w-[120px] h-9">
                            <button onclick="WizardLogic.adjustQty(${p.id}, -1)" class="w-8 h-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors text-lg font-bold flex items-center justify-center">-</button>
                            
                            <input type="number" id="qty-${p.id}" value="1" class="flex-1 h-full bg-transparent text-center text-white text-sm font-mono outline-none border-x border-zinc-800 appearance-none m-0 p-0" readonly>
                            
                            <button onclick="WizardLogic.adjustQty(${p.id}, 1)" class="w-8 h-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors text-lg font-bold flex items-center justify-center">+</button>
                        </div>
                    </div>

                </div>
            </div>`;
        }).join('');
    },

    renderStep3: () => CartManager.renderReviewTable(),

    loadHistory: async () => {
        const container = document.getElementById('history-container');
        container.innerHTML = '<div class="text-center text-zinc-500 text-xs mt-4">Cargando...</div>';
        const { data, error } = await window.supabaseClient
            .from('orders').select(`id, created_at, total_amount, guest_info, order_items(quantity, product:products(name))`)
            .order('created_at', { ascending: false }).limit(20);
        if (error) return;
        container.innerHTML = data.map(o => `
            <div class="bg-zinc-900 border border-zinc-800 p-3 flex justify-between hover:border-zinc-600">
                <div><span class="text-[#39FF14] font-mono text-xs">#${o.id}</span> <span class="text-[9px] text-zinc-500">${new Date(o.created_at).toLocaleDateString()}</span></div>
                <div class="text-white font-mono text-sm">${Utils.formatCurrency(o.total_amount)}</div>
            </div>
        `).join('');
    }
};