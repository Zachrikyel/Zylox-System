window.appState = {
    screen: 'home',
    user: null
};

// Sincronizar con Header del Parent (igual que Calculator)
window.syncWithParentHeader = function () {
    const parent = window.parent;
    if (!parent || parent === window) return;

    const screen = window.appState.screen;

    // Configurar Home del Módulo
    parent.stageModuleHome = () => navigateTo('home');

    // Configurar Atrás según contexto
    if (screen === 'home') {
        // En home del módulo, atrás cierra la herramienta
        parent.stageBack = () => parent.closeTool && parent.closeTool();
        if (parent.updateStageBackVisible) parent.updateStageBackVisible(true);
        if (parent.updateStageTitle) parent.updateStageTitle('Productos');
    }
    else if (screen === 'create_product') {
        const step = window.createState?.step || 1;
        if (step > 1) {
            parent.stageBack = () => window.goToStep && window.goToStep(step - 1);
        } else {
            parent.stageBack = () => {
                delete window.createState;
                navigateTo('home');
            };
        }
        if (parent.updateStageTitle) parent.updateStageTitle(`Nuevo Producto ${step}/4`);
        if (parent.updateStageBackVisible) parent.updateStageBackVisible(true);
    }
    else if (screen === 'create_variant') {
        parent.stageBack = () => {
            delete window.variantState;
            navigateTo('home');
        };
        if (parent.updateStageTitle) parent.updateStageTitle('Nueva Variante');
        if (parent.updateStageBackVisible) parent.updateStageBackVisible(true);
    }
    else if (screen === 'arsenal') {
        // Si el inspector está activo, el botón atrás cierra el inspector
        if (window.inspectorState && window.inspectorState.active) {
            parent.stageBack = () => {
                window.closeInspector && window.closeInspector();
            };
            if (parent.updateStageTitle) parent.updateStageTitle('Inspector');
        } else {
            parent.stageBack = () => navigateTo('home');
            if (parent.updateStageTitle) parent.updateStageTitle('Arsenal');
        }
        if (parent.updateStageBackVisible) parent.updateStageBackVisible(true);
    }
    else {
        parent.stageBack = () => navigateTo('home');
        if (parent.updateStageBackVisible) parent.updateStageBackVisible(true);
    }
}

window.navigateTo = (screen) => {
    console.log(`⚡ Productos: Navegando a ${screen}`);
    window.appState.screen = screen;
    // Resetear inspector si salimos
    if (screen !== 'arsenal') window.inspectorState = null;
    renderModule();
    window.syncWithParentHeader();
};

function renderModule() {
    const root = document.getElementById('root');
    const screen = window.appState.screen;

    // PRIORIDAD: Si el Inspector está activo, mostrarlo sobre todo (overlay o full screen)
    if (window.inspectorState && window.inspectorState.active && window.Components.ProductInspector) {
        root.innerHTML = window.Components.ProductInspector();
        return;
    }

    if (window.Components) {
        try {
            if (screen === 'home') {
                root.innerHTML = window.Components.HomeScreen();
            } else if (screen === 'create_product') {
                root.innerHTML = window.Components.CreateProductScreen();
            } else if (screen === 'create_variant') {
                root.innerHTML = window.Components.CreateVariantScreen();
            } else if (screen === 'arsenal') {
                // AHORA CONECTADO
                if (window.Components.ArsenalScreen) {
                    root.innerHTML = window.Components.ArsenalScreen();
                } else {
                    root.innerHTML = `<div class="p-10 text-neo">Cargando Arsenal UI...</div>`;
                }
            }
        } catch (e) {
            console.error("❌ Error renderizando:", e);
            root.innerHTML = `<div class="text-red-500 p-5">Error UI: ${e.message}</div>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    setTimeout(() => {
        renderModule();
        window.syncWithParentHeader();
    }, 50);
});