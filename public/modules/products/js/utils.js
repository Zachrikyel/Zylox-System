// --- 0. CORE CONNECTION ---
const getSupabase = () => {
    if (window.parent && window.parent.supabaseClient) {
        const parentClient = window.parent.supabaseClient;
        if (typeof parentClient.from === 'function') return parentClient;
        if (parentClient.client && typeof parentClient.client.from === 'function') return parentClient.client;
    }
    if (window.supabaseClient && typeof window.supabaseClient.from === 'function') return window.supabaseClient;
    console.error("🚨 ZYLOX CORE DISCONNECTED");
    return null;
};

// --- 1. HELPERS VISUALES ---
window.extractDriveId = (input) => {
    if (!input) return '';
    const match = input.match(/\/d\/([a-zA-Z0-9_-]+)/) || input.match(/id=([a-zA-Z0-9_-]+)/);
    // Si ya es un ID limpio (sin url), retornarlo
    if (!match && input.length > 20 && !input.includes('/')) return input;
    return match ? match[1] : input;
};

window.getDriveImageUrl = (id) => {
    if (!id) return null;
    return `/api/drive-proxy?id=${id}`;
};

const formatForDb = (input) => {
    const id = window.extractDriveId(input);
    if (!id) return '';
    return `/api/drive-proxy?id=${id}`;
};

window.parseLocalFloat = (val) => {
    if (!val) return 0;
    let clean = val.toString();
    if (clean.includes(',') && clean.includes('.')) {
        clean = clean.replace(/\./g, '').replace(',', '.');
    } else {
        clean = clean.replace(',', '.');
    }
    return parseFloat(clean) || 0;
};

// --- 2. FETCHERS BASE (Configuración) ---
window.fetchPackagingOptions = async () => {
    const supabase = getSupabase();
    if (!supabase) return [];
    try {
        const { data: allMaterials, error } = await supabase.from('materials').select('id, name, parent_id, sku');
        if (error) throw error;
        if (!allMaterials) return [];
        const rootNode = allMaterials.find(m => m.name.toLowerCase().includes('embalaje') && !m.parent_id);
        if (!rootNode) return [];
        const getDescendants = (parentId, dataset) => {
            let children = dataset.filter(item => item.parent_id === parentId);
            let descendants = [...children];
            children.forEach(child => { descendants = [...descendants, ...getDescendants(child.id, dataset)]; });
            return descendants;
        };
        return getDescendants(rootNode.id, allMaterials).sort((a, b) => a.name.localeCompare(b.name));
    } catch (e) { console.error(e); return []; }
};

window.fetchCategories = async () => {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data, error } = await supabase.from('categories').select('id, name, parent_id').order('parent_id', { ascending: true }).order('name', { ascending: true });
    if (error) return [];
    const parents = data.filter(c => !c.parent_id);
    const children = data.filter(c => c.parent_id);
    let options = [];
    parents.forEach(p => {
        options.push({ id: p.id, name: p.name, type: 'parent' });
        children.filter(c => c.parent_id === p.id).forEach(child => { options.push({ id: child.id, name: `${p.name} > ${child.name}`, type: 'child' }); });
    });
    return options;
};

window.fetchOrphanQuotes = async () => {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data } = await supabase
        .from('sicma_quotes')
        .select('id, quote_name, results, config, print_data, created_at')
        .is('product_id', null)
        .not('quote_name', 'is', null)
        .not('results', 'is', null)
        .order('created_at', { ascending: true });
    // Filter out quotes with empty/undefined names or zero finalPrice on client side
    return (data || []).filter(q => 
        q.quote_name && q.quote_name.trim() !== '' && 
        q.quote_name !== 'undefined' &&
        q.results?.finalPrice > 0
    );
};

window.fetchProductsSimple = async () => {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('products')
        .select('id, name, sku')
        .is('pack_type', null)
        .order('name', { ascending: true });
    if (error) return [];
    return data;
};

