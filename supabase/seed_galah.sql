-- ============================================================
-- PARROTCARE — Seed Data: Cacatoès Rosalbin / Galah
-- (Eolophus roseicapillus)
-- ============================================================

-- ── CATÉGORIES ────────────────────────────────────────────────
INSERT INTO food_categories (id, name, color, icon, species) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Granulés Low-Fat',             '#6B7280', '🟤', 'galah'),
  ('c1000000-0000-0000-0000-000000000002', 'Fruits',                       '#F97316', '🍊', 'galah'),
  ('c1000000-0000-0000-0000-000000000003', 'Légumes',                      '#22C55E', '🥦', 'galah'),
  ('c1000000-0000-0000-0000-000000000004', 'Graines & Céréales',           '#EAB308', '🌾', 'galah'),
  ('c1000000-0000-0000-0000-000000000005', 'Protéines & Légumineuses',     '#A78BFA', '🫘', 'galah'),
  ('c1000000-0000-0000-0000-000000000006', 'Friandises / Noix',            '#EC4899', '🥜', 'galah'),
  ('c1000000-0000-0000-0000-000000000007', 'Interdit',                     '#EF4444', '☠️', 'galah');

-- ── GRANULÉS LOW-FAT ────────────────────────────────────────────
INSERT INTO foods (name, category_id, is_forbidden, danger_level, danger_note, beta_carotene_rich, remove_seed, vitamin_a_ug, vitamin_c_mg, vitamin_e_mg, calcium_mg, phosphorus_mg, iron_mg, protein_g, fiber_g, sugar_g, fat_g, notes, species) VALUES
('Pellets low-fat (Harrison''s, Roudybush, etc.)', 'c1000000-0000-0000-0000-000000000001', false, 0, NULL, false, false, 180, 8, 1.5, 60, 40, 0.4, 12, 4, 2, 3, 'BASE DU RÉGIME — 70% de l''alimentation. IMPÉRATIF : choisir des pellets FAIBLES EN GRAS (< 5% lipides). Le Rosalbin est extrêmement sensible à l''obésité.', 'galah'),
('Pellets maintenance low-fat', 'c1000000-0000-0000-0000-000000000001', false, 0, NULL, false, false, 140, 6, 1, 50, 35, 0.3, 10, 3, 3, 3, 'Alternative basse en gras. Vérifier composition : < 5% lipides, pas de colorants, pas de sucres ajoutés.', 'galah');

