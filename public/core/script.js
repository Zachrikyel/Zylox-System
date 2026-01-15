/**
 * ZYLOX SYSTEM CORE v2.5 (Cyber-Cut Edition)
 */

const ZYLOX_CONFIG = {
    colors: {
        cyber: '#B026FF',
        neo: '#39FF14',
        holo: '#00F5FF',
        plasma: '#FF6B00',
        void: '#000000',
    },
    tools: [
        // Fila 1
        { id: 'calc', name: 'Calculadora', icon: 'cpu', color: 'cyber', file: 'calculator.html' },
        { id: 'products', name: 'Productos', icon: 'cube', color: 'neo', file: 'products.html' },
        { id: 'orders', name: 'Ordenes', icon: 'list', color: 'holo', file: 'orders.html' },

        // Fila 2
        { id: 'coupons', name: 'Cupones', icon: 'ticket', color: 'plasma', file: 'coupons.html' },
        { id: 'extractor', name: 'Extractor', icon: 'magnet', color: 'white', file: 'extractor.html' },
        { id: 'materials', name: 'Materiales', icon: 'atom', color: 'white', file: 'materials.html' },

        // Fila 3
        { id: 'categories', name: 'Categorías', icon: 'tree', color: 'white', file: 'categories.html' },
        { id: 'locked', name: 'Bloqueado', icon: 'lock', color: 'locked', file: null }
    ]
};

// ... (Mismo objeto ICONS que antes) ...
const ICONS = {
    cpu: '<path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>',
    cube: '<path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>',
    list: '<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>',
    ticket: '<path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>',
    magnet: '<path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>',
    atom: '<path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>',
    tree: '<path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>',
    lock: '<path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>'
};

// ... (Tailwind Config igual) ...
tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                cyber: ZYLOX_CONFIG.colors.cyber,
                neo: ZYLOX_CONFIG.colors.neo,
                holo: ZYLOX_CONFIG.colors.holo,
                plasma: ZYLOX_CONFIG.colors.plasma,
                void: ZYLOX_CONFIG.colors.void,
            },
            fontFamily: { sans: ['Inter', 'sans-serif'] }
        }
    }
};

function renderDashboard(user) {
    const grid = document.getElementById('tools-grid');
    grid.innerHTML = '';

    // Mapa de colores hex para CSS variables
    const colorHexMap = {
        'cyber': ZYLOX_CONFIG.colors.cyber,
        'neo': ZYLOX_CONFIG.colors.neo,
        'holo': ZYLOX_CONFIG.colors.holo,
        'plasma': ZYLOX_CONFIG.colors.plasma,
        'white': '#e4e4e7'
    };

    // Definir las filas en forma piramidal: 2, 3, 3
    const pyramidRows = [
        ZYLOX_CONFIG.tools.slice(0, 2),   // Primera fila: 2 carpetas
        ZYLOX_CONFIG.tools.slice(2, 5),   // Segunda fila: 3 carpetas
        ZYLOX_CONFIG.tools.slice(5, 8)    // Tercera fila: 3 carpetas
    ];

    pyramidRows.forEach((rowTools) => {
        // Crear contenedor de fila
        const row = document.createElement('div');
        row.className = 'flex justify-center gap-4 md:gap-6 w-full';

        rowTools.forEach((tool) => {
            const isLocked = tool.id === 'locked';
            const folderColor = colorHexMap[tool.color] || '#e4e4e7';

            const wrapper = document.createElement('div');
            wrapper.className = `folder-card ${isLocked ? 'locked' : ''}`;
            wrapper.style.setProperty('--folder-color', folderColor);

            if (!isLocked) {
                wrapper.onclick = () => launchTool(tool.id);
            }

            wrapper.innerHTML = `
                <div class="folder-tab"></div>
                <div class="folder-body">
                    <div class="folder-content">
                        <div class="folder-stack">
                            <div class="folder-stack-card"></div>
                            <div class="folder-stack-card"></div>
                            <div class="folder-stack-card"></div>
                            <div class="folder-main-icon">
                                <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                                    ${ICONS[tool.icon]}
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div class="folder-bar">
                        <span class="folder-label">${tool.name}</span>
                    </div>
                </div>
            `;

            row.appendChild(wrapper);
        });

        grid.appendChild(row);
    });

    if (user.user_metadata?.avatar_url) {
        document.getElementById('user-avatar').src = user.user_metadata.avatar_url;
    }
}

