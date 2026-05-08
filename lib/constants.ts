export const CATEGORIES = [
  { name: 'All',          color: '#7C3AED', emoji: '⚡' },
  { name: 'Coding',       color: '#06B6D4', emoji: '💻' },
  { name: 'Marketing',    color: '#F59E0B', emoji: '📈' },
  { name: 'YouTube',      color: '#EF4444', emoji: '▶' },
  { name: 'X / Twitter',  color: '#F8F8FF', emoji: '✕' },
  { name: 'Sales',        color: '#10B981', emoji: '🤝' },
  { name: 'SEO',          color: '#7C3AED', emoji: '🔍' },
  { name: 'Security',     color: '#EF4444', emoji: '🔒' },
  { name: 'Finance',      color: '#10B981', emoji: '💰' },
  { name: 'Research',     color: '#06B6D4', emoji: '🔬' },
  { name: 'Content',      color: '#A855F7', emoji: '✍' },
  { name: 'Productivity', color: '#F59E0B', emoji: '📌' },
  { name: 'AI Automation',color: '#7C3AED', emoji: '🤖' },
]

export const SUBJECTS = CATEGORIES.map(c => c.name)

export const CATEGORY_COLORS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map(c => [c.name, c.color])
)

export const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced']

export const DIFF_COLOR: Record<string, string> = {
  Beginner:     '#10B981',
  Intermediate: '#F59E0B',
  Advanced:     '#EF4444',
}

export const DIFF_BG: Record<string, string> = {
  Beginner:     '#10B98120',
  Intermediate: '#F59E0B20',
  Advanced:     '#EF444420',
}
