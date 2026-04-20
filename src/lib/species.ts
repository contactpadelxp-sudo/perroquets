// ══════════════════════════════════════════════
// SPECIES CONFIGURATION — ParrotCare
// ══════════════════════════════════════════════

export type SpeciesId = 'eclectus' | 'african_grey' | 'galah';

export interface SpeciesConfig {
  id: SpeciesId;
  name: string;
  scientificName: string;
  emoji: string;
  description: string;

  // Design
  accentColor: string;       // Primary accent color
  accentColorLight: string;  // Lighter version for badges/bg

  // Nutrition targets
  targets: {
    vitamin_a_ug: number;
    vitamin_c_mg: number;
    vitamin_e_mg: number;
    calcium_mg: number;
    iron_mg: number;
    protein_g: number;
    fiber_g: number;
    fat_max_g?: number; // Galah: max fat threshold
  };

  // Nutrient display config
  nutrients: {
    key: string;
    label: string;
    unit: string;
    target: number;
    critical: boolean;
    suggestions: string;
    // For iron in African Grey: max threshold warning
    maxWarning?: number;
    maxWarningMessage?: string;
  }[];

  // Weight config
  weight: {
    defaultMin: number;
    defaultMax: number;
    criticalLow: number;
    criticalHigh: number;
    subspecies?: { name: string; min: number; max: number }[];
    weightLossAlertG: number;     // alert if lost this much in 2 weeks
    weightGainAlertG: number;     // alert if gained this much in 1 month
    weighFrequencyDays: number;   // recommended weigh frequency
    reminderAfterDays: number;    // remind if no weigh after this many days
  };

  // Diet ratios (percentages)
  dietRatios: {
    label: string;
    percentage: number;
    description: string;
  }[];

  // Diet info card (permanent display)
  dietInfoCard?: {
    icon: string;
    title: string;
    message: string;
  };

  // Category IDs for this species
  categoryIds: {
    fruits: string;
    legumes: string;
    germinations: string;
    cereales: string;
    noix: string;
    fleurs: string;
    complements: string;
    interdit: string;
    pellets?: string; // African Grey specific
  };

  // Score calculation weights
  scoreConfig: {
    fruitVegMin: number;         // min % fruits+vegetables for score
    fruitVegMax?: number;        // max % (eclectus: 85%)
    betaCarotenePoints: number;
    sproutsPoints: number;
    vitAPoints: number;
    diversityPoints: number;
    diversityMinFoods: number;
    completedMealsPoints: number;
    pelletsPoints?: number;      // African Grey: points for having pellets
  };

  // Species-specific alerts
  customAlerts: {
    id: string;
    condition: string;  // description of when this fires
    type: 'danger' | 'warning' | 'info';
    icon: string;
    message: string;
  }[];
}

// ══════════════════════════════════════════════
// ÉCLECTUS RORATUS
// ══════════════════════════════════════════════

