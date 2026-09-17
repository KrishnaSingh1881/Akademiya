-- Enable pgvector and uuid generation
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('teacher', 'student')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. assessments
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. questions
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE SET NULL,
  concept VARCHAR(255) NOT NULL,
  subconcept VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('mcq_single', 'mcq_multi', 'coding')),
  statement TEXT NOT NULL,
  options JSONB,
  correct_option_ids JSONB,
  bloom_level VARCHAR(50),
  difficulty VARCHAR(50),
  source VARCHAR(50) NOT NULL DEFAULT 'teacher' CHECK (source IN ('teacher', 'ai')),
  embedding vector(768),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. attempts
CREATE TABLE IF NOT EXISTS attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  source VARCHAR(50) NOT NULL CHECK (source IN ('practice', 'assessment', 'diagnostic', 'reassessment')),
  selected_option_ids JSONB,
  code TEXT,
  is_correct BOOLEAN NOT NULL,
  marks_awarded NUMERIC(5, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. learning_evidence
CREATE TABLE IF NOT EXISTS learning_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  concept VARCHAR(255) NOT NULL,
  subconcept VARCHAR(255) NOT NULL,
  attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  result VARCHAR(50) NOT NULL CHECK (result IN ('correct', 'incorrect')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. learning_gaps
CREATE TABLE IF NOT EXISTS learning_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  concept VARCHAR(255) NOT NULL,
  subconcept VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'emerging' CHECK (status IN ('emerging', 'confirmed', 'resolved')),
  evidence_ids JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. diagnostics
CREATE TABLE IF NOT EXISTS diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gap_id UUID NOT NULL REFERENCES learning_gaps(id) ON DELETE CASCADE,
  blueprint JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. diagnostic_attempts
CREATE TABLE IF NOT EXISTS diagnostic_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnostic_id UUID NOT NULL REFERENCES diagnostics(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. interventions
CREATE TABLE IF NOT EXISTS interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gap_id UUID NOT NULL REFERENCES learning_gaps(id) ON DELETE CASCADE,
  plan JSONB NOT NULL,
  target_concept VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. reassessments
CREATE TABLE IF NOT EXISTS reassessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id UUID NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 11. progress
CREATE TABLE IF NOT EXISTS progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  concept VARCHAR(255) NOT NULL,
  before_evidence_ids JSONB NOT NULL,
  after_evidence_ids JSONB NOT NULL,
  delta JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 12. generation_jobs
CREATE TABLE IF NOT EXISTS generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requested_count INT NOT NULL,
  generated_count INT NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'cancelled', 'failed')),
  retry_budget_used INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 13. generated_questions
CREATE TABLE IF NOT EXISTS generated_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES generation_jobs(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'failed')),
  attempt_no INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 14. coding_challenges
CREATE TABLE IF NOT EXISTS coding_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concept VARCHAR(255) NOT NULL,
  subconcept VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  initial_code TEXT NOT NULL,
  language VARCHAR(50) NOT NULL DEFAULT 'python',
  expected_behaviour TEXT NOT NULL,
  test_cases JSONB NOT NULL,
  diagnostic_tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Helpful indexes for rapid deterministic querying
CREATE INDEX IF NOT EXISTS idx_questions_concept ON questions(concept, subconcept);
CREATE INDEX IF NOT EXISTS idx_attempts_student ON attempts(student_id, question_id);
CREATE INDEX IF NOT EXISTS idx_evidence_student_concept ON learning_evidence(student_id, concept);
CREATE INDEX IF NOT EXISTS idx_gaps_student_status ON learning_gaps(student_id, status);
CREATE INDEX IF NOT EXISTS idx_interventions_gap ON interventions(gap_id);
CREATE INDEX IF NOT EXISTS idx_gen_jobs_teacher ON generation_jobs(teacher_id);
