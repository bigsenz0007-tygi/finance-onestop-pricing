/** 兼容本地根路径与 GitHub Pages 子路径部署 */
export function publicAsset(path) {
  const base = process.env.BASE_URL || '/'
  const raw = String(path || '')
  if (!raw) return base
  if (/^https?:\/\//.test(raw)) return raw
  if (base !== '/' && raw.startsWith(base)) return raw
  const cleaned = raw.replace(/^\//, '')
  return `${base}${cleaned}`
}
