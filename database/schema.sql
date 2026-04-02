-- ============================================
-- Veritas AI Database Schema
-- Supabase PostgreSQL
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Articles Table
-- Main storage for AI-generated news articles
-- ============================================
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    headline TEXT NOT NULL,
    summary TEXT,
    body TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'draft', -- draft, published, failed
    confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100), -- 0-100
    sources JSONB DEFAULT '[]'::jsonb, -- array of {url, title, domain}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    generation_time_ms INTEGER -- how long it took to generate
);

-- ============================================
-- Agent Logs Table
-- Transparency logging for all agent activities
-- ============================================
CREATE TABLE agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    agent VARCHAR(50) NOT NULL CHECK (agent IN ('scout', 'creator', 'publisher', 'fact_checker')),
    action VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Sources Table
-- Individual sources for fact-checking and verification
-- ============================================
CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title TEXT,
    domain TEXT,
    relevance_score INTEGER CHECK (relevance_score >= 0 AND relevance_score <= 100), -- 0-100
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_created ON articles(created_at DESC);
CREATE INDEX idx_articles_published ON articles(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_agent_logs_article ON agent_logs(article_id);
CREATE INDEX idx_agent_logs_created ON agent_logs(created_at DESC);
CREATE INDEX idx_sources_article ON sources(article_id);
CREATE INDEX idx_sources_domain ON sources(domain);

-- Full-text search indexes
CREATE INDEX idx_articles_headline_search ON articles USING gin(to_tsvector('english', headline));
CREATE INDEX idx_articles_body_search ON articles USING gin(to_tsvector('english', body));

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Articles RLS Policies
-- ============================================

-- Anyone can read published articles
CREATE POLICY "Public can read published articles"
    ON articles
    FOR SELECT
    USING (status = 'published');

-- Only authenticated service role can insert/update all articles
CREATE POLICY "Service role can manage all articles"
    ON articles
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- Agent Logs RLS Policies
-- ============================================

-- Anyone can read agent logs (transparency)
CREATE POLICY "Public can read agent logs"
    ON agent_logs
    FOR SELECT
    USING (true);

-- Only service role can insert agent logs
CREATE POLICY "Service role can insert agent logs"
    ON agent_logs
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- Sources RLS Policies
-- ============================================

-- Anyone can read sources
CREATE POLICY "Public can read sources"
    ON sources
    FOR SELECT
    USING (true);

-- Only service role can manage sources
CREATE POLICY "Service role can manage sources"
    ON sources
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- Helper Functions
-- ============================================

-- Function to automatically set published_at when status changes to published
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'published' AND OLD.status != 'published' THEN
        NEW.published_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_set_published_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION set_published_at();

-- Function to log agent activity
CREATE OR REPLACE FUNCTION log_agent_action(
    p_article_id UUID,
    p_agent VARCHAR(50),
    p_action VARCHAR(100),
    p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO agent_logs (article_id, agent, action, details)
    VALUES (p_article_id, p_agent, p_action, p_details)
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
