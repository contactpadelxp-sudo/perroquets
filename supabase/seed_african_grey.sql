-- ============================================================
-- PARROTCARE — Seed Data: Gris du Gabon (Psittacus erithacus)
-- ============================================================

-- ── CATÉGORIES ────────────────────────────────────────────────
INSERT INTO food_categories (id, name, color, icon, species) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Granulés / Pellets',           '#6B7280', '🟤', 'african_grey'),
  ('b1000000-0000-0000-0000-000000000002', 'Fruits',                       '#F97316', '🍊', 'african_grey'),
  ('b1000000-0000-0000-0000-000000000003', 'Légumes',                      '#22C55E', '🥦', 'african_grey'),
  ('b1000000-0000-0000-0000-000000000004', 'Graines & Céréales',           '#EAB308', '🌾', 'african_grey'),
  ('b1000000-0000-0000-0000-000000000005', 'Protéines & Légumineuses',     '#A78BFA', '🫘', 'african_grey'),
  ('b1000000-0000-0000-0000-000000000006', 'Friandises / Noix',            '#EC4899', '🥜', 'african_grey'),
  ('b1000000-0000-0000-0000-000000000007', 'Interdit',                     '#EF4444', '☠️', 'african_grey');

-- ── GRANULÉS / PELLETS ──────────────────────────────────────────
INSERT INTO foods (name, category_id, is_forbidden, danger_level, danger_note, beta_carotene_rich, remove_seed, vitamin_a_ug, vitamin_c_mg, vitamin_e_mg, calcium_mg, phosphorus_mg, iron_mg, protein_g, fiber_g, sugar_g, fat_g, notes, species) VALUES
('Pellets premium (Harrison''s, TOP''s, etc.)', 'b1000000-0000-0000-0000-000000000001', false, 0, NULL, false, false, 200, 10, 2, 80, 50, 0.5, 14, 4, 2, 5, 'BASE DU RÉGIME — 70% de l''alimentation quotidienne. Pellets de qualité = alimentation complète et équilibrée.', 'african_grey'),
('Pellets maintenance', 'b1000000-0000-0000-0000-000000000001', false, 0, NULL, false, false, 150, 8, 1.5, 60, 40, 0.4, 12, 3, 3, 4, 'Alternative aux pellets premium. Vérifier composition : pas de colorants, pas de sucres ajoutés.', 'african_grey');

