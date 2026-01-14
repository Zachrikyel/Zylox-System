// 1. Inicializar Estado Global
window.appState = {
  screen: 'home',      // <--- FORZAMOS INICIO EN EL MENÚ
  currentQuote: null,
  user: null,
  isAuthorized: true
};

window.navigateTo = (screen) => {
  console.log(`⚡ Módulo navegando a: ${screen}`);
  window.appState.screen = screen;
  renderModule();
};

// 3. Renderizador Maestro
function renderModule() {
  const root = document.getElementById('root');
  const screen = window.appState.screen;

  // Verificar si los componentes cargaron
  if (window.Components) {
    try {
      if (screen === 'home') {
        root.innerHTML = window.Components.HomeScreen();
      }
      else if (screen === 'calculator') {
        root.innerHTML = window.Components.Calculator();
      }
      else if (screen === 'history') {
        root.innerHTML = window.Components.History();
      }
      else if (screen === 'packages') {
        root.innerHTML = window.Components.PackageCalculator();
      }
      else {
        root.innerHTML = window.Components.HomeScreen();
      }
    } catch (e) {
      console.error("❌ Error renderizando pantalla:", e);
      root.innerHTML = `<div class="text-red-500 text-center p-10">Error de interfaz: ${e.message}</div>`;
    }
  } else {
    console.error("❌ CRITICAL: window.Components no cargó.");
    // Reintentar en 500ms por si es lag de carga
    setTimeout(renderModule, 500);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Intentar obtener usuario solo si el cliente existe
    if (window.supabaseClient && window.supabaseClient.client) {
      const { data: { session } } = await window.supabaseClient.client.auth.getSession();
      if (session?.user) {
        window.appState.user = session.user;
      }
    }
  } catch (e) {
    console.warn("Modo invitado/Offline", e);
  }

  renderModule();
});