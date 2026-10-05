import type { LogLevel } from '~/types/log';

const LEVEL_STYLES = {
  debug: {
    badge: 'text-level-debug bg-level-debug-bg',
    dot: 'bg-level-debug',
    border: 'border-level-debug',
  },
  info: {
    badge: 'text-level-info bg-level-info-bg',
    dot: 'bg-level-info',
    border: 'border-level-info',
  },
  warning: {
    badge: 'text-level-warning bg-level-warning-bg',
    dot: 'bg-level-warning',
    border: 'border-level-warning',
  },
  error: {
    badge: 'text-level-error bg-level-error-bg',
    dot: 'bg-level-error',
    border: 'border-level-error',
  },
  critical: {
    badge: 'text-level-critical bg-level-critical-bg',
    dot: 'bg-level-critical',
    border: 'border-level-critical',
  },
} as const;

export function levelBadgeClass(level: LogLevel): string {
  return LEVEL_STYLES[level].badge;
}

export function levelDotClass(level: LogLevel): string {
  return LEVEL_STYLES[level].dot;
}

export function levelBorderClass(level: LogLevel): string {
  return LEVEL_STYLES[level].border;
}
