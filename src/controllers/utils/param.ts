export function getInt(params: URLSearchParams, key: string, min: number, max: number, defaultValue: number) {
  const v = params.get(key);
  let i = typeof v === 'string'
    ? parseInt(v)
    : defaultValue;

  if (defaultValue !== undefined && i === Number.NaN) {
    i = defaultValue;
  }

  if (min !== undefined) {
    i = Math.max(i, min);
  }
  if (max !== undefined) {
    i = Math.min(i, max);
  }

  return i
}