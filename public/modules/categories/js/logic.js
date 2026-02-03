/* public/modules/categories/js/logic.js */

window.catState = {
    path: [{ id: null, name: 'CATEGORÍAS', slug: 'root' }],
    items: [],
    loading: false
};

// --- 1. CARGA DE DATOS ---
window.loadCategories = async function () {
    const root = document.getElementById('root');
    const ctx = window.getCurrentContext();
    const isRoot = window.catState.path.length === 1;

    // Loader Color
    const loaderColor = isRoot ? '#B026FF' : '#39FF14';

    if (!window.catState.items.length) {
        root.innerHTML = `<div class="flex h-full items-center justify-center"><i class="fas fa-circle-notch fa-spin text-3xl" style="color: ${loaderColor}"></i></div>`;
    }

    try {
        let query = window.supabase
            .from('categories')
            .select('*, children:categories!parent_id(count), products:products!category_id(count)')
            .order('display_order', { ascending: true })
            .order('name');

        if (ctx.id === null) {
            query = query.is('parent_id', null);
        } else {
            query = query.eq('parent_id', ctx.id);
        }

        const { data, error } = await query;
        if (error) throw error;

        window.catState.items = data || [];
        window.renderUI();

    } catch (e) {
        console.error("Zylox Error:", e);
        root.innerHTML = `<div class="p-10 text-center text-red-500 font-mono">ERROR: ${e.message}</div>`;
    }
};

window.renderUI = function () {
    const root = document.getElementById('root');
    if (window.Components && window.Components.CategoryList) {
        root.innerHTML = window.Components.CategoryList(
            window.catState.path,
            window.catState.items
        );
    }
};

// --- 2. NAVEGACIÓN ---
window.navigateDown = (id) => {
    // 🔥 BLOQUEO DE PROFUNDIDAD: Si ya estamos dentro de un padre (nivel 2), no bajamos más.
    if (window.catState.path.length >= 2) return;

    const item = window.catState.items.find(i => i.id === id);
    if (!item) return;

    window.catState.path.push({
        id: item.id,
        name: item.name,
        slug: item.slug
    });
    window.loadCategories();
};

window.jumpToStep = (index) => {
    if (index < window.catState.path.length - 1) {
        window.catState.path = window.catState.path.slice(0, index + 1);
        window.loadCategories();
    }
};

window.getCurrentContext = () => window.catState.path[window.catState.path.length - 1];

// --- 3. CREACIÓN ---
window.generateSlug = (val) => {
    const slug = val.toLowerCase().trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    document.getElementById('input_slug').value = slug;
};

window.openCreationModal = () => {
    const isRoot = window.catState.path.length === 1;
    const themeColor = isRoot ? '#B026FF' : '#39FF14';

    // Ajustar estilos del modal
    document.getElementById('modal-sheet-border').style.borderColor = themeColor;
    const btn = document.querySelector('#create-modal .btn-full');
    if (btn) btn.style.backgroundColor = themeColor;

    // Labels
    const labels = document.querySelectorAll('#create-modal label, #create-modal h3 span');
    labels.forEach(l => l.style.color = themeColor);

    const iconLink = document.querySelector('#create-modal .fa-link');
    if (iconLink) iconLink.style.color = themeColor;

    const ctx = window.getCurrentContext();
    document.getElementById('modal-context-path').innerText = window.catState.path.map(p => p.name).join(' > ');
    document.getElementById('input_name').value = '';
    document.getElementById('input_slug').value = '';

    document.getElementById('create-modal').classList.remove('hidden');
    setTimeout(() => document.getElementById('input_name').focus(), 100);
};

window.submitCreation = async () => {
    const name = document.getElementById('input_name').value;
    const slug = document.getElementById('input_slug').value;
    const ctx = window.getCurrentContext();

    if (!name || !slug) return alert("Datos incompletos");

    try {
        const payload = {
            name: name,
            slug: slug,
            parent_id: ctx.id,
            display_order: 0
        };

        const { error } = await window.supabase.from('categories').insert([payload]);
        if (error) throw error;

        window.closeModal();
        await window.loadCategories();

    } catch (e) {
        alert("Error: " + e.message);
    }
};

// --- 4. EDICIÓN ---
window.gestureStart = (id, e) => {
    window.pressTimer = setTimeout(() => {
        window.isLongPress = true;
        window.openEditModal(id);
    }, 600);
};

window.gestureEnd = (id, e) => {
    clearTimeout(window.pressTimer);
    if (window.isLongPress) {
        window.isLongPress = false;
        return;
    }
    window.navigateDown(id);
};

window.openEditModal = (id) => {
    const item = window.catState.items.find(i => i.id === id);
    if (!item) return;

    const isRoot = window.catState.path.length === 1;
    const themeColor = isRoot ? '#B026FF' : '#39FF14';

    document.getElementById('edit_id').value = id;
    document.getElementById('edit_name_input').value = item.name;

    // Estilos Modal Edit
    document.getElementById('edit-sheet-border').style.borderColor = themeColor;
    document.getElementById('btn-save-edit').style.backgroundColor = themeColor;

    document.getElementById('edit-modal').classList.remove('hidden');
};

window.submitEdit = async () => {
    const id = document.getElementById('edit_id').value;
    const newName = document.getElementById('edit_name_input').value;

    try {
        const { error } = await window.supabase
            .from('categories')
            .update({ name: newName })
            .eq('id', id);

        if (error) throw error;

        document.getElementById('edit-modal').classList.add('hidden');
        window.loadCategories();
    } catch (e) {
        alert("Error al editar: " + e.message);
    }
};

window.deleteCategory = async () => {
    if (!confirm("⚠️ ¿ELIMINAR?")) return;
    const id = document.getElementById('edit_id').value;
    const { error } = await window.supabase.from('categories').delete().eq('id', id);
    if (error) alert("Error: " + error.message);
    else {
        document.getElementById('edit-modal').classList.add('hidden');
        window.loadCategories();
    }
};