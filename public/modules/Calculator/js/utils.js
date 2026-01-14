/**
 * ============================================
 * SICMA CALCULATOR - UTILIDADES
 * Formatters + Calculations + Storage
 * ============================================
 */

// Obtener el cliente de Supabase desde window.supabaseClient
const getSupabase = () => window.supabaseClient.client;

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
  formatHours,
  formatDate,
  formatDateShort
};

// ============================================
// CALCULATIONS
// ============================================

function calculateQuote(params) {
  const { config, print, labor, logistics, pricing } = params;
  const { PRINTERS, NOZZLES, MATERIALS, SHIPPING_OPTIONS, PACKAGING, COMPLEXITY_LEVELS, GATEWAYS, SYSTEM_CONFIG } = getConstants();

  const printer = PRINTERS.find(p => p.id === config.printer);
  const material = MATERIALS.find(m => m.id === config.material);
  const nozzle = NOZZLES.find(n => n.size === config.nozzle);
  const shipping = SHIPPING_OPTIONS.find(s => s.id === logistics.shipping);
  const complexityLevel = COMPLEXITY_LEVELS[labor.complexity];
  const gateway = GATEWAYS.find(g => g.id === pricing.gateway);

  // Tiempo de ocupación
  const totalPrintHours = print.printHours;
  const coolMinutes = print.coolMinutes || material.coolMinutes;
  const plateMultiplier = print.isPiece === 'multi' ? (Number(print.plateCount) || 1) : 1;
  const totalCoolMinutes = coolMinutes * plateMultiplier;
  const totalCoolHours = totalCoolMinutes / 60;
  const totalOccupancyHours = totalPrintHours + totalCoolHours;

  // Costos duros
  const costEnergy = ((printer.watts * totalPrintHours) + (printer.watts * 0.1 * totalCoolHours)) / 1000 * config.kwhPrice;
  const costWear = printer.wear * totalOccupancyHours;
  let costMaterial = print.materialCost;
  costMaterial *= nozzle.riskFactor;
  if (config.amsMode) {
    costMaterial *= material.amsRisk;
  }
  const hardCosts = costEnergy + costWear + costMaterial;

  // Costos blandos
  const postProcessHours = complexityLevel.postProcessMinutes / 60;
  const operatorHours = complexityLevel.operatorMinutes / 60;
  const totalLaborHours = postProcessHours + operatorHours;
  let costLabor = totalLaborHours * SYSTEM_CONFIG.HOURLY_LABOR_RATE;
  costLabor *= (1 + complexityLevel.failureRisk);
  costLabor += complexityLevel.suppliesCost;
  if (config.amsMode) {
    costLabor *= (1 + SYSTEM_CONFIG.AMS_ADDITIONAL_RISK);
  }
  if (labor.primerToggle) {
    costLabor += SYSTEM_CONFIG.PRIMER_COST;
  }
  if (labor.lacquerToggle) {
    costLabor += SYSTEM_CONFIG.LACQUER_COST;
  }
  const softCosts = costLabor;

  // Logística
  let packagingCost = 0;
  if (logistics.packagingSize === 'deluxe') {
    packagingCost = logistics.packagingCustom || 0;
  } else {
    const pkg = PACKAGING.find(p => p.id === logistics.packagingSize);
    packagingCost = pkg ? pkg.cost : 0;
  }
  if (logistics.additionalsToggle) {
    packagingCost *= (1 + SYSTEM_CONFIG.PACKAGING_ADDITIONAL_RISK);
  }
  const logisticsCosts = shipping.cost + packagingCost;

  // Costo base
  const baseCost = hardCosts + softCosts + logisticsCosts;

  // Precio de venta
  const marginDecimal = pricing.profitMargin / 100;
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

  return {
    finalPrice,
    hardCosts,
    softCosts,
    logisticsCosts,
    netProfit,
    feeEstimate,
    sellPrice,
    additionalCharge: pricing.additionalCharge || 0,
    totalProductionTime,
    totalPrintHours,
    totalCoolHours,
    totalOccupancyHours,
    breakdown: {
      energy: costEnergy,
      wear: costWear,
      material: costMaterial,
      labor: costLabor,
      packaging: packagingCost,
      shipping: shipping.cost
    }
  };
}

function recalculateVariant(originalResults, newShipping, newPackaging, profitMargin) {
  const { SHIPPING_OPTIONS, PACKAGING, SYSTEM_CONFIG } = getConstants();
  const shipping = SHIPPING_OPTIONS.find(s => s.id === newShipping);
  const packaging = PACKAGING.find(p => p.id === newPackaging);

  const productionCosts = originalResults.hardCosts + originalResults.softCosts;
  const newLogisticsCosts = shipping.cost + packaging.cost;
  const newBaseCost = productionCosts + newLogisticsCosts;

  const marginDecimal = profitMargin / 100;
  const newSellPrice = newBaseCost / (1 - marginDecimal);

  const wompiRate = SYSTEM_CONFIG.WOMPI_RATE * (1 + SYSTEM_CONFIG.WOMPI_IVA);
  const finalPrice = Math.ceil((newSellPrice / (1 - wompiRate)) / 100) * 100;
  const feeEstimate = finalPrice - newSellPrice;
  const netProfit = newSellPrice - newBaseCost;

  return {
    finalPrice,
    logisticsCosts: newLogisticsCosts,
    netProfit,
    feeEstimate
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
  // Si tiene producto vinculado con sale_price, usar ese
  // Si no, usar el finalPrice calculado de la cotización
  const getSalePrice = (quote) => {
    // Si tiene producto vinculado con sale_price, usar ese
    if (quote.products && quote.products.sale_price) {
      return quote.products.sale_price;
    }
    // Si tiene linked_product_sale_price guardado, usar ese
    if (quote.linked_product_sale_price) {
      return quote.linked_product_sale_price;
    }
    // Fallback: usar el precio calculado de la cotización
    return quote.results.finalPrice;
  };

  // === CÁLCULO DEL INGRESO BASE (Lógica N-1) ===
  // Producto Master: precio de venta completo (incluye 1 envío y comisión)
  let baseIncome = getSalePrice(selectedQuotes[0]);

  // Productos adicionales: precio de venta - envío base
  for (let i = 1; i < selectedQuotes.length; i++) {
    baseIncome += getSalePrice(selectedQuotes[i]) - baseShippingDeduction;
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
    quotesBreakdown: selectedQuotes.map((q, i) => {
      const salePrice = getSalePrice(q);
      const hasLinkedProduct = !!(q.products?.sale_price || q.linked_product_sale_price);
      return {
        name: q.quote_name,
        productName: q.products?.name || null,
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
      .select('id, name, sku, sale_price, base_price')
      .eq('is_published', true)
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Error obteniendo productos:', error);
    return [];
  }
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
        quote.pricing.profitMargin
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

async function getQuotes(limit = 50, offset = 0) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('sicma_quotes')
      .select(`
        *,
        products:product_id (name, sku, sale_price, base_price)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
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
    const { data, error } = await supabase
      .rpc('search_sicma_quotes', { search_term: searchTerm });

    if (error) throw error;
    return data;

  } catch (error) {
    console.error('❌ Error buscando cotizaciones:', error);
    throw error;
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
      .from('sicma_packages')
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
      .from('sicma_packages')
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
      .from('sicma_packages')
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
  deletePackage
};

console.log('✅ Utils loaded (Formatters + Calculations + Storage)');