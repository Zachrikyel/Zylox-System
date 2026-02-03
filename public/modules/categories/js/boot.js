/* public/modules/categories/js/boot.js */

// Estado inicial del módulo
window.appState = {
    screen: 'list' // Por ahora solo tenemos vista de lista
};

// 1. INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', async () => {
    // 🔥 HERENCIA CRÍTICA: Robar la sesión del padre
    if (window.parent && window.parent.supabaseClient) {
        window.supabase = window.parent.supabaseClient;
    } else {
        console.error("⛔ NO PARENT SESSION: Ejecutando en modo aislado o sin auth.");
        // Opcional: Redirigir o mostrar error visual si no hay padre
    }

    // Configurar comunicación con el Core (Botón atrás, Título)
    window.syncHeader();

    // Arrancar lógica
    if (window.loadCategories) {
        await window.loadCategories();
    }
});

// 2. SINCRONIZACIÓN CON EL SHELL (CORE)
window.syncHeader = () => {
    const parent = window.parent;
    if (!parent || parent === window) return;

    // A. Definir qué hace el botón "Atrás" del Core
    parent.stageBack = () => {
        // Intentar volver un nivel arriba en breadcrumbs
        // Si ya estamos en raíz (length 1), salir al Home
        if (window.catState && window.catState.path.length > 1) {
            // Volver al padre
            const newPath = window.catState.path.slice(0, -1);
            window.catState.path = newPath;
            window.loadCategories(); // Recargar con el nuevo ID padre
        } else {
            // Cerrar módulo
            parent.closeTool && parent.closeTool();
        }
    };

    // B. Actualizar Título del Header según donde estemos
    if (parent.updateStageTitle) {
        const currentName = window.getCurrentContext ? window.getCurrentContext().name : 'CATEGORÍAS';
        parent.updateStageTitle(currentName);
    }

    // C. Mostrar botón atrás siempre
    if (parent.updateStageBackVisible) parent.updateStageBackVisible(true);
};

// Hook para actualizar título al navegar
const originalNavigate = window.navigateDown;
window.navigateDown = (id) => {
    if (originalNavigate) originalNavigate(id);
    window.syncHeader();
};

const originalJump = window.jumpToStep;
window.jumpToStep = (idx) => {
    if (originalJump) originalJump(idx);
    window.syncHeader();
};