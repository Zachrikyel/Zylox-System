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
        if (window.parent && window.parent.showNotification) {
            window.parent.showNotification(msg, type);
        } else {
            alert(`${type.toUpperCase()}: ${msg}`);
        }
    },

    formatDate: (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });
    }
};