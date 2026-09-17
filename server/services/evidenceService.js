/**
 * Evidence Aggregation & Learning Gap Detection Service
 * 
 * DESIGN STRATEGY:
 * We use an Exponential Recency-Weighted Window of up to the last 10 attempts
 * for each student + concept. 
 * Weight formula: w_i = (0.85)^i where i=0 is the most recent attempt.
 * A gap is triggered when:
 * 1. Total evidence attempts for the concept >= 3
 * 2. Weighted incorrect ratio >= 60% (0.60)
 * 3. No active ('emerging' or 'confirmed') gap currently exists for this student + concept.
 * 
 * When triggered, a new learning gap is inserted with status = 'emerging',
 * storing the exact evidence IDs that contributed to the trigger.
 * ZERO opaque numeric risk scores are computed or stored.
 */

import { query } from '../db/index.js';

export async function aggregateEvidence(studentId, concept) {
  const result = await query(
    `SELECT id, student_id, concept, subconcept, attempt_id, result, source, created_at
     FROM learning_evidence
     WHERE student_id = $1 AND concept = $2
     ORDER BY created_at DESC
     LIMIT 10`,
    [studentId, concept]
  );

  const rows = result.rows;
  if (rows.length === 0) {
    return {
      total_count: 0,
      weighted_incorrect_ratio: 0,
      evidence_rows: []
    };
  }

  const DECAY = 0.85;
  let totalWeight = 0;
  let incorrectWeight = 0;

  rows.forEach((row, index) => {
    // Recency decay factor
    const recencyWeight = Math.pow(DECAY, index);
    // Trust weight: deterministic evidence has full trust (1.0),
    // ai_graded_descriptive has lower trust (0.6) per Phase 10 spec.
    const trustWeight = row.source === 'ai_graded_descriptive' ? 0.6 : 1.0;
    const effectiveWeight = recencyWeight * trustWeight;

    totalWeight += effectiveWeight;
    if (row.result === 'incorrect') {
      incorrectWeight += effectiveWeight;
    }
  });

  const weightedIncorrectRatio = totalWeight > 0 ? (incorrectWeight / totalWeight) : 0;

  return {
    total_count: rows.length,
    weighted_incorrect_ratio: weightedIncorrectRatio,
    evidence_rows: rows
  };
}

export async function detectGap(studentId, concept, subconcept) {
  const aggregation = await aggregateEvidence(studentId, concept);

  // Require at least 3 attempts and >= 60% weighted incorrect ratio
  if (aggregation.total_count < 3 || aggregation.weighted_incorrect_ratio < 0.60) {
    return null;
  }

  // Check if an open gap ('emerging' or 'confirmed') already exists
  const existingGap = await query(
    `SELECT id, status, evidence_ids 
     FROM learning_gaps 
     WHERE student_id = $1 AND concept = $2 AND status IN ('emerging', 'confirmed')
     LIMIT 1`,
    [studentId, concept]
  );

  const triggeringEvidenceIds = aggregation.evidence_rows.map(e => e.id);

  if (existingGap.rows.length > 0) {
    // Gap already exists; we update updated_at and refresh evidence_ids if needed
    const currentGap = existingGap.rows[0];
    await query(
      `UPDATE learning_gaps
       SET evidence_ids = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [JSON.stringify(triggeringEvidenceIds), currentGap.id]
    );
    return { gap_id: currentGap.id, status: currentGap.status, is_new: false };
  }

  // Create new emerging gap
  const insertResult = await query(
    `INSERT INTO learning_gaps (student_id, concept, subconcept, status, evidence_ids)
     VALUES ($1, $2, $3, 'emerging', $4)
     RETURNING *`,
    [
      studentId,
      concept,
      subconcept || (aggregation.evidence_rows[0]?.subconcept || concept),
      JSON.stringify(triggeringEvidenceIds)
    ]
  );

  return { gap_id: insertResult.rows[0].id, status: 'emerging', is_new: true, gap: insertResult.rows[0] };
}

export async function getStudentGapsWithEvidence(studentId) {
  const gapsResult = await query(
    `SELECT * FROM learning_gaps
     WHERE student_id = $1
     ORDER BY updated_at DESC`,
    [studentId]
  );

  const gaps = gapsResult.rows;

  // Expand full evidence rows for each gap
  const enrichedGaps = await Promise.all(
    gaps.map(async (gap) => {
      let evidenceIds = [];
      try {
        evidenceIds = typeof gap.evidence_ids === 'string' 
          ? JSON.parse(gap.evidence_ids) 
          : (gap.evidence_ids || []);
      } catch {
        evidenceIds = [];
      }

      if (evidenceIds.length === 0) {
        return { ...gap, evidence: [] };
      }

      const evidenceQuery = await query(
        `SELECT le.id, le.concept, le.subconcept, le.result, le.source as evidence_source, le.created_at,
                a.source as attempt_source, a.marks_awarded, a.selected_option_ids, a.grading_details,
                q.statement, q.type as question_type, q.bloom_level
         FROM learning_evidence le
         LEFT JOIN attempts a ON le.attempt_id = a.id
         LEFT JOIN questions q ON a.question_id = q.id
         WHERE le.id = ANY($1::uuid[])
         ORDER BY le.created_at DESC`,
        [evidenceIds]
      );

      return {
        ...gap,
        evidence: evidenceQuery.rows
      };
    })
  );

  return enrichedGaps;
}
