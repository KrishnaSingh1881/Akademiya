/**
 * Central AI Model Adapter
 * Interface: generateQuestion, generateDiagnostic, generatePlan, generateExplanation, generateEmbedding
 * 
 * Strict Pattern:
 * Tries local Ollama first (with strict timeout) -> on failure/timeout falls back to
 * pre-validated pool.
 */

import axios from 'axios';
import { extractJSON } from '../lib/aiOutput.js';
import { FALLBACK_QUESTIONS, FALLBACK_DIAGNOSTICS, FALLBACK_PLANS } from './fallbackPool.js';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_GEN_MODEL = process.env.OLLAMA_GEN_MODEL || 'gemma4:e4b';
const OLLAMA_EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text:latest';
const TIMEOUT_MS = 3500;

export async function generateQuestion(blueprint) {
  const { concept, subconcept, type = 'mcq_single', bloom_level = 'apply', difficulty = 'medium', constraints = '' } = blueprint;

  const prompt = `You are an expert computer science educator.
Generate exactly ONE high-quality multiple choice question according to this strict blueprint:
- Concept: ${concept}
- Subconcept: ${subconcept}
- Question Type: ${type}
- Bloom Cognitive Level: ${bloom_level}
- Difficulty: ${difficulty}
${constraints ? `- Constraints: ${constraints}` : ''}

Respond ONLY with valid JSON with this exact structure:
{
  "statement": "string",
  "options": [
    { "id": "opt_1", "text": "option 1 text" },
    { "id": "opt_2", "text": "option 2 text" },
    { "id": "opt_3", "text": "option 3 text" },
    { "id": "opt_4", "text": "option 4 text" }
  ],
  "correct_option_ids": ["opt_2"],
  "explanation": "Brief explanation of why the correct option is correct."
}`;

  try {
    const res = await axios.post(
      `${OLLAMA_BASE_URL}/api/generate`,
      {
        model: OLLAMA_GEN_MODEL,
        prompt,
        stream: false,
        format: 'json',
        options: { temperature: 0.7 }
      },
      { timeout: TIMEOUT_MS }
    );

    const parsed = extractJSON(res.data.response);
    if (parsed && parsed.statement && Array.isArray(parsed.options) && parsed.options.length >= 2 && Array.isArray(parsed.correct_option_ids)) {
      return {
        concept,
        subconcept,
        type,
        bloom_level,
        difficulty,
        statement: parsed.statement,
        options: parsed.options,
        correct_option_ids: parsed.correct_option_ids,
        source: 'ai'
      };
    }
    throw new Error('AI output did not match required question schema');
  } catch (err) {
    console.warn(`[ModelAdapter] Local model unavailable or timed out (${err.message}). Using validated fallback pool.`);
    // Select best match from fallback pool
    const match = FALLBACK_QUESTIONS.find(q => q.concept.toLowerCase() === concept.toLowerCase()) 
      || FALLBACK_QUESTIONS[Math.floor(Math.random() * FALLBACK_QUESTIONS.length)];
    
    return {
      concept,
      subconcept: subconcept || match.subconcept,
      type: match.type,
      bloom_level: bloom_level || match.bloom_level,
      difficulty: difficulty || match.difficulty,
      statement: match.statement,
      options: match.options,
      correct_option_ids: match.correct_option_ids,
      source: 'ai'
    };
  }
}

export async function generateDiagnostic(gap) {
  const concept = gap.concept;
  const subconcept = gap.subconcept;

  const prompt = `You are a diagnostic learning specialist.
A student has formed an emerging learning gap in ${concept} (${subconcept}).
Identify the likely underlying conceptual misconception and formulate 2 targeted diagnostic probe questions.

Respond ONLY with valid JSON:
{
  "misconception": "string describing the specific conceptual flaw",
  "blueprint": {
    "diagnostic_type": "misconception_probe",
    "focus": "${subconcept}",
    "targeted_questions": [
      {
        "statement": "string",
        "options": [
          { "id": "opt_1", "text": "text" },
          { "id": "opt_2", "text": "text" }
        ],
        "correct_option_ids": ["opt_2"],
        "type": "mcq_single",
        "bloom_level": "analyze"
      }
    ]
  }
}`;

  try {
    const res = await axios.post(
      `${OLLAMA_BASE_URL}/api/generate`,
      {
        model: OLLAMA_GEN_MODEL,
        prompt,
        stream: false,
        format: 'json',
        options: { temperature: 0.5 }
      },
      { timeout: TIMEOUT_MS }
    );
    const parsed = extractJSON(res.data.response);
    if (parsed && parsed.blueprint) {
      return parsed;
    }
    throw new Error('Invalid diagnostic output schema');
  } catch (err) {
    console.warn(`[ModelAdapter] Diagnostic fallback triggered: ${err.message}`);
    return FALLBACK_DIAGNOSTICS[0];
  }
}

