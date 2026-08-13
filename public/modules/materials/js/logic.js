/* public/modules/materials/js/logic.js */

// --- VARIABLES DE GESTOS Y CONTROL ---
let gestureTimer = null;
let isHolding = false;
let gestureActive = false; // 🔥 NUEVO: Rastrea si pointerdown fue llamado
let gestureStartX = 0;
let gestureStartY = 0;
let activeItemId = null; // 🔥 NUEVO: ID del item activo en el gesto

// 🔥 COOLDOWN: Evita que el click atraviese niveles instantáneamente
let isNavigating = false;

// --- ESTADO ---
window.inventoryState = {
    path: [{ id: null, name: 'DOCK', level: 0, sku: '' }],
    items: [],
    loading: false
};

const LEVEL_CONFIG = {
    0: { name: 'NODO', color: '#39FF14', icon: 'fa-server' },
    1: { name: 'SECCIÓN', color: '#B026FF', icon: 'fa-layer-group' },
    2: { name: 'CUADRANTE', color: '#00F5FF', icon: 'fa-border-all' },
    3: { name: 'CELDA', color: '#FF6B00', icon: 'fa-box-open' }
};

window.getLevelConfig = (levelIndex) => {
    return LEVEL_CONFIG[levelIndex] || { name: 'ITEM', color: '#ffffff', icon: 'fa-box' };
};

/* --- 1. CARGA DE DATOS --- */
window.loadMaterialStats = async function () {
    if (!window.supabase) return;
    try {
        const { count } = await window.supabase.from('materials').select('*', { count: 'exact', head: true }).is('parent_id', null);
        const { data } = await window.supabase.from('materials').select('current_quantity, min_stock_alert');
        let alerts = 0;
        if (data) alerts = data.filter(m => m.unit_measure != null && m.current_quantity <= (m.min_stock_alert ?? 5)).length;
        window.appState.stats = { totalArmarios: count || 0, alerts: alerts };
    } catch (e) { console.error(e); }
};

window.loadInventoryData = async function () {
    const ctx = window.getCurrentContext();
    const root = document.getElementById('root');

    // Solo mostrar loader si estamos en vista de inventario
    if (window.appState.screen === 'inventory') {
        const currentLevelIdx = window.inventoryState.path.length - 1;
        const config = window.getLevelConfig(currentLevelIdx);
        // Loader temporal
        root.innerHTML = `<div class="flex h-full items-center justify-center"><i class="fas fa-circle-notch fa-spin text-3xl" style="color: ${config.color}"></i></div>`;
    }

    try {
        let q = window.supabase.from('materials').select('*').order('name');
        if (ctx.id === null) q = q.is('parent_id', null);
        else q = q.eq('parent_id', ctx.id);

        const { data, error } = await q;
        if (error) throw error;
        window.inventoryState.items = data || [];
        window.renderInventoryUI();

        // 🔥 DESBLOQUEAR NAVEGACIÓN DESPUÉS DE CARGAR
        setTimeout(() => { isNavigating = false; }, 300);

    } catch (e) {
        console.error(e);
        window.renderInventoryUI();
        isNavigating = false;
    }
};

window.renderInventoryUI = function () {
    const root = document.getElementById('root');
    if (window.appState.screen !== 'inventory') return;

    if (window.Components && window.Components.InventoryScreen) {
        root.innerHTML = window.Components.InventoryScreen(
            window.inventoryState.path,
            window.inventoryState.items
        );
        window.syncHeader();
    }
};

/* --- 2. SISTEMA DE NAVEGACIÓN (DRILL DOWN) --- */
window.navigateDown = (id) => {
    id = String(id);
    // 🛑 BLOQUEO DE SEGURIDAD
    if (isNavigating) return;

    const currentDepth = window.inventoryState.path.length - 1;
    if (currentDepth >= 3) {
        console.log("🛑 Final de línea (Celda)");
        return;
    }

    const item = window.inventoryState.items.find(i => String(i.id) === id);
    if (!item) return;

    // 🔥 ACTIVAR BLOQUEO
    isNavigating = true;

    window.inventoryState.path.push({
        id: item.id,
        name: item.name,
        sku: item.sku,
        level: window.inventoryState.path.length
    });
    window.loadInventoryData();
};

