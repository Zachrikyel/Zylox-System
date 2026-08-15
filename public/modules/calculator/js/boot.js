// 1. Inicializar Estado Global
window.appState = {
  screen: 'home',      // <--- INICIO EN EL MENÚ PRINCIPAL
  currentQuote: null,
  user: null,
  isAuthorized: true
};

// 2. Sincronizar con Header del Parent
function syncWithParentHeader() {
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
    if (parent.updateStageTitle) parent.updateStageTitle('Calculadora 3D');
  }
  else if (screen === 'type-selector') {
    // En selector de tipo, atrás vuelve al home
    parent.stageBack = () => navigateTo('home');
    if (parent.updateStageBackVisible) parent.updateStageBackVisible(true);
    if (parent.updateStageTitle) parent.updateStageTitle('Nueva Cotización');
  }
  else if (screen === 'calculator') {
    const step = window.calculatorState?.step || 1;
    if (step > 1) {
      parent.stageBack = () => window.prevStep && window.prevStep();
    } else {
      parent.stageBack = () => navigateTo('type-selector');
    }
    if (parent.updateStageTitle) parent.updateStageTitle(`Paso ${step}/6`);
    if (parent.updateStageBackVisible) parent.updateStageBackVisible(true);
  }
  else if (screen === 'packages') {
    const step = window.packageState?.step || 1;
    if (step > 1) {
      parent.stageBack = () => window.backToPackageStep1 && window.backToPackageStep1();
    } else {
      parent.stageBack = () => navigateTo('home');
    }
    if (parent.updateStageTitle) parent.updateStageTitle('Paquetes');
    if (parent.updateStageBackVisible) parent.updateStageBackVisible(true);
  }
  else if (screen === 'history') {
    parent.stageBack = () => navigateTo('home');
    if (parent.updateStageTitle) parent.updateStageTitle('Historial');
    if (parent.updateStageBackVisible) parent.updateStageBackVisible(true);
  }
  else if (screen === 'resin-home') {
    parent.stageBack = () => navigateTo('type-selector');
    if (parent.updateStageTitle) parent.updateStageTitle('Calculadora Resina');
    if (parent.updateStageBackVisible) parent.updateStageBackVisible(true);
  }
  else {
    parent.stageBack = () => navigateTo('home');
    if (parent.updateStageBackVisible) parent.updateStageBackVisible(true);
  }
}

window.navigateTo = (screen) => {
  console.log(`⚡ Módulo navegando a: ${screen}`);
  window.appState.screen = screen;
  renderModule();
  syncWithParentHeader();
};

// 3. Renderizador Maestro
function renderModule() {
  const root = document.getElementById('root');
  const screen = window.appState.screen;

  // Verificar si los componentes cargaron
  if (window.Components) {
    try {
      if (screen === 'type-selector') {
        root.innerHTML = window.Components.TypeSelector();
      }
      else if (screen === 'home') {
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
      else if (screen === 'resin-home') {
        root.innerHTML = window.Components.ResinHome();
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
  syncWithParentHeader();
});