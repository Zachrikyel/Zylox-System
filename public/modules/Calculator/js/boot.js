/**
 * ZYLOX MODULE BOOTLOADER
 * Reemplaza la lógica de routing/auth original de SICMA
 */

// 1. Inicializar Estado Global (Simulando lo que hacía tu app.js)
window.appState = {
  screen: 'calculator', // Forzamos pantalla calculadora directo
  currentQuote: null,
  user: null,          // Se llenará desde el padre
  isAuthorized: true   // Asumimos true porque el Dashboard ya filtró
};

// 2. Función de Navegación Simplificada (Para que los botones internos funcionen)
window.navigateTo = (screen) => {
  console.log(`⚡ Módulo navegando a: ${screen}`);
  window.appState.screen = screen;
  renderModule();
};

// 3. Renderizador Maestro
function renderModule() {
  const root = document.getElementById('root');
  const screen = window.appState.screen;

  // Usamos tus componentes originales
  if (window.Components) {
    if (screen === 'calculator') root.innerHTML = window.Components.Calculator();
    else if (screen === 'history') root.innerHTML = window.Components.History();
    else if (screen === 'packages') root.innerHTML = window.Components.PackageCalculator();
    else root.innerHTML = window.Components.Calculator(); // Fallback
  } else {
    console.error("❌ CRITICAL: window.Components no cargó. Verifica components.js");
  }
}

// 4. Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  // Intentar obtener usuario del contexto de Supabase (Local Storage compartido)
  try {
    const { data: { session } } = await window.supabaseClient.client.auth.getSession();
    if (session?.user) {
      window.appState.user = session.user;
    }
  } catch (e) {
    console.warn("⚠️ No se pudo sincronizar sesión con Supabase, usando modo invitado.");
  }

  // Arrancar interfaz
  renderModule();
});