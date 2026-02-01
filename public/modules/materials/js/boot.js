/* public/modules/materials/js/boot.js */

window.appState = {
    screen: 'home', // 'home' or 'inventory'
    stats: { totalArmarios: 0, alerts: 0 }
};

window.renderModule = function () {
    const root = document.getElementById('root');
    const { screen, stats } = window.appState;

    if (screen === 'home') {
        if (window.Components && window.Components.HomeScreen) {
            root.innerHTML = window.Components.HomeScreen(stats);
        }
    }
    else if (screen === 'inventory') {
        if (window.renderInventoryUI) window.renderInventoryUI();
    }

    window.syncHeader();
};

window.navigateTo = async (targetScreen) => {
    console.log(`Navigating to: ${targetScreen}`);
    window.appState.screen = targetScreen;

    if (targetScreen === 'inventory') {
        await window.loadInventoryData();
    } else {
        await window.loadMaterialStats();
    }

    window.renderModule();
};

document.addEventListener('DOMContentLoaded', async () => {
    if (window.parent && window.parent.supabaseClient) {
        window.supabase = window.parent.supabaseClient;
    }
    if (window.loadMaterialStats) await window.loadMaterialStats();
    window.renderModule();
});

window.syncHeader = () => {
    const parent = window.parent;
    if (!parent || parent === window) return;

    const { screen } = window.appState;

    parent.stageModuleHome = () => window.navigateTo('home');

    if (screen === 'home') {
        parent.stageBack = () => parent.closeTool && parent.closeTool();
        if (parent.updateStageTitle) parent.updateStageTitle('MATERIALES');
    }
    else {
        parent.stageBack = () => {
            if (window.popPath && !window.popPath()) {
                window.navigateTo('home');
            }
        };
        if (parent.updateStageTitle && window.getCurrentContextName) {
            parent.updateStageTitle(window.getCurrentContextName());
        }
    }

    if (parent.updateStageBackVisible) parent.updateStageBackVisible(true);
};