export const ECLECTUS_CONFIG: SpeciesConfig = {
  id: 'eclectus',
  name: 'Éclectus',
  scientificName: 'Eclectus roratus',
  emoji: '🦜',
  description: 'Perroquet frugivore nécessitant 60-80% de fruits et légumes frais',

  accentColor: '#A855F7',
  accentColorLight: '#A855F7',

  targets: {
    vitamin_a_ug: 800,
    vitamin_c_mg: 50,
    vitamin_e_mg: 5,
    calcium_mg: 150,
    iron_mg: 3,
    protein_g: 12,
    fiber_g: 8,
  },

  nutrients: [
    { key: 'vitamin_a_ug', label: 'Vitamine A', unit: 'µg', target: 800, critical: true, suggestions: 'Carotte, patate douce, mangue, potiron, poivron rouge' },
    { key: 'vitamin_c_mg', label: 'Vitamine C', unit: 'mg', target: 50, critical: false, suggestions: 'Goyave, poivron rouge, kiwi, piment, brocoli' },
    { key: 'vitamin_e_mg', label: 'Vitamine E', unit: 'mg', target: 5, critical: false, suggestions: 'Graines tournesol germées, pissenlit, épinards' },
    { key: 'calcium_mg', label: 'Calcium', unit: 'mg', target: 150, critical: false, suggestions: 'Brocoli, pissenlit, basilic, pois mange-tout' },
    { key: 'iron_mg', label: 'Fer', unit: 'mg', target: 3, critical: false, suggestions: 'Lentilles cuites, épinards, piment, pissenlit' },
    { key: 'protein_g', label: 'Protéines', unit: 'g', target: 12, critical: false, suggestions: 'Germinations, lentilles cuites, pois chiches, quinoa' },
    { key: 'fiber_g', label: 'Fibres', unit: 'g', target: 8, critical: false, suggestions: 'Pois chiches, lentilles, goyave, grenade, poire' },
  ],

  weight: {
    defaultMin: 380,
    defaultMax: 550,
    criticalLow: 350,
    criticalHigh: 600,
    weightLossAlertG: 20,
    weightGainAlertG: 40,
    weighFrequencyDays: 7,
    reminderAfterDays: 10,
  },

  dietRatios: [
    { label: 'Fruits & Légumes frais', percentage: 80, description: 'BASE OBLIGATOIRE — frugivore strict' },
    { label: 'Germinations', percentage: 10, description: 'Quotidien recommandé' },
    { label: 'Céréales & Légumineuses', percentage: 5, description: 'Max 2x/semaine' },
    { label: 'Noix & Graines', percentage: 5, description: 'Friandises max 1-2x/semaine' },
  ],

  categoryIds: {
    fruits: 'a1000000-0000-0000-0000-000000000001',
    legumes: 'a1000000-0000-0000-0000-000000000002',
    germinations: 'a1000000-0000-0000-0000-000000000003',
    cereales: 'a1000000-0000-0000-0000-000000000004',
    noix: 'a1000000-0000-0000-0000-000000000005',
    fleurs: 'a1000000-0000-0000-0000-000000000006',
    complements: 'a1000000-0000-0000-0000-000000000007',
    interdit: 'a1000000-0000-0000-0000-000000000008',
  },

  scoreConfig: {
    fruitVegMin: 60,
    fruitVegMax: 85,
    betaCarotenePoints: 20,
    sproutsPoints: 20,
    vitAPoints: 20,
    diversityPoints: 10,
    diversityMinFoods: 5,
    completedMealsPoints: 10,
  },

  customAlerts: [],
};

// ══════════════════════════════════════════════
// GRIS DU GABON (Psittacus erithacus)
// ══════════════════════════════════════════════

