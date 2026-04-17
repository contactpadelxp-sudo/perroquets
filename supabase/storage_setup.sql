-- ============================================================
-- ECLECTUSCARE — Storage bucket pour les photos de gamelles
-- À exécuter dans le SQL Editor de Supabase
-- ============================================================

-- 1. Créer le bucket (public pour afficher les images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'meal-photos',
  'meal-photos',
  true,
  5242880,  -- 5 Mo
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Policy : tout utilisateur authentifié peut uploader dans son dossier
CREATE POLICY "Users upload own photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'meal-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. Policy : tout le monde peut voir les photos (bucket public)
CREATE POLICY "Public read meal photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'meal-photos');

-- 4. Policy : les utilisateurs peuvent supprimer leurs propres photos
CREATE POLICY "Users delete own photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'meal-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5. Policy : les utilisateurs peuvent mettre à jour (upsert) leurs photos
CREATE POLICY "Users update own photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'meal-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
