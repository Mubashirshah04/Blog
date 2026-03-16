-- =============================================
-- Categories with Subcategories - SQL
-- Supabase Dashboard > SQL Editor mein run karein
-- =============================================

-- Purani categories table drop kar ke fresh shuru karein
DROP TABLE IF EXISTS categories CASCADE;

-- Naya categories table (parent-child support ke sath)
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS enable
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are public" ON categories FOR SELECT USING (true);
CREATE POLICY "Admin can manage categories" ON categories
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =============================================
-- MAIN CATEGORIES
-- =============================================
INSERT INTO categories (name, slug, sort_order) VALUES
  ('AI Tools',      'ai-tools',      1),
  ('Finance',       'finance',       2),
  ('Crypto',        'crypto',        3),
  ('Tech News',     'tech-news',     4),
  ('Mobile Apps',   'mobile-apps',   5),
  ('Online Earning','online-earning', 6),
  ('Gadgets',       'gadgets',       7),
  ('Internet',      'internet',      8),
  ('Cricket News',  'cricket-news',  9)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

-- =============================================
-- SUBCATEGORIES - AI Tools
-- =============================================
INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT s.name, s.slug, c.id, s.ord
FROM (VALUES
  ('AI News',               'ai-news',               1),
  ('AI Video Tools',        'ai-video-tools',        2),
  ('AI Image Generators',   'ai-image-generators',   3),
  ('AI Writing Tools',      'ai-writing-tools',      4),
  ('AI Chatbots',           'ai-chatbots',           5),
  ('AI Productivity Tools', 'ai-productivity-tools', 6),
  ('AI Coding Tools',       'ai-coding-tools',       7),
  ('Best AI Tools Lists',   'best-ai-tools-lists',   8),
  ('Free AI Tools',         'free-ai-tools',         9),
  ('AI Tutorials',          'ai-tutorials',          10)
) AS s(name, slug, ord)
CROSS JOIN (SELECT id FROM categories WHERE slug = 'ai-tools') AS c
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id;

-- =============================================
-- SUBCATEGORIES - Finance
-- =============================================
INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT s.name, s.slug, c.id, s.ord
FROM (VALUES
  ('Personal Finance',  'personal-finance',  1),
  ('Investing Guides',  'investing-guides',  2),
  ('Passive Income',    'passive-income',    3),
  ('Money Saving Tips', 'money-saving-tips', 4),
  ('Budgeting',         'budgeting',         5),
  ('Financial Apps',    'financial-apps',    6),
  ('Financial News',    'financial-news',    7)
) AS s(name, slug, ord)
CROSS JOIN (SELECT id FROM categories WHERE slug = 'finance') AS c
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id;

-- =============================================
-- SUBCATEGORIES - Crypto
-- =============================================
INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT s.name, s.slug, c.id, s.ord
FROM (VALUES
  ('Crypto News',       'crypto-news',       1),
  ('Crypto Price Analysis','crypto-price-analysis',2),
  ('Coin Guides',       'coin-guides',       3),
  ('Crypto Trading',    'crypto-trading',    4),
  ('Crypto Wallets',    'crypto-wallets',    5),
  ('Crypto Exchanges',  'crypto-exchanges',  6),
  ('Crypto Predictions','crypto-predictions', 7),
  ('Crypto Security',   'crypto-security',   8)
) AS s(name, slug, ord)
CROSS JOIN (SELECT id FROM categories WHERE slug = 'crypto') AS c
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id;

-- =============================================
-- SUBCATEGORIES - Tech News
-- =============================================
INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT s.name, s.slug, c.id, s.ord
FROM (VALUES
  ('Latest Tech News',    'latest-tech-news',    1),
  ('Software Updates',    'software-updates',    2),
  ('Startup News',        'startup-news',        3),
  ('Internet Trends',     'internet-trends',     4),
  ('Technology Guides',   'technology-guides',   5),
  ('Future Tech',         'future-tech',         6),
  ('Tech Industry News',  'tech-industry-news',  7)
) AS s(name, slug, ord)
CROSS JOIN (SELECT id FROM categories WHERE slug = 'tech-news') AS c
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id;