export const AFRICAN_GREY_CONFIG: SpeciesConfig = {
  id: 'african_grey',
  name: 'Gris du Gabon',
  scientificName: 'Psittacus erithacus',
  emoji: '🦜',
  description: 'Perroquet granivore — pellets de qualité = 70% du régime',

  accentColor: '#EF4444',
  accentColorLight: '#9CA3AF',

  targets: {
    vitamin_a_ug: 700,
    vitamin_c_mg: 40,
    vitamin_e_mg: 5,
    calcium_mg: 200,
    iron_mg: 2,
    protein_g: 15,
    fiber_g: 6,
  },

  nutrients: [
    { key: 'vitamin_a_ug', label: 'Vitamine A', unit: 'µg', target: 700, critical: true, suggestions: 'Carotte, patate douce, pissenlit, kale, potiron' },
    { key: 'vitamin_c_mg', label: 'Vitamine C', unit: 'mg', target: 40, critical: false, suggestions: 'Poivron rouge, kiwi, fraises, brocoli' },
    { key: 'vitamin_e_mg', label: 'Vitamine E', unit: 'mg', target: 5, critical: false, suggestions: 'Graines germées, pissenlit, épinards' },
    {
      key: 'calcium_mg', label: 'Calcium', unit: 'mg', target: 200, critical: true,
      suggestions: 'Pissenlit, kale, brocoli, figue — CRITIQUE pour le Gris',
    },
    {
      key: 'iron_mg', label: 'Fer', unit: 'mg', target: 2, critical: true,
      suggestions: 'Ne pas dépasser — Iron Storage Disease',
      maxWarning: 3,
      maxWarningMessage: '⚠️ Iron Storage Disease : réduire aliments riches en fer',
    },
    { key: 'protein_g', label: 'Protéines', unit: 'g', target: 15, critical: false, suggestions: 'Légumineuses cuites, graines germées, quinoa' },
    { key: 'fiber_g', label: 'Fibres', unit: 'g', target: 6, critical: false, suggestions: 'Légumineuses, brocoli, poire, grenade' },
  ],

  weight: {
    defaultMin: 400,
    defaultMax: 650,
    criticalLow: 380,
    criticalHigh: 680,
    subspecies: [
      { name: 'Congo', min: 400, max: 650 },
      { name: 'Timneh', min: 275, max: 375 },
    ],
    weightLossAlertG: 20,
    weightGainAlertG: 40,
    weighFrequencyDays: 7,
    reminderAfterDays: 10,
  },

  dietRatios: [
    { label: 'Granulés / Pellets', percentage: 70, description: 'BASE OBLIGATOIRE' },
    { label: 'Légumes frais', percentage: 15, description: 'Complément quotidien' },
    { label: 'Fruits frais', percentage: 10, description: 'Friandises nutritives' },
    { label: 'Céréales & Protéines', percentage: 5, description: 'Complément occasionnel' },
  ],

  dietInfoCard: {
    icon: '⚠️',
    title: 'Régime du Gris du Gabon',
    message: 'Le Gris du Gabon est un granivore : les pellets de qualité doivent constituer 70% de son alimentation. Contrairement à l\'Éclectus, les fruits et légumes frais sont un COMPLÉMENT, pas une base.',
  },

  categoryIds: {
    fruits: 'b1000000-0000-0000-0000-000000000002',
    legumes: 'b1000000-0000-0000-0000-000000000003',
    germinations: 'b1000000-0000-0000-0000-000000000003', // merged with legumes for Grey
    cereales: 'b1000000-0000-0000-0000-000000000004',
    noix: 'b1000000-0000-0000-0000-000000000006',
    fleurs: 'b1000000-0000-0000-0000-000000000003', // n/a for Grey
    complements: 'b1000000-0000-0000-0000-000000000001', // pellets
    interdit: 'b1000000-0000-0000-0000-000000000007',
    pellets: 'b1000000-0000-0000-0000-000000000001',
  },

  scoreConfig: {
    fruitVegMin: 20,
    betaCarotenePoints: 15,
    sproutsPoints: 0,
    vitAPoints: 20,
    diversityPoints: 10,
    diversityMinFoods: 4,
    completedMealsPoints: 10,
    pelletsPoints: 25,
  },

  customAlerts: [
    {
      id: 'calcium_critical',
      condition: 'calcium < 50% target',
      type: 'danger',
      icon: '🔴',
      message: '⚠️ CRITIQUE : Gris très sensible à l\'hypocalcémie — ajouter pissenlit, kale ou brocoli',
    },
    {
      id: 'vitamin_a_absent',
      condition: 'vitamin_a_ug === 0',
      type: 'danger',
      icon: '🔴',
      message: 'Carotte ou patate douce obligatoire aujourd\'hui — carence Vit A = pathologie n°1',
    },
    {
      id: 'iron_excess',
      condition: 'iron > 150% target',
      type: 'warning',
      icon: '🟠',
      message: '⚠️ Iron Storage Disease : réduire aliments riches en fer (lentilles, épinards)',
    },
    {
      id: 'no_pellets',
      condition: 'no pellets category eaten',
      type: 'warning',
      icon: '🟡',
      message: 'Les pellets doivent constituer 70% du régime — en avez-vous donné aujourd\'hui ?',
    },
    {
      id: 'too_many_seeds',
      condition: 'seeds > 30% ratio',
      type: 'warning',
      icon: '🟡',
      message: 'Trop de graines sèches — remplacer par des pellets de qualité',
    },
    {
      id: 'underweight_critical',
      condition: 'weight < 380g',
      type: 'danger',
      icon: '🔴',
      message: 'Sous-poids critique — consulter vétérinaire aviaire en urgence',
    },
  ],
};

