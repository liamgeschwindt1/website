export const THEMES = {
  default: {
    name: 'Default',
    bg: '#031119',
    surface: 'rgba(27, 53, 79, 0.50)',
    text: '#F7F7F7',
    body: 'rgba(247, 247, 247, 0.75)',
    muted: 'rgba(247, 247, 247, 0.45)',
    teal: '#01B4AF',
    gold: '#FFB100',
    border: 'rgba(255, 255, 255, 0.08)',
  },
  'touch-grass': {
    name: 'Touch Grass Mode',
    bg: '#0a1f0f',
    surface: 'rgba(34, 78, 42, 0.50)',
    text: '#E8F5E9',
    body: 'rgba(232, 245, 233, 0.75)',
    muted: 'rgba(232, 245, 233, 0.45)',
    teal: '#2BBF6E',
    gold: '#7CB342',
    border: 'rgba(139, 195, 74, 0.12)',
  },
  'pink-perfect': {
    name: 'Pink Perfect',
    bg: '#1a0f18',
    surface: 'rgba(142, 68, 173, 0.50)',
    text: '#FBE9F3',
    body: 'rgba(251, 233, 243, 0.75)',
    muted: 'rgba(251, 233, 243, 0.45)',
    teal: '#E91E8C',
    gold: '#D946EF',
    border: 'rgba(233, 30, 140, 0.15)',
  },
  'deep-ocean': {
    name: 'Deep Ocean',
    bg: '#0a1628',
    surface: 'rgba(30, 71, 125, 0.50)',
    text: '#D0E8FF',
    body: 'rgba(208, 232, 255, 0.75)',
    muted: 'rgba(208, 232, 255, 0.45)',
    teal: '#00D9FF',
    gold: '#FFD700',
    border: 'rgba(0, 217, 255, 0.12)',
  },
  'sunset-glow': {
    name: 'Sunset Glow',
    bg: '#1a0d00',
    surface: 'rgba(139, 69, 19, 0.50)',
    text: '#FFE8CC',
    body: 'rgba(255, 232, 204, 0.75)',
    muted: 'rgba(255, 232, 204, 0.45)',
    teal: '#FF6B35',
    gold: '#FFA500',
    border: 'rgba(255, 107, 53, 0.12)',
  },
} as const

export type ThemeId = keyof typeof THEMES

export function applyTheme(themeId: string) {
  const theme = THEMES[themeId as ThemeId]
  if (!theme || typeof document === 'undefined') return
  const root = document.documentElement
  root.style.setProperty('--bg', theme.bg)
  root.style.setProperty('--surface', theme.surface)
  root.style.setProperty('--text', theme.text)
  root.style.setProperty('--body', theme.body)
  root.style.setProperty('--muted', theme.muted)
  root.style.setProperty('--teal', theme.teal)
  root.style.setProperty('--gold', theme.gold)
  root.style.setProperty('--border', theme.border)
}