-- ── LÉGUMES AUTORISÉS ──────────────────────────────────────────
INSERT INTO foods (name, category_id, is_forbidden, danger_level, danger_note, beta_carotene_rich, remove_seed, vitamin_a_ug, vitamin_c_mg, vitamin_e_mg, calcium_mg, phosphorus_mg, iron_mg, protein_g, fiber_g, sugar_g, fat_g, notes, species) VALUES
('Carotte',            'b1000000-0000-0000-0000-000000000003', false, 0, NULL, true,  false, 835, 6, 0.7, 33, 35, 0.3, 0.9, 2.8, 4.7, 0.2, 'PRIORITÉ QUOTIDIENNE — Excellente source bêta-carotène et vit A', 'african_grey'),
('Patate douce',       'b1000000-0000-0000-0000-000000000003', false, 0, NULL, true,  false, 961, 20, 0.3, 30, 47, 0.6, 1.6, 3, 4.2, 0.1, 'PRIORITÉ QUOTIDIENNE — Meilleure source vit A', 'african_grey'),
('Courge / Potiron',   'b1000000-0000-0000-0000-000000000003', false, 0, NULL, true,  false, 426, 9, 1, 21, 44, 0.8, 1, 0.5, 2.8, 0.1, NULL, 'african_grey'),
('Poivron rouge',      'b1000000-0000-0000-0000-000000000003', false, 0, NULL, true,  false, 157, 128, 1.6, 7, 26, 0.4, 1, 2.1, 4.2, 0.3, 'Excellente source vitamine C', 'african_grey'),
('Brocoli',            'b1000000-0000-0000-0000-000000000003', false, 0, NULL, false, false, 31, 89, 0.8, 47, 66, 0.7, 2.8, 2.6, 1.7, 0.4, 'Source calcium importante — recommandé quotidiennement', 'african_grey'),
('Pissenlit (feuilles)', 'b1000000-0000-0000-0000-000000000003', false, 0, NULL, true, false, 508, 35, 3.4, 187, 66, 3.1, 2.7, 3.5, 0.7, 0.7, 'Excellente source calcium — fleurs, feuilles, racines', 'african_grey'),
('Kale / Chou frisé',  'b1000000-0000-0000-0000-000000000003', false, 0, NULL, true,  false, 241, 120, 1.5, 150, 92, 1.5, 4.3, 3.6, 2.3, 0.9, 'Riche en calcium — recommandé', 'african_grey'),
('Épinards',           'b1000000-0000-0000-0000-000000000003', false, 1, 'Modération - acide oxalique lie le calcium', true,  false, 469, 28, 2, 99, 49, 2.7, 2.9, 2.2, 0.4, 0.4, 'Modération — acide oxalique', 'african_grey'),
('Bette / Blette',     'b1000000-0000-0000-0000-000000000003', false, 1, 'Modération - oxalate', true,  false, 306, 30, 1.9, 51, 46, 1.8, 1.8, 1.6, 1.1, 0.2, 'Modération — oxalate', 'african_grey'),
('Fenouil',            'b1000000-0000-0000-0000-000000000003', false, 0, NULL, false, false, 7, 12, 0.6, 49, 50, 0.7, 1.2, 3.1, 0, 0.2, NULL, 'african_grey'),
('Persil',             'b1000000-0000-0000-0000-000000000003', false, 0, 'Petites quantités', false, false, 421, 133, 1.3, 138, 58, 6.2, 3, 3.3, 0.9, 0.8, 'Petites quantités — riche en fer', 'african_grey'),
('Pois mange-tout',    'b1000000-0000-0000-0000-000000000003', false, 0, NULL, false, false, 54, 60, 0.4, 43, 53, 2.1, 3, 2.6, 5.4, 0.2, NULL, 'african_grey'),
('Haricots verts cuits', 'b1000000-0000-0000-0000-000000000003', false, 0, NULL, false, false, 35, 12, 0.4, 37, 38, 1, 1.8, 3, 3.3, 0.2, 'Toujours cuits', 'african_grey'),
('Maïs',               'b1000000-0000-0000-0000-000000000003', false, 0, NULL, false, false, 9, 7, 0.1, 2, 89, 0.5, 3.4, 2.7, 6.3, 1.4, NULL, 'african_grey'),
('Betterave',          'b1000000-0000-0000-0000-000000000003', false, 0, NULL, false, false, 2, 5, 0, 16, 40, 0.8, 1.6, 2.8, 6.8, 0.2, NULL, 'african_grey'),
('Radis',              'b1000000-0000-0000-0000-000000000003', false, 0, NULL, false, false, 7, 15, 0, 25, 20, 0.3, 0.7, 1.6, 1.9, 0.1, NULL, 'african_grey'),
('Laitue romaine',     'b1000000-0000-0000-0000-000000000003', false, 0, NULL, false, false, 436, 24, 0.1, 33, 30, 1, 1.2, 2.1, 1.2, 0.3, NULL, 'african_grey'),
('Chicorée',           'b1000000-0000-0000-0000-000000000003', false, 0, NULL, false, false, 286, 24, 2.3, 100, 47, 0.9, 1.7, 4, 0.7, 0.3, NULL, 'african_grey'),
('Céleri',             'b1000000-0000-0000-0000-000000000003', false, 0, NULL, false, false, 22, 3, 0.3, 40, 24, 0.2, 0.7, 1.6, 1.3, 0.2, NULL, 'african_grey');

