-- ============================================================
-- ECLECTUSCARE — Seed Data
-- ============================================================

-- ── CATÉGORIES ────────────────────────────────────────────────
INSERT INTO food_categories (id, name, color, icon) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Fruits',                   '#F97316', '🍊'),
  ('a1000000-0000-0000-0000-000000000002', 'Légumes',                  '#22C55E', '🥦'),
  ('a1000000-0000-0000-0000-000000000003', 'Germinations',             '#84CC16', '🌱'),
  ('a1000000-0000-0000-0000-000000000004', 'Céréales & Légumineuses',  '#EAB308', '🌾'),
  ('a1000000-0000-0000-0000-000000000005', 'Noix & Graines',           '#A78BFA', '🥜'),
  ('a1000000-0000-0000-0000-000000000006', 'Fleurs & Herbes',          '#EC4899', '🌸'),
  ('a1000000-0000-0000-0000-000000000007', 'Compléments',              '#06B6D4', '💊'),
  ('a1000000-0000-0000-0000-000000000008', 'Interdit',                 '#EF4444', '☠️');

-- ── FRUITS AUTORISÉS ──────────────────────────────────────────
INSERT INTO foods (name, category_id, is_forbidden, danger_level, danger_note, beta_carotene_rich, remove_seed, vitamin_a_ug, vitamin_c_mg, vitamin_e_mg, calcium_mg, phosphorus_mg, iron_mg, protein_g, fiber_g, sugar_g, fat_g, notes) VALUES
('Grenade',       'a1000000-0000-0000-0000-000000000001', false, 0, NULL, false, false, 0, 10, 0.6, 10, 36, 0.3, 1.7, 4, 13.7, 1.2, 'Favorite absolue'),
('Mangue',        'a1000000-0000-0000-0000-000000000001', false, 0, NULL, true,  false, 54, 36, 0.9, 11, 14, 0.2, 0.8, 1.6, 13.7, 0.4, 'Quotidien recommandé — riche bêta-carotène'),
('Papaye',        'a1000000-0000-0000-0000-000000000001', false, 0, NULL, true,  false, 47, 62, 0.3, 20, 10, 0.3, 0.5, 1.7, 7.8, 0.3, 'Quotidien recommandé — riche bêta-carotène'),
('Figue',         'a1000000-0000-0000-0000-000000000001', false, 0, NULL, false, false, 7, 2, 0.1, 35, 14, 0.4, 0.8, 2.9, 16.3, 0.3, NULL),
('Goyave',        'a1000000-0000-0000-0000-000000000001', false, 0, NULL, false, false, 31, 228, 0.7, 18, 40, 0.3, 2.6, 5.4, 8.9, 1, NULL),
('Pomme',         'a1000000-0000-0000-0000-000000000001', false, 0, NULL, false, true,  3, 5, 0.2, 6, 11, 0.1, 0.3, 2.4, 10.4, 0.2, 'Retirer pépins (cyanure)'),
('Poire',         'a1000000-0000-0000-0000-000000000001', false, 0, NULL, false, true,  1, 4, 0.1, 9, 12, 0.2, 0.4, 3.1, 9.8, 0.1, 'Retirer pépins (cyanure)'),
('Kiwi',          'a1000000-0000-0000-0000-000000000001', false, 0, NULL, false, false, 4, 93, 1.5, 34, 34, 0.3, 1.1, 3, 9, 0.5, NULL),
('Melon',         'a1000000-0000-0000-0000-000000000001', false, 0, NULL, true,  false, 169, 36, 0, 9, 15, 0.2, 0.8, 0.9, 7.9, 0.2, NULL),
('Pastèque',      'a1000000-0000-0000-0000-000000000001', false, 0, NULL, true,  false, 28, 8, 0.1, 7, 11, 0.2, 0.6, 0.4, 6.2, 0.2, NULL),
('Cerise',        'a1000000-0000-0000-0000-000000000001', false, 0, NULL, false, true,  3, 7, 0.1, 13, 21, 0.4, 1.1, 2.1, 12.8, 0.2, 'Retirer noyau (cyanure)'),
('Abricot',       'a1000000-0000-0000-0000-000000000001', false, 0, NULL, true,  true,  96, 10, 0.9, 13, 23, 0.4, 1.4, 2, 9.2, 0.4, 'Retirer noyau (cyanure)'),
('Pêche',         'a1000000-0000-0000-0000-000000000001', false, 0, NULL, true,  true,  16, 7, 0.7, 6, 20, 0.3, 0.9, 1.5, 8.4, 0.3, 'Retirer noyau (cyanure)'),
('Prune',         'a1000000-0000-0000-0000-000000000001', false, 0, NULL, false, true,  17, 10, 0.3, 6, 16, 0.2, 0.7, 1.4, 9.9, 0.3, 'Retirer noyau (cyanure)'),
('Raisin',        'a1000000-0000-0000-0000-000000000001', false, 1, 'Modération - index glycémique élevé', false, false, 3, 3, 0.2, 10, 20, 0.4, 0.7, 0.9, 18, 0.2, 'Modération — sucré'),
('Fraise',        'a1000000-0000-0000-0000-000000000001', false, 1, 'Modération', false, false, 1, 59, 0.3, 16, 24, 0.4, 0.7, 2, 4.9, 0.3, 'Modération'),
('Banane',        'a1000000-0000-0000-0000-000000000001', false, 1, 'Modération - très sucré', false, false, 3, 9, 0.1, 5, 22, 0.3, 1.1, 2.6, 17, 0.3, 'Modération — très sucré'),
('Tomate mûre',   'a1000000-0000-0000-0000-000000000001', false, 1, 'Modération + jamais feuilles/tiges', true,  false, 42, 14, 0.5, 10, 24, 0.3, 0.9, 1.2, 2.6, 0.2, 'Modération — jamais feuilles ni tiges'),
('Agrumes (pulpe)', 'a1000000-0000-0000-0000-000000000001', false, 1, 'Petites quantités, sans peau', false, false, 11, 53, 0.2, 40, 14, 0.1, 0.9, 2.4, 9.4, 0.1, 'Petites quantités, sans peau');