// ... (RESTO DE FUNCIONES IGUAL: launchTool, init, auth...)
// Asegúrate de copiar el resto del script previo (Auth, LaunchTool, etc) aquí abajo.
// Si necesitas que te lo escriba completo otra vez dímelo, pero solo cambió renderDashboard.

// LÓGICA DE LANZAMIENTO
function launchTool(toolId) {
    const tool = ZYLOX_CONFIG.tools.find(t => t.id === toolId);
    if (!tool) return;

    const stage = document.getElementById('stage-container');
    const title = document.getElementById('stage-title');
    const iframe = document.getElementById('stage-frame');
    const loader = document.getElementById('stage-loader');

    stage.classList.remove('hidden');
    title.innerText = tool.name;

    // Estilo del título
    title.className = `font-black text-xl tracking-tighter uppercase italic pr-4 border-r-4 ${tool.color === 'white' ? 'text-white border-white' : `text-${tool.color} border-${tool.color}`}`;

    iframe.src = 'about:blank';
    loader.classList.remove('hidden');

    const folderName = tool.file.replace('.html', '');
    const path = `/modules/${folderName}/${tool.file}`;

    iframe.src = path;

    iframe.onload = () => loader.classList.add('hidden');
}

function closeTool() {
    document.getElementById('stage-container').classList.add('hidden');
    document.getElementById('stage-frame').src = 'about:blank';
    // Reset header callbacks
    window.stageBack = null;
    window.stageModuleHome = null;
}

// Header communication functions (set by modules via iframe)
window.stageBack = null;
window.stageModuleHome = null;
window.closeTool = closeTool;

// Update stage title from module
window.updateStageTitle = (title) => {
    const el = document.getElementById('stage-title');
    if (el) el.innerText = title;
};

// Update back button visibility
window.updateStageBackVisible = (visible) => {
    const btn = document.getElementById('stage-back-btn');
    if (btn) btn.style.visibility = visible ? 'visible' : 'hidden';
};

const SUPABASE_URL = 'https://stjvnjmqezdcxsdodnfc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0anZuam1xZXpkY3hzZG9kbmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNTE5NTUsImV4cCI6MjA3OTkyNzk1NX0.nh111C74tbdSreSdn7sRQlI8PPNnOCpod-Y1nD3210o';
const ALLOWED_UIDS = ["9d2bca2f-eec2-49ef-b843-6691a0d3ed2d", "a8f3681d-ab81-44d5-9a18-f365092d5714", "c4a011c5-d8af-47ab-bc2f-f245b3cf6462"];

window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function init() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session?.user) checkAccess(session.user);
    else document.getElementById('login-overlay').classList.remove('hidden');

    supabaseClient.auth.onAuthStateChange((_event, session) => {
        if (session?.user) checkAccess(session.user);
        else document.getElementById('login-overlay').classList.remove('hidden');
    });
}

function checkAccess(user) {
    if (!ALLOWED_UIDS.includes(user.id)) {
        document.getElementById('access-denied').classList.remove('hidden');
        return;
    }
    document.getElementById('login-overlay').classList.add('hidden');
    document.getElementById('main-dashboard').classList.remove('hidden');
    renderDashboard(user);
}

window.loginWithGoogle = async () => {
    await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
    });
};

window.logout = async () => {
    await supabaseClient.auth.signOut();
    window.location.reload();
};

document.addEventListener('DOMContentLoaded', init);