-- ── FRUITS AUTORISÉS (10% seulement) ────────────────────────────
INSERT INTO foods (name, category_id, is_forbidden, danger_level, danger_note, beta_carotene_rich, remove_seed, vitamin_a_ug, vitamin_c_mg, vitamin_e_mg, calcium_mg, phosphorus_mg, iron_mg, protein_g, fiber_g, sugar_g, fat_g, notes, species) VALUES
('Myrtilles',            'b1000000-0000-0000-0000-000000000002', false, 0, NULL, false, false, 3, 10, 0.6, 6, 12, 0.3, 0.7, 2.4, 10, 0.3, 'Riches en antioxydants — recommandées pour le Gris', 'african_grey'),
('Fraises',              'b1000000-0000-0000-0000-000000000002', false, 0, NULL, false, false, 1, 59, 0.3, 16, 24, 0.4, 0.7, 2, 4.9, 0.3, 'Riches en antioxydants', 'african_grey'),
('Framboises',           'b1000000-0000-0000-0000-000000000002', false, 0, NULL, false, false, 2, 26, 0.9, 25, 29, 0.7, 1.2, 6.5, 4.4, 0.7, 'Riches en antioxydants', 'african_grey'),
('Grenade',              'b1000000-0000-0000-0000-000000000002', false, 0, NULL, false, false, 0, 10, 0.6, 10, 36, 0.3, 1.7, 4, 13.7, 1.2, 'Excellent antioxydant', 'african_grey'),
('Pomme',                'b1000000-0000-0000-0000-000000000002', false, 0, NULL, false, true, 3, 5, 0.2, 6, 11, 0.1, 0.3, 2.4, 10.4, 0.2, 'Retirer pépins (cyanure)', 'african_grey'),
('Mangue',               'b1000000-0000-0000-0000-000000000002', false, 0, NULL, true,  false, 54, 36, 0.9, 11, 14, 0.2, 0.8, 1.6, 13.7, 0.4, 'Bonne source bêta-carotène', 'african_grey'),
('Kiwi',                 'b1000000-0000-0000-0000-000000000002', false, 0, NULL, false, false, 4, 93, 1.5, 34, 34, 0.3, 1.1, 3, 9, 0.5, 'Excellente source vitamine C', 'african_grey'),
('Papaye',               'b1000000-0000-0000-0000-000000000002', false, 0, NULL, true,  false, 47, 62, 0.3, 20, 10, 0.3, 0.5, 1.7, 7.8, 0.3, 'Bonne source bêta-carotène et vit C', 'african_grey'),
('Figue',                'b1000000-0000-0000-0000-000000000002', false, 0, NULL, false, false, 7, 2, 0.1, 35, 14, 0.4, 0.8, 2.9, 16.3, 0.3, 'Bonne source calcium relative', 'african_grey'),
('Fruits de la passion', 'b1000000-0000-0000-0000-000000000002', false, 0, NULL, false, false, 64, 30, 0.1, 12, 68, 1.6, 2.2, 10.4, 11.2, 0.7, NULL, 'african_grey'),
('Poire',                'b1000000-0000-0000-0000-000000000002', false, 0, NULL, false, true, 1, 4, 0.1, 9, 12, 0.2, 0.4, 3.1, 9.8, 0.1, 'Retirer pépins (cyanure)', 'african_grey'),
('Agrumes (pulpe)',      'b1000000-0000-0000-0000-000000000002', false, 1, 'Petites quantités, sans peau', false, false, 11, 53, 0.2, 40, 14, 0.1, 0.9, 2.4, 9.4, 0.1, 'Petites quantités, sans peau', 'african_grey'),
('Banane',               'b1000000-0000-0000-0000-000000000002', false, 1, 'Pauvre valeur nutritionnelle pour le Gris — friandise seulement', false, false, 3, 9, 0.1, 5, 22, 0.3, 1.1, 2.6, 17, 0.3, 'Pauvre valeur nutritionnelle — friandise seulement', 'african_grey'),
('Raisin',               'b1000000-0000-0000-0000-000000000002', false, 1, 'Pauvre valeur nutritionnelle — friandise seulement', false, false, 3, 3, 0.2, 10, 20, 0.4, 0.7, 0.9, 18, 0.2, 'Pauvre valeur nutritionnelle — friandise seulement', 'african_grey');

