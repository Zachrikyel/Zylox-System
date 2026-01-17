// --- ZYLOX NOTIFICATION MODAL ---
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

// --- ZYLOX CONFIRM MODAL ---
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

    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal();
            if (onCancel) onCancel();
        }
    };
};

const Utils = {
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
    },
    notify: (msg, type = 'info') => {
        showNotification(msg, type);
    }
};