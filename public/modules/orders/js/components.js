const OrdersUI = {
    state: {
        products: [],
        bundles: [],
        selectedProductIds: new Set(),
        currentView: 'home',
        currentStep: 0,
        isComboMode: false
    },

    init: async () => {
        OrdersUI.loadHomeStats();
        // Prefetch products & bundles in background
        OrdersUI.fetchProducts();
        OrdersUI.fetchBundles();
    },

    fetchProducts: async () => {
        if (OrdersUI.state.products.length > 0) return;
        const { data, error } = await window.supabaseClient
            .from('products')
            .select(`
                id, name, sku, base_price, sale_price, stock_quantity, card_middle_url, display_order,
                profit_margin, specific_kwh_cost, specific_wear_cost, specific_labor_cost, 
                is_stock_item, is_free_shipping, compare_at_price,
                product_colors ( id, color_name, hex_code, price_adjustment )
            `)
            .eq('is_published', true)
            .is('pack_type', null) // Filtrar SOLO productos (sin bundles)
            .order('display_order', { ascending: true });

        if (!error && data) OrdersUI.state.products = data;
    },

    fetchBundles: async () => {
        if (OrdersUI.state.bundles.length > 0) return;
        const { data, error } = await window.supabaseClient
            .from('products')
            .select(`
                id, name, sku, base_price, sale_price, stock_quantity, card_middle_url, display_order,
                profit_margin, specific_kwh_cost, specific_wear_cost, specific_labor_cost, 
                is_stock_item, is_free_shipping, compare_at_price,
                product_colors ( id, color_name, hex_code, price_adjustment )
            `)
            .eq('is_published', true)
            .not('pack_type', 'is', null) // Filtrar SOLO combos
            .order('display_order', { ascending: true });

        if (!error && data) OrdersUI.state.bundles = data;
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
        OrdersUI.state.isComboMode = false;
        await OrdersUI.fetchProducts();
        OrdersUI.state.selectedProductIds.clear();
        CartManager.cart = [];
        WizardLogic.goToStep(1);
    },

    startComboWizard: async () => {
        OrdersUI.state.isComboMode = true;
        await OrdersUI.fetchBundles();
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
        if (context === 'wizard') {
            const prefix = OrdersUI.state.isComboMode ? 'COMBO ' : '';
            // Si es combo, saltamos el step 2, por lo que el step 3 es "2 de 3" y step 4 es "3 de 3"
            if (OrdersUI.state.isComboMode) {
                const displayStep = stepNum === 1 ? 1 : stepNum - 1;
                titleText = `${prefix}PASO ${displayStep} DE 3`;
            } else {
                titleText = `PASO ${stepNum} DE 4`;
            }
        }

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
                if (stepNum > 1) {
                    const prevStep = (OrdersUI.state.isComboMode && stepNum === 3) ? 1 : stepNum - 1;
                    WizardLogic.goToStep(prevStep);
                }
                else OrdersUI.switchView('home');
            };
        }
    },

    filterStep1: (query) => {
        const q = (query || '').toLowerCase().trim();
        const items = OrdersUI.state.isComboMode ? OrdersUI.state.bundles : OrdersUI.state.products;
        
        items.forEach(p => {
            const el = document.getElementById(`step1-item-${p.id}`);
            if (el) {
                if (!q || (p.name && p.name.toLowerCase().includes(q))) {
                    el.classList.remove('hidden');
                } else {
                    el.classList.add('hidden');
                }
            }
        });
    },

    renderStep1: () => {
        // En lugar de un grid, usamos una lista estilo Arsenal (flex column)
        const container = document.getElementById('step1-grid');
        container.className = "flex-1 overflow-y-auto space-y-2 pb-24"; // Reemplazar clases del grid

        const selected = OrdersUI.state.selectedProductIds;
        const items = OrdersUI.state.isComboMode ? OrdersUI.state.bundles : OrdersUI.state.products;

        if (items.length === 0) {
            container.innerHTML = '<div class="text-center p-10 text-zinc-500 text-xs">No hay elementos disponibles.</div>';
            return;
        }

        container.innerHTML = items.map(p => {
            const isSelected = selected.has(p.id);
            const price = p.sale_price || p.base_price;
            let imgUrl = null;
            if (p.card_middle_url) {
                const id = Utils.extractDriveId(p.card_middle_url);
                if (id) imgUrl = `/api/drive-proxy?id=${id}`;
            }

            const stockColor = p.stock_quantity > 20 ? 'text-[#39FF14]' : (p.stock_quantity > 5 ? 'text-yellow-400' : 'text-red-500');
            const borderCls = isSelected ? 'border-[#39FF14]' : 'border-zinc-800';
            const bgCls = isSelected ? 'bg-zinc-800/80' : 'bg-zinc-900';

            return `
            <div id="step1-item-${p.id}" onclick="WizardLogic.toggleProductSelection(${p.id})" class="${bgCls} border ${borderCls} h-28 flex cursor-pointer hover:border-[#39FF14] transition-all group overflow-hidden relative" style="clip-path: polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%);">
                
                ${isSelected ? `<div class="absolute top-2 right-2 text-[#39FF14] z-10 bg-black/80 rounded-full p-0.5 shadow-[0_0_8px_rgba(57,255,20,0.5)]"><i class="ph-fill ph-check-circle text-xl"></i></div>` : ''}

                <div class="w-24 h-full bg-zinc-950 flex-shrink-0 relative border-r border-zinc-800">
                    ${imgUrl 
                        ? `<img src="${imgUrl}" class="w-full h-full object-cover opacity-80 ${isSelected ? 'opacity-100 scale-110' : 'group-hover:opacity-100'} transition-all" />` 
                        : `<div class="w-full h-full flex items-center justify-center text-zinc-700"><i class="ph ph-image text-2xl"></i></div>`}
                    <div class="absolute top-0 left-0 bg-black/80 px-1.5 py-0.5 text-[8px] font-mono text-zinc-400 border-b border-r border-zinc-800">
                        #${p.display_order || '0'}
                    </div>
                </div>
                
                <div class="flex-1 p-3 flex flex-col justify-between">
                    <div>
                        <div class="flex items-start gap-2">
                            <h3 class="text-sm font-bold text-white uppercase leading-tight line-clamp-2">${p.name}</h3>
                            ${OrdersUI.state.isComboMode ? '<span class="text-[8px] bg-purple-500/20 text-purple-400 px-1 py-0.5 border border-purple-500/30 rounded font-bold uppercase tracking-wider whitespace-nowrap">Combo</span>' : ''}
                        </div>
                        <span class="text-[10px] font-mono text-zinc-500 mt-0.5 block tracking-widest">${p.sku || 'SIN-SKU'}</span>
                    </div>
                    <div class="flex items-end justify-between border-t border-white/5 pt-2">
                        <div class="flex flex-col">
                            <span class="text-[9px] text-zinc-600 uppercase">Venta</span>
                            <span class="text-sm font-mono font-bold text-[#39FF14]">${Utils.formatCurrency(price)}</span>
                        </div>
                        <div class="flex flex-col items-end">
                            <span class="text-[9px] text-zinc-600 uppercase">Stock</span>
                            <span class="text-xs font-mono ${stockColor}">${p.stock_quantity || 0} un.</span>
                        </div>
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
            .from('orders').select(`id, created_at, total_amount, total_profit, status, payment_method, guest_info, order_items(id, quantity, unit_price, selected_color, product_id, product:products(id, name))`)
            .order('created_at', { ascending: false }).limit(20);
        if (error) return;
        window._historyOrders = data; // cache para abrir el editor sin volver a pedirlo
        container.innerHTML = data.map(o => {
            let guestLabel = '';
            if (o.guest_info) {
                try {
                    const gi = typeof o.guest_info === 'string' ? JSON.parse(o.guest_info) : o.guest_info;
                    guestLabel = gi.name || gi.nombre || gi.email || gi.phone || JSON.stringify(gi);
                } catch { guestLabel = String(o.guest_info); }
            }
            return `
            <div onclick="openOrderEditor(${o.id})" class="bg-zinc-900 border border-zinc-800 p-3 flex justify-between hover:border-cyan-500 cursor-pointer transition-colors">
                <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-[#39FF14] font-mono text-xs">#${o.id}</span>
                    <span class="text-[9px] text-zinc-500">${new Date(o.created_at).toLocaleDateString()}</span>
                    ${guestLabel ? `<span class="text-[9px] text-purple-400 font-mono bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded-sm uppercase truncate max-w-[150px]" title="${guestLabel}">${guestLabel}</span>` : ''}
                </div>
                <div class="text-white font-mono text-sm">${Utils.formatCurrency(o.total_amount)}</div>
            </div>`;
        }).join('');
    }
};
// --- EDITOR DE ORDENES ---
window.openOrderEditor = async (orderId) => {
    const order = (window._historyOrders || []).find(o => o.id === orderId);
    if (!order) return;

    if (!window._orderEditorFilamentOptions) {
        window._orderEditorFilamentOptions = 'loading';
        window.fetchFilamentOptions().then(opts => { window._orderEditorFilamentOptions = opts; renderOrderEditorModal(order); });
    }

    // Traemos el consumo real (quote_materials) de cada línea, en una sola pasada
    window._orderEditorMaterials = {};
    window._orderEditorColors = {}; // Para el select de selected_color
    for (const item of order.order_items) {
        window._orderEditorMaterials[item.id] = await window.fetchOrderItemMaterials(item.id);
        window._orderEditorColors[item.id] = await window.fetchProductColors(item.product_id);
    }

    renderOrderEditorModal(order);
};

window.closeOrderEditor = () => {
    const el = document.getElementById('order-editor-modal');
    if (el) el.remove();
};

function renderOrderEditorModal(order) {
    const existing = document.getElementById('order-editor-modal');
    if (existing) existing.remove();

    const opts = window._orderEditorFilamentOptions;
    const loading = opts === 'loading' || !opts;

    // Parse guest_info for string input
    let guestStr = '';
    if (order.guest_info) {
        try {
            const gi = typeof order.guest_info === 'string' ? JSON.parse(order.guest_info) : order.guest_info;
            guestStr = gi.name || gi.nombre || gi.email || gi.phone || JSON.stringify(gi);
        } catch { guestStr = String(order.guest_info); }
    }

    const modal = document.createElement('div');
    modal.id = 'order-editor-modal';
    modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in overflow-y-auto';
    modal.innerHTML = `
        <div class="bg-zinc-900 border-2 border-cyan-500 max-w-2xl w-full p-5 shadow-2xl relative my-8" style="clip-path: polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 100%);">
            <div class="flex justify-between items-center mb-6 border-b border-zinc-800 pb-2">
                <h3 class="text-cyan-400 font-bold uppercase text-lg">Editar Orden #${order.id}</h3>
                <button onclick="closeOrderEditor()" class="text-zinc-500 hover:text-white text-xl">✕</button>
            </div>
            
            <form id="order-edit-form" onsubmit="event.preventDefault(); saveOrderChanges(${order.id});" class="space-y-6">
                <!-- Info General -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="text-[9px] text-zinc-500 uppercase tracking-wider font-bold mb-1 block">Cliente</label>
                        <input type="text" id="edit-guest" value="${guestStr}" class="w-full bg-black border border-zinc-700 p-2 text-xs text-white">
                    </div>
                    <div>
                        <label class="text-[9px] text-zinc-500 uppercase tracking-wider font-bold mb-1 block">Total Cobrado (COP)</label>
                        <input type="number" step="0.01" id="edit-total" value="${order.total_amount || 0}" class="w-full bg-black border border-zinc-700 p-2 text-xs text-[#39FF14] font-mono font-bold">
                    </div>
                    <div>
                        <label class="text-[9px] text-zinc-500 uppercase tracking-wider font-bold mb-1 block">Ganancia Registrada (COP)</label>
                        <input type="number" step="0.01" id="edit-profit" value="${order.total_profit || 0}" class="w-full bg-black border border-zinc-700 p-2 text-xs text-white font-mono">
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="text-[9px] text-zinc-500 uppercase tracking-wider font-bold mb-1 block">Estado</label>
                            <select id="edit-status" class="w-full bg-black border border-zinc-700 p-2 text-xs text-white">
                                <option value="paid" ${order.status === 'paid' ? 'selected' : ''}>Pagado</option>
                                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pendiente</option>
                                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelado</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-[9px] text-zinc-500 uppercase tracking-wider font-bold mb-1 block">Método</label>
                            <select id="edit-method" class="w-full bg-black border border-zinc-700 p-2 text-xs text-white">
                                <option value="cash_pos" ${order.payment_method === 'cash_pos' ? 'selected' : ''}>Efectivo (POS)</option>
                                <option value="transfer" ${order.payment_method === 'transfer' ? 'selected' : ''}>Transferencia</option>
                                <option value="wompi" ${order.payment_method === 'wompi' ? 'selected' : ''}>Wompi</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Items -->
                <div class="space-y-3">
                    <h4 class="text-xs text-zinc-400 font-bold uppercase tracking-widest border-b border-zinc-800 pb-1">Items de la Orden</h4>
                    <div id="edit-items-container" class="space-y-3">
                    ${order.order_items.map(item => {
                        const rows = window._orderEditorMaterials[item.id] || [];
                        const colors = window._orderEditorColors[item.id] || [];
                        return `
                        <div class="border border-zinc-800 p-3 relative bg-zinc-950" id="item-row-${item.id}">
                            <button type="button" onclick="handleDeleteOrderItem(${item.id})" class="absolute top-2 right-2 text-zinc-600 hover:text-red-500"><i class="ph-fill ph-trash"></i></button>
                            <div class="text-xs text-white font-bold mb-3 pr-8">${item.product ? item.product.name : 'Producto'}</div>
                            
                            <div class="grid grid-cols-3 gap-3 mb-3">
                                <div>
                                    <label class="text-[8px] text-zinc-500 uppercase block mb-1">Cantidad</label>
                                    <input type="number" min="1" id="item-qty-${item.id}" value="${item.quantity}" class="w-full bg-black border border-zinc-700 p-1.5 text-xs text-white text-center">
                                </div>
                                <div>
                                    <label class="text-[8px] text-zinc-500 uppercase block mb-1">Precio Unit.</label>
                                    <input type="number" step="0.01" id="item-price-${item.id}" value="${item.unit_price || 0}" class="w-full bg-black border border-zinc-700 p-1.5 text-xs text-white">
                                </div>
                                <div>
                                    <label class="text-[8px] text-zinc-500 uppercase block mb-1">Variante Color</label>
                                    <select id="item-color-${item.id}" class="w-full bg-black border border-zinc-700 p-1.5 text-xs text-white">
                                        <option value="">N/A</option>
                                        ${colors.map(c => `<option value="${c.color_name}" ${item.selected_color === c.color_name ? 'selected' : ''}>${c.color_name}</option>`).join('')}
                                        ${item.selected_color && !colors.some(c => c.color_name === item.selected_color) ? `<option value="${item.selected_color}" selected>${item.selected_color} (Legado)</option>` : ''}
                                    </select>
                                </div>
                            </div>
                            
                            <!-- Materiales -->
                            <div class="bg-black/50 p-2 border border-zinc-800/50">
                                <div class="text-[9px] text-zinc-500 uppercase tracking-widest mb-2 font-bold">Materiales de Impresión</div>
                                ${loading ? `<div class="text-[10px] text-zinc-600">⏳ Cargando materiales...</div>` : rows.length === 0 ? `<div class="text-[10px] text-zinc-600">Sin materiales (probablemente combo o sin receta).</div>` : rows.map(r => `
                                <div class="flex items-center gap-2 mb-1">
                                    <select id="qm-swap-${r.id}" class="flex-1 bg-black border border-zinc-700 p-1 text-[10px] text-white">
                                        ${opts.map(m => `<option value="${m.id}" ${m.id === r.material_id ? 'selected' : ''}>${m.display_name}${m.current_quantity <= 0 ? ' ⚠️' : ''}</option>`).join('')}
                                    </select>
                                    <span class="text-[9px] text-yellow-400 font-mono w-10 text-right" id="qm-qty-${r.id}" data-base="${r.quantity / item.quantity}">${r.quantity}g</span>
                                </div>`).join('')}
                            </div>
                        </div>`;
                    }).join('')}
                    </div>
                    
                    <div class="mt-4 flex gap-2">
                        <select id="add-product-select" class="flex-1 bg-black border border-zinc-700 p-2 text-xs text-white">
                            <option value="">+ Seleccionar producto para agregar...</option>
                            ${OrdersUI.state.products.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                        </select>
                        <button type="button" onclick="handleAddProductToOrder(${order.id})" class="bg-zinc-800 text-[#39FF14] px-4 text-xs font-bold hover:bg-zinc-700 transition-colors border border-zinc-700">Agregar</button>
                    </div>
                </div>
                
                <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-zinc-800">
                    <button type="button" onclick="closeOrderEditor()" class="px-4 py-2 text-xs font-bold uppercase text-zinc-400 hover:text-white transition-colors">Cancelar</button>
                    <button type="submit" class="bg-cyan-500 text-black px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-cyan-400 transition-colors cyber-shape">Guardar Cambios</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    // Auto-update quote material weights when qty changes
    order.order_items.forEach(item => {
        const qtyEl = document.getElementById(`item-qty-${item.id}`);
        if (qtyEl) {
            qtyEl.addEventListener('input', (e) => {
                const newQty = parseInt(e.target.value) || 1;
                const rows = window._orderEditorMaterials[item.id] || [];
                rows.forEach(r => {
                    const el = document.getElementById(`qm-qty-${r.id}`);
                    if (el) {
                        const baseQty = parseFloat(el.getAttribute('data-base')) || 0;
                        el.innerText = (baseQty * newQty).toFixed(1) + 'g';
                    }
                });
            });
        }
    });
}

window.handleDeleteOrderItem = (itemId) => {
    showConfirmModal("¿Estás seguro de eliminar este item de la orden? El inventario será repuesto.", async () => {
        try {
            await window.deleteOrderItem(itemId);
            document.getElementById(`item-row-${itemId}`).remove();
            showNotification("Item eliminado", "success");
        } catch (e) {
            console.error(e);
            showNotification("Error: " + e.message, "error");
        }
    });
};

window.saveOrderChanges = async (orderId) => {
    const btn = document.querySelector('#order-edit-form button[type="submit"]');
    btn.disabled = true;
    btn.innerText = "GUARDANDO...";

    try {
        const order = (window._historyOrders || []).find(o => o.id === orderId);
        if (!order) throw new Error("Orden no encontrada");

        // 1. Guardar info de la orden
        const orderChanges = {
            guest_info: document.getElementById('edit-guest').value,
            total_amount: parseFloat(document.getElementById('edit-total').value) || 0,
            total_profit: parseFloat(document.getElementById('edit-profit').value) || 0,
            status: document.getElementById('edit-status').value,
            payment_method: document.getElementById('edit-method').value
        };
        await window.updateOrder(orderId, orderChanges);

        // 2. Guardar items y materiales
        for (const item of order.order_items) {
            const rowEl = document.getElementById(`item-row-${item.id}`);
            if (!rowEl) continue; // fue eliminado

            const qty = parseInt(document.getElementById(`item-qty-${item.id}`).value) || 1;
            const price = parseFloat(document.getElementById(`item-price-${item.id}`).value) || 0;
            const color = document.getElementById(`item-color-${item.id}`).value || null;
            
            const itemChanges = {};
            if (qty !== item.quantity) itemChanges.quantity = qty;
            if (price !== item.unit_price) {
                itemChanges.unit_price = price;
                itemChanges.subtotal = price * qty;
            } else if (qty !== item.quantity) {
                itemChanges.subtotal = item.unit_price * qty;
            }
            if (color !== item.selected_color) itemChanges.selected_color = color;

            if (Object.keys(itemChanges).length > 0) {
                await window.updateOrderItem(item.id, itemChanges);
            }

            // Material Swaps
            const rows = window._orderEditorMaterials[item.id] || [];
            for (const r of rows) {
                const swapEl = document.getElementById(`qm-swap-${r.id}`);
                if (swapEl) {
                    const newMatId = parseInt(swapEl.value);
                    if (newMatId !== r.material_id) {
                        await window.swapOrderItemMaterial(r.id, newMatId);
                    }
                }
            }
        }

        showNotification("Orden actualizada con éxito", "success");
        closeOrderEditor();
        await OrdersUI.loadHistory(); // Refrescar

    } catch (e) {
        console.error(e);
        showNotification("Error: " + e.message, "error");
        btn.disabled = false;
        btn.innerText = "Guardar Cambios";
    }
};

window.handleAddProductToOrder = async (orderId) => {
    const sel = document.getElementById('add-product-select');
    const productId = parseInt(sel.value);
    if (!productId) return Utils.notify("Selecciona un producto primero", "warning");

    const p = OrdersUI.state.products.find(x => x.id === productId);
    if (!p) return;

    try {
        const supabase = window.supabaseClient;
        
        // 1. Insertar order_item
        const { data: insertedItem, error: itemErr } = await supabase.from('order_items').insert({
            order_id: orderId,
            product_id: productId,
            quantity: 1,
            unit_price: p.sale_price || p.base_price,
            subtotal: p.sale_price || p.base_price,
            selected_color: null,
            selected_size: 'ÚNICA',
            predicted_price: p.base_price || 0,
            predicted_profit: p.profit_margin || 0,
            predicted_operational_cost: (p.specific_kwh_cost || 0) + (p.specific_wear_cost || 0) + (p.specific_labor_cost || 0)
        }).select().single();

        if (itemErr) throw itemErr;

        // 2. Traer la receta (bom) y crear quote_materials
        const { data: bom } = await supabase.from('product_bom').select('*').eq('product_id', productId).is('product_color_id', null);
        if (bom && bom.length > 0) {
            const consumption = bom.map(r => ({
                order_item_id: insertedItem.id,
                material_id: r.material_id,
                quantity: r.quantity_required
            }));
            await supabase.from('quote_materials').insert(consumption);
        }

        // 3. Descontar stock
        const { data: prodDb } = await supabase.from('products').select('stock_quantity').eq('id', productId).single();
        if (prodDb) {
            await supabase.from('products').update({
                stock_quantity: Math.max(0, prodDb.stock_quantity - 1)
            }).eq('id', productId);
        }

        Utils.notify("Producto agregado", "success");
        closeOrderEditor();
        await OrdersUI.loadHistory();
        window.openOrderEditor(orderId);

    } catch (e) {
        console.error(e);
        Utils.notify("Error agregando producto: " + e.message, "error");
    }
};