-- ── GRAINES & CÉRÉALES ──────────────────────────────────────────
INSERT INTO foods (name, category_id, is_forbidden, danger_level, danger_note, beta_carotene_rich, remove_seed, vitamin_a_ug, vitamin_c_mg, vitamin_e_mg, calcium_mg, phosphorus_mg, iron_mg, protein_g, fiber_g, sugar_g, fat_g, notes, species) VALUES
('Millet',                    'b1000000-0000-0000-0000-000000000004', false, 1, 'Meilleure graine - modération', false, false, 0, 0, 0, 8, 285, 3, 11, 8.5, 0, 4.2, 'Meilleure graine — modération', 'african_grey'),
('Quinoa cuit',               'b1000000-0000-0000-0000-000000000004', false, 1, 'Max 2x/semaine', false, false, 1, 0, 0.6, 17, 152, 1.5, 4.4, 2.8, 0.9, 1.9, 'Max 2x/semaine', 'african_grey'),
('Graines germées mélange',   'b1000000-0000-0000-0000-000000000004', false, 0, NULL, false, false, 10, 14, 0.5, 25, 56, 1, 4, 2, 0.5, 0.5, 'Bien meilleures que graines sèches — recommandé', 'african_grey'),
('Graines de tournesol sèches', 'b1000000-0000-0000-0000-000000000004', false, 1, 'Pauvres en Ca, Vit A — favorisent obésité et carences', false, false, 0, 1, 35, 78, 660, 5.3, 21, 8.6, 2.6, 51, 'LIMITER DRASTIQUEMENT — pauvres en Ca et Vit A, favorisent obésité', 'african_grey'),
('Graines de carthame sèches', 'b1000000-0000-0000-0000-000000000004', false, 1, 'Même limitation que tournesol', false, false, 0, 0, 0, 78, 644, 4.6, 16, 0, 0, 38, 'Même limitation que tournesol', 'african_grey'),
('Cacahuètes fraîches',       'b1000000-0000-0000-0000-000000000004', false, 1, 'Aflatoxines si mal stockées — à éviter par précaution', false, false, 0, 0, 8.3, 92, 376, 4.6, 26, 8.5, 4.7, 49, 'Risque aflatoxines si mal stockées — à éviter par précaution', 'african_grey');

-- ── PROTÉINES & LÉGUMINEUSES ────────────────────────────────────
INSERT INTO foods (name, category_id, is_forbidden, danger_level, danger_note, beta_carotene_rich, remove_seed, vitamin_a_ug, vitamin_c_mg, vitamin_e_mg, calcium_mg, phosphorus_mg, iron_mg, protein_g, fiber_g, sugar_g, fat_g, notes, species) VALUES
('Haricots cuits',     'b1000000-0000-0000-0000-000000000005', false, 1, 'Modération', false, false, 0, 1, 0.1, 25, 113, 2.1, 8.7, 6.4, 0.3, 0.5, NULL, 'african_grey'),
('Lentilles cuites',   'b1000000-0000-0000-0000-000000000005', false, 1, 'Max 2x/semaine — ATTENTION fer', false, false, 2, 2, 0.1, 19, 180, 3.3, 9, 7.9, 1.8, 0.4, '⚠️ Riches en fer — donner avec modération, surveiller Iron Storage Disease', 'african_grey'),
('Pois chiches cuits', 'b1000000-0000-0000-0000-000000000005', false, 1, 'Modération', false, false, 1, 1, 0.4, 49, 168, 2.9, 9, 7.6, 4.8, 2.6, 'Max 2x/semaine', 'african_grey');

-- ── FRIANDISES / NOIX (max 1-2x/semaine) ─────────────────────────
INSERT INTO foods (name, category_id, is_forbidden, danger_level, danger_note, beta_carotene_rich, remove_seed, vitamin_a_ug, vitamin_c_mg, vitamin_e_mg, calcium_mg, phosphorus_mg, iron_mg, protein_g, fiber_g, sugar_g, fat_g, notes, species) VALUES
('Cerneaux de noix',    'b1000000-0000-0000-0000-000000000006', false, 1, 'Source sélénium — modération', false, false, 1, 1, 0.7, 98, 346, 2.9, 15, 6.7, 2.6, 65, 'Source sélénium — max 1-2x/semaine', 'african_grey'),
('Pistaches',           'b1000000-0000-0000-0000-000000000006', false, 1, 'Non salées uniquement — modération', false, false, 26, 6, 2.9, 105, 490, 3.9, 20, 10.6, 7.7, 45, 'Non salées uniquement — modération', 'african_grey'),
('Pignons de pin',      'b1000000-0000-0000-0000-000000000006', false, 1, 'Modération', false, false, 1, 1, 9.3, 16, 575, 5.5, 14, 3.7, 3.6, 68, 'Modération', 'african_grey'),
('Noix de cajou crues', 'b1000000-0000-0000-0000-000000000006', false, 1, 'Crues, non salées uniquement', false, false, 0, 1, 0.9, 37, 593, 6.7, 18, 3.3, 5.9, 44, 'Crues, non salées uniquement — modération', 'african_grey');

