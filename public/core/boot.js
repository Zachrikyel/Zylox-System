/**
 * ZYLOX SYSTEM - CORE BOOTLOADER v2.0
 * Propósito: Inicializar servicios esenciales y montar la interfaz.
 */

console.log('⚡ ZYLOX KERNEL: Iniciando secuencia de arranque...');

// Función temporal para simular carga
function initSystem() {
    const root = document.getElementById('root');

    setTimeout(() => {
        console.log('✅ ZYLOX KERNEL: Sistema en línea.');

        // Reemplazar la pantalla de carga por una señal de éxito
        root.innerHTML = `
            <div class="flex-1 flex flex-col items-center justify-center animate-fade-in">
                <div class="text-6xl mb-4">💠</div>
                <h1 class="text-3xl font-bold text-cyan-400 mb-2">Sistema Zylox v2</h1>
                <p class="text-zinc-500 font-mono">Arquitectura Modular Operativa.</p>
                <div class="mt-8 p-4 bg-zinc-900/50 border border-cyan-900/50 rounded-xl text-sm text-cyan-300 font-mono">
                    > Core/Boot.js loaded.<br>
                    > Tailwind CSS injected.<br>
                    > Waiting for modules...
                </div>
            </div>
        `;
    }, 1500); // Simula 1.5s de carga
}

// Ejecutar al cargar
initSystem();