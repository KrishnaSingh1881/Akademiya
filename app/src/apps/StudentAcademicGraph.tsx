import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Info } from 'lucide-react';

/**
 * A hand-rolled force-directed "knowledge graph" of one student's academic
 * standing — concepts/gaps, recent evidence, reading-struggle topics, and
 * proctoring violations — all radiating out from a central student node.
 * No charting library exists in this app yet, so the physics + SVG rendering
 * here are intentionally simple (O(n^2) repulsion is fine at this node count).
 */

type NodeType = 'student' | 'concept' | 'evidence' | 'topic' | 'violation';

interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  color: string;
  radius: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number | null;
  fy?: number | null;
  meta: Record<string, any>;
}

interface GraphEdge {
  source: string;
  target: string;
  length: number;
}

interface AcademicGraphProps {
  studentName: string;
  gaps: any[];
  topics: any[];
  violations: {
    total_violations: number;
    by_assessment: Array<{ assessment_id: string; assessment_title: string; violation_count: number; event_type_counts: Record<string, number> }>;
  } | null;
}

const WIDTH = 960;
const HEIGHT = 600;
const CENTER = { x: WIDTH / 2, y: HEIGHT / 2 };

const GAP_STATUS_COLOR: Record<string, string> = {
  emerging: '#f59e0b',
  confirmed: '#ef4444',
  resolved: '#10b981',
};

const STRUGGLE_COLOR: Record<string, string> = {
  normal: '#64748b',
  moderate_struggle: '#f59e0b',
  high_struggle: '#ef4444',
};

function violationColor(count: number) {
  if (count >= 5) return '#dc2626';
  if (count >= 2) return '#f97316';
  return '#fbbf24';
}

function buildGraph(studentName: string, gaps: any[], topics: any[], violations: AcademicGraphProps['violations']): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  const seedPos = (i: number, total: number, r: number) => {
    const angle = (i / Math.max(1, total)) * Math.PI * 2;
    return { x: CENTER.x + Math.cos(angle) * r, y: CENTER.y + Math.sin(angle) * r };
  };

  const studentId = 'student-root';
  nodes.push({
    id: studentId,
    type: 'student',
    label: studentName || 'Student',
    color: '#818cf8',
    radius: 30,
    x: CENTER.x,
    y: CENTER.y,
    vx: 0,
    vy: 0,
    meta: { kind: 'Student' },
  });

  // Concept / learning-gap branches, each with a handful of recent evidence leaves
  gaps.forEach((gap, gi) => {
    const conceptId = `concept-${gap.id}`;
    const pos = seedPos(gi, gaps.length, 210);
    const evidenceCount = gap.evidence?.length || 0;
    nodes.push({
      id: conceptId,
      type: 'concept',
      label: gap.concept,
      color: GAP_STATUS_COLOR[gap.status] || '#94a3b8',
      radius: 14 + Math.min(10, evidenceCount),
      x: pos.x,
      y: pos.y,
      vx: 0,
      vy: 0,
      meta: { kind: 'Learning Gap', concept: gap.concept, subconcept: gap.subconcept, status: gap.status, evidenceCount },
    });
    edges.push({ source: studentId, target: conceptId, length: 150 });

    (gap.evidence || []).slice(0, 5).forEach((ev: any, ei: number) => {
      const evId = `evidence-${gap.id}-${ev.id || ei}`;
      const epos = seedPos(ei, Math.max(5, gap.evidence.length), 60);
      nodes.push({
        id: evId,
        type: 'evidence',
        label: ev.result === 'correct' ? 'Correct' : 'Incorrect',
        color: ev.result === 'correct' ? '#34d399' : '#f87171',
        radius: 6,
        x: pos.x + epos.x - CENTER.x,
        y: pos.y + epos.y - CENTER.y,
        vx: 0,
        vy: 0,
        meta: {
          kind: 'Attempt Evidence',
          statement: ev.statement,
          result: ev.result,
          source: ev.attempt_source,
          marks: ev.marks_awarded,
          when: ev.created_at,
        },
      });
      edges.push({ source: conceptId, target: evId, length: 55 });
    });
  });

  // Reading / study-struggle topics
  const relevantTopics = topics
    .slice()
    .sort((a, b) => (b.struggle_score || 0) - (a.struggle_score || 0))
    .slice(0, 8);
  relevantTopics.forEach((topic, ti) => {
    const pos = seedPos(ti, relevantTopics.length, 260);
    const topicId = `topic-${topic.id || topic.topic_id || ti}`;
    nodes.push({
      id: topicId,
      type: 'topic',
      label: topic.topic_title || topic.topic_label || 'Topic',
      color: STRUGGLE_COLOR[topic.struggle_level] || STRUGGLE_COLOR.normal,
      radius: 10 + Math.min(8, Number(topic.struggle_score) || 0),
      x: pos.x,
      y: pos.y,
      vx: 0,
      vy: 0,
      meta: {
        kind: 'Reading Activity',
        topic: topic.topic_title,
        subject: topic.subject_name,
        struggleLevel: topic.struggle_level,
        struggleScore: topic.struggle_score,
        struggleReason: topic.struggle_reason,
        hours: topic.hours_studied_str,
        verified: topic.is_considered_read,
      },
    });
    edges.push({ source: studentId, target: topicId, length: 190 });
  });

  // Proctoring / integrity violations, one node per assessment with violations
  (violations?.by_assessment || []).forEach((v, vi) => {
    const pos = seedPos(vi, violations!.by_assessment.length, 300);
    const violationId = `violation-${v.assessment_id}`;
    nodes.push({
      id: violationId,
      type: 'violation',
      label: v.assessment_title,
      color: violationColor(v.violation_count),
      radius: 12 + Math.min(12, v.violation_count),
      x: pos.x,
      y: pos.y,
      vx: 0,
      vy: 0,
      meta: {
        kind: 'Test Integrity Violations',
        assessment: v.assessment_title,
        count: v.violation_count,
        breakdown: v.event_type_counts,
      },
    });
    edges.push({ source: studentId, target: violationId, length: 230 });
  });

  return { nodes, edges };
}