-- ── LÉGUMES AUTORISÉS (15% du régime) ────────────────────────────
INSERT INTO foods (name, category_id, is_forbidden, danger_level, danger_note, beta_carotene_rich, remove_seed, vitamin_a_ug, vitamin_c_mg, vitamin_e_mg, calcium_mg, phosphorus_mg, iron_mg, protein_g, fiber_g, sugar_g, fat_g, notes, species) VALUES
('Carotte',            'c1000000-0000-0000-0000-000000000003', false, 0, NULL, true,  false, 835, 6, 0.7, 33, 35, 0.3, 0.9, 2.8, 4.7, 0.2, 'Quotidien recommandé — excellente source bêta-carotène', 'galah'),
('Patate douce',       'c1000000-0000-0000-0000-000000000003', false, 0, NULL, true,  false, 961, 20, 0.3, 30, 47, 0.6, 1.6, 3, 4.2, 0.1, 'Quotidien recommandé — meilleure source vit A', 'galah'),
('Courge / Potiron',   'c1000000-0000-0000-0000-000000000003', false, 0, NULL, true,  false, 426, 9, 1, 21, 44, 0.8, 1, 0.5, 2.8, 0.1, NULL, 'galah'),
('Poivron rouge',      'c1000000-0000-0000-0000-000000000003', false, 0, NULL, true,  false, 157, 128, 1.6, 7, 26, 0.4, 1, 2.1, 4.2, 0.3, 'Excellente source vitamine C', 'galah'),
('Brocoli',            'c1000000-0000-0000-0000-000000000003', false, 0, NULL, false, false, 31, 89, 0.8, 47, 66, 0.7, 2.8, 2.6, 1.7, 0.4, 'Source calcium — recommandé', 'galah'),
('Pissenlit (feuilles)', 'c1000000-0000-0000-0000-000000000003', false, 0, NULL, true, false, 508, 35, 3.4, 187, 66, 3.1, 2.7, 3.5, 0.7, 0.7, 'Excellente source calcium et vit A', 'galah'),
('Épinards',           'c1000000-0000-0000-0000-000000000003', false, 1, 'Modération - acide oxalique', true,  false, 469, 28, 2, 99, 49, 2.7, 2.9, 2.2, 0.4, 0.4, 'Modération — acide oxalique', 'galah'),
('Bette / Blette',     'c1000000-0000-0000-0000-000000000003', false, 1, 'Modération - oxalate', true,  false, 306, 30, 1.9, 51, 46, 1.8, 1.8, 1.6, 1.1, 0.2, 'Modération — oxalate', 'galah'),
('Persil',             'c1000000-0000-0000-0000-000000000003', false, 0, 'Petites quantités', false, false, 421, 133, 1.3, 138, 58, 6.2, 3, 3.3, 0.9, 0.8, 'Petites quantités', 'galah'),
('Fenouil',            'c1000000-0000-0000-0000-000000000003', false, 0, NULL, false, false, 7, 12, 0.6, 49, 50, 0.7, 1.2, 3.1, 0, 0.2, NULL, 'galah'),
('Pois mange-tout',    'c1000000-0000-0000-0000-000000000003', false, 0, NULL, false, false, 54, 60, 0.4, 43, 53, 2.1, 3, 2.6, 5.4, 0.2, NULL, 'galah'),
('Haricots verts cuits', 'c1000000-0000-0000-0000-000000000003', false, 0, NULL, false, false, 35, 12, 0.4, 37, 38, 1, 1.8, 3, 3.3, 0.2, 'Toujours cuits', 'galah'),
('Maïs',               'c1000000-0000-0000-0000-000000000003', false, 0, NULL, false, false, 9, 7, 0.1, 2, 89, 0.5, 3.4, 2.7, 6.3, 1.4, NULL, 'galah'),
('Betterave',          'c1000000-0000-0000-0000-000000000003', false, 0, NULL, false, false, 2, 5, 0, 16, 40, 0.8, 1.6, 2.8, 6.8, 0.2, NULL, 'galah'),
('Laitue romaine',     'c1000000-0000-0000-0000-000000000003', false, 0, NULL, false, false, 436, 24, 0.1, 33, 30, 1, 1.2, 2.1, 1.2, 0.3, NULL, 'galah'),
('Chicorée',           'c1000000-0000-0000-0000-000000000003', false, 0, NULL, false, false, 286, 24, 2.3, 100, 47, 0.9, 1.7, 4, 0.7, 0.3, NULL, 'galah'),
('Céleri',             'c1000000-0000-0000-0000-000000000003', false, 0, NULL, false, false, 22, 3, 0.3, 40, 24, 0.2, 0.7, 1.6, 1.3, 0.2, NULL, 'galah');

-- ── FRUITS (5% seulement — TRÈS LIMITÉ) ─────────────────────────
INSERT INTO foods (name, category_id, is_forbidden, danger_level, danger_note, beta_carotene_rich, remove_seed, vitamin_a_ug, vitamin_c_mg, vitamin_e_mg, calcium_mg, phosphorus_mg, iron_mg, protein_g, fiber_g, sugar_g, fat_g, notes, species) VALUES
('Pomme',              'c1000000-0000-0000-0000-000000000002', false, 0, NULL, false, true, 3, 5, 0.2, 6, 11, 0.1, 0.3, 2.4, 10.4, 0.2, 'Retirer pépins (cyanure)', 'galah'),
('Poire',              'c1000000-0000-0000-0000-000000000002', false, 0, NULL, false, true, 1, 4, 0.1, 9, 12, 0.2, 0.4, 3.1, 9.8, 0.1, 'Retirer pépins (cyanure)', 'galah'),
('Myrtilles',          'c1000000-0000-0000-0000-000000000002', false, 0, NULL, false, false, 3, 10, 0.6, 6, 12, 0.3, 0.7, 2.4, 10, 0.3, 'Antioxydants — petite quantité', 'galah'),
('Fraises',            'c1000000-0000-0000-0000-000000000002', false, 0, NULL, false, false, 1, 59, 0.3, 16, 24, 0.4, 0.7, 2, 4.9, 0.3, 'Antioxydants — petite quantité', 'galah'),
('Framboises',         'c1000000-0000-0000-0000-000000000002', false, 0, NULL, false, false, 2, 26, 0.9, 25, 29, 0.7, 1.2, 6.5, 4.4, 0.7, 'Antioxydants — petite quantité', 'galah'),
('Kiwi',               'c1000000-0000-0000-0000-000000000002', false, 0, NULL, false, false, 4, 93, 1.5, 34, 34, 0.3, 1.1, 3, 9, 0.5, 'Excellente source vitamine C — petite quantité', 'galah'),
('Mangue',             'c1000000-0000-0000-0000-000000000002', false, 1, 'Petite quantité — sucré', true,  false, 54, 36, 0.9, 11, 14, 0.2, 0.8, 1.6, 13.7, 0.4, 'Petite quantité seulement', 'galah'),
('Cerise',             'c1000000-0000-0000-0000-000000000002', false, 0, NULL, false, true, 3, 7, 0.1, 13, 21, 0.4, 1.1, 2.1, 12.8, 0.2, 'Retirer noyau — petite quantité', 'galah'),
('Grenade',            'c1000000-0000-0000-0000-000000000002', false, 0, NULL, false, false, 0, 10, 0.6, 10, 36, 0.3, 1.7, 4, 13.7, 1.2, 'Petite quantité', 'galah'),
('Banane',             'c1000000-0000-0000-0000-000000000002', false, 2, 'À éviter — trop sucré, favorise obésité', false, false, 3, 9, 0.1, 5, 22, 0.3, 1.1, 2.6, 17, 0.3, 'À ÉVITER — trop sucré, favorise obésité chez le Rosalbin', 'galah'),
('Raisin',             'c1000000-0000-0000-0000-000000000002', false, 2, 'À éviter — trop sucré, favorise obésité', false, false, 3, 3, 0.2, 10, 20, 0.4, 0.7, 0.9, 18, 0.2, 'À ÉVITER — trop sucré, favorise obésité chez le Rosalbin', 'galah');

