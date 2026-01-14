tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            colors: { zinc: { 900: '#101012', 950: '#050505' }, error: '#7f1d1d' },
            animation: { 'float': 'float 6s ease-in-out infinite', 'fade-in-up': 'fadeInUp 0.5s ease-out forwards' },
            keyframes: {
                float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
                fadeInUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } }
            }
        }
    }
}

// 2. CONFIGURACIÓN SUPABASE
const SUPABASE_URL = 'https://stjvnjmqezdcxsdodnfc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0anZuam1xZXpkY3hzZG9kbmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNTE5NTUsImV4cCI6MjA3OTkyNzk1NX0.nh111C74tbdSreSdn7sRQlI8PPNnOCpod-Y1nD3210o';

const ALLOWED_UIDS = [
    "9d2bca2f-eec2-49ef-b843-6691a0d3ed2d",
    "a8f3681d-ab81-44d5-9a18-f365092d5714",
    "c4a011c5-d8af-47ab-bc2f-f245b3cf6462"
];

window.supabaseClient = null;

// Flags de estado
let accessDeniedActive = false;
let validationComplete = false;

// 3. INICIALIZACIÓN
window.initZylox = function () {
    console.log("🔋 Arrancando Sistema...");

    if (typeof window.supabase !== 'undefined') {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log("✅ Cliente Supabase Listo");

        // Configurar listener de cambios de autenticación PRIMERO
        setupAuthListener();

        // Luego verificar sesión existente
        setTimeout(checkSession, 500);
    } else {
        alert("CRITICAL ERROR: No se pudo cargar Supabase. Revisa tu conexión.");
    }
};

// Listener para cambios de autenticación (crítico para OAuth callbacks)
function setupAuthListener() {
    window.supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log("🔔 Auth Event:", event);

        // Si acceso denegado está activo, ignorar TODOS los eventos
        if (accessDeniedActive) {
            console.log("🛑 Evento ignorado - Acceso denegado activo");
            return;
        }

        if (event === 'SIGNED_IN' && session?.user) {
            console.log("🎉 SIGNED_IN detectado via onAuthStateChange");
            validateAccess(session.user);
        } else if (event === 'SIGNED_OUT') {
            console.log("👋 Usuario cerró sesión");
            showLoginScreen();
        } else if (event === 'TOKEN_REFRESHED') {
            console.log("🔄 Token refrescado");
        }
    });
}

function showLoginScreen() {
    // NUNCA mostrar login si acceso denegado está activo
    if (accessDeniedActive) {
        console.log("🛑 showLoginScreen bloqueado - Acceso denegado activo");
        return;
    }
    document.getElementById('login-overlay').classList.remove('hidden', 'opacity-0');
    document.getElementById('main-dashboard').classList.add('hidden');
    document.getElementById('access-denied').classList.add('hidden');
}

// 4. SESIÓN
async function checkSession() {
    // Si ya se procesó validación, no ejecutar de nuevo
    if (validationComplete || accessDeniedActive) {
        console.log("🛑 checkSession bloqueado - validación ya completa");
        return;
    }

    try {
        const { data: { session }, error: sessionError } = await window.supabaseClient.auth.getSession();

        if (sessionError) {
            console.error("Error obteniendo sesión:", sessionError);
        }

        if (session?.user) {
            console.log("📍 Sesión existente encontrada");
            validateAccess(session.user);
        } else {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            if (user) {
                console.log("📍 Usuario encontrado via getUser");
                validateAccess(user);
            } else {
                console.log("🔒 Estado: Esperando Login");
                showLoginScreen();
            }
        }
    } catch (e) {
        console.error("Error sesión:", e);
        showLoginScreen();
    }
}

function validateAccess(user) {
    // Evitar validaciones duplicadas
    if (validationComplete || accessDeniedActive) {
        console.log("🛑 validateAccess bloqueado - ya procesado");
        return;
    }
    validationComplete = true;

    console.log("👤 Usuario detectado:", user.email);
    console.log("🔑 TU UID ES:", user.id);

    // Si la lista tiene gente y tú no estás -> FUERA
    if (ALLOWED_UIDS.length > 0 && !ALLOWED_UIDS.includes(user.id)) {
        showAccessDenied(user.email, user.id);
        // NO hacer signOut inmediatamente, dejar que la pantalla se muestre primero
        setTimeout(() => {
            window.supabaseClient.auth.signOut();
        }, 100);
        return;
    }

    initDashboard(user);
}

// 🚧 FUNCIÓN DE LOGIN DIAGNÓSTICA 🚧
async function loginWithGoogle() {
    console.log("🖱️ Botón presionado");
    const btn = document.getElementById('login-btn-text');
    if (btn) btn.innerText = "Conectando...";

    if (!window.supabaseClient) {
        alert("Error: El sistema no terminó de cargar. Recarga la página (F5).");
        return;
    }

    try {
        console.log("📡 Enviando solicitud a Google...");
        // Intentamos redirigir
        // Usar solo el origin para evitar problemas con caracteres especiales en la URL
        const redirectUrl = window.location.origin;
        console.log("🔗 Redirect URL:", redirectUrl);

        const { error } = await window.supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: redirectUrl }
        });

        if (error) throw error;

        // Si no hay error, la página debería empezar a recargarse hacia Google en breve.

    } catch (error) {
        console.error("Login Fallido:", error);
        alert("Error de Login: " + error.message);
        if (btn) btn.innerText = "Reintentar";
    }
}

async function logout() {
    await window.supabaseClient.auth.signOut();
    window.location.reload();
}

// 5. UI MANAGERS
function initDashboard(user) {
    document.getElementById('login-overlay').classList.add('hidden');
    document.getElementById('access-denied').classList.add('hidden');

    const main = document.getElementById('main-dashboard');
    main.classList.remove('hidden');
    setTimeout(() => main.classList.remove('opacity-0'), 100);

    document.getElementById('user-email-display').innerText = user.email;
    if (user.user_metadata.avatar_url) {
        document.getElementById('user-avatar-img').src = user.user_metadata.avatar_url;
    }
}

function showAccessDenied(email, uid) {
    // Activar flag para que SIGNED_OUT no muestre login
    accessDeniedActive = true;

    document.getElementById('login-overlay').classList.add('hidden');
    document.getElementById('main-dashboard').classList.add('hidden');

    document.getElementById('access-denied').classList.remove('hidden');
    document.getElementById('denied-email').innerText = email;
    document.getElementById('denied-uid').innerText = uid;
}

function openTool(name) {
    document.getElementById('tool-view').classList.remove('hidden');
    const title = name === 'calculator' ? "CALCULADORA 3D" : "EXTRACTOR IA";
    document.getElementById('tool-title').innerText = title;
    document.getElementById('iframe-container').innerHTML = `<iframe src="/modules/${name}/index.html" class="w-full h-full border-0"></iframe>`;
}

function closeTool() {
    document.getElementById('tool-view').classList.add('hidden');
    document.getElementById('iframe-container').innerHTML = '';
}

// Arrancar
document.addEventListener('DOMContentLoaded', window.initZylox);