// --- 3. CREATORS (Master & Variants) ---
window.createProduct = async (formData, linkedQuoteId = null) => {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Sin conexión al Núcleo");

    const regular = window.parseLocalFloat(formData.regularPrice);
    const discount = window.parseLocalFloat(formData.discount);
    let salePrice = regular;
    let compareAt = null;
    if (discount > 0) {
        salePrice = regular * (1 - (discount / 100));
        compareAt = regular;
    }

    const stock = parseInt(formData.stock) || 0;
    const timeMinutes = Math.round(window.parseLocalFloat(formData.printTime) * 60);
    const weightKg = window.parseLocalFloat(formData.weight) / 1000;

    const payload = {
        name: formData.name,
        sku: formData.sku,
        stock_quantity: stock,
        category_id: formData.categoryId,
        legend: formData.legend,
        description: formData.description,
        card_front_url: formatForDb(formData.imgFront),
        card_back_url: formatForDb(formData.imgBack),
        card_middle_url: formatForDb(formData.imgMiddle),
        base_price: window.parseLocalFloat(formData.basePrice),
        sale_price: salePrice,
        compare_at_price: compareAt,
        profit_margin: window.parseLocalFloat(formData.margin),
        display_order: parseInt(formData.displayOrder) || 0,
        is_published: formData.isPublished,
        is_trending: formData.isTrending,
        print_time_minutes: timeMinutes,
        specific_kwh_cost: window.parseLocalFloat(formData.kwhCost),
        specific_wear_cost: window.parseLocalFloat(formData.wearCost),
        dimensions_cm: formData.packDims,
        material_weight_kg: weightKg,
        slug: slugify(`${formData.name}-${formData.sku}`),
        is_free_shipping: formData.isFreeShipping || false,
        packaging_material_id: formData.packagingId || null,
        is_stock_item: formData.isStockItem !== false,
    };

    const { data, error } = await supabase.from('products').insert([payload]).select().single();
    if (error) {
        if (error.code === '42501') throw new Error("Permiso denegado (RLS).");
        throw error;
    }

    // Receta de colores (product_bom): uno por cada color capturado en la cotización importada.
    // El primero (índice 0) queda como obligatorio, el resto opcional — mismo orden en que se
    // capturaron en el Paso 2 de la calculadora.
    const colorSlots = formData.importedColorSlots || [];
    if (colorSlots.length > 0 && data.id) {
        const bomRows = colorSlots.map((slot, i) => ({
            product_id: data.id,
            material_id: slot.materialId,
            quantity_required: slot.grams,
            is_required: i === 0,
            display_order: i + 1,
        }));
        const { error: bomError } = await supabase.from('product_bom').insert(bomRows);
        if (bomError) console.error('❌ Error creando receta de materiales (product_bom):', bomError);
    }

    if (linkedQuoteId && data.id) {
        await supabase.from('sicma_quotes').update({ product_id: data.id }).eq('id', linkedQuoteId);
    }
    return data;
};

window.createVariant = async (variantData) => {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Sin conexión al Núcleo");

    const productId = parseInt(variantData.productId);
    const colorName = variantData.colorName;
    const hexCode = variantData.hexCode;

    const images = [variantData.img1, variantData.img2, variantData.img3, variantData.img4]
        .filter(img => img && img.trim() !== '');

    const { data: colorRecord, error: colorError } = await supabase
        .from('product_colors')
        .insert([{
            product_id: productId,
            color_name: colorName,
            hex_code: hexCode,
            price_adjustment: window.parseLocalFloat(variantData.priceAdjustment) || 0,
            display_order: 0
        }])
        .select()
        .single();

    if (colorError) throw colorError;

    if (images.length > 0) {
        const mediaPayload = images.map((imgUrl, index) => ({
            product_id: productId,
            associated_color_id: colorRecord.id,
            media_url: formatForDb(imgUrl),
            media_type: 'image',
            display_order: index
        }));

        const { error: mediaError } = await supabase.from('product_media').insert(mediaPayload);
        if (mediaError) throw new Error("Error guardando imágenes: " + mediaError.message);
    }
    return { color: colorRecord, imageCount: images.length };
};

// ==========================================
// 5. ARSENAL LOGIC (NUEVO)
// ==========================================

// A. Obtener Lista de Tarjetas
window.fetchArsenalList = async () => {
    const supabase = getSupabase();
    if (!supabase) return [];

    // Agregamos más campos para el render de la lista
    const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, stock_quantity, sale_price, display_order, card_middle_url, is_published, is_trending, is_free_shipping')
        .order('display_order', { ascending: true });

    if (error) { console.error("Error Arsenal:", error); return []; }
    return data;
};

