// =================================================================
// ZYLOX CUENTAS — COMPONENTS
// CuentasUI: Inventario + Dashboard + Modales
// =================================================================

const CuentasUI = {
    // --- STATE ---
    _products: [],        // Cache de productos con capacidad
    _allProducts: [],     // Sin filtrar (para búsqueda)
    _charts: {},          // Instancias de Chart.js
    _materials: null,     // Cache de materiales hoja

    // =============================================================
    // INIT
    // =============================================================
    init: async () => {
        CuentasUI._activeMonths = new Set();
        const supabase = window.supabaseClient;
        if (supabase) {
            const { data } = await supabase.from('orders').select('created_at');
            (data || []).forEach(o => {
                if (o.created_at) {
                    CuentasUI._activeMonths.add(o.created_at.substring(0, 7));
                }
            });
        }
        CuentasUI._setMonthValue(null, null);
    },

    // =============================================================
    // MONTH PICKER
    // =============================================================
    _MONTH_NAMES: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    _MONTH_FULL: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    _pickerYear: 2026,
    _pickerMonth: 0,
    _activeMonths: new Set(),

    _setMonthValue: (year, month) => {
        if (year === null) {
            // "Todo" mode
            document.getElementById('dashboard-month').value = '';
            document.getElementById('month-picker-label').textContent = '📊 Todo el Historial';
            CuentasUI._pickerYear = new Date().getFullYear();
            CuentasUI._pickerMonth = -1;
            return;
        }
        const mStr = String(month + 1).padStart(2, '0');
        document.getElementById('dashboard-month').value = `${year}-${mStr}`;
        document.getElementById('month-picker-label').textContent = `${CuentasUI._MONTH_FULL[month]} ${year}`;
    },

    toggleMonthPicker: () => {
        const dd = document.getElementById('month-picker-dropdown');
        const isHidden = dd.classList.contains('hidden');
        if (isHidden) {
            dd.classList.remove('hidden');
            CuentasUI._renderPickerGrid();
        } else {
            dd.classList.add('hidden');
        }
    },

    changePickerYear: (delta) => {
        CuentasUI._pickerYear += delta;
        CuentasUI._renderPickerGrid();
    },

    _renderPickerGrid: () => {
        const grid = document.getElementById('picker-months-grid');
        document.getElementById('picker-year-label').textContent = CuentasUI._pickerYear;

        const now = new Date();
        const curYear = now.getFullYear();
        const curMonth = now.getMonth();
        const selectedVal = document.getElementById('dashboard-month').value;

        // Botón "Todo"
        const isAllSelected = selectedVal === '';
        const allCls = isAllSelected
            ? 'col-span-3 py-2 text-xs font-mono uppercase tracking-wider bg-purple-600 text-white font-bold mb-1'
            : 'col-span-3 py-2 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:bg-zinc-800 hover:text-white mb-1';

        let html = `<button onclick="CuentasUI.selectAllMonths()" class="${allCls}">📊 Todo el Historial</button>`;

        html += CuentasUI._MONTH_NAMES.map((name, idx) => {
            const monthKey = `${CuentasUI._pickerYear}-${String(idx + 1).padStart(2, '0')}`;
            const isSelected = selectedVal === monthKey;
            const isFuture = CuentasUI._pickerYear > curYear || (CuentasUI._pickerYear === curYear && idx > curMonth);
            const isCurrent = CuentasUI._pickerYear === curYear && idx === curMonth;
            const hasSales = CuentasUI._activeMonths.has(monthKey);

            let cls = 'py-2 text-xs font-mono uppercase tracking-wider transition-all ';
            if (isSelected) {
                cls += 'bg-purple-600 text-white font-bold';
            } else if (isCurrent) {
                cls += 'bg-zinc-800 text-purple-400 font-bold hover:bg-purple-600/30';
            } else if (isFuture) {
                cls += 'text-zinc-800 cursor-not-allowed opacity-20';
            } else if (!hasSales) {
                cls += 'text-zinc-600 opacity-30 hover:bg-zinc-900 hover:opacity-100';
            } else {
                cls += 'text-zinc-300 font-bold hover:bg-zinc-800 hover:text-white';
            }

            return `<button ${isFuture ? 'disabled' : ''} onclick="CuentasUI.selectMonth(${idx})" class="${cls}">${name}</button>`;
        }).join('');

        grid.innerHTML = html;
    },

    selectMonth: (monthIdx) => {
        CuentasUI._pickerMonth = monthIdx;
        CuentasUI._setMonthValue(CuentasUI._pickerYear, monthIdx);
        document.getElementById('month-picker-dropdown').classList.add('hidden');
        CuentasUI.loadDashboard();
    },

    selectAllMonths: () => {
        CuentasUI._pickerMonth = -1;
        CuentasUI._setMonthValue(null, null);
        document.getElementById('month-picker-dropdown').classList.add('hidden');
        CuentasUI.loadDashboard();
    },

    // =============================================================
    // VIEW SWITCHING
    // =============================================================
    switchView: (viewName) => {
        document.getElementById('view-home').classList.add('hidden');
        document.getElementById('view-inventory').classList.add('hidden');
        document.getElementById('view-inventory').classList.remove('flex');
        document.getElementById('view-dashboard').classList.add('hidden');
        document.getElementById('view-dashboard').classList.remove('flex');

        if (viewName === 'home') {
            document.getElementById('view-home').classList.remove('hidden');
            CuentasUI._syncParentHeader('home');
        } else if (viewName === 'inventory') {
            document.getElementById('view-inventory').classList.remove('hidden');
            document.getElementById('view-inventory').classList.add('flex');
            CuentasUI.loadInventory();
            CuentasUI._syncParentHeader('inventory');
        } else if (viewName === 'dashboard') {
            document.getElementById('view-dashboard').classList.remove('hidden');
            document.getElementById('view-dashboard').classList.add('flex');
            CuentasUI.loadDashboard();
            CuentasUI._syncParentHeader('dashboard');
        }
    },

    _syncParentHeader: (context) => {
        if (!window.parent) return;
        try {
            if (context === 'home') {
                window.parent.stageBack = null;
                window.parent.stageModuleHome = null;
            } else {
                window.parent.stageBack = () => CuentasUI.switchView('home');
                window.parent.stageModuleHome = () => CuentasUI.switchView('home');
            }
        } catch (e) { /* cross-origin */ }
    },

    // =============================================================
    // INVENTARIO — CARGA
    // =============================================================
    loadInventory: async () => {
        const container = document.getElementById('inventory-container');
        container.innerHTML = '<div class="flex items-center justify-center h-32"><i class="ph ph-circle-notch ph-spin text-3xl text-cyan-500"></i></div>';

        const supabase = window.supabaseClient;
        if (!supabase) return;

        try {
            // 1. Productos publicados
            const { data: products, error: pErr } = await supabase
                .from('products')
                .select('id, name, sku, is_stock_item, card_middle_url, sale_price, stock_quantity, is_published, is_free_shipping')
                .eq('is_published', true);

            if (pErr) throw pErr;

            // 2. Base recipes from sicma_quotes
            const { data: quotes, error: qErr } = await supabase
                .from('sicma_quotes')
                .select('product_id, print_data')
                .not('product_id', 'is', null);

            if (qErr) throw qErr;

            // 3. All BOMs (incluyendo variantes de color y legacy base)
            const { data: boms, error: bErr } = await supabase
                .from('product_bom')
                .select('product_id, material_id, quantity_required, product_color_id');

            if (bErr) throw bErr;

            // 4. Stock de materiales
            const { data: mats, error: mErr } = await supabase
                .from('materials')
                .select('id, current_quantity');

            if (mErr) throw mErr;

            const matStock = {};
            (mats || []).forEach(m => { matStock[m.id] = m.current_quantity || 0; });

            // Construir recetas base (desde cotizaciones)
            const baseRecipes = {};
            (quotes || []).forEach(q => {
                const slots = q.print_data?.colorSlots || [];
                const validSlots = slots.filter(s => s.materialId && s.grams > 0);
                if (validSlots.length > 0) {
                    baseRecipes[q.product_id] = validSlots.map(s => ({
                        material_id: Number(s.materialId),
                        quantity_required: Number(s.grams)
                    }));
                }
            });

            const extraRecipes = {};
            (boms || []).forEach(b => {
                if (!b.product_color_id) {
                    // Legacy base recipe (si no hay quote o es un producto viejo)
                    if (!baseRecipes[b.product_id]) baseRecipes[b.product_id] = [];
                    baseRecipes[b.product_id].push({ material_id: b.material_id, quantity_required: b.quantity_required });
                } else {
                    // Extra materials por variante de color
                    if (!extraRecipes[b.product_id]) extraRecipes[b.product_id] = {};
                    if (!extraRecipes[b.product_id][b.product_color_id]) extraRecipes[b.product_id][b.product_color_id] = [];
                    extraRecipes[b.product_id][b.product_color_id].push({ material_id: b.material_id, quantity_required: b.quantity_required });
                }
            });

            // Calcular capacidad por producto
            const enriched = (products || []).map(p => {
                let maxCapacity = null;
                const bRecipe = baseRecipes[p.id];
                const variants = extraRecipes[p.id] || {};

                const allVariantKeys = Object.keys(variants);
                const colorVariations = [];
                
                if (bRecipe && bRecipe.length > 0) {
                    colorVariations.push(bRecipe); // Solo la base
                    for (const vKey of allVariantKeys) {
                        colorVariations.push([...bRecipe, ...variants[vKey]]); // Base + Variante
                    }
                } else if (allVariantKeys.length > 0) {
                    // Producto sin base, pero con variantes
                    for (const vKey of allVariantKeys) {
                        colorVariations.push(variants[vKey]);
                    }
                }

                if (colorVariations.length > 0) {
                    maxCapacity = 0;
                    for (const recipe of colorVariations) {
                        const reqsByMat = {};
                        for (const r of recipe) {
                            reqsByMat[r.material_id] = (reqsByMat[r.material_id] || 0) + r.quantity_required;
                        }

                        let colorCapacity = Infinity;
                        for (const matId in reqsByMat) {
                            const needed = reqsByMat[matId];
                            const available = matStock[matId] || 0;
                            if (needed > 0) {
                                const possible = Math.floor(available / needed);
                                if (possible < colorCapacity) colorCapacity = possible;
                            }
                        }
                        if (colorCapacity > maxCapacity && colorCapacity !== Infinity) {
                            maxCapacity = colorCapacity;
                        }
                    }
                }

                return {
                    ...p,
                    hasRecipe: colorVariations.length > 0,
                    capacity: maxCapacity,
                    baseRecipe: bRecipe || [],
                    extraRecipes: variants
                };
            });

            // Ordenar: de mayor capacidad a menor, luego por nombre
            enriched.sort((a, b) => {
                const capA = a.capacity || 0;
                const capB = b.capacity || 0;
                if (capA !== capB) return capB - capA;
                return a.name.localeCompare(b.name);
            });

            CuentasUI._products = enriched;
            CuentasUI._allProducts = enriched;
            if (!CuentasUI._selectedProductIds) CuentasUI._selectedProductIds = new Set();
            
            CuentasUI.renderInventoryList(enriched);
            CuentasUI.ensureFabExists();

        } catch (e) {
            console.error('Error cargando inventario:', e);
            container.innerHTML = '<div class="text-center text-red-400 text-xs mt-8">Error al cargar inventario</div>';
        }
    },

    ensureFabExists: () => {
        let fab = document.getElementById('validator-fab');
        if (!fab) {
            fab = document.createElement('div');
            fab.id = 'validator-fab';
            fab.className = 'fixed bottom-6 right-6 hidden z-50';
            fab.innerHTML = `
                <button onclick="CuentasUI.openValidatorFromFab()" class="bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/50 rounded-full h-14 px-6 flex items-center gap-2 font-bold uppercase tracking-widest text-xs transition-all transform hover:scale-105 border border-purple-400">
                    <i class="ph ph-check-square text-xl"></i>
                    Validar (<span id="validator-fab-count">0</span>)
                </button>
            `;
            document.body.appendChild(fab);
        }
        CuentasUI.updateFab();
    },

    updateFab: () => {
        const fab = document.getElementById('validator-fab');
        if (!fab) return;
        const count = CuentasUI._selectedProductIds.size;
        const isInventoryView = !document.getElementById('view-inventory').classList.contains('hidden');
        
        if (count > 0 && isInventoryView) {
            fab.classList.remove('hidden');
            document.getElementById('validator-fab-count').innerText = count;
        } else {
            fab.classList.add('hidden');
        }
    },

    toggleProductSelection: (id, element) => {
        if (CuentasUI._selectedProductIds.has(id)) {
            CuentasUI._selectedProductIds.delete(id);
            element.classList.remove('border-purple-500', 'border-2');
            element.classList.add('border-zinc-800', 'border');
        } else {
            CuentasUI._selectedProductIds.add(id);
            element.classList.remove('border-zinc-800', 'border');
            element.classList.add('border-purple-500', 'border-2');
        }
        CuentasUI.updateFab();
    },

    openValidatorFromFab: () => {
        CuentasUI._validatorItems = [];
        for (const id of CuentasUI._selectedProductIds) {
            const p = CuentasUI._allProducts.find(x => x.id === id);
            if (p) CuentasUI._validatorItems.push({ id: p.id, name: p.name, qty: 1 });
        }

        let modal = document.getElementById('modal-validator');
        if (modal) modal.remove();

        modal = document.createElement('div');
        modal.id = 'modal-validator';
        modal.className = 'modal-overlay centered';
        modal.innerHTML = `
        <div class="modal-centered no-scrollbar">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold text-cyan-400 uppercase tracking-wider">Validar Pedido</h3>
                <button onclick="document.getElementById('modal-validator').remove()" class="text-zinc-500 hover:text-white text-xl">✕</button>
            </div>
            <div id="validator-selection" class="space-y-1 mb-4 max-h-40 overflow-y-auto no-scrollbar"></div>
            <div id="validator-results" class="mb-4"></div>
            <button onclick="CuentasUI.runValidation()"
                class="w-full py-3 bg-cyan-500 text-black font-bold uppercase text-xs tracking-widest hover:bg-cyan-400 transition-colors">
                <i class="ph ph-check-circle mr-1"></i> Calcular Materiales
            </button>
        </div>`;
        document.body.appendChild(modal);

        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

        CuentasUI._renderValidatorSelection();
    },

    // =============================================================
    // INVENTARIO — RENDERIZADO
    // =============================================================
    renderInventoryList: (items) => {
        const container = document.getElementById('inventory-container');

        if (!items || items.length === 0) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center h-32 text-zinc-600">
                    <i class="ph ph-package text-4xl mb-2"></i>
                    <p class="text-xs font-mono">No se encontraron productos</p>
                </div>`;
            return;
        }

        const extractId = window.parent?.extractDriveId || (url => {
            if (!url) return null;
            const match = url.match(/(?:id=|\/d\/)([a-zA-Z0-9_-]+)/);
            return match ? match[1] : null;
        });
        const getUrl = window.parent?.getDriveImageUrl || (id => id ? `/api/drive-proxy?id=${id}` : '');

        container.innerHTML = items.map(p => {
            const driveId = extractId(p.card_middle_url);
            const url = getUrl(driveId);
            
            const stockQty = p.stock_quantity || 0;
            const stockColor = stockQty > 20 ? 'text-[#39FF14]' : (stockQty > 5 ? 'text-yellow-400' : 'text-red-500');
            const pubStatus = !p.is_published ? '<span class="text-red-500 text-[8px] border border-red-500 px-1 ml-1">OCULTO</span>' : '';
            const freeShipBadge = p.is_free_shipping ? '<span class="text-green-400 text-[8px] border border-green-500/50 bg-green-500/10 px-1 ml-1">🚚 FREE</span>' : '';

            let capHtml;
            if (p.capacity === null) {
                capHtml = '<span class="text-zinc-600 font-mono text-[9px] uppercase tracking-widest block text-right mt-1">Sin receta</span>';
            } else if (p.capacity <= 0) {
                capHtml = `<span class="text-red-500 font-mono text-[10px] uppercase font-bold block text-right mt-1 tracking-wider">Fabricables: 0</span>`;
            } else {
                capHtml = `<span class="text-cyan-400 font-mono text-[10px] uppercase font-bold block text-right mt-1 tracking-wider">Fabricables: ${p.capacity}</span>`;
            }

            const isSelected = CuentasUI._selectedProductIds.has(p.id);
            const borderClass = isSelected ? 'border-purple-500 border-2' : 'border-zinc-800 border';

            return `
            <div onclick="CuentasUI.toggleProductSelection(${p.id}, this)" class="bg-zinc-900 ${borderClass} min-h-[7rem] flex transition-all cursor-pointer group overflow-hidden relative mb-2" style="clip-path: polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%);">
                <div class="w-24 min-h-[7rem] bg-zinc-950 flex-shrink-0 relative border-r border-zinc-800">
                    ${url
                    ? `<img src="${url}" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />`
                    : `<div class="w-full h-full flex items-center justify-center text-zinc-700"><i class="ph ph-image-square text-2xl"></i></div>`
                    }
                    <div class="absolute top-0 left-0 bg-black/80 px-1.5 py-0.5 text-[8px] font-mono text-zinc-400 border-b border-r border-zinc-800">
                        ${p.is_stock_item ? '📦 STOCK' : '🎨 CUSTOM'}
                    </div>
                </div>

                <div class="flex-1 p-3 flex flex-col justify-between">
                    <div>
                        <h3 class="text-sm font-bold text-white uppercase leading-tight line-clamp-2">${p.name} ${pubStatus}${freeShipBadge}</h3>
                        <span class="text-[10px] font-mono text-zinc-500 mt-0.5 block tracking-widest">${p.sku || '—'}</span>
                    </div>

                    <div class="flex items-end justify-between border-t border-white/5 pt-2">
                        <div class="flex flex-col">
                            <span class="text-[9px] text-zinc-600 uppercase">Venta</span>
                            <span class="text-sm font-mono font-bold text-[#39FF14]">${Utils.formatCurrency(p.sale_price)}</span>
                        </div>
                        <div class="flex flex-col items-end">
                            <span class="text-[9px] text-zinc-600 uppercase">Stock Actual</span>
                            <span class="text-xs font-mono ${stockColor}">${stockQty} un.</span>
                            ${capHtml}
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('');
    },

    // =============================================================
    // INVENTARIO — FILTRO
    // =============================================================
    filterInventory: (query) => {
        const q = (query || '').toLowerCase().trim();
        if (!q) {
            CuentasUI.renderInventoryList(CuentasUI._allProducts);
            return;
        }
        const filtered = CuentasUI._allProducts.filter(p =>
            (p.name && p.name.toLowerCase().includes(q)) ||
            (p.sku && p.sku.toLowerCase().includes(q))
        );
        CuentasUI.renderInventoryList(filtered);
    },

    // =============================================================
    // VALIDAR PEDIDO — MODAL & SELECCIÓN
    // =============================================================
    _validatorItems: [],

    _renderValidatorSelection: () => {
        const container = document.getElementById('validator-selection');
        container.innerHTML = CuentasUI._validatorItems.map((item, idx) => `
            <div class="validator-product-row flex items-center justify-between bg-zinc-900 border border-zinc-800 p-2 mb-2 rounded">
                <span class="flex-1 text-xs text-white truncate pr-2">${item.name}</span>
                <div class="flex items-center gap-2">
                    <button onclick="CuentasUI._adjustValidatorQty(${idx}, -1)" class="w-6 h-6 bg-zinc-800 text-white text-xs flex items-center justify-center hover:bg-zinc-700 rounded">-</button>
                    <span class="text-sm font-mono text-cyan-400 w-6 text-center">${item.qty}</span>
                    <button onclick="CuentasUI._adjustValidatorQty(${idx}, 1)" class="w-6 h-6 bg-zinc-800 text-white text-xs flex items-center justify-center hover:bg-zinc-700 rounded">+</button>
                    <button onclick="CuentasUI._removeValidatorItem(${idx}, ${item.id})" class="text-red-500 hover:text-red-400 text-xs ml-2">✕</button>
                </div>
            </div>
        `).join('');
    },

    _adjustValidatorQty: (index, delta) => {
        const item = CuentasUI._validatorItems[index];
        if (!item) return;
        item.qty = Math.max(1, item.qty + delta);
        CuentasUI._renderValidatorSelection();
    },

    _removeValidatorItem: (index, productId) => {
        CuentasUI._validatorItems.splice(index, 1);
        CuentasUI._selectedProductIds.delete(productId);
        
        // Refresh cards border in background
        CuentasUI.renderInventoryList(CuentasUI._allProducts);
        CuentasUI.updateFab();
        
        CuentasUI._renderValidatorSelection();
        if (CuentasUI._validatorItems.length === 0) {
            document.getElementById('modal-validator').classList.add('hidden');
        }
    },

    // =============================================================
    // VALIDAR PEDIDO — EJECUCIÓN
    // =============================================================
    runValidation: async () => {
        const results = document.getElementById('validator-results');
        const items = CuentasUI._validatorItems;

        if (items.length === 0) {
            Utils.notify('Agrega al menos un producto', 'warning');
            return;
        }

        results.innerHTML = '<div class="text-center text-zinc-500 text-xs py-2"><i class="ph ph-circle-notch ph-spin mr-1"></i>Calculando...</div>';

        const supabase = window.supabaseClient;
        if (!supabase) return;

        try {
            // Calcular requerimiento total usando los datos que ya cargó loadInventory
            const requirements = {}; // { material_id: totalNeeded }
            
            for (const item of items) {
                const prod = CuentasUI._allProducts.find(p => p.id === item.id);
                if (prod && prod.hasRecipe) {
                    const reqsByMat = {};
                    
                    // Sumamos la receta base primero
                    if (prod.baseRecipe) {
                        for (const r of prod.baseRecipe) {
                            reqsByMat[r.material_id] = (reqsByMat[r.material_id] || 0) + r.quantity_required;
                        }
                    }
                    
                    // Para ser conservadores (worst-case), buscamos la variante que más material extra consuma
                    let maxExtraReqs = {};
                    let maxExtraTotal = 0;
                    
                    for (const vKey in prod.extraRecipes) {
                        const vReqs = {};
                        let vTotal = 0;
                        for (const r of prod.extraRecipes[vKey]) {
                            vReqs[r.material_id] = (vReqs[r.material_id] || 0) + r.quantity_required;
                            vTotal += r.quantity_required;
                        }
                        if (vTotal > maxExtraTotal) {
                            maxExtraTotal = vTotal;
                            maxExtraReqs = vReqs;
                        }
                    }

                    // Agregamos la peor variante a la base
                    for (const matId in maxExtraReqs) {
                        reqsByMat[matId] = (reqsByMat[matId] || 0) + maxExtraReqs[matId];
                    }

                    // Multiplicamos por la cantidad y agregamos a totales
                    for (const matId in reqsByMat) {
                        if (!requirements[matId]) requirements[matId] = 0;
                        requirements[matId] += reqsByMat[matId] * item.qty;
                    }
                }
            }

            const materialIds = Object.keys(requirements).map(Number);
            if (materialIds.length === 0) {
                results.innerHTML = '<div class="text-center text-zinc-500 text-xs py-2">Los productos seleccionados no tienen receta.</div>';
                return;
            }

            // 3. Obtener stock actual de esos materiales directo de Supabase para tener el dato más fresco
            const { data: mats, error: mErr } = await supabase
                .from('materials')
                .select('id, name, current_quantity, unit_measure')
                .in('id', materialIds);

            if (mErr) throw mErr;

            const matMap = {};
            (mats || []).forEach(m => { matMap[m.id] = m; });

            // 4. Comparar
            let allOk = true;
            const lines = [];

            for (const [matId, needed] of Object.entries(requirements)) {
                const mat = matMap[Number(matId)];
                if (!mat) {
                    lines.push({ name: `Material #${matId}`, needed, available: 0, unit: '?', ok: false });
                    allOk = false;
                    continue;
                }
                const available = mat.current_quantity || 0;
                const ok = available >= needed;
                if (!ok) allOk = false;
                lines.push({
                    name: mat.name,
                    needed: Math.round(needed * 100) / 100,
                    available: Math.round(available * 100) / 100,
                    unit: mat.unit_measure || '',
                    ok
                });
            }

            // 5. Renderizar resultado
            if (allOk) {
                results.innerHTML = `
                    <div class="bg-green-900/20 border border-green-800 p-3 text-center">
                        <span class="validator-result-ok text-sm">✅ ¡Alcanza para todo el pedido!</span>
                    </div>`;
            } else {
                const failLines = lines.filter(l => !l.ok);
                results.innerHTML = `
                    <div class="bg-red-900/20 border border-red-800 p-3">
                        <div class="validator-result-fail text-xs mb-2">❌ Faltan materiales:</div>
                        ${failLines.map(l => `
                            <div class="flex justify-between text-[10px] py-1 border-b border-zinc-800/50">
                                <span class="text-zinc-300">${l.name}</span>
                                <span class="text-red-400 font-mono">Necesita ${l.needed}${l.unit} — Hay ${l.available}${l.unit} (faltan ${Math.round((l.needed - l.available) * 100) / 100})</span>
                            </div>
                        `).join('')}
                    </div>`;
            }

        } catch (e) {
            console.error('Error validando pedido:', e);
            results.innerHTML = '<div class="text-center text-red-400 text-xs py-2">Error al validar</div>';
        }
    },

    // =============================================================
    // DASHBOARD — CARGA PRINCIPAL
    // =============================================================
    loadDashboard: async () => {
        const container = document.getElementById('dashboard-container');
        container.innerHTML = '<div class="flex items-center justify-center h-32"><i class="ph ph-circle-notch ph-spin text-3xl text-purple-500"></i></div>';

        try {
            // Cargar tarjetas (históricas, sin filtro de mes) y gráficas (con filtro) en paralelo
            const monthVal = document.getElementById('dashboard-month').value;
            const [cardsHtml, chartsHtml, movementsHtml] = await Promise.all([
                CuentasUI._buildCards(monthVal),
                CuentasUI._buildCharts(monthVal),
                CuentasUI._buildMovements()
            ]);

            container.innerHTML = cardsHtml + chartsHtml + movementsHtml;

            // Inicializar gráficas después de insertar el HTML
            CuentasUI._initCharts(monthVal);

        } catch (e) {
            console.error('Error cargando dashboard:', e);
            container.innerHTML = '<div class="text-center text-red-400 text-xs mt-8">Error al cargar dashboard</div>';
        }
    },

    // =============================================================
    // DASHBOARD — TARJETAS (saldo disponible histórico)
    // =============================================================
    _buildCards: async (monthVal) => {
        const supabase = window.supabaseClient;
        if (!supabase) return '';

        let orderIds = null;
        let startDate = null;
        let endDate = null;

        if (monthVal) {
            const [year, month] = monthVal.split('-').map(Number);
            startDate = new Date(year, month - 1, 1).toISOString();
            endDate = new Date(year, month, 1).toISOString();

            const { data: orders } = await supabase
                .from('orders')
                .select('id')
                .gte('created_at', startDate)
                .lt('created_at', endDate);
            orderIds = (orders || []).map(o => o.id);
        }

        // 1. Order Items
        let oiRows = [];
        if (monthVal) {
            if (orderIds && orderIds.length > 0) {
                const { data } = await supabase
                    .from('order_items')
                    .select('predicted_profit, predicted_operational_cost, unit_price, quantity, predicted_price, ganancia_real')
                    .in('order_id', orderIds);
                oiRows = data || [];
            }
        } else {
            const { data } = await supabase
                .from('order_items')
                .select('predicted_profit, predicted_operational_cost, unit_price, quantity, predicted_price, ganancia_real');
            oiRows = data || [];
        }

        let sumProfit = 0, sumGananciaReal = 0, sumOpCost = 0;
        for (const row of oiRows) {
            const profit = parseFloat(row.predicted_profit) || 0;
            const opCost = parseFloat(row.predicted_operational_cost) || 0;
            const qty = parseFloat(row.quantity) || 1;

            sumProfit += profit * qty;
            sumOpCost += opCost * qty;

            if (row.ganancia_real !== undefined && row.ganancia_real !== null) {
                sumGananciaReal += parseFloat(row.ganancia_real) * qty;
            } else {
                const unitPrice = parseFloat(row.unit_price) || 0;
                const predPrice = parseFloat(row.predicted_price) || 0;
                sumGananciaReal += (profit + (unitPrice - predPrice)) * qty;
            }
        }

        // 2. Financial Movements
        let fmQuery = supabase.from('financial_movements').select('bucket, amount');
        if (monthVal) {
            fmQuery = fmQuery.gte('created_at', startDate).lt('created_at', endDate);
        }
        const { data: fmRows } = await fmQuery;

        let fmGanancia = 0, fmOpCost = 0;
        if (fmRows) {
            for (const row of fmRows) {
                const amt = parseFloat(row.amount) || 0;
                if (row.bucket === 'ganancia') fmGanancia += amt;
                else if (row.bucket === 'costo_operativo') fmOpCost += amt;
            }
        }

        // 3. Totales
        const saldoGanancia = sumProfit + fmGanancia;
        const saldoGananciaReal = sumGananciaReal + fmGanancia;
        const saldoOpCost = sumOpCost + fmOpCost;

        const labelSuffix = monthVal ? 'del Mes' : 'Disponible';

        console.log('[Cuentas] Cards:', { sumProfit, sumGananciaReal, sumOpCost, fmGanancia, fmOpCost, saldoGanancia, saldoGananciaReal, saldoOpCost });

        return `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="dash-card" style="--card-accent: #39FF14;">
                <div class="card-value text-[#39FF14]">${Utils.formatCurrency(saldoGanancia)}</div>
                <div class="card-label">Ganancia ${labelSuffix}</div>
            </div>
            <div class="dash-card" style="--card-accent: #00F5FF;">
                <div class="card-value text-cyan-400">${Utils.formatCurrency(saldoGananciaReal)}</div>
                <div class="card-label">Ganancia Real ${labelSuffix}</div>
            </div>
            <div class="dash-card" style="--card-accent: #FF6B00;">
                <div class="card-value text-orange-400">${Utils.formatCurrency(saldoOpCost)}</div>
                <div class="card-label">Costo Operativo ${labelSuffix}</div>
            </div>
        </div>`;
    },

    // =============================================================
    // DASHBOARD — GRÁFICAS (filtradas por mes)
    // =============================================================
    _buildCharts: async (monthVal) => {
        // Placeholder con canvas — se llenan después con _initCharts
        return `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="chart-box">
                <div class="chart-title">Productos Más Vendidos</div>
                <canvas id="chart-top-products"></canvas>
            </div>
            <div class="chart-box">
                <div class="chart-title">Stock vs Custom</div>
                <canvas id="chart-stock-custom"></canvas>
            </div>
        </div>`;
    },

    _initCharts: async (monthVal) => {
        const supabase = window.supabaseClient;
        if (!supabase) return;

        // Destruir gráficas anteriores
        if (CuentasUI._charts.topProducts) CuentasUI._charts.topProducts.destroy();
        if (CuentasUI._charts.stockCustom) CuentasUI._charts.stockCustom.destroy();

        try {
            let orderIds;

            if (monthVal) {
                // Filtrar por mes
                const [year, month] = monthVal.split('-').map(Number);
                const startDate = new Date(year, month - 1, 1).toISOString();
                const endDate = new Date(year, month, 1).toISOString();

                const { data: orders, error: ordErr } = await supabase
                    .from('orders')
                    .select('id')
                    .gte('created_at', startDate)
                    .lt('created_at', endDate);

                if (ordErr) throw ordErr;
                orderIds = (orders || []).map(o => o.id);
            } else {
                // Todo el historial
                const { data: orders, error: ordErr } = await supabase
                    .from('orders')
                    .select('id');

                if (ordErr) throw ordErr;
                orderIds = (orders || []).map(o => o.id);
            }

            let items = [];
            if (orderIds.length > 0) {
                const { data: oi, error: oiErr } = await supabase
                    .from('order_items')
                    .select('quantity, product_id, products(name, is_stock_item)')
                    .in('order_id', orderIds);

                if (oiErr) throw oiErr;
                items = oi || [];
            }

            // --- Top Productos ---
            const prodCounts = {};
            let stockQty = 0, customQty = 0;

            for (const item of items) {
                const qty = item.quantity || 1;
                const pName = item.products?.name || 'Desconocido';
                const isStock = item.products?.is_stock_item;

                prodCounts[pName] = (prodCounts[pName] || 0) + qty;
                if (isStock) stockQty += qty;
                else customQty += qty;
            }

            const sorted = Object.entries(prodCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

            const topCtx = document.getElementById('chart-top-products');
            if (topCtx) {
                CuentasUI._charts.topProducts = new Chart(topCtx, {
                    type: 'bar',
                    data: {
                        labels: sorted.map(s => s[0]),
                        datasets: [{
                            data: sorted.map(s => s[1]),
                            backgroundColor: 'rgba(57, 255, 20, 0.6)',
                            borderColor: '#39FF14',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                        plugins: { legend: { display: false } },
                        scales: {
                            x: {
                                ticks: { color: '#71717a', font: { size: 10 } },
                                grid: { color: 'rgba(255,255,255,0.04)' }
                            },
                            y: {
                                ticks: { color: '#a1a1aa', font: { size: 10 } },
                                grid: { display: false }
                            }
                        }
                    }
                });
            }

            // --- Stock vs Custom donut ---
            const scCtx = document.getElementById('chart-stock-custom');
            if (scCtx) {
                CuentasUI._charts.stockCustom = new Chart(scCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Stock', 'Custom'],
                        datasets: [{
                            data: [stockQty, customQty],
                            backgroundColor: ['rgba(0, 245, 255, 0.7)', 'rgba(176, 38, 255, 0.7)'],
                            borderColor: ['#00F5FF', '#B026FF'],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: { color: '#a1a1aa', font: { size: 10 }, padding: 12 }
                            }
                        }
                    }
                });
            }

        } catch (e) {
            console.error('Error cargando gráficas:', e);
        }
    },

    // =============================================================
    // DASHBOARD — MOVIMIENTOS RECIENTES
    // =============================================================
    _buildMovements: async () => {
        const supabase = window.supabaseClient;
        if (!supabase) return '';

        // Financial movements
        const { data: fm } = await supabase
            .from('financial_movements')
            .select('id, bucket, amount, note, created_at')
            .order('created_at', { ascending: false })
            .limit(10);

        // Material movements
        const { data: mm } = await supabase
            .from('material_movements')
            .select('id, material_id, quantity, reason, note, created_at, materials(name)')
            .order('created_at', { ascending: false })
            .limit(10);

        // Merge & sort
        const all = [];
        (fm || []).forEach(r => all.push({ type: 'money', ...r }));
        (mm || []).forEach(r => all.push({ type: 'material', ...r }));
        all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const recent = all.slice(0, 15);

        if (recent.length === 0) {
            return `
            <div class="mt-2">
                <div class="chart-title">Movimientos Recientes</div>
                <div class="text-center text-zinc-600 text-xs py-4 font-mono">Sin movimientos registrados</div>
            </div>`;
        }

        const reasonLabels = {
            uso_personal: 'Uso Personal',
            stock_marketing: 'Stock / Marketing',
            reposicion: 'Reposición',
            ajuste_conteo: 'Ajuste de Conteo'
        };

        const rows = recent.map(m => {
            if (m.type === 'money') {
                const icon = m.bucket === 'ganancia'
                    ? '<i class="ph ph-coins text-green-400"></i>'
                    : '<i class="ph ph-gear text-orange-400"></i>';
                const bucketLabel = m.bucket === 'ganancia' ? 'Ganancia' : 'Costo Op.';
                return `
                <div class="movement-item money">
                    <div class="shrink-0">${icon}</div>
                    <div class="flex-1 min-w-0">
                        <div class="text-xs text-white font-bold">${bucketLabel}</div>
                        <div class="text-[10px] text-zinc-500 truncate">${m.note || '—'}</div>
                    </div>
                    <div class="text-right shrink-0">
                        <div class="text-sm font-mono text-red-400">${Utils.formatCurrency(m.amount)}</div>
                        <div class="text-[9px] text-zinc-600">${Utils.formatDate(m.created_at)}</div>
                    </div>
                </div>`;
            } else {
                const matName = m.materials?.name || `Material #${m.material_id}`;
                const qtyColor = m.quantity > 0 ? 'text-green-400' : 'text-red-400';
                const qtyPrefix = m.quantity > 0 ? '+' : '';
                return `
                <div class="movement-item material">
                    <div class="shrink-0"><i class="ph ph-flask text-cyan-400"></i></div>
                    <div class="flex-1 min-w-0">
                        <div class="text-xs text-white font-bold truncate">${matName}</div>
                        <div class="text-[10px] text-zinc-500 truncate">${reasonLabels[m.reason] || m.reason}${m.note ? ' — ' + m.note : ''}</div>
                    </div>
                    <div class="text-right shrink-0">
                        <div class="text-sm font-mono ${qtyColor}">${qtyPrefix}${m.quantity}</div>
                        <div class="text-[9px] text-zinc-600">${Utils.formatDate(m.created_at)}</div>
                    </div>
                </div>`;
            }
        }).join('');

        return `
        <div class="mt-2">
            <div class="chart-title">Movimientos Recientes</div>
            <div class="space-y-1">${rows}</div>
        </div>`;
    },

    // =============================================================
    // REGISTRAR MOVIMIENTO — MODAL
    // =============================================================
    openMovementForm: () => {
        const existing = document.getElementById('movement-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'movement-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
        <div class="modal-sheet no-scrollbar">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold text-purple-400 uppercase tracking-wider">Registrar Movimiento</h3>
                <button onclick="document.getElementById('movement-modal').remove()" class="text-zinc-500 hover:text-white text-xl">✕</button>
            </div>

            <div class="tab-bar">
                <button class="tab-btn active" onclick="CuentasUI._switchMovementTab('dinero', this)">
                    <i class="ph ph-money mr-1"></i> Dinero
                </button>
                <button class="tab-btn" onclick="CuentasUI._switchMovementTab('material', this)">
                    <i class="ph ph-flask mr-1"></i> Material
                </button>
            </div>

            <div id="tab-dinero">
                <div class="mb-4">
                    <label class="text-[10px] text-zinc-400 uppercase tracking-wider mb-1 block font-bold">Bolsillo</label>
                    <select id="mv-bucket" class="w-full px-3 py-2 text-sm" onchange="CuentasUI._onBucketChange()">
                        <option value="ganancia">Ganancia</option>
                        <option value="costo_operativo">Costo Operativo</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label class="text-[10px] text-zinc-400 uppercase tracking-wider mb-1 block font-bold">Monto a Retirar</label>
                    <input type="number" id="mv-amount" placeholder="0" min="0" step="100"
                        class="w-full px-3 py-2 text-sm font-mono">
                    <p class="text-[9px] text-zinc-600 mt-1">Se guarda como valor negativo (retiro)</p>
                </div>
                <div class="mb-4">
                    <label class="text-[10px] text-zinc-400 uppercase tracking-wider mb-1 block font-bold">Nota <span id="note-required" class="text-zinc-600">(opcional)</span></label>
                    <textarea id="mv-note" rows="2" placeholder="Descripción del retiro..."
                        class="w-full px-3 py-2 text-sm resize-none"></textarea>
                </div>
                <button onclick="CuentasUI._submitMoneyMovement()"
                    class="w-full py-3 bg-purple-500 text-black font-bold uppercase text-xs tracking-widest hover:bg-purple-400 transition-colors">
                    Registrar Retiro
                </button>
            </div>

            <div id="tab-material" class="hidden">
                <div class="mb-4">
                    <label class="text-[10px] text-zinc-400 uppercase tracking-wider mb-1 block font-bold">Ubicación / Material</label>
                    <div id="mv-mat-hierarchy" class="space-y-2">
                        <!-- Cascading selects will go here -->
                        <div class="text-xs text-zinc-500 py-1"><i class="ph ph-circle-notch ph-spin"></i> Cargando...</div>
                    </div>
                    <div id="mv-mat-selected" class="mt-3 p-2 bg-zinc-900 border border-zinc-800 rounded hidden"></div>
                </div>
                <div class="mb-4">
                    <label class="text-[10px] text-zinc-400 uppercase tracking-wider mb-1 block font-bold">Cantidad</label>
                    <input type="number" id="mv-mat-qty" placeholder="0" step="any"
                        class="w-full px-3 py-2 text-sm font-mono">
                    <p class="text-[9px] text-zinc-600 mt-1">Negativo = consumo, Positivo = reposición</p>
                </div>
                <div class="mb-4">
                    <label class="text-[10px] text-zinc-400 uppercase tracking-wider mb-1 block font-bold">Razón</label>
                    <select id="mv-mat-reason" class="w-full px-3 py-2 text-sm">
                        <option value="uso_personal">Uso Personal</option>
                        <option value="stock_marketing">Stock / Marketing</option>
                        <option value="reposicion">Reposición</option>
                        <option value="ajuste_conteo">Ajuste de Conteo</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label class="text-[10px] text-zinc-400 uppercase tracking-wider mb-1 block font-bold">Nota <span class="text-zinc-600">(opcional)</span></label>
                    <textarea id="mv-mat-note" rows="2" placeholder="Comentario..."
                        class="w-full px-3 py-2 text-sm resize-none"></textarea>
                </div>
                <button onclick="CuentasUI._submitMaterialMovement()"
                    class="w-full py-3 bg-cyan-500 text-black font-bold uppercase text-xs tracking-widest hover:bg-cyan-400 transition-colors">
                    Registrar Movimiento
                </button>
            </div>
        </div>`;
        document.body.appendChild(modal);

        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

        // Reset selected material
        CuentasUI._selectedMaterialId = null;
        CuentasUI._initMaterialHierarchy();
    },

    _selectedMaterialId: null,

    _switchMovementTab: (tab, btnEl) => {
        document.getElementById('tab-dinero').classList.toggle('hidden', tab !== 'dinero');
        document.getElementById('tab-material').classList.toggle('hidden', tab !== 'material');

        // Update active tab button
        const tabBar = btnEl.parentElement;
        tabBar.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btnEl.classList.add('active');
    },

    _onBucketChange: () => {
        const bucket = document.getElementById('mv-bucket').value;
        const label = document.getElementById('note-required');
        if (label) {
            label.textContent = bucket === 'costo_operativo' ? '(obligatoria)' : '(opcional)';
            label.className = bucket === 'costo_operativo' ? 'text-red-400' : 'text-zinc-600';
        }
    },

    // --- MATERIAL HIERARCHY ---
    _initMaterialHierarchy: async () => {
        const container = document.getElementById('mv-mat-hierarchy');
        if (!container) return;
        
        container.innerHTML = '<div class="text-xs text-zinc-500 py-1"><i class="ph ph-circle-notch ph-spin"></i> Cargando Docks...</div>';
        
        const supabase = window.supabaseClient;
        const { data } = await supabase.from('materials').select('id, name').is('parent_id', null).order('name');
        
        if (!data || data.length === 0) {
            container.innerHTML = '<div class="text-xs text-zinc-500">No hay ubicaciones raíz.</div>';
            return;
        }
        
        container.innerHTML = '';
        CuentasUI._renderHierarchySelect(0, data, 'NODO');
    },

    _renderHierarchySelect: (level, items, label) => {
        const container = document.getElementById('mv-mat-hierarchy');
        
        // Remove any selects that are at this level or deeper
        const existingSelects = container.querySelectorAll('.hier-select');
        existingSelects.forEach(sel => {
            if (parseInt(sel.dataset.level) >= level) sel.remove();
        });
        
        // Reset selected material when hierarchy changes above it
        CuentasUI._clearMaterial();
        
        if (!items || items.length === 0) return;
        
        const select = document.createElement('select');
        select.className = 'w-full px-3 py-2 text-sm bg-black border border-zinc-700 text-white hier-select mb-2';
        select.dataset.level = level;
        
        let placeholder = '';
        switch(level) {
            case 0: placeholder = 'Seleccionar Nodo (Dock)...'; break;
            case 1: placeholder = 'Seleccionar Sección...'; break;
            case 2: placeholder = 'Seleccionar Cuadrante...'; break;
            case 3: placeholder = 'Seleccionar Celda...'; break;
            default: placeholder = 'Seleccionar Ítem...'; break;
        }
        
        select.innerHTML = `<option value="">-- ${placeholder} --</option>` + items.map(i => {
            // Include stock info if it's a leaf item (has unit_measure)
            const stockStr = i.unit_measure ? ` (Stock: ${i.current_quantity || 0} ${i.unit_measure})` : '';
            return `<option value="${i.id}" data-name="${i.name}" data-qty="${i.current_quantity||0}" data-unit="${i.unit_measure||''}">${i.name}${stockStr}</option>`;
        }).join('');
        
        select.onchange = (e) => CuentasUI._onHierarchyChange(level, e.target);
        
        container.appendChild(select);
    },

    _onHierarchyChange: async (level, selectEl) => {
        const val = selectEl.value;
        const selectedOption = selectEl.options[selectEl.selectedIndex];
        
        // Limpiar niveles inferiores y selección actual
        const container = document.getElementById('mv-mat-hierarchy');
        container.querySelectorAll('.hier-select').forEach(sel => {
            if (parseInt(sel.dataset.level) > level) sel.remove();
        });
        CuentasUI._clearMaterial();
        
        if (!val) return;
        
        const supabase = window.supabaseClient;
        const { data } = await supabase.from('materials').select('id, name, current_quantity, unit_measure').eq('parent_id', val).order('name');
        
        if (data && data.length > 0) {
            // It has children, render next level
            CuentasUI._renderHierarchySelect(level + 1, data);
        } else {
            // It's a leaf node! Select it.
            const name = selectedOption.dataset.name;
            const qty = selectedOption.dataset.qty;
            const unit = selectedOption.dataset.unit;
            
            // Only select if it's a real item (has unit_measure, not just an empty folder)
            if (unit) {
                CuentasUI._selectMaterial(val, name, qty, unit);
            }
        }
    },

    _selectMaterial: (id, name, qty, unit) => {
        CuentasUI._selectedMaterialId = id;
        const selContainer = document.getElementById('mv-mat-selected');
        selContainer.classList.remove('hidden');
        selContainer.innerHTML = `
            <div class="flex items-center gap-2 text-xs">
                <i class="ph ph-flask text-cyan-400 text-lg"></i>
                <div class="flex-1">
                    <div class="text-white font-bold">${name}</div>
                    <div class="text-zinc-500 font-mono">Stock actual: ${qty} ${unit}</div>
                </div>
            </div>`;
    },

    _clearMaterial: () => {
        CuentasUI._selectedMaterialId = null;
        const selContainer = document.getElementById('mv-mat-selected');
        if (selContainer) {
            selContainer.classList.add('hidden');
            selContainer.innerHTML = '';
        }
    },

    // --- SUBMIT MONEY MOVEMENT ---
    _submitMoneyMovement: async () => {
        const bucket = document.getElementById('mv-bucket').value;
        const amountRaw = parseFloat(document.getElementById('mv-amount').value);
        const note = document.getElementById('mv-note').value.trim();

        if (!amountRaw || amountRaw <= 0) {
            Utils.notify('Ingresa un monto válido', 'warning');
            return;
        }
        if (bucket === 'costo_operativo' && !note) {
            Utils.notify('La nota es obligatoria para Costo Operativo', 'warning');
            return;
        }

        const supabase = window.supabaseClient;
        const amount = -Math.abs(amountRaw); // Siempre negativo

        try {
            const payload = {
                bucket,
                amount,
                note: note || null,
                created_by: window.SYSTEM_USER_ID
            };

            const { error } = await supabase
                .from('financial_movements')
                .insert(payload);

            if (error) throw error;

            Utils.notify('Retiro registrado', 'success');
            document.getElementById('movement-modal').remove();
            CuentasUI.loadDashboard();

        } catch (e) {
            console.error('Error registrando movimiento:', e);
            Utils.notify('Error: ' + e.message, 'error');
        }
    },

    // --- SUBMIT MATERIAL MOVEMENT ---
    _submitMaterialMovement: async () => {
        const materialId = CuentasUI._selectedMaterialId;
        const quantity = parseFloat(document.getElementById('mv-mat-qty').value);
        const reason = document.getElementById('mv-mat-reason').value;
        const note = document.getElementById('mv-mat-note').value.trim();

        if (!materialId) {
            Utils.notify('Selecciona un material', 'warning');
            return;
        }
        if (!quantity || quantity === 0) {
            Utils.notify('Ingresa una cantidad válida', 'warning');
            return;
        }

        const supabase = window.supabaseClient;

        try {
            const payload = {
                material_id: materialId,
                quantity,
                reason,
                note: note || null,
                created_by: window.SYSTEM_USER_ID
            };

            const { error } = await supabase
                .from('material_movements')
                .insert(payload);

            if (error) throw error;

            Utils.notify('Movimiento de material registrado', 'success');
            document.getElementById('movement-modal').remove();

            // Limpiar cache de materiales para refrescar stock
            CuentasUI._materials = null;
            CuentasUI.loadDashboard();

        } catch (e) {
            console.error('Error registrando movimiento material:', e);
            Utils.notify('Error: ' + e.message, 'error');
        }
    }
};