export default function StudentAcademicGraph({ studentName, gaps, topics, violations }: AcademicGraphProps) {
  const graphData = useMemo(() => buildGraph(studentName, gaps, topics, violations), [studentName, gaps, topics, violations]);
  const nodesRef = useRef<GraphNode[]>(graphData.nodes);
  const edgesRef = useRef<GraphEdge[]>(graphData.edges);
  const alphaRef = useRef(1);
  const draggingRef = useRef<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [, forceTick] = useState(0);
  const [hovered, setHovered] = useState<{ node: GraphNode; x: number; y: number } | null>(null);

  useEffect(() => {
    nodesRef.current = graphData.nodes;
    edgesRef.current = graphData.edges;
    alphaRef.current = 1;
  }, [graphData]);

  useEffect(() => {
    let raf: number;
    const step = () => {
      const nodes = nodesRef.current;
      const edges = edgesRef.current;
      const alpha = alphaRef.current;

      if (alpha > 0.002) {
        // Repulsion between every pair of nodes
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i];
            const b = nodes[j];
            let dx = b.x - a.x;
            let dy = b.y - a.y;
            let distSq = dx * dx + dy * dy;
            if (distSq < 1) distSq = 1;
            const dist = Math.sqrt(distSq);
            const force = (2600 * alpha) / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            if (a.fx == null) { a.vx -= fx; a.vy -= fy; }
            if (b.fx == null) { b.vx += fx; b.vy += fy; }
          }
        }

        // Spring attraction along edges
        for (const edge of edges) {
          const a = nodes.find(n => n.id === edge.source);
          const b = nodes.find(n => n.id === edge.target);
          if (!a || !b) continue;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
          const displacement = (dist - edge.length) * 0.06 * alpha;
          const fx = (dx / dist) * displacement;
          const fy = (dy / dist) * displacement;
          if (a.fx == null) { a.vx += fx; a.vy += fy; }
          if (b.fx == null) { b.vx -= fx; b.vy -= fy; }
        }

        // Gentle centering pull + integrate + damping
        for (const n of nodes) {
          if (n.fx != null && n.fy != null) {
            n.x = n.fx;
            n.y = n.fy;
            n.vx = 0;
            n.vy = 0;
            continue;
          }
          n.vx += (CENTER.x - n.x) * 0.002;
          n.vy += (CENTER.y - n.y) * 0.002;
          n.vx *= 0.82;
          n.vy *= 0.82;
          n.x += n.vx;
          n.y += n.vy;
          n.x = Math.max(n.radius, Math.min(WIDTH - n.radius, n.x));
          n.y = Math.max(n.radius, Math.min(HEIGHT - n.radius, n.y));
        }

        alphaRef.current *= 0.985;
        forceTick(t => t + 1);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const toSvgPoint = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * WIDTH,
      y: ((clientY - rect.top) / rect.height) * HEIGHT,
    };
  };

  const handlePointerDown = (nodeId: string) => (e: React.PointerEvent) => {
    e.stopPropagation();
    draggingRef.current = nodeId;
    alphaRef.current = 1;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const dragId = draggingRef.current;
    if (dragId) {
      const node = nodesRef.current.find(n => n.id === dragId);
      if (node) {
        const p = toSvgPoint(e.clientX, e.clientY);
        node.fx = p.x;
        node.fy = p.y;
        forceTick(t => t + 1);
      }
    }
  };

  const handlePointerUp = () => {
    if (draggingRef.current) {
      const node = nodesRef.current.find(n => n.id === draggingRef.current);
      if (node) { node.fx = null; node.fy = null; }
    }
    draggingRef.current = null;
  };

  const nodes = nodesRef.current;
  const edges = edgesRef.current;
  const isEmpty = gaps.length === 0 && topics.length === 0 && !(violations?.total_violations);

  if (isEmpty) {
    return (
      <div style={{ padding: 50, textAlign: 'center', color: 'var(--text-muted)' }}>
        No academic graph data yet for {studentName || 'this student'}.
        <div style={{ fontSize: 12, marginTop: 6 }}>
          Learning gaps, reading-struggle topics, and test violations will appear here as evidence accumulates.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-secondary)' }}>
        <Info size={13} />
        <span>Drag nodes to explore. Hover a node for details. Layout settles automatically.</span>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 11, color: 'var(--text-secondary)' }}>
        <LegendDot color="#818cf8" label="Student" />
        <LegendDot color="#f59e0b" label="Emerging Gap" />
        <LegendDot color="#ef4444" label="Confirmed Gap" />
        <LegendDot color="#10b981" label="Resolved Gap" />
        <LegendDot color="#34d399" label="Correct Attempt" />
        <LegendDot color="#f87171" label="Incorrect Attempt" />
        <LegendDot color="#64748b" label="Reading Topic (normal)" />
        <LegendDot color="#fbbf24" label="Test Violations (low)" />
        <LegendDot color="#dc2626" label="Test Violations (high)" />
      </div>

      <div
        className="glass-panel"
        style={{ borderRadius: 14, padding: 4, position: 'relative', overflow: 'hidden' }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          style={{ width: '100%', height: 560, touchAction: 'none', cursor: draggingRef.current ? 'grabbing' : 'default' }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {edges.map((edge, i) => {
            const a = nodes.find(n => n.id === edge.source);
            const b = nodes.find(n => n.id === edge.target);
            if (!a || !b) return null;
            return (
              <line
                key={i}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={1.2}
              />
            );
          })}

          {nodes.map((n) => (
            <g
              key={n.id}
              transform={`translate(${n.x}, ${n.y})`}
              onPointerDown={handlePointerDown(n.id)}
              onMouseEnter={(e) => setHovered({ node: n, x: e.clientX, y: e.clientY })}
              onMouseMove={(e) => setHovered(h => (h && h.node.id === n.id ? { node: n, x: e.clientX, y: e.clientY } : h))}
              onMouseLeave={() => setHovered(h => (h && h.node.id === n.id ? null : h))}
              style={{ cursor: 'grab' }}
            >
              <circle
                r={n.radius}
                fill={n.color}
                fillOpacity={n.type === 'evidence' ? 0.85 : 0.28}
                stroke={n.color}
                strokeWidth={n.type === 'student' ? 3 : 2}
              />
              {n.type !== 'evidence' && (
                <text
                  y={n.radius + 14}
                  textAnchor="middle"
                  fontSize={n.type === 'student' ? 12 : 10}
                  fontWeight={n.type === 'student' ? 800 : 600}
                  fill="var(--text-primary)"
                  style={{ pointerEvents: 'none', paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.55)', strokeWidth: 3 }}
                >
                  {n.label.length > 26 ? `${n.label.slice(0, 24)}…` : n.label}
                </text>
              )}
            </g>
          ))}
        </svg>

        {hovered && (
          <NodeTooltip node={hovered.node} />
        )}
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 9, height: 9, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {label}
    </span>
  );
}

function NodeTooltip({ node }: { node: GraphNode }) {
  const { meta } = node;
  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        right: 10,
        maxWidth: 300,
        background: 'rgba(15, 23, 42, 0.95)',
        border: `1px solid ${node.color}`,
        borderRadius: 10,
        padding: '10px 12px',
        fontSize: 11,
        color: '#e2e8f0',
        pointerEvents: 'none',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ fontWeight: 800, color: node.color, marginBottom: 4, textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.04em' }}>
        {meta.kind}
      </div>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{node.label}</div>
      {node.type === 'concept' && (
        <div>Status: {meta.status} · {meta.evidenceCount} evidence item(s)</div>
      )}
      {node.type === 'evidence' && (
        <>
          <div>{meta.statement}</div>
          <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>
            {meta.source} · {meta.marks} pts · {meta.when ? new Date(meta.when).toLocaleString() : ''}
          </div>
        </>
      )}
      {node.type === 'topic' && (
        <>
          <div>{meta.subject}</div>
          <div>Struggle: {meta.struggleLevel} ({meta.struggleScore}/10)</div>
          {meta.struggleReason && <div style={{ color: 'var(--text-muted)' }}>{meta.struggleReason}</div>}
          <div>Time spent: {meta.hours}</div>
        </>
      )}
      {node.type === 'violation' && (
        <>
          <div>{meta.count} violation(s) recorded</div>
          <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>
            {Object.entries(meta.breakdown || {}).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(' · ')}
          </div>
        </>
      )}
    </div>
  );
}
