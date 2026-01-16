window.SYSTEM_USER_ID = null;

async function initOrdersModule() {
    console.log("🚀 Iniciando Módulo de Órdenes...");

    // 1. Conexión con Supabase Padre
    if (window.parent && window.parent.supabaseClient) {
        window.supabaseClient = window.parent.supabaseClient;
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (user) window.SYSTEM_USER_ID = user.id;
    } else {
        console.warn("⚠️ Sin conexión con Shell Zylox.");
    }

    // 2. Inicializar Interfaz
    await OrdersUI.init();

    // 3. --- LOGICA DE HEADER GLOBAL ---
    try {
        // Buscamos el botón HOME en el padre (Asumiendo que es el botón de la casa)
        // Usamos selectores genéricos de iconos Phosphor (ph-house, ph-house-simple)
        const parentDoc = window.parent.document;
        const homeBtn = parentDoc.querySelector('header button i.ph-house')?.parentElement ||
            parentDoc.querySelector('header button i.ph-house-simple')?.parentElement ||
            parentDoc.querySelector('header button i.ph-house-line')?.parentElement;

        if (homeBtn) {
            console.log("🔗 Header Global Vinculado.");

            // Clonamos el botón para eliminar listeners anteriores del sistema (reset limpio)
            const newHomeBtn = homeBtn.cloneNode(true);
            homeBtn.parentNode.replaceChild(newHomeBtn, homeBtn);

            // Agregamos nuestro comportamiento
            newHomeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // Si NO estamos en el home del módulo, ir al home del módulo
                const isModuleHome = !document.getElementById('view-home').classList.contains('hidden');

                if (!isModuleHome) {
                    // Navegación interna: Volver al Dashboard de Órdenes
                    console.log("🏠 Navegando a Home Local");
                    OrdersUI.switchView('home');
                } else {
                    // Si YA estamos en el home del módulo, dejar que el sistema recargue (o hacer nada)
                    // Opcional: window.parent.location.reload(); para ir al dashboard global real
                    console.log("🏠 Ya en Home Local.");
                }
            });
        }
    } catch (e) {
        console.warn("No se pudo vincular el header global (Cross-Origin o estructura distinta):", e);
    }
}

document.addEventListener('DOMContentLoaded', initOrdersModule);