-- ── LÉGUMES AUTORISÉS ──────────────────────────────────────────
INSERT INTO foods (name, category_id, is_forbidden, danger_level, danger_note, beta_carotene_rich, remove_seed, vitamin_a_ug, vitamin_c_mg, vitamin_e_mg, calcium_mg, phosphorus_mg, iron_mg, protein_g, fiber_g, sugar_g, fat_g, notes) VALUES
('Carotte',            'a1000000-0000-0000-0000-000000000002', false, 0, NULL, true,  false, 835, 6, 0.7, 33, 35, 0.3, 0.9, 2.8, 4.7, 0.2, 'PRIORITÉ QUOTIDIENNE — Excellente source vit A'),
('Patate douce',       'a1000000-0000-0000-0000-000000000002', false, 0, NULL, true,  false, 961, 20, 0.3, 30, 47, 0.6, 1.6, 3, 4.2, 0.1, 'PRIORITÉ QUOTIDIENNE — Meilleure source vit A'),
('Potiron / Courge',   'a1000000-0000-0000-0000-000000000002', false, 0, NULL, true,  false, 426, 9, 1, 21, 44, 0.8, 1, 0.5, 2.8, 0.1, NULL),
('Poivron rouge',      'a1000000-0000-0000-0000-000000000002', false, 0, NULL, true,  false, 157, 128, 1.6, 7, 26, 0.4, 1, 2.1, 4.2, 0.3, 'Excellente source vitamine C'),
('Poivron vert',       'a1000000-0000-0000-0000-000000000002', false, 0, NULL, false, false, 18, 80, 0.4, 10, 20, 0.3, 0.9, 1.7, 2.4, 0.2, NULL),
('Piment',             'a1000000-0000-0000-0000-000000000002', false, 0, NULL, true,  false, 48, 144, 0.7, 14, 43, 1, 1.9, 1.5, 5.3, 0.4, NULL),
('Brocoli',            'a1000000-0000-0000-0000-000000000002', false, 0, NULL, false, false, 31, 89, 0.8, 47, 66, 0.7, 2.8, 2.6, 1.7, 0.4, 'Excellent — riche calcium'),
('Courgette',          'a1000000-0000-0000-0000-000000000002', false, 0, NULL, false, false, 10, 17, 0.1, 16, 38, 0.4, 1.2, 1, 2.5, 0.3, NULL),
('Betterave',          'a1000000-0000-0000-0000-000000000002', false, 0, NULL, false, false, 2, 5, 0, 16, 40, 0.8, 1.6, 2.8, 6.8, 0.2, NULL),
('Haricots verts cuits', 'a1000000-0000-0000-0000-000000000002', false, 0, NULL, false, false, 35, 12, 0.4, 37, 38, 1, 1.8, 3, 3.3, 0.2, 'Toujours cuits uniquement'),
('Pois mange-tout',    'a1000000-0000-0000-0000-000000000002', false, 0, NULL, false, false, 54, 60, 0.4, 43, 53, 2.1, 3, 2.6, 5.4, 0.2, NULL),
('Maïs cuit',          'a1000000-0000-0000-0000-000000000002', false, 0, NULL, false, false, 9, 7, 0.1, 2, 89, 0.5, 3.4, 2.7, 6.3, 1.4, NULL),
('Céleri',             'a1000000-0000-0000-0000-000000000002', false, 0, NULL, false, false, 22, 3, 0.3, 40, 24, 0.2, 0.7, 1.6, 1.3, 0.2, NULL),
('Radis',              'a1000000-0000-0000-0000-000000000002', false, 0, NULL, false, false, 7, 15, 0, 25, 20, 0.3, 0.7, 1.6, 1.9, 0.1, NULL),
('Laitue',             'a1000000-0000-0000-0000-000000000002', false, 0, NULL, false, false, 25, 4, 0.3, 18, 20, 0.4, 0.9, 1.1, 0.8, 0.1, NULL),
('Épinards',           'a1000000-0000-0000-0000-000000000002', false, 1, 'Modération - acide oxalique', true,  false, 469, 28, 2, 99, 49, 2.7, 2.9, 2.2, 0.4, 0.4, 'Modération — acide oxalique lie le calcium'),
('Blette',             'a1000000-0000-0000-0000-000000000002', false, 0, NULL, true,  false, 306, 30, 1.9, 51, 46, 1.8, 1.8, 1.6, 1.1, 0.2, NULL),
('Mâche',              'a1000000-0000-0000-0000-000000000002', false, 0, NULL, true,  false, 335, 38, 0.5, 38, 49, 2.2, 2, 2.2, 0.4, 0.4, NULL);