-- ── ALIMENTS INTERDITS ──────────────────────────────────────────
INSERT INTO foods (name, category_id, is_forbidden, danger_level, danger_note, beta_carotene_rich, remove_seed, notes, species) VALUES
('Avocat',                                 'b1000000-0000-0000-0000-000000000007', true, 3, 'Persine → MORTEL', false, false, 'MORTEL — persine attaque le cœur', 'african_grey'),
('Oignon',                                 'b1000000-0000-0000-0000-000000000007', true, 3, 'Composés soufrés → anémie hémolytique', false, false, 'MORTEL', 'african_grey'),
('Ail',                                    'b1000000-0000-0000-0000-000000000007', true, 3, 'Composés soufrés → anémie hémolytique', false, false, 'MORTEL', 'african_grey'),
('Poireau',                                'b1000000-0000-0000-0000-000000000007', true, 3, 'Composés soufrés → anémie hémolytique', false, false, 'MORTEL', 'african_grey'),
('Échalote',                               'b1000000-0000-0000-0000-000000000007', true, 3, 'Composés soufrés → anémie hémolytique', false, false, 'MORTEL', 'african_grey'),
('Chocolat',                               'b1000000-0000-0000-0000-000000000007', true, 3, 'Théobromine neurotoxique', false, false, 'MORTEL', 'african_grey'),
('Noyaux/pépins (cerise, pomme...)',       'b1000000-0000-0000-0000-000000000007', true, 3, 'Cyanure', false, false, 'MORTEL — contiennent du cyanure', 'african_grey'),
('Rhubarbe',                               'b1000000-0000-0000-0000-000000000007', true, 3, 'Acide oxalique → insuffisance rénale', false, false, 'MORTEL', 'african_grey'),
('Alcool',                                 'b1000000-0000-0000-0000-000000000007', true, 3, 'Mortel pour les oiseaux', false, false, 'MORTEL', 'african_grey'),
('Café',                                   'b1000000-0000-0000-0000-000000000007', true, 3, 'Caféine mortelle', false, false, 'MORTEL', 'african_grey'),
('Thé',                                    'b1000000-0000-0000-0000-000000000007', true, 3, 'Caféine/théine mortelle', false, false, 'MORTEL', 'african_grey'),
('Xylitol',                                'b1000000-0000-0000-0000-000000000007', true, 3, 'Édulcorant mortel', false, false, 'MORTEL', 'african_grey'),
('Cacahuètes mal stockées',                'b1000000-0000-0000-0000-000000000007', true, 3, 'Aspergillus/aflatoxines — foie très fragile', false, false, 'MORTEL — aflatoxines, foie très fragile du Gris', 'african_grey'),
('Macadamia',                              'b1000000-0000-0000-0000-000000000007', true, 3, 'Toxique pour les oiseaux', false, false, 'MORTEL', 'african_grey'),
('Feuilles/tiges de tomate',               'b1000000-0000-0000-0000-000000000007', true, 2, 'Tomatine toxique', false, false, 'TOXIQUE', 'african_grey'),
('Aubergine crue',                         'b1000000-0000-0000-0000-000000000007', true, 2, 'Solanine', false, false, 'TOXIQUE', 'african_grey'),
('Champignons',                            'b1000000-0000-0000-0000-000000000007', true, 2, 'Sources contradictoires — éviter par précaution', false, false, 'À éviter par précaution', 'african_grey'),
('Sel / Sucre / Plats cuisinés',           'b1000000-0000-0000-0000-000000000007', true, 2, 'Aliments humains transformés', false, false, 'Interdit', 'african_grey'),
('Produits laitiers',                       'b1000000-0000-0000-0000-000000000007', true, 2, 'Intolérance lactose', false, false, 'Interdit', 'african_grey'),
('Suppléments vitaminiques sans véto',      'b1000000-0000-0000-0000-000000000007', true, 1, 'Sur régime pellets : excès Vit A aussi dangereux que carence', false, false, 'Jamais sans avis vétérinaire — risque surdosage sur régime pellets', 'african_grey'),
('Graines sèches en excès',                'b1000000-0000-0000-0000-000000000007', true, 1, 'Obésité + carences calcium/vitamine A', false, false, 'Obésité + carences calcium/Vit A', 'african_grey');

