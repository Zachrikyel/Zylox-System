async function initExtractorModule() {
    console.log("🚀 Módulo Extractor Iniciado");

    // Conectar Header Padre
    if (window.parent) {
        // En esta herramienta, el botón "Home" del módulo simplemente limpia
        window.parent.stageModuleHome = () => {
            showConfirmModal("¿Limpiar todo?", () => {
                Extractor.clear();
            });
        };

        // El botón "Atrás" se deja null para que el padre decida (salir al dashboard principal)
        window.parent.stageBack = null;
    }

    // Inicializar lógica
    Extractor.init();
}

document.addEventListener('DOMContentLoaded', initExtractorModule);