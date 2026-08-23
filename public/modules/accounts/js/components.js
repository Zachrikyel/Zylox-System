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
        // Mes por defecto = mes actual
        const now = new Date();
        const monthInput = document.getElementById('dashboard-month');
        if (monthInput) {
            const y = now.getFullYear();
            const m = String(now.getMonth() + 1).padStart(2, '0');
            monthInput.value = `${y}-${m}`;
        }
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
                .select('id, name, sku, is_stock_item')
                .eq('is_published', true)
                .order('name', { ascending: true });

            if (pErr) throw pErr;

            // 2. Capacidades (vista product_capacity)
            const { data: capacities, error: cErr } = await supabase
                .from('product_capacity')
                .select('product_id, max_units');

            if (cErr) throw cErr;

            // 3. Verificar cuáles tienen receta (product_bom base)
            const { data: boms, error: bErr } = await supabase
                .from('product_bom')
                .select('product_id')
                .is('product_color_id', null);

            if (bErr) throw bErr;

            // Mapas
            const capMap = {};
            (capacities || []).forEach(c => { capMap[c.product_id] = c.max_units; });

            const bomSet = new Set();
            (boms || []).forEach(b => bomSet.add(b.product_id));

            // Combinar
            const enriched = (products || []).map(p => ({
                ...p,
                hasRecipe: bomSet.has(p.id),
                capacity: bomSet.has(p.id) ? (capMap[p.id] ?? 0) : null
            }));

            CuentasUI._products = enriched;
            CuentasUI._allProducts = enriched;
            CuentasUI.renderInventoryList(enriched);

        } catch (e) {
            console.error('Error cargando inventario:', e);
            container.innerHTML = '<div class="text-center text-red-400 text-xs mt-8">Error al cargar inventario</div>';
        }
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

        container.innerHTML = items.map(p => {
            const typeIcon = p.is_stock_item
                ? '<i class="ph ph-package text-lg text-cyan-400" title="Stock"></i>'
                : '<i class="ph ph-paint-brush text-lg text-purple-400" title="Custom"></i>';

            let capHtml;
            if (p.capacity === null) {
                capHtml = '<span class="capacity-none text-[10px] font-mono">Sin receta</span>';
            } else if (p.capacity <= 0) {
                capHtml = `<span class="capacity-zero text-sm font-mono">${Math.floor(p.capacity)} uds</span>`;
            } else {
                capHtml = `<span class="capacity-ok text-sm font-mono">${Math.floor(p.capacity)} uds</span>`;
            }

            return `
            <div class="inventory-row">
                <div class="shrink-0">${typeIcon}</div>
                <div class="flex-1 min-w-0">
                    <div class="text-sm font-bold text-white truncate">${p.name}</div>
                    <div class="text-[10px] text-zinc-500 font-mono">${p.sku || '—'}</div>
                </div>
                <div class="text-right shrink-0">${capHtml}</div>
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
    // VALIDAR PEDIDO — MODAL
    // =============================================================
    openValidator: () => {
        const existing = document.getElementById('validator-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'validator-modal';
        modal.className = 'modal-overlay centered';
        modal.innerHTML = `
        <div class="modal-centered no-scrollbar">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold text-cyan-400 uppercase tracking-wider">Validar Pedido</h3>
                <button onclick="document.getElementById('validator-modal').remove()" class="text-zinc-500 hover:text-white text-xl">✕</button>
            </div>

            <div class="mb-4">
                <input type="text" id="validator-search" placeholder="Buscar producto para agregar..."
                    class="w-full px-3 py-2 text-sm" oninput="CuentasUI._filterValidatorProducts(this.value)">
                <div id="validator-suggestions" class="max-h-32 overflow-y-auto mt-1 no-scrollbar"></div>
            </div>

            <div id="validator-selection" class="space-y-1 mb-4 max-h-40 overflow-y-auto no-scrollbar"></div>

            <div id="validator-results" class="mb-4"></div>

            <button onclick="CuentasUI.runValidation()"
                class="w-full py-3 bg-cyan-500 text-black font-bold uppercase text-xs tracking-widest hover:bg-cyan-400 transition-colors">
                <i class="ph ph-check-circle mr-1"></i> Validar
            </button>
        </div>`;
        document.body.appendChild(modal);

        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

        // Init state
        CuentasUI._validatorItems = [];
    },

    _validatorItems: [],

    _filterValidatorProducts: (query) => {
        const suggestions = document.getElementById('validator-suggestions');
        const q = (query || '').toLowerCase().trim();
        if (!q) { suggestions.innerHTML = ''; return; }

        const matches = CuentasUI._allProducts
            .filter(p => p.hasRecipe && (
                (p.name && p.name.toLowerCase().includes(q)) ||
                (p.sku && p.sku.toLowerCase().includes(q))
            ))
            .slice(0, 6);

        suggestions.innerHTML = matches.map(p => `
            <div onclick="CuentasUI._addValidatorItem(${p.id}, '${p.name.replace(/'/g, "\\'")}')"
                 class="px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 cursor-pointer border-b border-zinc-800/50 flex justify-between">
                <span>${p.name}</span>
                <span class="text-zinc-600">${p.sku || ''}</span>
            </div>
        `).join('');
    },

    _addValidatorItem: (productId, productName) => {
        if (CuentasUI._validatorItems.find(v => v.id === productId)) {
            Utils.notify('Producto ya agregado', 'warning');
            return;
        }
        CuentasUI._validatorItems.push({ id: productId, name: productName, qty: 1 });
        document.getElementById('validator-search').value = '';
        document.getElementById('validator-suggestions').innerHTML = '';
        document.getElementById('validator-results').innerHTML = '';
        CuentasUI._renderValidatorSelection();
    },

    _renderValidatorSelection: () => {
        const container = document.getElementById('validator-selection');
        container.innerHTML = CuentasUI._validatorItems.map((item, idx) => `
            <div class="validator-product-row">
                <span class="flex-1 text-xs text-white truncate">${item.name}</span>
                <div class="flex items-center gap-1">
                    <button onclick="CuentasUI._adjustValidatorQty(${idx}, -1)" class="w-6 h-6 bg-zinc-800 text-white text-xs flex items-center justify-center hover:bg-zinc-700">-</button>
                    <span class="text-sm font-mono text-cyan-400 w-6 text-center">${item.qty}</span>
                    <button onclick="CuentasUI._adjustValidatorQty(${idx}, 1)" class="w-6 h-6 bg-zinc-800 text-white text-xs flex items-center justify-center hover:bg-zinc-700">+</button>
                </div>
                <button onclick="CuentasUI._removeValidatorItem(${idx})" class="text-red-500 hover:text-red-400 text-xs ml-1">✕</button>
            </div>
        `).join('');
    },

    _adjustValidatorQty: (index, delta) => {
        const item = CuentasUI._validatorItems[index];
        if (!item) return;
        item.qty = Math.max(1, item.qty + delta);
        CuentasUI._renderValidatorSelection();
    },

    _removeValidatorItem: (index) => {
        CuentasUI._validatorItems.splice(index, 1);
        CuentasUI._renderValidatorSelection();
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
            // 1. Obtener todas las recetas base de los productos seleccionados
            const productIds = items.map(i => i.id);
            const { data: bomRows, error: bErr } = await supabase
                .from('product_bom')
                .select('product_id, material_id, quantity_required')
                .in('product_id', productIds)
                .is('product_color_id', null);

            if (bErr) throw bErr;

            // 2. Calcular requerimiento total por material
            const requirements = {}; // { material_id: totalNeeded }
            for (const item of items) {
                const recipes = (bomRows || []).filter(b => b.product_id === item.id);
                for (const r of recipes) {
                    const matId = r.material_id;
                    if (!requirements[matId]) requirements[matId] = 0;
                    requirements[matId] += r.quantity_required * item.qty;
                }
            }

            const materialIds = Object.keys(requirements).map(Number);
            if (materialIds.length === 0) {
                results.innerHTML = '<div class="text-center text-zinc-500 text-xs py-2">Los productos seleccionados no tienen receta base.</div>';
                return;
            }

            // 3. Obtener stock actual de esos materiales
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
                CuentasUI._buildCards(),
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
    _buildCards: async () => {
        const supabase = window.supabaseClient;
        if (!supabase) return '';

        // 1. Sumas de order_items (all time)
        const { data: oiData, error: oiErr } = await supabase
            .rpc('get_order_items_sums');

        // Fallback: query manual si el RPC no existe
        let sumProfit = 0, sumGananciaReal = 0, sumOpCost = 0;

        if (oiErr) {
            // Query directa
            const { data: oiRows } = await supabase
                .from('order_items')
                .select('predicted_profit, ganancia_real, predicted_operational_cost');

            if (oiRows) {
                for (const row of oiRows) {
                    sumProfit += parseFloat(row.predicted_profit) || 0;
                    sumGananciaReal += parseFloat(row.ganancia_real) || 0;
                    sumOpCost += parseFloat(row.predicted_operational_cost) || 0;
                }
            }
        } else if (oiData) {
            // RPC retorna un objeto con sumas
            sumProfit = parseFloat(oiData.sum_profit) || 0;
            sumGananciaReal = parseFloat(oiData.sum_ganancia_real) || 0;
            sumOpCost = parseFloat(oiData.sum_operational_cost) || 0;
        }

        // 2. Sumas de financial_movements por bucket (all time)
        const { data: fmRows } = await supabase
            .from('financial_movements')
            .select('bucket, amount');

        let fmGanancia = 0, fmOpCost = 0;
        if (fmRows) {
            for (const row of fmRows) {
                const amt = parseFloat(row.amount) || 0;
                if (row.bucket === 'ganancia') fmGanancia += amt;
                else if (row.bucket === 'costo_operativo') fmOpCost += amt;
            }
        }

        // 3. Calcular saldos
        const saldoGanancia = sumProfit + fmGanancia;
        const saldoGananciaReal = sumGananciaReal + fmGanancia;
        const saldoOpCost = sumOpCost + fmOpCost;

        return `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="dash-card" style="--card-accent: #39FF14;">
                <div class="card-value text-[#39FF14]">${Utils.formatCurrency(saldoGanancia)}</div>
                <div class="card-label">Ganancia Disponible</div>
            </div>
            <div class="dash-card" style="--card-accent: #00F5FF;">
                <div class="card-value text-cyan-400">${Utils.formatCurrency(saldoGananciaReal)}</div>
                <div class="card-label">Ganancia Real Disponible</div>
            </div>
            <div class="dash-card" style="--card-accent: #FF6B00;">
                <div class="card-value text-orange-400">${Utils.formatCurrency(saldoOpCost)}</div>
                <div class="card-label">Costo Operativo Disponible</div>
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

        // Parsear mes
        let startDate, endDate;
        if (monthVal) {
            const [year, month] = monthVal.split('-').map(Number);
            startDate = new Date(year, month - 1, 1).toISOString();
            endDate = new Date(year, month, 1).toISOString();
        } else {
            const now = new Date();
            startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
        }

        try {
            // Query: order_items del mes con producto
            const { data: oi, error } = await supabase
                .from('order_items')
                .select('quantity, product_id, products(name, is_stock_item), order_id, orders!inner(created_at)')
                .gte('orders.created_at', startDate)
                .lt('orders.created_at', endDate);

            if (error) throw error;

            const items = oi || [];

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
                    <label class="text-[10px] text-zinc-400 uppercase tracking-wider mb-1 block font-bold">Material</label>
                    <input type="text" id="mv-mat-search" placeholder="Buscar material..."
                        class="w-full px-3 py-2 text-sm" oninput="CuentasUI._searchMaterials(this.value)">
                    <div id="mv-mat-suggestions" class="max-h-28 overflow-y-auto mt-1 no-scrollbar"></div>
                    <div id="mv-mat-selected" class="mt-2"></div>
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

    // --- MATERIAL SEARCH ---
    _searchMaterials: async (query) => {
        const suggestions = document.getElementById('mv-mat-suggestions');
        const q = (query || '').toLowerCase().trim();
        if (!q) { suggestions.innerHTML = ''; return; }

        // Load & cache materials on first search
        if (!CuentasUI._materials) {
            const supabase = window.supabaseClient;
            const { data } = await supabase
                .from('materials')
                .select('id, name, parent_id, current_quantity, unit_measure');

            if (data) {
                // Find leaf materials (no children)
                const parentIds = new Set(data.filter(m => m.parent_id).map(m => m.parent_id));
                CuentasUI._materials = data.filter(m => !parentIds.has(m.id));
            } else {
                CuentasUI._materials = [];
            }
        }

        const matches = CuentasUI._materials
            .filter(m => m.name && m.name.toLowerCase().includes(q))
            .slice(0, 8);

        suggestions.innerHTML = matches.map(m => `
            <div onclick="CuentasUI._selectMaterial(${m.id}, '${m.name.replace(/'/g, "\\'")}', ${m.current_quantity || 0}, '${m.unit_measure || ''}')"
                 class="px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 cursor-pointer border-b border-zinc-800/50 flex justify-between">
                <span class="truncate">${m.name}</span>
                <span class="text-zinc-600 font-mono shrink-0 ml-2">${m.current_quantity || 0} ${m.unit_measure || ''}</span>
            </div>
        `).join('');
    },

    _selectMaterial: (id, name, qty, unit) => {
        CuentasUI._selectedMaterialId = id;
        document.getElementById('mv-mat-search').value = '';
        document.getElementById('mv-mat-suggestions').innerHTML = '';
        document.getElementById('mv-mat-selected').innerHTML = `
            <div class="flex items-center gap-2 px-3 py-2 bg-cyan-900/20 border border-cyan-800 text-xs">
                <i class="ph ph-flask text-cyan-400"></i>
                <span class="text-white flex-1">${name}</span>
                <span class="text-zinc-500 font-mono">${qty} ${unit}</span>
                <button onclick="CuentasUI._clearMaterial()" class="text-zinc-500 hover:text-white">✕</button>
            </div>`;
    },

    _clearMaterial: () => {
        CuentasUI._selectedMaterialId = null;
        document.getElementById('mv-mat-selected').innerHTML = '';
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