window.jumpToStep = (index) => {
    if (index < window.inventoryState.path.length - 1) {
        isNavigating = true;
        window.inventoryState.path = window.inventoryState.path.slice(0, index + 1);
        window.loadInventoryData();
    }
};

window.popPath = () => {
    if (window.inventoryState.path.length > 1) {
        isNavigating = true;
        window.inventoryState.path.pop();
        window.loadInventoryData();
        return true;
    }
    return false;
};

window.getCurrentContext = () => window.inventoryState.path[window.inventoryState.path.length - 1];
window.getCurrentContextName = () => window.getCurrentContext().name;


/* --- 3. SISTEMA DE GESTOS (TACTICAL HOLD) --- */

window.gestureStart = (id, event) => {
    id = String(id);
    // 🛑 Bloqueos de seguridad
    if (isNavigating) return;
    if (event.button === 2) return; // Click derecho

    // 🔥 ACTIVAR GESTO
    gestureActive = true;
    activeItemId = id;
    isHolding = false;

    // Normalizar coordenadas Touch vs Mouse
    gestureStartX = event.touches ? event.touches[0].clientX : event.clientX;
    gestureStartY = event.touches ? event.touches[0].clientY : event.clientY;

    // Iniciar timer para Hold (edición) - SOLO EN INVENTARIO Y DENTRO DE UN NIVEL
    // path.length > 1 significa que ya entraste en al menos un NODO
    const hasNavigatedInside = window.inventoryState && window.inventoryState.path.length > 1;
    if (window.appState && window.appState.screen === 'inventory' && hasNavigatedInside) {
        gestureTimer = setTimeout(() => {
            isHolding = true;
            gestureActive = false; // Ya no es un tap
            if (navigator.vibrate) navigator.vibrate(50);
            window.openEditModal(id);
        }, 600);
    }
};

window.gestureMove = (event) => {
    // Solo procesar si hay un gesto activo
    if (!gestureActive) return;
    if (isNavigating) return;

    const x = event.touches ? event.touches[0].clientX : event.clientX;
    const y = event.touches ? event.touches[0].clientY : event.clientY;

    // Si se movió más de 10px, cancelar gesto (es scroll)
    if (Math.abs(x - gestureStartX) > 10 || Math.abs(y - gestureStartY) > 10) {
        clearTimeout(gestureTimer);
        gestureActive = false; // 🔥 Cancelar gesto
        isHolding = false;
        activeItemId = null;
    }
};

window.gestureEnd = (id, event) => {
    id = String(id);
    // Prevenir eventos duplicados del navegador
    if (event && event.cancelable) event.preventDefault();

    clearTimeout(gestureTimer);

    // 🔥 SOLO NAVEGAR SI:
    // 1. gestureActive es true (hubo un pointerdown válido)
    // 2. El ID coincide con el item donde empezó el gesto
    // 3. No estamos navegando
    // 4. No fue un hold (que ya abrió el modal de edición)
    if (gestureActive && activeItemId === id && !isNavigating && !isHolding) {
        window.navigateDown(id);
    }

    // Resetear estado
    gestureActive = false;
    isHolding = false;
    activeItemId = null;
};

// 🔥 Función para cancelar gestos (útil para pointerleave)
window.gestureCancel = () => {
    clearTimeout(gestureTimer);
    gestureActive = false;
    isHolding = false;
    activeItemId = null;
};


/* --- 4. CREACIÓN (MODAL) --- */
window.adjustVal = (id, delta) => {
    const input = document.getElementById(id);
    if (!input) return;
    let val = parseFloat(input.value) || 0;
    val += delta;
    if (val < 0) val = 0;
    input.value = Math.round(val * 100) / 100;
};

