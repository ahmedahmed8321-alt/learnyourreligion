-- ── Adhkar (الأذكار والفوائد) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS adhkar (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category     TEXT NOT NULL DEFAULT 'عام',        -- أذكار الصباح / المساء / بعد الصلاة ...
  text         TEXT NOT NULL,                       -- نص الذكر
  reference    TEXT,                                -- التخريج / المصدر
  virtue       TEXT,                                -- الفضل (اختياري)
  repeat_count INTEGER DEFAULT 1,                   -- عدد التكرار
  order_index  INTEGER DEFAULT 0,
  published    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS adhkar_published_idx ON adhkar (published, category, order_index);

ALTER TABLE adhkar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "adhkar_public_read" ON adhkar FOR SELECT USING (published = true);

-- A small starter set (the Sheikh can edit/add more from the admin panel)
INSERT INTO adhkar (category, text, reference, repeat_count, order_index) VALUES
  ('أذكار عامة', 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ', 'متفق عليه', 100, 1),
  ('أذكار عامة', 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', 'متفق عليه', 10, 2),
  ('الاستغفار', 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ', 'سيد الاستغفار — رواه البخاري', 1, 3)
ON CONFLICT DO NOTHING;
