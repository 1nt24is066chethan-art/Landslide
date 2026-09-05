// Single source of truth for risk levels, labels, and styling.
// No component should hardcode risk colors directly — everything reads
// from here so LOW/MEDIUM/HIGH always look and read the same everywhere
// in the app (dashboard cards, alerts, map markers in later phases, etc).

export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
}

// Non-risk "status" tones used for cards/badges that aren't a risk level
// (e.g. Active Warnings, Citizen Reports) but still need a consistent color.
export const STATUS_TONES = {
  ...RISK_LEVELS,
  INFO: 'info',
}

const LABELS = {
  low: 'LOW',
  medium: 'MEDIUM',
  high: 'HIGH',
  info: 'INFO',
}

// Tailwind class groups per tone. Colors themselves are defined once in
// tailwind.config.js (risk.low/medium/high, accent) — this just maps a
// tone name to the right combination of classes.
const TONE_CLASSES = {
  low: {
    badge: 'badge-low',
    text: 'text-risk-low',
    bg: 'bg-risk-lowSoft',
    border: 'border-risk-low/30',
    ring: 'ring-risk-low/20',
    iconBg: 'bg-risk-lowSoft',
    iconText: 'text-risk-low',
  },
  medium: {
    badge: 'badge-medium',
    text: 'text-risk-medium',
    bg: 'bg-risk-mediumSoft',
    border: 'border-risk-medium/30',
    ring: 'ring-risk-medium/20',
    iconBg: 'bg-risk-mediumSoft',
    iconText: 'text-risk-medium',
  },
  high: {
    badge: 'badge-high',
    text: 'text-risk-high',
    bg: 'bg-risk-highSoft',
    border: 'border-risk-high/30',
    ring: 'ring-risk-high/20',
    iconBg: 'bg-risk-highSoft',
    iconText: 'text-risk-high',
  },
  info: {
    badge: 'bg-accent/15 text-accent-soft border border-accent/30',
    text: 'text-accent-soft',
    bg: 'bg-accent/10',
    border: 'border-accent/30',
    ring: 'ring-accent/20',
    iconBg: 'bg-accent/10',
    iconText: 'text-accent-soft',
  },
}

/**
 * Human-readable label for a risk/status tone, e.g. "HIGH".
 * Always pair color with this label — never communicate risk by color alone.
 */
export function getRiskLabel(tone) {
  return LABELS[tone] ?? tone?.toUpperCase?.() ?? 'UNKNOWN'
}

/**
 * Tailwind class set for a given risk/status tone.
 * Falls back to the "info" tone if an unrecognized value is passed,
 * so a bad tone never silently renders unstyled.
 */
export function getToneClasses(tone) {
  return TONE_CLASSES[tone] ?? TONE_CLASSES.info
}

// NOTE: score -> risk level conversion, risk-score gauge styling, etc.
// are intentionally NOT included yet — they belong to Phase 6 (Risk Score
// Visualization) once a selected location actually has a score to convert.
