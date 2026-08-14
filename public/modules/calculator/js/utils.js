/**
 * ============================================
 * SICMA CALCULATOR - UTILIDADES
 * Formatters + Calculations + Storage
 * ============================================
 */

// Obtener el cliente de Supabase - PRIORIZA EL PARENT FRAME (Zylox Shell)
const getSupabase = () => {
  // 1. Intentar desde el parent frame (herencia del shell principal)
  if (window.parent && window.parent.supabaseClient) {
    const parentClient = window.parent.supabaseClient;
    // El parent puede exponer el cliente directamente o como {client: ...}
    if (typeof parentClient.from === 'function') return parentClient;
    if (parentClient.client && typeof parentClient.client.from === 'function') return parentClient.client;
  }
  // 2. Fallback al cliente local (config.js)
  if (window.supabaseClient) {
    if (typeof window.supabaseClient.from === 'function') return window.supabaseClient;
    if (window.supabaseClient.client && typeof window.supabaseClient.client.from === 'function') return window.supabaseClient.client;
  }
  console.error("🚨 SUPABASE DISCONNECTED - No hay cliente disponible");
  return null;
};

// Acceder a las constantes directamente desde window
const getConstants = () => window.SICMA_CONSTANTS;

// ============================================
// FORMATTERS
// ============================================

function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '0';
  return Math.round(amount).toLocaleString('es-CO');
}

function formatCurrencyWithSymbol(amount) {
  return `$${formatCurrency(amount)}`;
}

function parseDecimalHours(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return { hours: h, minutes: m };
}

/**
 * Parsea input de tiempo flexible: acepta horas decimales (36.85)
 * o formato duración como "1d 12h 51m", "12h 51m", "51m", etc.
 * Retorna horas decimales.
 */
function parseTimeInput(val) {
  if (typeof val !== 'string') val = String(val);
  val = val.trim().toLowerCase();
  if (!val) return 0;
  // Si contiene letras d/h/m, parsear como duración
  if (/[dhm]/.test(val)) {
    const dMatch = val.match(/(\d+(?:\.\d+)?)\s*d/);
    const hMatch = val.match(/(\d+(?:\.\d+)?)\s*h/);
    const mMatch = val.match(/(\d+(?:\.\d+)?)\s*m/);
    const days = dMatch ? parseFloat(dMatch[1]) : 0;
    const hours = hMatch ? parseFloat(hMatch[1]) : 0;
    const minutes = mMatch ? parseFloat(mMatch[1]) : 0;
    return (days * 24) + hours + (minutes / 60);
  }
  // Fallback: tratar como horas decimales
  return parseFloat(val) || 0;
}