-- ── CALENDRIER BIOLOGIQUE — GRIS DU GABON ────────────────────────
INSERT INTO bio_calendar_events
  (event_type, title, recurrence_month_start, recurrence_month_end, color, icon, description, dietary_advice, species)
VALUES
('reproduction',
 '🥚 Saison de reproduction',
 1, 6,
 '#EF4444', '🥚',
 'En captivité sous nos latitudes, la reproduction s''étale de janvier à juin (1 à 2 couvées/an). Ponte de 3 à 5 œufs. Incubation : 28-30 jours (femelle couve, nourrie par le mâle). Les jeunes quittent le nid à 12 semaines. Maturité sexuelle : 3 à 5 ans. Comportements : régurgitation, recherche de cavités, possessivité accrue, agressivité possible. Ne jamais caresser le dos/cloaque.',
 'Augmenter calcium (brocoli, pissenlit, kale). Maintenir Vit A quotidienne. Protéines légèrement augmentées (légumineuses cuites). Réduire fer (éviter lentilles en excès — Iron Storage Disease). Pas de suppléments vitaminiques sans avis véto.',
 'african_grey'),

('hormones',
 '🌡️ Pic hormonal printemps',
 3, 5,
 '#F97316', '🌡️',
 'Pic hormonal lié à l''allongement des jours (mars-mai en captivité). Comportements : vocalises intenses, morsures, régurgitation, plumage gonflé, masturbation sur perchoir. Réduire à 10h de lumière/jour pour atténuer. Le Gris peut aussi développer de l''anxiété accrue pendant cette période.',
 'Réduire fruits sucrés. Augmenter légumes verts. Maintenir calcium quotidien. Éviter toute stimulation (caresses dos/cloaque strictement interdites).',
 'african_grey'),

('mue',
 '🪶 Mue principale',
 8, 10,
 '#F59E0B', '🪶',
 'Le Gris du Gabon est une espèce ÉQUATORIALE : il ne mue pas à date fixe comme les espèces tempérées. La mue principale dure 6 à 12 semaines, survient typiquement fin été/automne. Les plumes de poudre (powder-down) se renouvellent continuellement tout au long de l''année — c''est normal et signe de bonne santé. ATTENTION : ne pas confondre mue avec plumage (pterotillomania) — si le Gris tire ses plumes activement, c''est un comportement pathologique nécessitant une consultation vétérinaire urgente.',
 'Protéines ++ : légumineuses cuites, graines germées. Bêta-carotène quotidien obligatoire (carotte, patate douce). Brumisations fréquentes recommandées. Calcium maintenu (kale, pissenlit). Surveiller Iron Storage Disease : ne pas augmenter les aliments riches en fer.',
 'african_grey'),

('mue',
 '🪶 Mues partielles (continues)',
 1, 12,
 '#FCD34D', '🪶',
 'Le Gris perd des plumes en continu toute l''année, avec des périodes plus intenses. C''est NORMAL pour une espèce équatoriale. Si chute de plumes brutale ou zones dégarnies → consulter vétérinaire.',
 'Maintenir bêta-carotène et protéines de qualité en continu.',
 'african_grey'),

('bien_etre',
 '✨ Période calme',
 6, 7,
 '#22C55E', '✨',
 'Période post-reproduction, généralement juin-juillet. Comportement plus stable, meilleure réceptivité aux interactions et apprentissages. Idéale pour introduire nouveaux aliments.',
 'Maintenir équilibre standard. Bonne période pour introduire de nouveaux légumes ou textures.',
 'african_grey'),

('veterinaire',
 '🩺 Bilan vétérinaire (janvier)',
 1, 1,
 '#3B82F6', '🏥',
 'Bilan recommandé 2x/an. BILAN SANGUIN ANNUEL IMPÉRATIF pour surveiller : calcémie (hypocalcémie silencieuse fréquente), marqueurs de surcharge en fer (Iron Storage Disease), carences vitamine A. Vérification bec, ongles, poids officiel.',
 'Exporter CSV des repas des 3 derniers mois depuis Paramètres.',
 'african_grey'),

('veterinaire',
 '🩺 Bilan vétérinaire (juillet)',
 7, 7,
 '#3B82F6', '🏥',
 'Bilan de mi-année. Vérification poids, plumage et comportement. Bilan sanguin si non fait en janvier.',
 'Exporter CSV des repas des 3 derniers mois depuis Paramètres.',
 'african_grey');