-- ── GERMINATIONS ──────────────────────────────────────────────
INSERT INTO foods (name, category_id, is_forbidden, danger_level, danger_note, beta_carotene_rich, remove_seed, vitamin_a_ug, vitamin_c_mg, vitamin_e_mg, calcium_mg, phosphorus_mg, iron_mg, protein_g, fiber_g, sugar_g, fat_g, notes) VALUES
('Germinations fraîches mélangées', 'a1000000-0000-0000-0000-000000000003', false, 0, NULL, false, false, 10, 14, 0.5, 25, 56, 1, 4, 2, 0.5, 0.5, 'À donner QUOTIDIENNEMENT — essentiel'),
('Graines tournesol germées',       'a1000000-0000-0000-0000-000000000003', false, 0, NULL, false, false, 5, 10, 11, 20, 180, 2, 5, 2, 1, 8, 'Seulement germées, jamais sèches'),
('Graines carthame germées',        'a1000000-0000-0000-0000-000000000003', false, 0, NULL, false, false, 2, 8, 5, 15, 120, 1.5, 4.5, 1.5, 0.5, 6, 'Seulement germées, jamais sèches');

-- ── CÉRÉALES & LÉGUMINEUSES ────────────────────────────────────
INSERT INTO foods (name, category_id, is_forbidden, danger_level, danger_note, beta_carotene_rich, remove_seed, vitamin_a_ug, vitamin_c_mg, vitamin_e_mg, calcium_mg, phosphorus_mg, iron_mg, protein_g, fiber_g, sugar_g, fat_g, notes) VALUES
('Riz brun cuit',       'a1000000-0000-0000-0000-000000000004', false, 1, 'Max 2x/semaine', false, false, 0, 0, 0.1, 10, 83, 0.4, 2.6, 1.8, 0.4, 0.9, 'Max 2x/semaine'),
('Quinoa cuit',         'a1000000-0000-0000-0000-000000000004', false, 1, 'Max 2x/semaine', false, false, 1, 0, 0.6, 17, 152, 1.5, 4.4, 2.8, 0.9, 1.9, 'Max 2x/semaine'),
('Couscous non salé',   'a1000000-0000-0000-0000-000000000004', false, 1, 'Max 2x/semaine', false, false, 0, 0, 0.1, 8, 22, 0.4, 3.8, 1.4, 0.3, 0.2, 'Max 2x/semaine, jamais salé'),
('Orge cuit',           'a1000000-0000-0000-0000-000000000004', false, 1, 'Max 2x/semaine', false, false, 1, 0, 0, 11, 54, 1.3, 2.3, 3.8, 0.3, 0.4, 'Max 2x/semaine'),
('Lentilles cuites',    'a1000000-0000-0000-0000-000000000004', false, 1, 'Max 2x/semaine', false, false, 2, 2, 0.1, 19, 180, 3.3, 9, 7.9, 1.8, 0.4, 'Max 2x/semaine — bonne source fer et protéines'),
('Pois chiches cuits',  'a1000000-0000-0000-0000-000000000004', false, 1, 'Max 2x/semaine', false, false, 1, 1, 0.4, 49, 168, 2.9, 9, 7.6, 4.8, 2.6, 'Max 2x/semaine'),
('Haricots rouges crus', 'a1000000-0000-0000-0000-000000000008', true, 3, 'Lectines mortelles — JAMAIS cru', false, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'MORTEL CRU — lectines toxiques');