function formatHours(hours) {
  const { hours: h, minutes: m } = parseDecimalHours(hours);
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDateShort(date) {
  const d = new Date(date);
  return d.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

window.Formatters = {
  formatCurrency,
  formatCurrencyWithSymbol,
  parseDecimalHours,
  parseTimeInput,
  formatHours,
  formatDate,
  formatDateShort
};

// ============================================
// CALCULATIONS
// ============================================

function calculateQuote(params) {
  const { config, print, labor, logistics, pricing } = params;
  const { PRINTERS, NOZZLES, MATERIALS, SHIPPING_OPTIONS, PACKAGING, PACKAGING_BAG, COMPLEXITY_LEVELS, GATEWAYS, SYSTEM_CONFIG } = getConstants();

  const printer = PRINTERS.find(p => p.id === config.printer);
  const material = MATERIALS.find(m => m.id === config.material);
  const nozzle = NOZZLES.find(n => n.size === config.nozzle);
  const shipping = SHIPPING_OPTIONS.find(s => s.id === logistics.shipping);
  const complexityLevel = COMPLEXITY_LEVELS[labor.complexity];
  const gateway = GATEWAYS.find(g => g.id === pricing.gateway);

  // Costo de envío real: 'urgente' usa el monto manual (Uber/mensajería del momento), el resto usa la tabla
  const shippingCost = logistics.shipping === 'urgente' ? (logistics.shippingCustom || 0) : shipping.cost;

  // Tiempo de ocupación
  const totalPrintHours = print.printHours;
  const coolMinutes = print.coolMinutes || material.coolMinutes;
  const plateMultiplier = print.isPiece === 'multi' ? (Number(print.plateCount) || 1) : 1;
  const totalCoolMinutes = coolMinutes * plateMultiplier;
  const totalCoolHours = totalCoolMinutes / 60;
  const totalOccupancyHours = totalPrintHours + totalCoolHours;

  // Costos duros (energía + desgaste de máquina), a valor base — van a Costos Operativos, no a Materia Prima
  let costEnergy = ((printer.watts * totalPrintHours) + (printer.watts * 0.1 * totalCoolHours)) / 1000 * config.kwhPrice;
  if (config.fanToggle) costEnergy += SYSTEM_CONFIG.FAN_COST;
  const costWear = printer.wear * totalOccupancyHours;

  // Reposición de Materia Prima — material a valor base (sin margen de error todavía)
  let costMaterial = print.materialCost; // PLA/PETG/etc, dinámico según gramos
  costMaterial *= nozzle.riskFactor;
  if (config.amsMode) {
    costMaterial *= material.amsRisk;
  }
  if (print.supportsAmount === 'few') costMaterial *= (1 + SYSTEM_CONFIG.SUPPORTS_AMOUNT_FEW_RATE);
  if (print.supportsAmount === 'many') costMaterial *= (1 + SYSTEM_CONFIG.SUPPORTS_AMOUNT_MANY_RATE);

  // Margen de error (v14.3): prima independiente sobre la base COMPLETA de Pasos 1+2, no infla cada línea por dentro.
  // step12Base = material + energía + desgaste ; failureRiskPremium = step12Base × failureRisk
  let effectiveFailureRisk = complexityLevel.failureRisk;
  if (print.supportsFragility === 'some') effectiveFailureRisk += SYSTEM_CONFIG.SUPPORTS_FRAGILITY_SOME_RATE;
  if (print.supportsFragility === 'all') effectiveFailureRisk += SYSTEM_CONFIG.SUPPORTS_FRAGILITY_ALL_RATE;
  const step12Base = costMaterial + costEnergy + costWear;
  const failureRiskPremium = step12Base * effectiveFailureRisk;

  let costSupplies = 0;
  if (labor.primerToggle) costSupplies += SYSTEM_CONFIG.PRIMER_COST;
  if (labor.lacquerToggle) costSupplies += SYSTEM_CONFIG.LACQUER_COST;
  if (labor.sandingToggle) costSupplies += SYSTEM_CONFIG.SANDING_COST;
  if (labor.paintToggle) costSupplies += SYSTEM_CONFIG.PAINT_COST;
  if (logistics.additionalsToggle) costSupplies += SYSTEM_CONFIG.EXTRAS_FLAT_COST;
  if (labor.brushToggle) costSupplies += SYSTEM_CONFIG.BRUSH_COST;
  if (labor.superglueToggle) costSupplies += SYSTEM_CONFIG.SUPERGLUE_COST;
  const suppliesBeforeOtherRate = costSupplies;
  if (labor.otherSuppliesToggle) costSupplies *= (1 + SYSTEM_CONFIG.OTHER_SUPPLIES_RATE);
  const otherSuppliesExtra = costSupplies - suppliesBeforeOtherRate; // el peso real que agrega el +5%
  const materiaPrima = costMaterial + costSupplies;

  // Mano de obra (tiempo real de post-proceso/operador) — va a Costos Operativos, es tu pago por hora, no reposición.
  // Ya NO lleva el margen de error (ver nota arriba) — solo el riesgo extra de AMS, que es un tema aparte.
  const postProcessHours = complexityLevel.postProcessMinutes / 60;
  const operatorHours = complexityLevel.operatorMinutes / 60;
  const totalLaborHours = postProcessHours + operatorHours;
  let costLabor = totalLaborHours * SYSTEM_CONFIG.HOURLY_LABOR_RATE;
  costLabor += complexityLevel.suppliesCost; // queda en 0 en todos los niveles, ver config.js
  if (config.amsMode) {
    costLabor *= (1 + SYSTEM_CONFIG.AMS_ADDITIONAL_RISK);
  }

  const hardCosts = costEnergy + costWear; // valores base, sin margen de error
  const softCosts = costLabor;
  const costOperativo = hardCosts + softCosts + failureRiskPremium; // energía + desgaste + mano de obra + prima de riesgo (comisión de pasarela se suma más abajo)

  // Reposición de Otros: empaque (caja o bolsa según tipo) + materiales de embalaje sueltos.
  // packagingCost ya viene resuelto desde el Paso 4 (precio real de tu inventario, o el monto
  // personalizado si elegiste esa opción) — no se vuelve a buscar aquí.
  let packagingCost = logistics.packagingCost || 0;
  let packagingExtras = 0;
  if (logistics.evaToggle) packagingExtras += SYSTEM_CONFIG.EVA_COST;
  if (logistics.vinylToggle) packagingExtras += SYSTEM_CONFIG.VINYL_COST;
  if (logistics.plikeToggle) packagingExtras += SYSTEM_CONFIG.PLIKE_COST;
  if (logistics.bubbleToggle) packagingExtras += SYSTEM_CONFIG.BUBBLE_COST;
  if (logistics.glueToggle) packagingExtras += SYSTEM_CONFIG.GLUE_COST;
  if (logistics.vinipelToggle) packagingExtras += SYSTEM_CONFIG.VINIPEL_COST;
  packagingCost += packagingExtras;
  const reposicionOtros = packagingCost; // envío queda aparte, es pass-through (ver logisticsCosts)
  const logisticsCosts = shippingCost + packagingCost;

  // Costo base
  const baseCostPrelim = materiaPrima + hardCosts + softCosts + logisticsCosts;
  const marginDecimal = pricing.profitMargin / 100;

  // Cargo Adicional (imanes/llaveros) — informativo: ya está incluido dentro de materiaPrima/costSupplies arriba,
  // esta variable NO se vuelve a sumar, solo sirve para mostrar el desglose en el resumen.
  const extrasCost = logistics.additionalsToggle ? SYSTEM_CONFIG.EXTRAS_FLAT_COST : 0;

  const baseCost = baseCostPrelim;

  // Precio de venta
  const sellPrice = baseCost / (1 - marginDecimal);

  // Ajuste por pasarela
  let finalPrice = 0;
  let feeEstimate = 0;

  if (gateway.id === 'wompi') {
    const wompiRate = SYSTEM_CONFIG.WOMPI_RATE * (1 + SYSTEM_CONFIG.WOMPI_IVA);
    finalPrice = sellPrice / (1 - wompiRate);
    feeEstimate = finalPrice - sellPrice;
  } else if (gateway.id === 'bold') {
    finalPrice = sellPrice / (1 - gateway.rate / 100);
    feeEstimate = finalPrice - sellPrice;
  } else {
    finalPrice = sellPrice;
    feeEstimate = 0;
  }

  finalPrice = Math.ceil(finalPrice / 100) * 100;
  const netProfit = sellPrice - baseCost;
  const totalProductionTime = totalPrintHours + totalCoolHours + totalLaborHours;

  // Cargo Personalizado: se cobra aparte, no entra a la pasarela ni al margen
  const customCharge = pricing.additionalCharge || 0;
  const totalToCharge = finalPrice + customCharge;

  // ============================================
  // LAS 4 ETIQUETAS (para mostrar al cerrar una venta)
  // Precio a Cobrar = Materia Prima + Reposición Otros + Costo Operativo + Comisión + Ganancia Real
  // Ganancia Real = lo que queda DESPUÉS de restar materia prima, otros, energía+desgaste+mano de obra
  // y comisión de pasarela. Solo se muestran 4 etiquetas: las otras 3 quedan absorbidas dentro
  // de "no es ganancia" en el resumen, no se exponen como categoría aparte.
  // ============================================
  const etiquetaPrecioACobrar = totalToCharge;
  const etiquetaMateriaPrima = materiaPrima;
  const etiquetaReposicionOtros = reposicionOtros + shippingCost; // empaque + envío (pass-through)
  const etiquetaGananciaReal = totalToCharge - etiquetaMateriaPrima - etiquetaReposicionOtros - costOperativo - feeEstimate;

  return {
    finalPrice,
    hardCosts,
    softCosts,
    logisticsCosts,
    netProfit,
    feeEstimate,
    sellPrice,
    extrasCost,
    customCharge,
    totalToCharge,
    totalProductionTime,
    totalPrintHours,
    totalCoolHours,
    totalOccupancyHours,
    materiaPrima,
    reposicionOtros,
    costOperativo,
    etiquetas: {
      precioACobrar: etiquetaPrecioACobrar,
      materiaPrima: etiquetaMateriaPrima,
      reposicionOtros: etiquetaReposicionOtros,
      gananciaReal: etiquetaGananciaReal
    },
    breakdown: {
      energy: costEnergy,
      wear: costWear,
      material: costMaterial,
      failureRiskPremium,
      supplies: costSupplies,
      suppliesDetail: {
        primer: labor.primerToggle ? SYSTEM_CONFIG.PRIMER_COST : 0,
        lacquer: labor.lacquerToggle ? SYSTEM_CONFIG.LACQUER_COST : 0,
        sanding: labor.sandingToggle ? SYSTEM_CONFIG.SANDING_COST : 0,
        paint: labor.paintToggle ? SYSTEM_CONFIG.PAINT_COST : 0,
        magnets: logistics.additionalsToggle ? SYSTEM_CONFIG.EXTRAS_FLAT_COST : 0,
        brush: labor.brushToggle ? SYSTEM_CONFIG.BRUSH_COST : 0,
        superglue: labor.superglueToggle ? SYSTEM_CONFIG.SUPERGLUE_COST : 0,
        otherRate: labor.otherSuppliesToggle ? otherSuppliesExtra : 0
      },
      labor: costLabor,
      packaging: packagingCost,
      packagingExtras,
      extras: extrasCost,
      shipping: shippingCost
    }
  };
}

function recalculateVariant(originalResults, newShipping, newPackaging, profitMargin, additionalsToggle, customCharge) {
  const { SHIPPING_OPTIONS, PACKAGING, SYSTEM_CONFIG } = getConstants();
  const shipping = SHIPPING_OPTIONS.find(s => s.id === newShipping);
  const packaging = PACKAGING.find(p => p.id === newPackaging);

  const productionCosts = originalResults.hardCosts + originalResults.softCosts;
  const newLogisticsCosts = shipping.cost + packaging.cost;
  const baseCostPrelim = productionCosts + newLogisticsCosts;

  const marginDecimal = profitMargin / 100;

  let extrasCost = 0;
  if (additionalsToggle) {
    extrasCost = SYSTEM_CONFIG.EXTRAS_FLAT_COST;
  }
  const newBaseCost = baseCostPrelim + extrasCost;
  const newSellPrice = newBaseCost / (1 - marginDecimal);

  const wompiRate = SYSTEM_CONFIG.WOMPI_RATE * (1 + SYSTEM_CONFIG.WOMPI_IVA);
  const finalPrice = Math.ceil((newSellPrice / (1 - wompiRate)) / 100) * 100;
  const feeEstimate = finalPrice - newSellPrice;
  const netProfit = newSellPrice - newBaseCost;
  const totalToCharge = finalPrice + (customCharge || 0);

  return {
    finalPrice,
    logisticsCosts: newLogisticsCosts,
    netProfit,
    feeEstimate,
    extrasCost,
    totalToCharge
  };
}

function calculatePackage(quotes, packageLogistics, profitMargin) {
  let totalHardCosts = 0;
  let totalSoftCosts = 0;
  let individualTotal = 0;

  quotes.forEach(item => {
    const quote = item.quote;
    totalHardCosts += quote.results.hardCosts;
    totalSoftCosts += quote.results.softCosts;

    if (item.variant) {
      individualTotal += item.variant.final_price;
    } else {
      individualTotal += quote.results.finalPrice;
    }
  });

  const totalProductionCosts = totalHardCosts + totalSoftCosts;

  const shipping = SHIPPING_OPTIONS.find(s => s.id === packageLogistics.shipping);
  const packaging = PACKAGING.find(p => p.id === packageLogistics.packagingSize);
  const logisticsCosts = shipping.cost + packaging.cost;
  const baseCost = totalProductionCosts + logisticsCosts;

  const marginDecimal = profitMargin / 100;
  const sellPrice = baseCost / (1 - marginDecimal);

  const wompiRate = SYSTEM_CONFIG.WOMPI_RATE * (1 + SYSTEM_CONFIG.WOMPI_IVA);
  const finalPrice = Math.ceil((sellPrice / (1 - wompiRate)) / 100) * 100;
  const feeEstimate = finalPrice - sellPrice;
  const netProfit = sellPrice - baseCost;

  const suggestions = {
    option_10: calculatePackagePriceOption(baseCost, 10),
    option_15: calculatePackagePriceOption(baseCost, 15),
    option_20: calculatePackagePriceOption(baseCost, 20)
  };

  return {
    individualTotal,
    totalProductionCosts,
    logisticsCosts,
    baseCost,
    finalPrice,
    profitMargin,
    netProfit,
    feeEstimate,
    pricingSuggestions: suggestions
  };
}

/**
 * Motor N-1 Master - Lógica de consolidación de envío para paquetes múltiples
 * 
 * Aplica la regla: Producto 1 (Master) = precio completo
 *                  Productos 2-N = precio - costo envío base
 * 
 * @param {Array} selectedQuotes - Cotizaciones seleccionadas
 * @param {Object} packageLogistics - Configuración de logística del paquete
 * @returns {Object} Resultado con ingreso base y matriz de decisión
 */
function calculatePackageN1(selectedQuotes, packageLogistics) {
  const { SHIPPING_OPTIONS, PACKAGING, SYSTEM_CONFIG, PACKAGE_CONFIG } = getConstants();

  // Costo envío configurable (default 15k, puede ser mayor)
  const baseShippingDeduction = packageLogistics.baseShippingDeduction || PACKAGE_CONFIG.DEFAULT_SHIPPING_DEDUCTION;
  const discounts = PACKAGE_CONFIG.DISCOUNT_OPTIONS;

  // === FUNCIÓN HELPER: Obtener precio de venta real ===
  // Respeta variante seleccionada (_variantOverride) si existe
  const getSalePrice = (quote) => {
    let basePrice = 0;
    // Si tiene producto vinculado con sale_price, usar ese
    if (quote.products && quote.products.sale_price) {
      basePrice = quote.products.sale_price;
    }
    // Si tiene linked_product_sale_price guardado, usar ese
    else if (quote.linked_product_sale_price) {
      basePrice = quote.linked_product_sale_price;
    }
    // Fallback: usar el precio calculado de la cotización
    else {
      basePrice = quote.results.finalPrice;
    }
    // Si tiene override de variante, sumar el price_adjustment
    if (quote._variantOverride && quote._variantOverride.priceAdjustment) {
      basePrice += quote._variantOverride.priceAdjustment;
    }
    return basePrice;
  };

  // === ORDENAR POR PRECIO DESCENDENTE (El más caro = Master) ===
  // Clonamos para no mutar el array original
  const sortedQuotes = [...selectedQuotes].sort((a, b) => getSalePrice(b) - getSalePrice(a));

  // === CÁLCULO DEL INGRESO BASE (Lógica N-1) ===
  // Producto Master (el MÁS CARO): precio de venta completo (incluye 1 envío y comisión)
  let baseIncome = getSalePrice(sortedQuotes[0]);

  // Productos adicionales: precio de venta - envío base
  for (let i = 1; i < sortedQuotes.length; i++) {
    baseIncome += getSalePrice(sortedQuotes[i]) - baseShippingDeduction;
  }

  // === COSTOS DE PRODUCCIÓN ===
  const productionCosts = selectedQuotes.reduce((sum, q) =>
    sum + q.results.hardCosts + q.results.softCosts, 0
  );

  // === LOGÍSTICA REAL ===
  // 1 envío + N empaques (NO consolidado)
  const shipping = SHIPPING_OPTIONS.find(s => s.id === packageLogistics.shipping);
  const shippingCost = shipping ? shipping.cost : 0;

  // Cada producto tiene su propio empaque
  let totalPackagingCost = 0;
  selectedQuotes.forEach((q, index) => {
    const pkgSize = q.packagingSize || packageLogistics.packagingSize;
    if (pkgSize === 'deluxe') {
      totalPackagingCost += packageLogistics.deluxePackagingCost || 0;
    } else {
      const pkg = PACKAGING.find(p => p.id === pkgSize);
      totalPackagingCost += pkg ? pkg.cost : 0;
    }
  });

  const realLogisticsCost = shippingCost + totalPackagingCost;

  // === MATRIZ DE DECISIÓN ESTRATÉGICA ===
  const wompiRate = SYSTEM_CONFIG.WOMPI_RATE * (1 + SYSTEM_CONFIG.WOMPI_IVA);

  const decisionMatrix = discounts.map(discount => {
    const discountedIncome = baseIncome * (1 - discount / 100);
    // Redondear a múltiplos de 5000 para precios comerciales (ej: 134.800 → 135.000)
    const rawClientPrice = discountedIncome / (1 - wompiRate);
    const clientPrice = Math.ceil(rawClientPrice / 5000) * 5000;
    const wompiCommission = Math.round(clientPrice * wompiRate);
    const netProfit = clientPrice - productionCosts - wompiCommission - realLogisticsCost;
    const margin = clientPrice > 0 ? (netProfit / clientPrice * 100) : 0;
    const savings = baseIncome * (discount / 100);

    let marginColor = 'red';
    if (margin >= PACKAGE_CONFIG.MARGIN_THRESHOLDS.GREEN) marginColor = 'green';
    else if (margin >= PACKAGE_CONFIG.MARGIN_THRESHOLDS.YELLOW) marginColor = 'yellow';

    return {
      discount,
      label: discount === 0 ? 'Full (1 Envío)' : `Combo ${discount}% OFF`,
      clientPrice,
      savings,
      netProfit,
      margin: parseFloat(margin.toFixed(1)),
      marginColor,
      wompiCommission,
      isRecommended: margin >= 25 && margin <= 35
    };
  });

  const individualTotal = selectedQuotes.reduce((sum, q) => sum + getSalePrice(q), 0);

  return {
    baseIncome,
    individualTotal,
    productionCosts,
    realLogisticsCost,
    shippingCost,
    totalPackagingCost,
    baseShippingDeduction,
    productCount: selectedQuotes.length,
    decisionMatrix,
    maxSavings: baseIncome * 0.20,
    quotesBreakdown: sortedQuotes.map((q, i) => {
      const salePrice = getSalePrice(q);
      const hasLinkedProduct = !!(q.products?.sale_price || q.linked_product_sale_price);
      return {
        name: q.quote_name,
        productName: q.products?.name || null,
        variantName: q._variantOverride?.colorName || null,
        originalPrice: salePrice,
        calculatedPrice: q.results.finalPrice,
        contributedPrice: i === 0 ? salePrice : salePrice - baseShippingDeduction,
        isMaster: i === 0,
        hasLinkedProduct
      };
    })
  };
}

function calculatePackagePriceOption(baseCost, margin) {
  const { SYSTEM_CONFIG } = getConstants();
  const marginDecimal = margin / 100;
  const sellPrice = baseCost / (1 - marginDecimal);
  const wompiRate = SYSTEM_CONFIG.WOMPI_RATE * (1 + SYSTEM_CONFIG.WOMPI_IVA);
  const finalPrice = Math.ceil((sellPrice / (1 - wompiRate)) / 100) * 100;
  const netProfit = sellPrice - baseCost;

  return {
    price: finalPrice,
    profit: netProfit,
    margin: margin
  };
}

window.Calculations = {
  calculateQuote,
  recalculateVariant,
  calculatePackage,
  calculatePackageN1,
  calculatePackagePriceOption
};

// ============================================
// STORAGE
// ============================================

/**
 * Obtener lista de productos para el selector de vinculación
 */
async function getProducts() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('products')
      .select('id, name, sku, sale_price, base_price, display_order, pack_type')
      .eq('is_published', true)
      .is('pack_type', null)
      .order('display_order', { ascending: true, nullsFirst: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Error obteniendo productos:', error);
    return [];
  }
}

// Trae opciones reales de tu inventario (materials) vía la función get_leaf_materials de
// Supabase — sirve tanto para empaque (Caja/Bolsa) como para colores de filamento
// (PLA/PETG/ABS/TPU). Cachea por root_id para no repetir la consulta.
async function loadMaterialOptions(rootId) {
  window.calculatorState._materialOptions = window.calculatorState._materialOptions || {};
  if (window.calculatorState._materialOptions[rootId]) return; // ya en caché, incl. arrays vacíos ya resueltos

  const supabase = getSupabase();
  if (!supabase) {
    window.calculatorState._materialOptions[rootId] = { error: true, items: [] };
    if (window.renderModule) window.renderModule();
    return;
  }

  try {
    const { data, error } = await supabase.rpc('get_leaf_materials', { root_id: rootId });
    if (error) throw error;
    window.calculatorState._materialOptions[rootId] = { error: false, items: data || [] };
  } catch (e) {
    console.error('❌ Error cargando opciones desde inventario:', e);
    window.calculatorState._materialOptions[rootId] = { error: true, items: [] };
  }
  if (window.renderModule) window.renderModule();
}

async function saveQuote(quoteData) {
  try {
    const supabase = getSupabase();

    // Intentar obtener usuario, pero no fallar si no hay
    let userId = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    } catch (authError) {
      console.warn('⚠️ Sin autenticación, guardando sin created_by');
    }

    const quoteToInsert = {
      quote_name: quoteData.quoteName,
      client_name: quoteData.clientName || null,
      product_id: quoteData.productId || null,
      config: quoteData.config,
      print_data: quoteData.print,
      labor: quoteData.labor,
      logistics: quoteData.logistics,
      pricing: quoteData.pricing,
      results: quoteData.results,
      tags: quoteData.tags || [],
      notes: quoteData.notes || null,
      is_free_shipping: quoteData.logistics?.isFreeShipping || false,
      created_by: userId
    };

    if (quoteData.id) {
      quoteToInsert.id = quoteData.id;
    }

    const { data: quote, error: quoteError } = await supabase
      .from('sicma_quotes')
      .upsert([quoteToInsert])
      .select()
      .single();

    if (quoteError) throw quoteError;

    if (quoteData.generateVariants) {
      await generateVariantsForQuote(quote);
    }

    console.log('✅ Cotización guardada:', quote.id);
    return quote;

  } catch (error) {
    console.error('❌ Error guardando cotización:', error);
    throw error;
  }
}

async function generateVariantsForQuote(quote) {
  try {
    const supabase = getSupabase();
    const { VARIANT_CONFIGS } = getConstants();
    const variants = VARIANT_CONFIGS.map(config => {
      const recalculated = recalculateVariant(
        quote.results,
        config.shipping,
        config.packaging,
        quote.pricing.profitMargin,
        quote.logistics?.additionalsToggle,
        quote.pricing?.additionalCharge
      );

      return {
        quote_id: quote.id,
        variant_name: config.name,
        shipping: config.shipping,
        packaging_size: config.packaging,
        final_price: recalculated.finalPrice,
        logistics_costs: recalculated.logisticsCosts,
        net_profit: recalculated.netProfit,
        fee_estimate: recalculated.feeEstimate
      };
    });

    const { data, error } = await supabase
      .from('sicma_quote_variants')
      .insert(variants)
      .select();

    if (error) throw error;

    console.log(`✅ ${variants.length} variantes generadas`);
    return data;

  } catch (error) {
    console.error('❌ Error generando variantes:', error);
    throw error;
  }
}

async function getQuotes(limit = 50, offset = 0, filter = null) {
  try {
    const supabase = getSupabase();
    let query = supabase
      .from('sicma_quotes')
      .select(`
        *,
        products:product_id (name, sku, sale_price, base_price, display_order, pack_type, category_id, product_colors (id, color_name, price_adjustment))
      `)
      .order('created_at', { ascending: false });

    // Filtro: solo vinculadas o solo no vinculadas
    if (filter === 'linked') {
      query = query.not('product_id', 'is', null);
    } else if (filter === 'unlinked') {
      query = query.is('product_id', null);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) throw error;

    if (data) {
      const filtered = data.filter(q => {
        if (q.products?.pack_type) return false;
        if (!q.quote_name) return false;
        if (!q.results || !q.results.finalPrice) return false;
        return true;
      });

      filtered.sort((a, b) => {
        const orderA = a.products?.display_order ?? 9999;
        const orderB = b.products?.display_order ?? 9999;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(b.created_at) - new Date(a.created_at);
      });

      return filtered;
    }

    return data;

  } catch (error) {
    console.error('❌ Error obteniendo cotizaciones:', error);
    throw error;
  }
}

async function getQuoteById(quoteId) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('sicma_quotes')
      .select(`
        *,
        products:product_id (name, sku),
        variants:sicma_quote_variants (*)
      `)
      .eq('id', quoteId)
      .single();

    if (error) throw error;
    return data;

  } catch (error) {
    console.error('❌ Error obteniendo cotización:', error);
    throw error;
  }
}