window.openCreationModal = () => {
    try {
        const modal = document.getElementById('create-modal');
        if (!modal) return;

        const ctx = window.getCurrentContext();
        const currentDepth = window.inventoryState.path.length - 1;
        const config = window.getLevelConfig(currentDepth);

        // UI
        const typeText = document.getElementById('modal-type-text');
        if (typeText) { typeText.innerText = config.name; typeText.style.color = config.color; }

        const contextLabel = document.getElementById('modal-context-path');
        if (contextLabel) {
            contextLabel.innerText = window.inventoryState.path.map(p => p.name).join(' > ');
            contextLabel.style.color = config.color;
        }

        const modalSheet = modal.querySelector('#modal-sheet-border');
        if (modalSheet) modalSheet.style.borderTopColor = config.color;

        const labelName = document.getElementById('dynamic-label');
        if (labelName) labelName.style.color = config.color;

        const iconSku = document.getElementById('dynamic-icon');
        if (iconSku) iconSku.style.color = config.color;

        const btnSubmit = document.getElementById('dynamic-btn');
        if (btnSubmit) {
            btnSubmit.style.backgroundColor = config.color;
            btnSubmit.style.color = '#000';
            btnSubmit.style.boxShadow = `0 0 15px ${config.color}40`;
        }

        // Extras
        const extraFields = document.getElementById('extra-fields');
        if (extraFields) {
            if (currentDepth >= 2) extraFields.classList.remove('hidden');
            else extraFields.classList.add('hidden');
        }

        // Reset
        const inName = document.getElementById('input_name');
        if (inName) inName.value = '';

        ['input_qty', 'input_alert', 'input_cost'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = (id === 'input_alert' ? 5 : 0);
        });

        const skuPreview = document.getElementById('modal-sku-preview');
        if (skuPreview) skuPreview.innerText = ctx.sku ? `${ctx.sku}-???` : '???';

        modal.classList.remove('hidden');
        setTimeout(() => document.getElementById('input_name').focus(), 100);

    } catch (err) { console.error("Error modal:", err); }
};

window.updateSkuPreview = () => {
    try {
        const name = document.getElementById('input_name').value || '';
        const ctx = window.getCurrentContext();
        const short = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
        const preview = document.getElementById('modal-sku-preview');
        if (preview) preview.innerText = ctx.sku ? `${ctx.sku}-${short}` : short;
    } catch (e) { }
};

window.submitCreation = async () => {
    try {
        const nameInput = document.getElementById('input_name');
        if (!nameInput || !nameInput.value) return;

        const name = nameInput.value.toUpperCase();
        const sku = document.getElementById('modal-sku-preview').innerText;
        const ctx = window.getCurrentContext();
        const currentDepth = window.inventoryState.path.length - 1;

        const payload = { name, sku, parent_id: ctx.id, current_quantity: 0 };

        if (currentDepth >= 2) {
            const getVal = (id) => document.getElementById(id).value;
            payload.current_quantity = parseFloat(getVal('input_qty')) || 0;
            payload.min_stock_alert = parseFloat(getVal('input_alert')) || 5;
            payload.unit_measure = getVal('input_unit');
            payload.cost_per_unit = parseFloat(getVal('input_cost')) || 0;
        }

        if (window.closeModal) window.closeModal();

        await window.supabase.from('materials').insert([payload]);
        await window.loadInventoryData();

    } catch (err) { console.error("Error guardando:", err); }
};