-- ── NOIX & GRAINES (friandises) ────────────────────────────────
INSERT INTO foods (name, category_id, is_forbidden, danger_level, danger_note, beta_carotene_rich, remove_seed, vitamin_a_ug, vitamin_c_mg, vitamin_e_mg, calcium_mg, phosphorus_mg, iron_mg, protein_g, fiber_g, sugar_g, fat_g, notes) VALUES
('Noix de cajou crues non salées', 'a1000000-0000-0000-0000-000000000005', false, 1, 'Friandise — crues et non salées uniquement', false, false, 0, 1, 0.9, 37, 593, 6.7, 18, 3.3, 5.9, 44, 'Friandise max 1-2x/semaine. Source partielle (perroquets généraux). ⚠️ À confirmer avec vétérinaire aviaire'),
('Cerneaux de noix',               'a1000000-0000-0000-0000-000000000005', false, 1, 'Friandise — source de sélénium', false, false, 1, 1, 0.7, 98, 346, 2.9, 15, 6.7, 2.6, 65, 'Friandise max 1-2x/semaine. Source partielle (perroquets généraux). ⚠️ À confirmer avec vétérinaire aviaire'),
('Millet',                          'a1000000-0000-0000-0000-000000000005', false, 1, 'Petite quantité / récompense', false, false, 0, 0, 0, 8, 285, 3, 11, 8.5, 0, 4.2, 'Récompense d''entraînement'),
('Graines canari mélange',          'a1000000-0000-0000-0000-000000000005', false, 1, 'Petite quantité uniquement', false, false, 0, 0, 0, 20, 300, 3, 14, 6, 1, 5, 'Petite quantité uniquement');

-- ── FLEURS & HERBES ────────────────────────────────────────────
INSERT INTO foods (name, category_id, is_forbidden, danger_level, danger_note, beta_carotene_rich, remove_seed, vitamin_a_ug, vitamin_c_mg, vitamin_e_mg, calcium_mg, phosphorus_mg, iron_mg, protein_g, fiber_g, sugar_g, fat_g, notes) VALUES
('Pissenlit',   'a1000000-0000-0000-0000-000000000006', false, 0, NULL, true, false, 508, 35, 3.4, 187, 66, 3.1, 2.7, 3.5, 0.7, 0.7, 'Validé éclectus — fleurs, feuilles, racines'),
('Rose (pétales bio)', 'a1000000-0000-0000-0000-000000000006', false, 0, NULL, false, false, 10, 426, 5, 50, 20, 1, 1.6, 2, 3, 0.5, 'Sans pesticides obligatoire — bio uniquement'),
('Basilic',     'a1000000-0000-0000-0000-000000000006', false, 0, NULL, false, false, 264, 18, 0.8, 177, 56, 3.2, 3.2, 1.6, 0.3, 0.6, 'Fleurs + feuilles'),
('Bourrache',   'a1000000-0000-0000-0000-000000000006', false, 1, 'Source généraliste oiseaux — à confirmer véto', false, false, 210, 35, 0, 93, 53, 3.3, 1.8, 0, 0, 0, 'Source généraliste oiseaux — ⚠️ à confirmer avec vétérinaire aviaire'),
('Souci / Calendula', 'a1000000-0000-0000-0000-000000000006', false, 1, 'Source généraliste oiseaux — à confirmer véto', false, false, 50, 10, 0, 40, 20, 1, 1, 2, 0, 0, 'Source généraliste oiseaux — ⚠️ à confirmer avec vétérinaire aviaire'),
('Violette',    'a1000000-0000-0000-0000-000000000006', false, 1, 'Source généraliste oiseaux — à confirmer véto', false, false, 30, 15, 0, 30, 15, 0.5, 0.8, 1, 0, 0, 'Source généraliste oiseaux — ⚠️ à confirmer avec vétérinaire aviaire');

