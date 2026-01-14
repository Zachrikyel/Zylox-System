/**
 * ============================================
 * SICMA CALCULATOR - CONFIGURACIÓN
 * Supabase Client + Constants + Icons
 * ============================================
 */

// ============================================
// SUPABASE CLIENT
// ============================================

const SUPABASE_URL = 'https://stjvnjmqezdcxsdodnfc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0anZuam1xZXpkY3hzZG9kbmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNTE5NTUsImV4cCI6MjA3OTkyNzk1NX0.nh111C74tbdSreSdn7sRQlI8PPNnOCpod-Y1nD3210o';

// Crear cliente de Supabase usando el SDK del CDN
const supabaseClientInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkAuth() {
  try {
    const { data: { user }, error } = await supabaseClientInstance.auth.getUser();
    if (error) return { authenticated: false, user: null };
    return { authenticated: !!user, user: user };
  } catch (error) {
    return { authenticated: false, user: null };
  }
}

window.supabaseClient = {
  client: supabaseClientInstance,
  checkAuth
};

// ============================================
// CONSTANTS
// ============================================

const PRINTERS = [
  { id: 'p1s', name: 'Bambu Lab P1S', watts: 300, wear: 800 },
  { id: 'a1', name: 'Bambu Lab A1', watts: 110, wear: 500 },
  { id: 'x1c', name: 'Bambu Lab X1C', watts: 350, wear: 1200 }
];

const NOZZLES = [
  { size: 0.2, riskFactor: 1.15, label: '0.2mm' },
  { size: 0.4, riskFactor: 1.0, label: '0.4mm' },
  { size: 0.6, riskFactor: 1.05, label: '0.6mm' },
  { size: 0.8, riskFactor: 1.10, label: '0.8mm' }
];

const MATERIALS = [
  { id: 'pla', name: 'PLA', coolMinutes: 18, amsRisk: 1.03 },
  { id: 'petg', name: 'PETG', coolMinutes: 25, amsRisk: 1.05 },
  { id: 'abs', name: 'ABS', coolMinutes: 30, amsRisk: 1.04 },
  { id: 'tpu', name: 'TPU', coolMinutes: 10, amsRisk: 1.08 }
];

const SHIPPING_OPTIONS = [
  { id: 'pickup', name: 'Recogida', cost: 0, icon: '🏪' },
  { id: 'local', name: 'Local', cost: 15000, icon: '📦' },
  { id: 'national', name: 'Deluxe', cost: 0, icon: '🚚' }
];

const PACKAGING = [
  { id: 'small', name: 'Pequeña', cost: 3000 },
  { id: 'medium', name: 'Mediana', cost: 4000 },
  { id: 'large', name: 'Grande', cost: 5000 },
  { id: 'deluxe', name: 'Deluxe Personalizado', cost: 0 }
];

const COMPLEXITY_LEVELS = {
  simple: {
    name: 'Simple (Solo Impresión)',
    postProcessMinutes: 5,
    operatorMinutes: 0,
    failureRisk: 0.02,
    suppliesCost: 200,
    description: 'Solo sacar de impresora y revisar'
  },
  easy: {
    name: 'Fácil',
    postProcessMinutes: 60,
    operatorMinutes: 5,
    failureRisk: 0.10,
    suppliesCost: 2000,
    description: 'Limpieza básica y lijado ligero'
  },
  medium: {
    name: 'Media',
    postProcessMinutes: 120,
    operatorMinutes: 5,
    failureRisk: 0.20,
    suppliesCost: 4000,
    description: 'Lijado, acabados básicos'
  },
  hard: {
    name: 'Difícil',
    postProcessMinutes: 180,
    operatorMinutes: 10,
    failureRisk: 0.40,
    suppliesCost: 10000,
    description: 'Múltiples acabados, ensamblaje'
  }
};

const GATEWAYS = [
  { id: 'nequi', name: 'Nequi/Transferencia', rate: 0 },
  { id: 'wompi', name: 'Wompi', rate: 2.65, iva: true },
  { id: 'bold', name: 'Bold (Datafono)', rate: 5 }
];

const VARIANT_CONFIGS = [
  { shipping: 'pickup', packaging: 'small', name: 'Recogida + Empaque Pequeño' },
  { shipping: 'pickup', packaging: 'medium', name: 'Recogida + Empaque Mediano' },
  { shipping: 'local', packaging: 'small', name: 'Domicilio Local + Empaque Pequeño' },
  { shipping: 'local', packaging: 'medium', name: 'Domicilio Local + Empaque Mediano' },
  { shipping: 'local', packaging: 'large', name: 'Domicilio Local + Empaque Grande' },
  { shipping: 'national', packaging: 'medium', name: 'Domicilio Nacional + Empaque Mediano' },
  { shipping: 'national', packaging: 'large', name: 'Domicilio Nacional + Empaque Grande' }
];

