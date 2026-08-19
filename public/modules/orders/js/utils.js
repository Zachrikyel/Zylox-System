// --- ZYLOX NOTIFICATION MODAL (Consistente con Calculator y Products) ---
window.showNotification = (message, type = 'warning', duration = 1500) => {
    const existing = document.getElementById('zylox-notification');
    if (existing) existing.remove();

    const colors = {
        warning: { border: 'border-yellow-500', text: 'text-yellow-400', icon: '⚠️' },
        error: { border: 'border-red-500', text: 'text-red-400', icon: '❌' },
        success: { border: 'border-green-500', text: 'text-green-400', icon: '✅' },
        info: { border: 'border-cyan-500', text: 'text-cyan-400', icon: 'ℹ️' }
    };
    const c = colors[type] || colors.warning;

    const modal = document.createElement('div');
    modal.id = 'zylox-notification';
    modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in';
    modal.innerHTML = `
        <div class="bg-zinc-900 ${c.border} border-2 max-w-sm w-full p-6" style="clip-path: polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%);">
            <div class="flex items-center justify-center gap-4">
                <span class="text-3xl">${c.icon}</span>
                <p class="${c.text} text-sm font-bold uppercase tracking-wide">${message}</p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Establecer transición desde el inicio para el fade-out
    modal.style.transition = 'opacity 0.3s ease-out';

    setTimeout(() => {
        modal.style.opacity = '0';
        setTimeout(() => modal.remove(), 300);
    }, duration);

    modal.onclick = () => {
        modal.style.opacity = '0';
        setTimeout(() => modal.remove(), 300);
    };
};

// --- ZYLOX CONFIRM MODAL (Reemplaza confirm() nativo) ---
window.showConfirmModal = (message, onConfirm, onCancel = null) => {
    const existing = document.getElementById('zylox-confirm-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'zylox-confirm-modal';
    modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4 animate-fade-in';
    modal.innerHTML = `
        <div class="bg-zinc-900 border border-zinc-700 max-w-sm w-full p-6" style="clip-path: polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%);">
            <div class="flex items-start gap-4 mb-6">
                <span class="text-2xl">⚠️</span>
                <p class="text-white text-sm font-medium leading-relaxed">${message}</p>
            </div>
            <div class="flex gap-3">
                <button id="confirm-cancel-btn" class="flex-1 py-3 bg-zinc-800 text-zinc-400 font-bold uppercase text-xs tracking-widest hover:bg-zinc-700 hover:text-white transition-colors border border-zinc-700">
                    Cancelar
                </button>
                <button id="confirm-ok-btn" class="flex-1 py-3 bg-red-600 text-white font-bold uppercase text-xs tracking-widest hover:bg-red-500 transition-colors">
                    Confirmar
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const closeModal = () => modal.remove();

    document.getElementById('confirm-cancel-btn').onclick = () => {
        closeModal();
        if (onCancel) onCancel();
    };

    document.getElementById('confirm-ok-btn').onclick = () => {
        closeModal();
        onConfirm();
    };

    // Cerrar con click fuera
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal();
            if (onCancel) onCancel();
        }
    };
};

const Utils = {
    // Lista estándar de tallas
    STANDARD_SIZES: ["XS", "S", "M", "L", "XL", "XXL", "ÚNICA"],

    // --- CORRECCIÓN: Función faltante agregada ---
    extractDriveId: (input) => {
        if (!input) return '';
        const match = input.match(/\/d\/([a-zA-Z0-9_-]+)/) || input.match(/id=([a-zA-Z0-9_-]+)/);
        if (!match && input.length > 20 && !input.includes('/')) return input;
        return match ? match[1] : input;
    },
    // ---------------------------------------------

    formatCurrency: (amount) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
    },

    notify: (msg, type = 'info') => {
        // Usar showNotification local (siempre disponible)
        showNotification(msg, type);
    },

    formatDate: (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });
    }
};
// --- EDITOR DE ORDENES: cambiar el color/material real de una línea ya vendida
// (ej. facehugger negro→verde) sin crear cotización nueva. ---

window.fetchFilamentOptions = async () => {
    const supabase = window.supabaseClient;
    if (!supabase) return [];
    try {
        const { data: allMaterials, error } = await supabase.from('materials').select('id, name, parent_id, current_quantity');
        if (error) throw error;
        if (!allMaterials) return [];
        const rootNode = allMaterials.find(m => m.name.toLowerCase().includes('filamento') && !m.parent_id);
        if (!rootNode) return [];
        const byParent = {};
        allMaterials.forEach(m => { (byParent[m.parent_id] = byParent[m.parent_id] || []).push(m); });
        const leaves = [];
        const walk = (node, path) => {
            const children = byParent[node.id] || [];
            const fullPath = path ? `${path} ${node.name}` : node.name;
            if (children.length === 0) {
                leaves.push({ id: node.id, display_name: fullPath, current_quantity: node.current_quantity });
            } else {
                children.forEach(c => walk(c, fullPath));
            }
        };
        (byParent[rootNode.id] || []).forEach(c => walk(c, ''));
        return leaves.sort((a, b) => a.display_name.localeCompare(b.display_name));
    } catch (e) { console.error(e); return []; }
};

// Trae las filas reales de consumo (quote_materials) de una línea de orden específica
window.fetchOrderItemMaterials = async (orderItemId) => {
    const supabase = window.supabaseClient;
    const { data, error } = await supabase
        .from('quote_materials')
        .select('id, material_id, quantity')
        .eq('order_item_id', orderItemId);
    if (error) { console.error(error); return []; }
    return data || [];
};

// Cambia el material de UNA fila de consumo ya existente. El disparador que ya está
// conectado revierte el material viejo y descuenta el nuevo — no hay que tocar nada más.
window.swapOrderItemMaterial = async (quoteMaterialRowId, newMaterialId) => {
    const supabase = window.supabaseClient;
    const { error } = await supabase
        .from('quote_materials')
        .update({ material_id: newMaterialId })
        .eq('id', quoteMaterialRowId);
    if (error) throw error;
};

// Actualiza el texto que se ve en la orden (no afecta el inventario, solo la etiqueta)
window.updateOrderItemColorLabel = async (orderItemId, newLabel) => {
    const supabase = window.supabaseClient;
    const { error } = await supabase
        .from('order_items')
        .update({ selected_color: newLabel })
        .eq('id', orderItemId);
    if (error) throw error;
};