async function searchQuotes(searchTerm) {
  try {
    const supabase = getSupabase();
    const pattern = `%${searchTerm}%`;
    const { data, error } = await supabase
      .from('sicma_quotes')
      .select(`
        *,
        products:product_id (name, sku, sale_price, base_price, display_order, pack_type, category_id, product_colors (id, color_name, price_adjustment))
      `)
      .or(`quote_name.ilike.${pattern},client_name.ilike.${pattern}`)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Aplicar mismos filtros que getQuotes
    if (data) {
      return data.filter(q => {
        if (q.products?.pack_type) return false;
        if (!q.quote_name) return false;
        if (!q.results || !q.results.finalPrice) return false;
        return true;
      });
    }
    return data;

  } catch (error) {
    console.error('❌ Error buscando cotizaciones:', error);
    return [];
  }
}

async function deleteQuote(quoteId) {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('sicma_quotes')
      .delete()
      .eq('id', quoteId);

    if (error) throw error;

    console.log('✅ Cotización eliminada:', quoteId);
    return true;

  } catch (error) {
    console.error('❌ Error eliminando cotización:', error);
    throw error;
  }
}

async function savePackage(packageData) {
  try {
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const packageToInsert = {
      package_name: packageData.packageName,
      client_name: packageData.clientName || null,
      quote_ids: packageData.quoteIds,
      package_logistics: packageData.packageLogistics,
      individual_total: packageData.individualTotal,
      total_production_costs: packageData.totalProductionCosts,
      logistics_costs: packageData.logisticsCosts,
      base_cost: packageData.baseCost,
      final_price: packageData.finalPrice,
      profit_margin: packageData.profitMargin,
      net_profit: packageData.netProfit,
      pricing_suggestions: packageData.pricingSuggestions,
      notes: packageData.notes || null,
      created_by: user.id
    };

    const { data: pkg, error } = await supabase
      .from('bundle_items')
      .insert([packageToInsert])
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Paquete guardado:', pkg.id);
    return pkg;

  } catch (error) {
    console.error('❌ Error guardando paquete:', error);
    throw error;
  }
}

