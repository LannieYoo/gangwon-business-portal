-- Statistics Report Module - Index Optimization
-- Generated: 2026-02-01
-- Purpose: Optimize query performance for statistics report filtering

-- ============================================================================
-- EXISTING INDEXES (Already created)
-- ============================================================================

-- Basic search indexes
-- CREATE INDEX idx_members_company_name ON members(company_name);
-- CREATE INDEX idx_members_business_number ON members(business_number);
-- CREATE INDEX idx_members_email ON members(email);
-- CREATE INDEX idx_members_status ON members(status);
-- CREATE INDEX idx_members_approval_status ON members(approval_status);

-- ============================================================================
-- RECOMMENDED NEW INDEXES for Statistics Report
-- ============================================================================

-- 1. Industry Classification Indexes
-- Reason: Frequently used for filtering by KSIC codes and Gangwon industry
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_members_ksic_major 
ON members(ksic_major) 
WHERE ksic_major IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_members_gangwon_industry 
ON members(gangwon_industry) 
WHERE gangwon_industry IS NOT NULL;

-- 2. Startup Stage Index
-- Reason: Common filter for startup type/stage
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_members_startup_type 
ON members(startup_type) 
WHERE startup_type IS NOT NULL;

-- 3. Founding Date Index
-- Reason: Used for year/quarter/month filtering and work years calculation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_members_founding_date 
ON members(founding_date DESC) 
WHERE founding_date IS NOT NULL;

-- 4. Representative Gender Index
-- Reason: Used for gender filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_members_representative_gender 
ON members(representative_gender) 
WHERE representative_gender IS NOT NULL;

-- 5. Investment Indexes
-- Reason: Frequently filtered by investment status and amount
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_members_total_investment 
ON members(total_investment DESC) 
WHERE total_investment IS NOT NULL AND total_investment > 0;

-- Partial index for companies with investment
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_members_has_investment 
ON members(id) 
WHERE total_investment IS NOT NULL AND total_investment > 0;

-- 6. Patent Count Index
-- Reason: Used for patent count range filtering and sorting
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_members_patent_count 
ON members(patent_count DESC) 
WHERE patent_count IS NOT NULL AND patent_count > 0;

-- 7. Revenue Index
-- Reason: Used for revenue range filtering and sorting
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_members_revenue 
ON members(revenue DESC) 
WHERE revenue IS NOT NULL AND revenue > 0;

-- 8. Employee Count Index
-- Reason: Used for employee count range filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_members_employee_count 
ON members(employee_count) 
WHERE employee_count IS NOT NULL AND employee_count > 0;

-- 9. Region Index
-- Reason: Used for location filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_members_region 
ON members(region) 
WHERE region IS NOT NULL;

-- 10. GIN Index for Participation Programs (JSONB/Array)
-- Reason: Used for policy tags filtering with OR logic
-- Note: Adjust based on actual column type (TEXT, JSONB, or ARRAY)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_members_participation_programs_gin 
ON members USING GIN(participation_programs jsonb_path_ops)
WHERE participation_programs IS NOT NULL;

-- Alternative if participation_programs is TEXT (comma-separated)
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_members_participation_programs_text 
-- ON members USING GIN(to_tsvector('simple', participation_programs))
-- WHERE participation_programs IS NOT NULL;

-- ============================================================================
-- COMPOSITE INDEXES for Common Query Patterns
-- ============================================================================

-- 11. Industry + Startup Stage (Common combination)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_members_ksic_startup 
ON members(ksic_major, startup_type) 
WHERE ksic_major IS NOT NULL AND startup_type IS NOT NULL;

-- 12. Region + Industry (Location-based industry analysis)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_members_region_ksic 
ON members(region, ksic_major) 
WHERE region IS NOT NULL AND ksic_major IS NOT NULL;

-- 13. Founding Date + Startup Stage (Timeline analysis)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_members_founding_startup 
ON members(founding_date DESC, startup_type) 
WHERE founding_date IS NOT NULL AND startup_type IS NOT NULL;

-- ============================================================================
-- COVERING INDEXES for Common Queries (Avoid table lookups)
-- ============================================================================

-- 14. Covering index for basic list query
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_members_list_covering 
ON members(company_name, business_number, industry, startup_type) 
INCLUDE (total_investment, patent_count, revenue, export_val, employee_count, region);

-- ============================================================================
-- INDEX MAINTENANCE
-- ============================================================================

-- Analyze table after creating indexes
ANALYZE members;

-- Check index usage (run after some time in production)
-- SELECT 
--     schemaname,
--     tablename,
--     indexname,
--     idx_scan as index_scans,
--     idx_tup_read as tuples_read,
--     idx_tup_fetch as tuples_fetched
-- FROM pg_stat_user_indexes
-- WHERE tablename = 'members'
-- ORDER BY idx_scan DESC;

-- Check index size
-- SELECT 
--     indexname,
--     pg_size_pretty(pg_relation_size(indexrelid)) as index_size
-- FROM pg_stat_user_indexes
-- WHERE tablename = 'members'
-- ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================================================
-- PERFORMANCE NOTES
-- ============================================================================

-- 1. CONCURRENTLY: Indexes are created without locking the table
-- 2. Partial indexes (WHERE clause): Smaller, faster for specific queries
-- 3. DESC ordering: Optimized for descending sorts (common for amounts/dates)
-- 4. GIN indexes: Efficient for array/JSONB containment queries
-- 5. INCLUDE clause: Covering indexes to avoid table lookups

-- ============================================================================
-- ESTIMATED IMPACT
-- ============================================================================

-- Query Type                    | Expected Improvement
-- ------------------------------|---------------------
-- Industry filtering            | 10-50x faster
-- Date range queries            | 5-20x faster
-- Investment/Patent filtering   | 10-30x faster
-- Policy tags (OR logic)        | 20-100x faster
-- Sorting by amount fields      | 5-15x faster
-- Combined filters              | 50-200x faster

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================

-- DROP INDEX CONCURRENTLY IF EXISTS idx_members_ksic_major;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_members_gangwon_industry;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_members_startup_type;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_members_founding_date;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_members_representative_gender;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_members_total_investment;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_members_has_investment;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_members_patent_count;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_members_revenue;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_members_employee_count;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_members_region;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_members_participation_programs_gin;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_members_ksic_startup;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_members_region_ksic;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_members_founding_startup;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_members_list_covering;