-- ── GRAINES & CÉRÉALES (10% du régime) ──────────────────────────
INSERT INTO foods (name, category_id, is_forbidden, danger_level, danger_note, beta_carotene_rich, remove_seed, vitamin_a_ug, vitamin_c_mg, vitamin_e_mg, calcium_mg, phosphorus_mg, iron_mg, protein_g, fiber_g, sugar_g, fat_g, notes, species) VALUES
('Millet',                    'c1000000-0000-0000-0000-000000000004', false, 0, NULL, false, false, 0, 0, 0, 8, 285, 3, 11, 8.5, 0, 4.2, 'Meilleure graine pour le Rosalbin — faible en gras', 'galah'),
('Graines de lin',            'c1000000-0000-0000-0000-000000000004', false, 0, 'Modération malgré lipides - Oméga 3', false, false, 0, 1, 0.3, 255, 642, 5.7, 18, 27, 1.6, 42, 'Modération — riche en lipides mais bons Oméga 3', 'galah'),
('Graines germées mélange',   'c1000000-0000-0000-0000-000000000004', false, 0, NULL, false, false, 10, 14, 0.5, 25, 56, 1, 4, 2, 0.5, 0.5, 'Mieux que graines sèches — recommandé', 'galah'),
('Graines de canari',         'c1000000-0000-0000-0000-000000000004', false, 1, 'Mélange standard — modération', false, false, 0, 0, 0, 20, 300, 3, 14, 6, 1, 5, 'Mélange standard — modération', 'galah'),
('Graines de tournesol',      'c1000000-0000-0000-0000-000000000004', false, 2, 'DANGER ROSALBIN : cause principale de lipomatose et syndrome foie gras. Max 3-4 graines/semaine uniquement comme friandise de dressage.', false, false, 0, 1, 35, 78, 660, 5.3, 21, 8.6, 2.6, 51, '⚠️ QUASI-INTERDIT — cause directe de lipomatose. Max 3-4 graines/semaine', 'galah'),
('Graines de carthame',       'c1000000-0000-0000-0000-000000000004', false, 2, 'Même limitation que tournesol — cause lipomatose', false, false, 0, 0, 0, 78, 644, 4.6, 16, 0, 0, 38, '⚠️ QUASI-INTERDIT — même limitation que tournesol', 'galah');

