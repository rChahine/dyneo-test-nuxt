const pad = (value: number, size = 2) => String(value).padStart(size, '0');

export function formatTime(timestamp: string): string {
  const at = new Date(timestamp);
  if (Number.isNaN(at.getTime())) {
    return timestamp;
  }
  return `${pad(at.getHours())}:${pad(at.getMinutes())}:${pad(at.getSeconds())}.${pad(at.getMilliseconds(), 3)}`;
}