// Variantes Maestras para ADN Técnico (Plan Maestro de Ingeniería)
const MASTER_VARIANT_CONFIGS = [
  {
    id: 'V1',
    name: 'Pago Directo + Recogida',
    gateway: 'nequi',
    shipping: 'pickup',
    packaging: 'small',
    isMinimum: true,
    description: 'Precio mínimo sin comisiones'
  },
  {
    id: 'V2',
    name: 'Pago Directo + Envío Local',
    gateway: 'nequi',
    shipping: 'local',
    packaging: 'medium',
    description: 'Sin comisión, con envío'
  },
  {
    id: 'V3',
    name: 'Wompi + Recogida',
    gateway: 'wompi',
    shipping: 'pickup',
    packaging: 'small',
    description: 'Con comisión, sin envío'
  },
  {
    id: 'V4',
    name: 'Wompi + Envío Local (Estándar)',
    gateway: 'wompi',
    shipping: 'local',
    packaging: 'medium',
    isStandard: true,
    description: 'Configuración estándar para tienda'
  }
];

// Configuración para lógica N-1 de paquetes
const PACKAGE_CONFIG = {
  DEFAULT_SHIPPING_DEDUCTION: 15000, // Costo envío a restar en productos adicionales
  DISCOUNT_OPTIONS: [0, 10, 15, 20],  // Escenarios de descuento para matriz
  MARGIN_THRESHOLDS: {
    GREEN: 30,   // >= 30% = bueno
    YELLOW: 20,  // >= 20% = aceptable
    RED: 0       // < 20% = bajo
  }
};

const SYSTEM_CONFIG = {
  DEFAULT_KWH_PRICE: 920,
  DEFAULT_MARGIN: 30,
  HOURLY_LABOR_RATE: 20000,
  AMS_ADDITIONAL_RISK: 0.02,
  PRIMER_COST: 1000,
  LACQUER_COST: 1000,
  PACKAGING_ADDITIONAL_RISK: 0.02,
  WOMPI_RATE: 0.0265,
  WOMPI_IVA: 0.19
};

// ============================================
// USUARIOS AUTORIZADOS (Whitelist)
// Solo estos usuarios pueden acceder a SICMA
// ============================================
const AUTHORIZED_USERS = [
  'c4a011c5-d8af-47ab-bc2f-f245b3cf6462',
  'a8f3681d-ab81-44d5-9a18-f365092d5714',
  '9d2bca2f-eec2-49ef-b843-6691a0d3ed2d'
];

window.SICMA_CONSTANTS = {
  PRINTERS,
  NOZZLES,
  MATERIALS,
  SHIPPING_OPTIONS,
  PACKAGING,
  COMPLEXITY_LEVELS,
  GATEWAYS,
  VARIANT_CONFIGS,
  MASTER_VARIANT_CONFIGS,
  PACKAGE_CONFIG,
  SYSTEM_CONFIG,
  AUTHORIZED_USERS
};

// ============================================
// ICONS
// ============================================

const Icons = {
  ChevronLeft: (size = 20) => `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  ChevronRight: (size = 20) => `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  Zap: (size = 20) => `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  Printer: (size = 20) => `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`,
  Clock: (size = 20) => `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  Package: (size = 20) => `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  Snowflake: (size = 20) => `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 7l-5 5 5 5M7 7l5 5-5 5"/></svg>`,
  Truck: (size = 20) => `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  DollarSign: (size = 20) => `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  TrendingUp: (size = 20) => `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  Share2: (size = 20) => `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
  ArrowLeft: (size = 20) => `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  Sparkles: (size = 20) => `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3L14 8L19 10L14 12L12 17L10 12L5 10L10 8L12 3Z"/><path d="M19 3L20 6L23 7L20 8L19 11L18 8L15 7L18 6L19 3Z"/></svg>`,
  AlertCircle: (size = 20) => `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  Search: (size = 20) => `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  Home: (size = 20) => `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  Calculator: (size = 20) => `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/></svg>`,
  Layers: (size = 20) => `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  Trash2: (size = 20) => `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  Camera: (size = 20) => `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  Check: (size = 20) => `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  Edit: (size = 20) => `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  X: (size = 20) => `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
};

window.Icons = Icons;

console.log('✅ Config loaded (Supabase + Constants + Icons)');