-- ============================================
-- Veritas AI Seed Data
-- Sample data for testing and development
-- ============================================

-- ============================================
-- Sample Published Articles
-- ============================================

INSERT INTO articles (headline, summary, body, status, confidence, sources, published_at, generation_time_ms)
VALUES (
  'AI Breakthrough Enables Real-Time Fact Checking',
  'New multi-agent system demonstrates 95% accuracy in news verification through automated source cross-referencing',
  'In a significant advancement for journalism technology, researchers have developed a multi-agent AI system capable of real-time fact-checking with unprecedented accuracy rates. The system, called Veritas, employs specialized agents for research, content creation, and verification.

The breakthrough addresses a critical challenge in modern media: the rapid spread of misinformation. By leveraging multiple AI agents working in parallel, the system can cross-reference sources, verify claims, and generate accurate reports within minutes rather than hours.

Key features include automated source discovery, confidence scoring based on source reliability, and transparent logging of all agent decisions. This transparency allows human editors to review the AI reasoning process and intervene when necessary.

Early tests show the system correctly identifies factual errors in 95% of cases, significantly outperforming existing automated fact-checking tools. The technology could revolutionize how newsrooms handle breaking stories while maintaining accuracy standards.',
  'published',
  95,
  '[
    {"url": "https://arxiv.org/abs/2024.veritas", "title": "Veritas: Multi-Agent Fact Verification System", "domain": "arxiv.org"},
    {"url": "https://example.com/journalism-ai", "title": "AI in Journalism: Current Trends", "domain": "example.com"}
  ]'::jsonb,
  NOW() - INTERVAL '2 hours',
  4500
);

INSERT INTO articles (headline, summary, body, status, confidence, sources, published_at, generation_time_ms)
VALUES (
  'Climate Summit Reaches Historic Agreement on Carbon Reduction',
  'World leaders commit to 50% emissions reduction by 2035, establishing new global framework',
  'The 2024 Global Climate Summit concluded today with a historic agreement that establishes binding targets for carbon emission reductions. Representatives from 195 countries agreed to reduce greenhouse gas emissions by 50% below 2020 levels by 2035.

The agreement, dubbed the ''Seoul Protocol,'' includes unprecedented enforcement mechanisms and financial commitments from developed nations to support transition efforts in developing countries. A $500 billion annual fund was established to aid climate adaptation and mitigation.

Environmental groups have cautiously welcomed the agreement while emphasizing the need for immediate implementation. ''Targets are meaningless without action,'' said Dr. Sarah Chen, lead climate scientist at the Global Environmental Institute. ''We need to see concrete policies within the next 12 months.''

Critics point out that similar agreements in the past have fallen short of their goals. However, supporters argue that the new enforcement mechanisms, including trade penalties for non-compliance, provide stronger incentives for adherence than previous accords.',
  'published',
  88,
  '[
    {"url": "https://un.org/climate/seoul-protocol", "title": "Seoul Protocol Full Text", "domain": "un.org"},
    {"url": "https://climate-science.org/summit-analysis", "title": "Scientific Analysis of Seoul Protocol", "domain": "climate-science.org"},
    {"url": "https://reuters.com/climate-summit-2024", "title": "Climate Summit Coverage", "domain": "reuters.com"}
  ]'::jsonb,
  NOW() - INTERVAL '5 hours',
  6200
);

INSERT INTO articles (headline, summary, body, status, confidence, sources, published_at, generation_time_ms)
VALUES (
  'Tech Giants Form Coalition for Ethical AI Development',
  'Major technology companies pledge transparency and safety standards in unprecedented collaboration',
  'In a surprising move, ten of the world''s largest technology companies have formed the Coalition for Ethical AI Development (CEAID), committing to shared safety standards and transparency measures. The coalition includes OpenAI, Google, Anthropic, Microsoft, and several other major AI developers.

The agreement establishes common benchmarks for AI safety testing, requires disclosure of training methodologies, and creates an independent oversight board with representatives from academia and civil society. Members will share safety research and agree to pause development of models exceeding certain capability thresholds pending safety review.

''This represents a fundamental shift in how the industry approaches AI safety,'' said Dr. Michael Torres, AI ethics researcher at Stanford. ''Voluntary cooperation on this scale is unprecedented in the tech sector.''

Skeptics note that similar initiatives in other industries have struggled with enforcement. The coalition has committed to quarterly public reports on compliance, with membership contingent on meeting agreed-upon standards. Non-compliant members face expulsion and public censure.',
  'published',
  92,
  '[
    {"url": "https://ceaid.org/charter", "title": "CEAID Charter and Standards", "domain": "ceaid.org"},
    {"url": "https://techcrunch.com/ethical-ai-coalition", "title": "Tech Giants Unite on AI Ethics", "domain": "techcrunch.com"},
    {"url": "https://stanford.edu/ai-ethics-analysis", "title": "Academic Analysis of CEAID", "domain": "stanford.edu"}
  ]'::jsonb,
  NOW() - INTERVAL '8 hours',
  5100
);

-- ============================================
-- Sample Draft Articles (in progress)
-- ============================================

