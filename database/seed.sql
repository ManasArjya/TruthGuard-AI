-- TruthGuard AI - Seeding Script
-- NOTE: Replace the placeholder UUIDs with actual User UUIDs from your Supabase Auth dashboard.

-- Temporarily disable RLS to allow seeding
ALTER USER postgres WITH BYPASSRLS;
SET ROLE postgres;

-- Dummy User UUIDs (REPLACE THESE)
-- User 1: A regular user
-- User 2: An expert user
-- Go to Authentication -> Users in your Supabase dashboard to find these.
-- Example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
--          '0c0c0c0c-0c0c-0c0c-0c0c-0c0c0c0c0c0c'

-- 1. Seed User Profiles
INSERT INTO public.user_profiles (id, email, full_name, is_expert, expert_domain)
VALUES
    ('YOUR_FIRST_USER_UUID_HERE', 'user1@example.com', 'Nihal Good', FALSE, NULL),
    ('YOUR_SECOND_USER_UUID_HERE', 'expert@example.com', 'Dr. Anya Sharma', TRUE, 'Political Science')
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Claims
-- We'll add claims from both users.
INSERT INTO public.claims (id, user_id, content, content_type, status)
VALUES
    ('c1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'YOUR_FIRST_USER_UUID_HERE', 'The government announced a new 4-day work week for all IT companies.', 'text', 'completed'),
    ('c1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'YOUR_SECOND_USER_UUID_HERE', 'A recent study shows that drinking coffee can increase lifespan by 10%.', 'text', 'completed'),
    ('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'YOUR_FIRST_USER_UUID_HERE', 'Is this image of a shark swimming on a highway real?', 'image', 'processing')
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Claim Analyses for completed claims
INSERT INTO public.claim_analyses (claim_id, verdict, confidence_score, summary, ai_reasoning, evidence, sources)
VALUES
    ('c1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'false', 0.95, 'No official announcement has been made by the government regarding a mandatory 4-day work week for IT companies. Several news outlets have debunked this viral rumor.', 'The AI cross-referenced the claim against official government press releases and major news publications, finding no supporting evidence. The claim appears to originate from a satirical social media post.', '[]', '[]'),
    ('c1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'misleading', 0.88, 'While some studies suggest a correlation between coffee consumption and a lower risk of certain diseases, claiming a specific 10% increase in lifespan is an oversimplification and not supported by conclusive scientific consensus.', 'The AI analyzed multiple peer-reviewed meta-analyses. It found evidence for health benefits but noted that the specific quantitative claim of a "10% increase" is not a widely accepted scientific fact and is often used as clickbait.', '[]', '[]')
ON CONFLICT (claim_id) DO NOTHING;

-- 4. Seed Comments
INSERT INTO public.claim_comments (id, claim_id, user_id, content, is_expert_response)
VALUES
    ('c0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0', 'c1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'YOUR_FIRST_USER_UUID_HERE', 'I saw this on my social media feed! Glad to know it''s false.', FALSE),
    ('c0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b0b0', 'c1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'YOUR_SECOND_USER_UUID_HERE', 'As an expert in public policy, I can confirm no such legislation has been tabled. This is a classic case of misinformation.', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Reset the role and re-enable RLS
RESET ROLE;
ALTER USER postgres WITH NOBYPASSRLS;