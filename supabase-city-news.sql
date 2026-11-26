-- ============================================================================
-- ASENSO BAGO: CITY NEWS & ANNOUNCEMENTS TABLE
-- Run this in Supabase Dashboard -> SQL Editor
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.city_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Announcement',
  source_url TEXT,
  image_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_city_news_published
  ON public.city_news(is_published, published_at DESC);

ALTER TABLE public.city_news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published city news" ON public.city_news;
CREATE POLICY "Anyone can view published city news"
  ON public.city_news
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage city news" ON public.city_news;
CREATE POLICY "Admins can manage city news"
  ON public.city_news
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'supervisor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'supervisor')
    )
  );

-- Starter announcements (only inserted if table is empty)
INSERT INTO public.city_news (title, summary, category, source_url)
SELECT * FROM (
  VALUES
    (
      'Follow The Citybridge for Daily Bago City Updates',
      'Stay updated with official advisories, barangay events, and announcements from Mayor Mayette Javellana-Yao and the City Government of Bago.',
      'Official Page',
      'https://www.facebook.com/TheCityBridge'
    ),
    (
      'Online Health Service Requests Now Open',
      'Bagonhons can now request Heart Warriors, Wheels of Love, and Smile Bright Bago services directly inside the Asenso Bago app and track status online.',
      'Health',
      NULL
    ),
    (
      'Asenso Caravan Barangay Schedule',
      'Mobile government services including PhilHealth, SSS, PAG-IBIG, and PhilSys registration continue to visit Bago City barangays.',
      'Caravan',
      'https://caravan-blond.vercel.app'
    )
) AS v(title, summary, category, source_url)
WHERE NOT EXISTS (SELECT 1 FROM public.city_news LIMIT 1);