// ══════════════════════════════════════════════
// CACATOÈS ROSALBIN / GALAH (Eolophus roseicapillus)
// ══════════════════════════════════════════════

export const GALAH_CONFIG: SpeciesConfig = {
  id: 'galah',
  name: 'Cacatoès Rosalbin',
  scientificName: 'Eolophus roseicapillus',
  emoji: '🦩',
  description: 'Pellets low-fat = 70% — espèce très sujette à l\'obésité',

  accentColor: '#F472B6',
  accentColorLight: '#9CA3AF',

  targets: {
    vitamin_a_ug: 600,
    vitamin_c_mg: 35,
    vitamin_e_mg: 4,
    calcium_mg: 120,
    iron_mg: 2,
    protein_g: 10,
    fiber_g: 6,
    fat_max_g: 8,
  },

  nutrients: [
    { key: 'vitamin_a_ug', label: 'Vitamine A', unit: 'µg', target: 600, critical: true, suggestions: 'Carotte, patate douce, poivron rouge, pissenlit' },
    { key: 'vitamin_c_mg', label: 'Vitamine C', unit: 'mg', target: 35, critical: false, suggestions: 'Poivron rouge, kiwi, brocoli, fraises' },
    { key: 'vitamin_e_mg', label: 'Vitamine E', unit: 'mg', target: 4, critical: false, suggestions: 'Graines germées, pissenlit, épinards' },
    { key: 'calcium_mg', label: 'Calcium', unit: 'mg', target: 120, critical: false, suggestions: 'Brocoli, pissenlit, persil' },
    { key: 'iron_mg', label: 'Fer', unit: 'mg', target: 2, critical: false, suggestions: 'Lentilles cuites, épinards, pissenlit' },
    { key: 'protein_g', label: 'Protéines', unit: 'g', target: 10, critical: false, suggestions: 'Légumineuses cuites, graines germées, quinoa' },
    { key: 'fiber_g', label: 'Fibres', unit: 'g', target: 6, critical: false, suggestions: 'Légumineuses, brocoli, poire, grenade' },
    {
      key: 'fat_g', label: 'Lipides', unit: 'g', target: 8, critical: true,
      suggestions: 'NE PAS DÉPASSER — risque lipomatose',
      maxWarning: 8,
      maxWarningMessage: '⚠️ Lipides trop élevés : risque de lipomatose — réduire noix et graines grasses',
    },
  ],

  weight: {
    defaultMin: 272,
    defaultMax: 432,
    criticalLow: 250,
    criticalHigh: 450,
    weightLossAlertG: 15,
    weightGainAlertG: 20,
    weighFrequencyDays: 7,
    reminderAfterDays: 10,
  },

  dietRatios: [
    { label: 'Granulés low-fat', percentage: 70, description: 'BASE OBLIGATOIRE — pellets faibles en gras' },
    { label: 'Légumes frais', percentage: 15, description: 'Complément quotidien' },
    { label: 'Céréales & Légumineuses', percentage: 10, description: 'Complément modéré' },
    { label: 'Fruits frais', percentage: 5, description: 'TRÈS LIMITÉ — friandises seulement' },
  ],

  dietInfoCard: {
    icon: '⚠️',
    title: 'Régime du Rosalbin',
    message: 'Le Rosalbin est l\'espèce de cacatoès la plus sujette à l\'obésité et à la lipomatose (accumulation graisseuse sous-cutanée). Les graines grasses (tournesol, carthame) sont le principal facteur déclencheur. Les pellets LOW-FAT sont indispensables.',
  },

  categoryIds: {
    fruits: 'c1000000-0000-0000-0000-000000000002',
    legumes: 'c1000000-0000-0000-0000-000000000003',
    germinations: 'c1000000-0000-0000-0000-000000000004',
    cereales: 'c1000000-0000-0000-0000-000000000004',
    noix: 'c1000000-0000-0000-0000-000000000006',
    fleurs: 'c1000000-0000-0000-0000-000000000003',
    complements: 'c1000000-0000-0000-0000-000000000001',
    interdit: 'c1000000-0000-0000-0000-000000000007',
    pellets: 'c1000000-0000-0000-0000-000000000001',
  },

  scoreConfig: {
    fruitVegMin: 15,
    betaCarotenePoints: 15,
    sproutsPoints: 0,
    vitAPoints: 20,
    diversityPoints: 10,
    diversityMinFoods: 4,
    completedMealsPoints: 10,
    pelletsPoints: 25,
  },

  customAlerts: [
    {
      id: 'lipomatosis_weight',
      condition: 'weight > 450g',
      type: 'danger',
      icon: '🔴',
      message: '⚠️ Risque lipomatose — consulter vétérinaire aviaire',
    },
    {
      id: 'sunflower_seeds',
      condition: 'tournesol/carthame eaten',
      type: 'danger',
      icon: '🔴',
      message: '⚠️ Graines grasses détectées : cause directe de lipomatose chez le Rosalbin',
    },
    {
      id: 'fat_excess',
      condition: 'fat > 10% ratio',
      type: 'warning',
      icon: '🟠',
      message: 'Trop de lipides — réduire noix et graines grasses immédiatement',
    },
    {
      id: 'fruit_excess',
      condition: 'fruits > 5% ratio',
      type: 'warning',
      icon: '🟡',
      message: 'Fruits trop présents pour le Rosalbin — max 5% du régime',
    },
    {
      id: 'no_pellets',
      condition: 'no pellets low-fat eaten',
      type: 'warning',
      icon: '🟡',
      message: 'Pellets low-fat indispensables — 70% du régime',
    },
    {
      id: 'vitamin_a_absent',
      condition: 'vitamin_a_ug === 0',
      type: 'danger',
      icon: '🔴',
      message: 'Carotte ou poivron rouge obligatoire aujourd\'hui',
    },
  ],
};