-- ── PROTÉINES & LÉGUMINEUSES ────────────────────────────────────
INSERT INTO foods (name, category_id, is_forbidden, danger_level, danger_note, beta_carotene_rich, remove_seed, vitamin_a_ug, vitamin_c_mg, vitamin_e_mg, calcium_mg, phosphorus_mg, iron_mg, protein_g, fiber_g, sugar_g, fat_g, notes, species) VALUES
('Quinoa cuit',        'c1000000-0000-0000-0000-000000000005', false, 1, 'Max 2x/semaine', false, false, 1, 0, 0.6, 17, 152, 1.5, 4.4, 2.8, 0.9, 1.9, 'Max 2x/semaine', 'galah'),
('Haricots cuits',     'c1000000-0000-0000-0000-000000000005', false, 1, 'Modération', false, false, 0, 1, 0.1, 25, 113, 2.1, 8.7, 6.4, 0.3, 0.5, NULL, 'galah'),
('Lentilles cuites',   'c1000000-0000-0000-0000-000000000005', false, 1, 'Modération', false, false, 2, 2, 0.1, 19, 180, 3.3, 9, 7.9, 1.8, 0.4, 'Bonne source protéines', 'galah'),
('Pois chiches cuits', 'c1000000-0000-0000-0000-000000000005', false, 1, 'Modération', false, false, 1, 1, 0.4, 49, 168, 2.9, 9, 7.6, 4.8, 2.6, 'Max 2x/semaine', 'galah');

-- ── FRIANDISES / NOIX (max 1x/semaine, quantités minuscules) ────
INSERT INTO foods (name, category_id, is_forbidden, danger_level, danger_note, beta_carotene_rich, remove_seed, vitamin_a_ug, vitamin_c_mg, vitamin_e_mg, calcium_mg, phosphorus_mg, iron_mg, protein_g, fiber_g, sugar_g, fat_g, notes, species) VALUES
('Cerneaux de noix',    'c1000000-0000-0000-0000-000000000006', false, 1, '1 demi-noix max/semaine — très riches en graisses', false, false, 1, 1, 0.7, 98, 346, 2.9, 15, 6.7, 2.6, 65, '1 demi-noix max/semaine — très riches en graisses', 'galah'),
('Noix de cajou crues', 'c1000000-0000-0000-0000-000000000006', false, 1, '2-3 cajous max/semaine', false, false, 0, 1, 0.9, 37, 593, 6.7, 18, 3.3, 5.9, 44, '2-3 cajous max/semaine — crues uniquement', 'galah'),
('Noisette',            'c1000000-0000-0000-0000-000000000006', false, 2, 'Trop riches en graisses pour le Rosalbin', false, false, 1, 6, 15, 114, 290, 4.7, 15, 9.7, 4.3, 61, '⚠️ Trop riches en graisses pour le Rosalbin — éviter', 'galah'),
('Noix du Brésil',      'c1000000-0000-0000-0000-000000000006', false, 2, 'Trop riches en graisses pour le Rosalbin', false, false, 0, 1, 5.7, 160, 725, 2.4, 14, 7.5, 2.3, 66, '⚠️ Trop riches en graisses pour le Rosalbin — éviter', 'galah');

-- ── ALIMENTS INTERDITS ──────────────────────────────────────────
INSERT INTO foods (name, category_id, is_forbidden, danger_level, danger_note, beta_carotene_rich, remove_seed, notes, species) VALUES
('Avocat',                                 'c1000000-0000-0000-0000-000000000007', true, 3, 'Persine → MORTEL', false, false, 'MORTEL — persine attaque le cœur', 'galah'),
('Oignon',                                 'c1000000-0000-0000-0000-000000000007', true, 3, 'Composés soufrés → anémie hémolytique', false, false, 'MORTEL', 'galah'),
('Ail',                                    'c1000000-0000-0000-0000-000000000007', true, 3, 'Composés soufrés → anémie hémolytique', false, false, 'MORTEL', 'galah'),
('Échalote',                               'c1000000-0000-0000-0000-000000000007', true, 3, 'Composés soufrés → anémie hémolytique', false, false, 'MORTEL', 'galah'),
('Poireau',                                'c1000000-0000-0000-0000-000000000007', true, 3, 'Composés soufrés → anémie hémolytique', false, false, 'MORTEL', 'galah'),
('Chocolat',                               'c1000000-0000-0000-0000-000000000007', true, 3, 'Théobromine neurotoxique', false, false, 'MORTEL', 'galah'),
('Noyaux/pépins de fruits',                'c1000000-0000-0000-0000-000000000007', true, 3, 'Cyanure', false, false, 'MORTEL — contiennent du cyanure', 'galah'),
('Rhubarbe',                               'c1000000-0000-0000-0000-000000000007', true, 3, 'Acide oxalique → insuffisance rénale', false, false, 'MORTEL', 'galah'),
('Alcool',                                 'c1000000-0000-0000-0000-000000000007', true, 3, 'Mortel pour les oiseaux', false, false, 'MORTEL', 'galah'),
('Café',                                   'c1000000-0000-0000-0000-000000000007', true, 3, 'Caféine mortelle', false, false, 'MORTEL', 'galah'),
('Xylitol',                                'c1000000-0000-0000-0000-000000000007', true, 3, 'Édulcorant mortel', false, false, 'MORTEL', 'galah'),
('Macadamia',                              'c1000000-0000-0000-0000-000000000007', true, 3, 'Toxique pour les oiseaux', false, false, 'MORTEL', 'galah'),
('Graines de tournesol en quantité',       'c1000000-0000-0000-0000-000000000007', true, 2, 'Lipomatose + syndrome foie gras', false, false, 'INTERDIT EN QUANTITÉ — lipomatose + syndrome foie gras', 'galah'),
('Aliments gras de table',                 'c1000000-0000-0000-0000-000000000007', true, 2, 'Obésité directe', false, false, 'Interdit — obésité directe', 'galah'),
('Sel / Sucre / Produits laitiers',        'c1000000-0000-0000-0000-000000000007', true, 2, 'Aliments humains transformés', false, false, 'Interdit', 'galah');