/* --- 5. EDICIÓN --- */
window.openEditModal = (id) => {
    try {
        id = String(id);
        const item = window.inventoryState.items.find(i => String(i.id) === id);
        if (!item) return;
        const modal = document.getElementById('edit-modal');
        const currentDepth = window.inventoryState.path.length - 1;
        const config = window.getLevelConfig(currentDepth);

        document.getElementById('edit_id').value = item.id;
        document.getElementById('edit_old_sku').value = item.sku;
        document.getElementById('edit_name').value = item.name;
        document.getElementById('edit-sku-preview').innerText = item.sku;

        const typeText = document.getElementById('edit-type-text');
        typeText.innerText = config.name;
        typeText.style.color = config.color;

        const sheet = document.getElementById('edit-sheet-border');
        sheet.style.borderTopColor = config.color;

        document.getElementById('edit-dynamic-label').style.color = config.color;
        document.getElementById('edit-dynamic-icon').style.color = config.color;

        const btn = document.getElementById('edit-dynamic-btn');
        btn.style.backgroundColor = config.color;
        btn.style.color = '#000';
        btn.style.boxShadow = `0 0 15px ${config.color}40`;

        const extraFields = document.getElementById('edit-extra-fields');
        if (currentDepth >= 2) {
            extraFields.classList.remove('hidden');
            document.getElementById('edit_qty').value = item.current_quantity || 0;
            document.getElementById('edit_alert').value = item.min_stock_alert || 5;
            document.getElementById('edit_unit').value = item.unit_measure || 'unidad';
            document.getElementById('edit_cost').value = item.cost_per_unit || 0;
        } else {
            extraFields.classList.add('hidden');
        }

        modal.classList.remove('hidden');
    } catch (e) { console.error(e); }
};

window.closeEditModal = () => { document.getElementById('edit-modal').classList.add('hidden'); };

window.updateEditSkuPreview = () => {
    const name = document.getElementById('edit_name').value;
    const oldSku = document.getElementById('edit_old_sku').value;
    if (!oldSku) return;
    const parts = oldSku.split('-');
    const newShort = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
    parts[parts.length - 1] = newShort;
    document.getElementById('edit-sku-preview').innerText = parts.join('-');
};

window.cascadeSkuUpdate = async function (parentId, oldSku, newSku) {
    const { data: children } = await window.supabase.from('materials').select('id, sku').eq('parent_id', parentId);
    for (const child of children || []) {
        if (!child.sku || !child.sku.startsWith(oldSku + '-')) continue;
        const suffix = child.sku.slice(oldSku.length);
        const childNewSku = newSku + suffix;
        await window.supabase.from('materials').update({ sku: childNewSku }).eq('id', child.id);
        await window.cascadeSkuUpdate(child.id, child.sku, childNewSku);
    }
};

window.submitEdit = async () => {
    try {
        const id = document.getElementById('edit_id').value;
        const name = document.getElementById('edit_name').value;
        const newSku = document.getElementById('edit-sku-preview').innerText;
        const oldSku = document.getElementById('edit_old_sku').value;
        const currentDepth = window.inventoryState.path.length - 1;

        const payload = { name, sku: newSku };

        if (currentDepth >= 2) {
            payload.current_quantity = parseFloat(document.getElementById('edit_qty').value) || 0;
            payload.min_stock_alert = parseFloat(document.getElementById('edit_alert').value) || 5;
            payload.unit_measure = document.getElementById('edit_unit').value;
            payload.cost_per_unit = parseFloat(document.getElementById('edit_cost').value) || 0;
        }

        if (window.closeEditModal) window.closeEditModal();

        const { error } = await window.supabase.from('materials').update(payload).eq('id', id);
        if (error) throw error;

        if (oldSku && newSku && oldSku !== newSku) {
            await window.cascadeSkuUpdate(id, oldSku, newSku);
        }

        await window.loadInventoryData();
    } catch (e) { console.error(e); alert("Error: " + e.message); }
};

window.deleteItem = async () => {
    if (!confirm("¿CONFIRMAS ELIMINAR ESTE ELEMENTO?")) return;
    try {
        const id = document.getElementById('edit_id').value;
        if (window.closeEditModal) window.closeEditModal();
        const { error } = await window.supabase.from('materials').delete().eq('id', id);
        if (error) throw error;
        await window.loadInventoryData();
    } catch (e) { alert("Error al borrar: " + e.message); }
};