async function getPackages(limit = 50, offset = 0) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('bundle_items')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;

  } catch (error) {
    console.error('❌ Error obteniendo paquetes:', error);
    throw error;
  }
}

async function deletePackage(packageId) {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('bundle_items')
      .delete()
      .eq('id', packageId);

    if (error) throw error;

    console.log('✅ Paquete eliminado:', packageId);
    return true;

  } catch (error) {
    console.error('❌ Error eliminando paquete:', error);
    throw error;
  }
}

// --- NUEVO MOTOR DE FORJA DE BUNDLES (Añadido por Zachrikyel) ---
async function saveBundleToCore(payload) {
  try {
    const supabase = getSupabase();
    // Invocamos la función RPC "Transacción Dual" de PostgreSQL
    const { data, error } = await supabase.rpc('create_bundle_package', payload);

    if (error) throw error;

    console.log('✅ Bundle maestro forjado en la base de datos con ID:', data);
    return data;
  } catch (error) {
    console.error('❌ Error forjando Bundle:', error);
    throw error;
  }
}

async function getCategories() {
  try {
    const supabase = getSupabase();
    // Ahora extraemos todo el árbol genealógico de las categorías
    const { data, error } = await supabase.from('categories').select('id, name, parent_id').order('name');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Error obteniendo categorías:', error);
    return [];
  }
}