// B. Obtener Detalle Profundo (Inspector)
window.fetchProductDetails = async (id) => {
    const supabase = getSupabase();
    if (!supabase) return null;

    // Traemos producto y sus hijos (colores y media)
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            product_colors (
                id, color_name, hex_code, display_order, price_adjustment
            ),
            product_media (
                id, media_url, display_order, associated_color_id
            )
        `)
        .eq('id', id)
        .single();

    if (error) {
        console.error("Error Detail:", error);
        return null;
    }
    return data;
};

/// C. Actualizar Maestro 
window.updateProductMaster = async (id, rawData) => {
    const supabase = getSupabase();

    // 1. Obtener valores limpios de la UI
    const regular = window.parseLocalFloat(rawData.regularPrice);
    const discount = window.parseLocalFloat(rawData.discount);

    // 2. Calcular Lógica Shopify (Sale vs Compare)
    let finalSalePrice = regular;
    let finalCompareAt = null;

    if (discount > 0) {
        // Tiene descuento: El precio de venta baja, el compare es el regular
        finalSalePrice = regular * (1 - (discount / 100));
        finalCompareAt = regular;
    } else {
        // No tiene descuento: El precio de venta es el regular, compare es null
        finalSalePrice = regular;
        finalCompareAt = null;
    }

    // 3. Construir Payload (SOLO COLUMNAS REALES)
    const payload = {
        name: rawData.name,
        sku: rawData.sku,
        stock_quantity: parseInt(rawData.stock) || 0,
        category_id: rawData.categoryId,
        legend: rawData.legend,
        description: rawData.description,

        // Imágenes
        card_front_url: formatForDb(rawData.imgFront),
        card_back_url: formatForDb(rawData.imgBack),
        card_middle_url: formatForDb(rawData.imgMiddle),

        // Finanzas
        base_price: window.parseLocalFloat(rawData.basePrice),
        sale_price: finalSalePrice,       // Calculado
        compare_at_price: finalCompareAt, // Calculado (o null)
        profit_margin: window.parseLocalFloat(rawData.margin),

        // Control
        is_published: rawData.isPublished,
        is_trending: rawData.isTrending,
        is_free_shipping: rawData.isFreeShipping || false,
        display_order: parseInt(rawData.displayOrder)
    };

    // NOTA: No enviamos 'discount_percentage' porque no existe en la tabla.

    const { error } = await supabase.from('products').update(payload).eq('id', id);
    if (error) throw error;
    return true;
};

// D. Eliminar Producto (Nuclear)
window.deleteProduct = async (id) => {
    const supabase = getSupabase();
    // Asumiendo CASCADE en la DB, esto borra todo.
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    return true;
};

// E. Eliminar Variante (Surgical)
window.deleteVariant = async (colorId) => {
    const supabase = getSupabase();
    const { error } = await supabase.from('product_colors').delete().eq('id', colorId);
    if (error) throw error;
    return true;
};

// F. Actualización Completa de Variante (Color + Fotos con Wipe & Replace)
window.updateVariantFull = async (variantId, parentProductId, name, hex, images, priceAdjustment = 0) => {
    const supabase = getSupabase();

    // 1. Actualizar Datos del Color
    const { error: colorError } = await supabase
        .from('product_colors')
        .update({ color_name: name, hex_code: hex, price_adjustment: priceAdjustment })
        .eq('id', variantId);

    if (colorError) throw colorError;

    // 2. Transacción de Imágenes (Wipe & Replace)
    // A. Borrar TODAS las fotos de esta variante
    const { error: deleteError } = await supabase
        .from('product_media')
        .delete()
        .eq('associated_color_id', variantId);

    if (deleteError) throw deleteError;

    // B. Insertar las nuevas (si hay)
    const validImages = images.filter(img => img && img.trim() !== '');

    if (validImages.length > 0) {
        const mediaPayload = validImages.map((imgUrl, index) => ({
            product_id: parentProductId,
            associated_color_id: variantId,
            media_url: formatForDb(imgUrl),
            media_type: 'image',
            display_order: index
        }));

        const { error: insertError } = await supabase
            .from('product_media')
            .insert(mediaPayload);

        if (insertError) throw new Error("Error actualizando fotos: " + insertError.message);
    }

    return true;
};

// --- G. Sincronización desde Cotización ---
window.fetchLinkedQuote = async (productId) => {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase
        .from('sicma_quotes')
        .select('id, quote_name, results, config, print_data, is_free_shipping')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
    if (error) { console.warn('No linked quote found:', error.message); return null; }
    return data;
};

window.syncProductFromQuote = async (productId) => {
    const quote = await window.fetchLinkedQuote(productId);
    if (!quote) return { success: false, reason: 'no_quote' };

    const newBasePrice = Math.round(quote.results?.finalPrice || 0);
    const newMargin = Math.round(quote.results?.netProfit || 0);

    const supabase = getSupabase();
    if (!supabase) return { success: false, reason: 'no_connection' };

    const { error } = await supabase
        .from('products')
        .update({
            base_price: newBasePrice,
            profit_margin: newMargin
        })
        .eq('id', productId);

    if (error) return { success: false, reason: error.message };
    return { success: true, newBasePrice, newMargin, quoteName: quote.quote_name };
};

// --- EXTRAS ---
function slugify(text) {
    return text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}

window.loadProductStats = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    try {
        const { count: totalCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
        const { count: trendingCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_trending', true);
        const elTotal = document.getElementById('stats-total');
        const elTrend = document.getElementById('stats-trending');
        if (elTotal) elTotal.innerText = totalCount || 0;
        if (elTrend) elTrend.innerText = trendingCount || 0;
    } catch (e) { console.error(e); }
};