-- ── ALIMENTS INTERDITS ─────────────────────────────────────────
INSERT INTO foods (name, category_id, is_forbidden, danger_level, danger_note, beta_carotene_rich, remove_seed, notes) VALUES
('Avocat',                                 'a1000000-0000-0000-0000-000000000008', true, 3, 'Persine → attaque le cœur, MORTEL même en petite dose', false, false, 'MORTEL'),
('Oignon',                                 'a1000000-0000-0000-0000-000000000008', true, 3, 'Composés soufrés → anémie hémolytique', false, false, 'MORTEL'),
('Ail',                                    'a1000000-0000-0000-0000-000000000008', true, 3, 'Composés soufrés → anémie hémolytique', false, false, 'MORTEL'),
('Poireau',                                'a1000000-0000-0000-0000-000000000008', true, 3, 'Composés soufrés → anémie hémolytique', false, false, 'MORTEL'),
('Ciboulette',                             'a1000000-0000-0000-0000-000000000008', true, 3, 'Composés soufrés → anémie hémolytique', false, false, 'MORTEL'),
('Échalote',                               'a1000000-0000-0000-0000-000000000008', true, 3, 'Composés soufrés → anémie hémolytique', false, false, 'MORTEL'),
('Chocolat',                               'a1000000-0000-0000-0000-000000000008', true, 3, 'Théobromine neurotoxique', false, false, 'MORTEL'),
('Noyaux et pépins (pomme, poire, cerise, pêche, prune, abricot)', 'a1000000-0000-0000-0000-000000000008', true, 3, 'Cyanure', false, false, 'MORTEL — contiennent du cyanure'),
('Pomme de terre verte et pousses',        'a1000000-0000-0000-0000-000000000008', true, 3, 'Solanine, neurotoxine', false, false, 'MORTEL'),
('Rhubarbe',                               'a1000000-0000-0000-0000-000000000008', true, 3, 'Acide oxalique → insuffisance rénale', false, false, 'MORTEL'),
('Alcool',                                 'a1000000-0000-0000-0000-000000000008', true, 3, 'Mortel pour les oiseaux', false, false, 'MORTEL'),
('Café',                                   'a1000000-0000-0000-0000-000000000008', true, 3, 'Caféine mortelle pour les oiseaux', false, false, 'MORTEL'),
('Thé',                                    'a1000000-0000-0000-0000-000000000008', true, 3, 'Caféine/théine mortelle', false, false, 'MORTEL'),
('Xylitol (E968)',                         'a1000000-0000-0000-0000-000000000008', true, 3, 'Édulcorant mortel', false, false, 'MORTEL'),
('Cacahuète',                              'a1000000-0000-0000-0000-000000000008', true, 3, 'Aflatoxines cancérigènes, foie très fragile de l''éclectus', false, false, 'MORTEL — aflatoxines'),
('Macadamia',                              'a1000000-0000-0000-0000-000000000008', true, 3, 'Toxique pour les oiseaux', false, false, 'MORTEL'),
('Feuilles et tiges de tomate',            'a1000000-0000-0000-0000-000000000008', true, 2, 'Tomatine toxique', false, false, 'TOXIQUE'),
('Aubergine crue',                         'a1000000-0000-0000-0000-000000000008', true, 2, 'Solanine', false, false, 'TOXIQUE'),
('Champignons',                            'a1000000-0000-0000-0000-000000000008', true, 2, '⚠️ Sources contradictoires — à éviter par précaution, foie fragile', false, false, 'À éviter — foie fragile'),
('Noix du Brésil',                         'a1000000-0000-0000-0000-000000000008', true, 2, 'Aflatoxines cancérigènes, contamination radioactive naturelle', false, false, 'TOXIQUE'),
('Noisette',                               'a1000000-0000-0000-0000-000000000008', true, 1, 'Déconseillée spécifiquement pour l''éclectus', false, false, 'Déconseillée pour éclectus'),
('Sel / Sucre / Plats cuisinés / Produits laitiers', 'a1000000-0000-0000-0000-000000000008', true, 2, 'Aliments humains transformés', false, false, 'Interdit'),
('Extrudés en excès',                      'a1000000-0000-0000-0000-000000000008', true, 1, 'Hypervitaminose → picage, tremblements des doigts', false, false, 'Risque hypervitaminose'),
('Graines sèches en grande quantité',      'a1000000-0000-0000-0000-000000000008', true, 1, 'Tube digestif inadapté, risque hépatique', false, false, 'Tube digestif inadapté'),
('Agrumes avec peau',                      'a1000000-0000-0000-0000-000000000008', true, 1, 'Perturbateurs hormonaux + pesticides', false, false, 'Perturbateurs hormonaux'),
('Boissons énergisantes',                  'a1000000-0000-0000-0000-000000000008', true, 3, 'Mortel', false, false, 'MORTEL');