-- =============================================
-- SUBCATEGORIES - Mobile Apps
-- =============================================
INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT s.name, s.slug, c.id, s.ord
FROM (VALUES
  ('Android Apps',       'android-apps',       1),
  ('iPhone Apps',        'iphone-apps',        2),
  ('Best Apps Lists',    'best-apps-lists',    3),
  ('Productivity Apps',  'productivity-apps',  4),
  ('AI Apps',            'ai-apps',            5),
  ('Editing Apps',       'editing-apps',       6),
  ('Gaming Apps',        'gaming-apps',        7),
  ('App Reviews',        'app-reviews',        8)
) AS s(name, slug, ord)
CROSS JOIN (SELECT id FROM categories WHERE slug = 'mobile-apps') AS c
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id;

-- =============================================
-- SUBCATEGORIES - Online Earning
-- =============================================
INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT s.name, s.slug, c.id, s.ord
FROM (VALUES
  ('Freelancing',          'freelancing',          1),
  ('Affiliate Marketing',  'affiliate-marketing',  2),
  ('Side Hustles',         'side-hustles',         3),
  ('Online Jobs',          'online-jobs',          4),
  ('YouTube Tips',         'youtube-tips',         5),
  ('Digital Products',     'digital-products',     6),
  ('Earning Apps',         'earning-apps',         7),
  ('Passive Income Online','passive-income-online', 8)
) AS s(name, slug, ord)
CROSS JOIN (SELECT id FROM categories WHERE slug = 'online-earning') AS c
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id;

-- =============================================
-- SUBCATEGORIES - Gadgets
-- =============================================
INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT s.name, s.slug, c.id, s.ord
FROM (VALUES
  ('Smartphones',        'smartphones',        1),
  ('Laptops',            'laptops',            2),
  ('Wearables',          'wearables',          3),
  ('Gadget Reviews',     'gadget-reviews',     4),
  ('Tech Accessories',   'tech-accessories',   5),
  ('Upcoming Gadgets',   'upcoming-gadgets',   6),
  ('Best Gadgets Lists', 'best-gadgets-lists', 7)
) AS s(name, slug, ord)
CROSS JOIN (SELECT id FROM categories WHERE slug = 'gadgets') AS c
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id;

-- =============================================
-- SUBCATEGORIES - Internet
-- =============================================
INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT s.name, s.slug, c.id, s.ord
FROM (VALUES
  ('Website Tools',       'website-tools',       1),
  ('Online Platforms',    'online-platforms',    2),
  ('Web Apps',            'web-apps',            3),
  ('Browser Tools',       'browser-tools',       4),
  ('Online Services',     'online-services',     5),
  ('Productivity Websites','productivity-websites',6)
) AS s(name, slug, ord)
CROSS JOIN (SELECT id FROM categories WHERE slug = 'internet') AS c
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id;

-- =============================================
-- SUBCATEGORIES - Cricket News
-- =============================================
INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT s.name, s.slug, c.id, s.ord
FROM (VALUES
  ('Match News',        'match-news',        1),
  ('Player Updates',    'player-updates',    2),
  ('Series News',       'series-news',       3),
  ('Cricket Records',   'cricket-records',   4),
  ('Team Squads',       'team-squads',       5),
  ('Match Analysis',    'match-analysis',    6),
  ('Cricket Highlights','cricket-highlights', 7)
) AS s(name, slug, ord)
CROSS JOIN (SELECT id FROM categories WHERE slug = 'cricket-news') AS c
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id;

-- Confirm karein
SELECT 
  p.name AS main_category,
  c.name AS subcategory,
  c.slug
FROM categories c
LEFT JOIN categories p ON c.parent_id = p.id
ORDER BY p.sort_order, c.sort_order;
