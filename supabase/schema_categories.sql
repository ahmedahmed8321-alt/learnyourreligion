-- Categories table for summaries and articles
CREATE TABLE IF NOT EXISTS categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('summary', 'article')),
  order_index int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Index for quick lookups by type
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