-- ── CALENDRIER BIOLOGIQUE ─────────────────────────────────────
INSERT INTO bio_calendar_events
  (event_type, title, recurrence_month_start, recurrence_month_end, color, icon, description, dietary_advice)
VALUES
('nidification',
 '🪺 Saison de reproduction',
 7, 1,
 '#A855F7', '🪺',
 'Période de nidification naturelle (juillet → janvier). La femelle devient territoriale, possessive, moins interactive. Elle cherchera des cavités sombres (tiroirs, armoires). Comportements : régurgitation, parade nuptiale, protection de territoire. Maturité sexuelle : 2-3 ans. Couvée : 2 œufs blancs. Incubation : 26-28 jours. Oisillons au nid : 60-80 jours.',
 'Augmenter protéines et légumineuses cuites. Calcium important (brocoli). Réduire fruits trop sucrés. Germinations quotidiennes impératives.'),

('hormones',
 '🔴 Pic hormonal intense',
 9, 11,
 '#EF4444', '🌡️',
 'Pic hormonal automnal (septembre → novembre). Comportements : agressivité soudaine, morsures, vocalises intenses, plumage gonflé. Ne jamais caresser le dos ou le cloaque (stimulation hormonale). Photopériode max 12h lumière/jour recommandée en captivité.',
 'Augmenter la verdure : pissenlit, blette, mâche. Réduire fortement les sucres : banane et raisin à éviter. Éviter aliments réputés stimulants hormonaux. Germinations ++.'),

('mue',
 '🍂 Mue principale',
 2, 4,
 '#F59E0B', '🪶',
 'Mue annuelle principale (février → avril). Renouvellement progressif du plumage sur 6-12 mois avec pic intense en mars-avril. Brumisations fréquentes recommandées (aide à l''éclosion des plumes en fourreau). Si mue incomplète ou anormalement longue > 8 semaines intensément : consulter un vétérinaire aviaire (carence acides aminés soufrés possible).',
 'Germinations ++ (acides aminés essentiels pour la kératine). Bêta-carotène renforcé QUOTIDIEN : carotte, patate douce, mangue obligatoires. Spiruline petite pincée 1x/semaine si toléré. Limiter le stress.'),

('mue',
 '🍃 Mue partielle d''entretien',
 8, 9,
 '#FCD34D', '🪶',
 'Mue partielle d''entretien (août → septembre). Moins intensive que la mue principale. Quelques plumes de couverture renouvelées.',
 'Maintenir bêta-carotène quotidien et brumisations régulières. Augmenter légèrement les protéines (germinations, légumineuses).'),

('bien_etre',
 '🌿 Période calme — Bien-être optimal',
 5, 6,
 '#22C55E', '✨',
 'Période post-mue (mai → juin). L''oiseau est au meilleur de son plumage et de son comportement. Appétit et interaction à leur meilleur.',
 'Période idéale pour introduire de nouveaux aliments et enrichissements environnementaux. Maintenir la diversité du régime.'),

('veterinaire',
 '🩺 Bilan vétérinaire annuel',
 1, 1,
 '#3B82F6', '🏥',
 'Bilan annuel recommandé en janvier : pesée officielle, inspection du plumage, bilan sanguin (1x/an pour détecter carences/infections silencieuses), contrôle bec et griffes.',
 'Préparer un récapitulatif de l''alimentation des 3 derniers mois (export CSV depuis les paramètres) à apporter au vétérinaire.'),

('veterinaire',
 '🩺 Bilan vétérinaire mi-année',
 7, 7,
 '#3B82F6', '🏥',
 'Bilan de mi-année en juillet : vérification avant la saison de reproduction. Contrôle poids, plumage et comportement.',
 'Préparer export alimentation des 3 derniers mois depuis les paramètres.');

-- ── PARAMÈTRES PAR DÉFAUT ──────────────────────────────────────
INSERT INTO user_settings (bird_name, bird_birth_date, weight_min_grams, weight_max_grams)
VALUES ('Mon Éclectus', NULL, 380, 550);