// ══════════════════════════════════════════════
// SPECIES REGISTRY
// ══════════════════════════════════════════════

export const SPECIES_CONFIGS: Record<SpeciesId, SpeciesConfig> = {
  eclectus: ECLECTUS_CONFIG,
  african_grey: AFRICAN_GREY_CONFIG,
  galah: GALAH_CONFIG,
};

export const SPECIES_LIST = [
  {
    id: 'eclectus' as SpeciesId,
    name: 'Éclectus',
    scientificName: 'Eclectus roratus',
    emoji: '🦜',
    color: '#A855F7',
    description: 'Frugivore — 80% fruits & légumes frais',
    image: '/species/eclectus.png',
  },
  {
    id: 'african_grey' as SpeciesId,
    name: 'Gris du Gabon',
    scientificName: 'Psittacus erithacus',
    emoji: '🦜',
    color: '#EF4444',
    description: 'Granivore — 70% pellets de qualité',
    image: '/species/african-grey.png',
  },
  {
    id: 'galah' as SpeciesId,
    name: 'Cacatoès Rosalbin',
    scientificName: 'Eolophus roseicapillus',
    emoji: '🦩',
    color: '#F472B6',
    description: 'Pellets low-fat — très sensible à l\'obésité',
    image: '/species/galah.png',
  },
];

export function getSpeciesConfig(species: SpeciesId | string | null | undefined): SpeciesConfig {
  if (species && species in SPECIES_CONFIGS) {
    return SPECIES_CONFIGS[species as SpeciesId];
  }
  return ECLECTUS_CONFIG; // default fallback
}
