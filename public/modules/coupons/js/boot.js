window.SYSTEM_USER_ID = null;

async function initCouponsModule() {
    console.log("🚀 Módulo Cupones Iniciado");

    if (window.parent && window.parent.supabaseClient) {
        window.supabaseClient = window.parent.supabaseClient;
    } else {
        console.warn("⚠️ Sin conexión al Shell");
    }

    await CouponsUI.init();

    if (typeof CouponsManager !== 'undefined') {
        CouponsManager.init();
    }

    CouponsUI.switchView('home');
}

document.addEventListener('DOMContentLoaded', initCouponsModule);