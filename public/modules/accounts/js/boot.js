window.SYSTEM_USER_ID = null;

async function initCuentasModule() {
    console.log("🚀 Iniciando Módulo de Cuentas...");

    // 1. Conexión con Supabase Padre
    if (window.parent && window.parent.supabaseClient) {
        window.supabaseClient = window.parent.supabaseClient;
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (user) window.SYSTEM_USER_ID = user.id;
    } else {
        console.warn("⚠️ Sin conexión con Shell Zylox.");
    }

    // 2. Inicializar Interfaz
    await CuentasUI.init();

    // 3. --- LOGICA DE HEADER GLOBAL ---
    try {
        const parentDoc = window.parent.document;
        const homeBtn = parentDoc.querySelector('header button i.ph-house')?.parentElement ||
            parentDoc.querySelector('header button i.ph-house-simple')?.parentElement ||
            parentDoc.querySelector('header button i.ph-house-line')?.parentElement;

        if (homeBtn) {
            console.log("🔗 Header Global Vinculado.");
            const newHomeBtn = homeBtn.cloneNode(true);
            homeBtn.parentNode.replaceChild(newHomeBtn, homeBtn);

            newHomeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isModuleHome = !document.getElementById('view-home').classList.contains('hidden');
                if (!isModuleHome) {
                    console.log("🏠 Navegando a Home Local");
                    CuentasUI.switchView('home');
                } else {
                    console.log("🏠 Ya en Home Local.");
                }
            });
        }
    } catch (e) {
        console.warn("No se pudo vincular el header global (Cross-Origin o estructura distinta):", e);
    }
}

document.addEventListener('DOMContentLoaded', initCuentasModule);