export async function generatePlan(gap, diagnosis) {
  const concept = gap.concept;
  const subconcept = gap.subconcept;
  const misconception = diagnosis?.misconception || 'Fundamental conceptual misconception';

  const prompt = `Create an educational intervention learning plan for a student struggling with ${concept} (${subconcept}).
Misconception identified: ${misconception}.
Provide a 3-step structured learning plan and 2 scaffolded practice questions.

Respond ONLY with valid JSON:
{
  "title": "string",
  "description": "string",
  "steps": [
    { "step": 1, "title": "string", "instructions": "string" }
  ],
  "practice_questions": [
    {
      "statement": "string",
      "options": [{ "id": "opt_1", "text": "text" }, { "id": "opt_2", "text": "text" }],
      "correct_option_ids": ["opt_1"],
      "type": "mcq_single",
      "bloom_level": "apply",
      "difficulty": "easy"
    }
  ]
}`;

  try {
    const res = await axios.post(
      `${OLLAMA_BASE_URL}/api/generate`,
      {
        model: OLLAMA_GEN_MODEL,
        prompt,
        stream: false,
        format: 'json',
        options: { temperature: 0.5 }
      },
      { timeout: TIMEOUT_MS }
    );
    const parsed = extractJSON(res.data.response);
    if (parsed && parsed.steps && parsed.practice_questions) {
      return parsed;
    }
    throw new Error('Invalid plan schema');
  } catch (err) {
    console.warn(`[ModelAdapter] Intervention plan fallback triggered: ${err.message}`);
    return FALLBACK_PLANS[0];
  }
}

export async function generateExplanation(challenge, submission, error) {
  const prompt = `A student attempted coding challenge '${challenge.title}'.
Code submitted:
\`\`\`
${submission}
\`\`\`
Test Failure / Error:
${error}

Explain in 2-3 clear, constructive sentences why this failed and the conceptual adjustment needed. Do not provide the full solution code.`;

  try {
    const res = await axios.post(
      `${OLLAMA_BASE_URL}/api/generate`,
      {
        model: OLLAMA_GEN_MODEL,
        prompt,
        stream: false,
        options: { temperature: 0.3 }
      },
      { timeout: TIMEOUT_MS }
    );
    return res.data.response.trim();
  } catch (err) {
    return 'Your code did not satisfy the expected test condition. Check the edge cases and terminating conditions.';
  }
}

export async function grade_descriptive_answer(questionStatement, referenceAnswer, studentAnswer) {
  const prompt = `You are a computer science teacher grading a student's descriptive explanation.
Question: ${questionStatement}
Teacher's Reference Answer: ${referenceAnswer}
Student's Answer: ${studentAnswer}

Evaluate the student's explanation against the reference answer.
Determine if the explanation is correct, partially correct, or incorrect.
Identify which core conceptual points were covered and which critical points were missed.

CRITICAL: Return ONLY a JSON object with this exact structure:
{
  "verdict": "correct", // must be "correct", "partial", or "incorrect"
  "covered": ["point 1 explained well", "point 2 demonstrated"],
  "missed": ["missing point 1"]
}
Never return just a number or score.`;

  try {
    const res = await axios.post(
      `${OLLAMA_BASE_URL}/api/generate`,
      {
        model: OLLAMA_GEN_MODEL,
        prompt,
        stream: false,
        format: 'json',
        options: { temperature: 0.2 }
      },
      { timeout: TIMEOUT_MS }
    );

    const parsed = extractJSON(res.data.response);
    if (parsed && ['correct', 'partial', 'incorrect'].includes(parsed.verdict)) {
      return {
        verdict: parsed.verdict,
        covered: Array.isArray(parsed.covered) ? parsed.covered : [],
        missed: Array.isArray(parsed.missed) ? parsed.missed : []
      };
    }
  } catch (err) {
    console.warn(`[ModelAdapter] grade_descriptive_answer Ollama fallback: ${err.message}`);
  }

  // Robust deterministic heuristic fallback
  const STOP_WORDS = new Set(['each', 'with', 'without', 'that', 'this', 'from', 'into', 'until', 'when', 'where', 'which', 'their', 'there', 'have', 'been', 'will', 'would', 'should', 'could']);
  const normalize = (txt) => (txt || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 3 && !STOP_WORDS.has(w));
  const refWords = Array.from(new Set(normalize(referenceAnswer)));
  const stuWords = new Set(normalize(studentAnswer));

  const matched = refWords.filter(w => stuWords.has(w));
  const missedWords = refWords.filter(w => !stuWords.has(w));
  const matchRatio = refWords.length > 0 ? (matched.length / refWords.length) : 0;

  let verdict = 'incorrect';
  if (matchRatio >= 0.40) {
    verdict = 'correct';
  } else if (matchRatio >= 0.20) {
    verdict = 'partial';
  }

  const covered = matched.length > 0
    ? matched.slice(0, 4).map(w => `Identified key concept related to '${w}'`)
    : [];
  const missed = missedWords.length > 0
    ? missedWords.slice(0, 4).map(w => `Omitted reference point '${w}'`)
    : ['Needs more elaboration on core mechanism'];

  return {
    verdict,
    covered,
    missed
  };
}

export async function generateEmbedding(text) {
  try {
    const res = await axios.post(
      `${OLLAMA_BASE_URL}/api/embeddings`,
      {
        model: OLLAMA_EMBED_MODEL,
        prompt: text
      },
      { timeout: 8000 }
    );
    if (res.data && Array.isArray(res.data.embedding) && res.data.embedding.length === 768) {
      return res.data.embedding;
    }
  } catch (err) {
    // Fallback: deterministic pseudo-embedding vector of 768 dimensions based on hash of text
  }

  // Deterministic fallback vector
  const vec = new Array(768).fill(0);
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    vec[i % 768] = (vec[i % 768] + (code / 255)) / 2;
  }
  return vec;
}