INSERT INTO articles (headline, summary, body, status, confidence, sources, generation_time_ms)
VALUES (
  'SpaceX Starship Successfully Docks with Lunar Gateway',
  'Historic mission marks first commercial docking at lunar orbital station',
  'SpaceX Starship has successfully docked with the Lunar Gateway station, marking the first commercial spacecraft to connect with the lunar orbital platform. The mission, launched yesterday from Kennedy Space Center, carried supplies and scientific equipment for the station''s crew.\n\nThe docking represents a milestone in commercial space operations and demonstrates the viability of private-sector participation in deep-space logistics. NASA administrators praised the mission as a ''new chapter in space exploration.''\n\nThe Starship will remain docked for 72 hours while cargo is transferred before returning to Earth with scientific samples and equipment requiring maintenance.',
  'draft',
  78,
  '[
    {"url": "https://nasa.gov/starship-gateway", "title": "NASA Mission Update", "domain": "nasa.gov"},
    {"url": "https://spacex.com/news", "title": "SpaceX Mission Report", "domain": "spacex.com"}
  ]'::jsonb,
  3800
);

-- ============================================
-- Sample Agent Logs
-- ============================================

-- Get the first article ID for logging
DO $$
DECLARE
    article1_id UUID;
    article2_id UUID;
    article3_id UUID;
BEGIN
    -- Get article IDs
    SELECT id INTO article1_id FROM articles WHERE headline LIKE '%AI Breakthrough%' LIMIT 1;
    SELECT id INTO article2_id FROM articles WHERE headline LIKE '%Climate Summit%' LIMIT 1;
    SELECT id INTO article3_id FROM articles WHERE headline LIKE '%Tech Giants%' LIMIT 1;

    -- Logs for article 1 (AI Breakthrough)
    INSERT INTO agent_logs (article_id, agent, action, details) VALUES
    (article1_id, 'scout', 'research_started', '{"query": "AI fact checking systems 2024"}'::jsonb),
    (article1_id, 'scout', 'sources_found', '{"count": 12, "domains": ["arxiv.org", "example.com", "techcrunch.com"]}'::jsonb),
    (article1_id, 'creator', 'content_generated', '{"word_count": 245, "generation_model": "gpt-4"}'::jsonb),
    (article1_id, 'fact_checker', 'fact_check_started', '{"claims_to_verify": 8}'::jsonb),
    (article1_id, 'fact_checker', 'fact_check_completed', '{"verified": 7, "uncertain": 1, "confidence": 95}'::jsonb),
    (article1_id, 'publisher', 'publish_attempted', '{"platform": "veritas_platform"}'::jsonb),
    (article1_id, 'publisher', 'publish_success', '{"published_at": "' || NOW() || '"}'::jsonb);

    -- Logs for article 2 (Climate Summit)
    INSERT INTO agent_logs (article_id, agent, action, details) VALUES
    (article2_id, 'scout', 'research_started', '{"query": "Seoul Protocol climate summit 2024"}'::jsonb),
    (article2_id, 'scout', 'sources_found', '{"count": 15, "domains": ["un.org", "climate-science.org", "reuters.com"]}'::jsonb),
    (article2_id, 'creator', 'content_generated', '{"word_count": 312, "generation_model": "gpt-4"}'::jsonb),
    (article2_id, 'fact_checker', 'fact_check_completed', '{"verified": 9, "uncertain": 2, "confidence": 88}'::jsonb),
    (article2_id, 'publisher', 'publish_success', '{"published_at": "' || NOW() || '"}'::jsonb);

    -- Logs for article 3 (Tech Giants)
    INSERT INTO agent_logs (article_id, agent, action, details) VALUES
    (article3_id, 'scout', 'research_started', '{"query": "CEAID coalition ethical AI development"}'::jsonb),
    (article3_id, 'scout', 'sources_found', '{"count": 10, "domains": ["ceaid.org", "techcrunch.com", "stanford.edu"]}'::jsonb),
    (article3_id, 'creator', 'content_generated', '{"word_count": 298, "generation_model": "gpt-4"}'::jsonb),
    (article3_id, 'fact_checker', 'fact_check_completed', '{"verified": 8, "uncertain": 0, "confidence": 92}'::jsonb),
    (article3_id, 'publisher', 'publish_success', '{"published_at": "' || NOW() || '"}'::jsonb);

    -- Sources for articles
    INSERT INTO sources (article_id, url, title, domain, relevance_score) VALUES
    (article1_id, 'https://arxiv.org/abs/2024.veritas', 'Veritas: Multi-Agent Fact Verification System', 'arxiv.org', 95),
    (article1_id, 'https://example.com/journalism-ai', 'AI in Journalism: Current Trends', 'example.com', 75),
    (article2_id, 'https://un.org/climate/seoul-protocol', 'Seoul Protocol Full Text', 'un.org', 98),
    (article2_id, 'https://climate-science.org/summit-analysis', 'Scientific Analysis of Seoul Protocol', 'climate-science.org', 90),
    (article2_id, 'https://reuters.com/climate-summit-2024', 'Climate Summit Coverage', 'reuters.com', 85),
    (article3_id, 'https://ceaid.org/charter', 'CEAID Charter and Standards', 'ceaid.org', 98),
    (article3_id, 'https://techcrunch.com/ethical-ai-coalition', 'Tech Giants Unite on AI Ethics', 'techcrunch.com', 88),
    (article3_id, 'https://stanford.edu/ai-ethics-analysis', 'Academic Analysis of CEAID', 'stanford.edu', 92);

END $$;