// --- COUNT FUNCTIONS (HEAD-only, zero rows transferred) ---
async function countQuotes() {
  try {
    const supabase = getSupabase();
    const { count, error } = await supabase
      .from('sicma_quotes')
      .select('id', { count: 'exact', head: true })
      .not('quote_name', 'is', null)
      .not('results->finalPrice', 'is', null);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('❌ Error contando cotizaciones:', error);
    return 0;
  }
}

async function countPackages() {
  try {
    const supabase = getSupabase();
    const { count, error } = await supabase
      .from('bundle_items')
      .select('id', { count: 'exact', head: true })
      .not('package_name', 'is', null)
      .neq('package_name', 'undefined')
      .gt('final_price', 0);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('❌ Error contando paquetes:', error);
    return 0;
  }
}

window.Storage = {
  getProducts,
  saveQuote,
  generateVariantsForQuote,
  getQuotes,
  getQuoteById,
  searchQuotes,
  deleteQuote,
  savePackage,
  getPackages,
  deletePackage,
  saveBundleToCore,
  getCategories,
  countQuotes,
  countPackages
};

console.log('✅ Utils loaded (Formatters + Calculations + Storage)');

// --- ZYLOX BRIDGE: EXPOSE UTILS TO WINDOW ---
if (typeof Icons !== 'undefined') window.Icons = Icons;
if (typeof Formatters !== 'undefined') window.Formatters = Formatters;
if (typeof Calculations !== 'undefined') window.Calculations = Calculations;
if (typeof Storage !== 'undefined') window.Storage = Storage;

console.log('✅ ZYLOX UTILS LOADED');