-- ── CALENDRIER BIOLOGIQUE — ROSALBIN ─────────────────────────────
INSERT INTO bio_calendar_events
  (event_type, title, recurrence_month_start, recurrence_month_end, color, icon, description, dietary_advice, species)
VALUES
('reproduction',
 '🥚 Saison de reproduction',
 3, 7,
 '#F472B6', '🥚',
 'En captivité en Europe, la reproduction se déclenche au printemps (mars-juillet). Dans la nature : juillet-décembre (sud Australie) ou février-juillet (nord). En captivité, déclenchée principalement par la disponibilité d''un nichoir, le régime et les conditions lumineuses. Couvée : 2 à 4 œufs. Incubation partagée par les deux parents : 26-30 jours. Envol des jeunes : 40-45 jours. Lien de couple à vie.',
 'Maintenir pellets low-fat obligatoires. Calcium légèrement augmenté (brocoli, pissenlit). Protéines modérément augmentées (légumineuses). SURTOUT ne pas augmenter les graines grasses — risque lipomatose accru pendant la reproduction. Éviter nichoir si pas de reproduction souhaitée.',
 'galah'),

('hormones',
 '🌡️ Pic hormonal',
 2, 4,
 '#EF4444', '🌡️',
 'Fin d''hiver/début printemps. Comportements : cris intenses, morsures, comportements de nidification, masturbation, régurgitation. ATTENTION : le Rosalbin peut devenir très agressif. Ne pas stimuler (caresses dos/cloaque interdites). Retirer le nichoir si présent. Réduire photopériode à 10h/jour.',
 'Réduire tous les aliments sucrés (fruits limités au minimum). Augmenter légumes verts. Maintenir pellets low-fat. Pas de noix/graines grasses.',
 'galah'),

('mue',
 '🪶 Mue annuelle',
 7, 9,
 '#F59E0B', '🪶',
 'Mue post-reproduction, été/automne. Durée 5-12 semaines. L''oiseau peut être plus irritable et moins actif. Brumisations quotidiennes recommandées pour faciliter l''éclosion des plumes en fourreau.',
 'Protéines légèrement augmentées (graines germées, légumineuses). Maintenir bêta-carotène. Brumisations. ATTENTION : ne pas augmenter les graines grasses sous prétexte de la mue — l''obésité prime.',
 'galah'),

('bien_etre',
 '✨ Période calme — Automne/Hiver',
 10, 1,
 '#22C55E', '✨',
 'Période la plus stable comportementalement. Idéale pour renforcer le lien, introduire nouveaux aliments, travail d''enrichissement.',
 'Maintenir régime standard strict. Surveiller poids hebdomadaire. Bonne période pour réévaluer le régime avec le vétérinaire.',
 'galah'),

('veterinaire',
 '🩺 Bilan vétérinaire (mars)',
 3, 3,
 '#3B82F6', '🏥',
 'Bilan avant la saison de reproduction. Points clés : poids officiel, palpation pour lipomes sous-cutanés, bilan sanguin si surpoids, vérification bec et ongles.',
 'Exporter CSV alimentation 3 mois depuis Paramètres.',
 'galah'),

('veterinaire',
 '🩺 Bilan vétérinaire (septembre)',
 9, 9,
 '#3B82F6', '🏥',
 'Bilan après la mue. Poids officiel, palpation lipomes, évaluation état du plumage.',
 'Exporter CSV alimentation 3 mois depuis Paramètres.',
 'galah');
