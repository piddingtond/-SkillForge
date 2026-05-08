type Props = { score: number; showLabel?: boolean }

export default function ForgeScore({ score, showLabel = false }: Props) {
  const color =
    score >= 90 ? '#F59E0B' :
    score >= 75 ? '#FB923C' :
    score >= 50 ? '#F59E0B80' :
    '#555570'

  const label =
    score >= 90 ? 'Legendary' :
    score >= 75 ? 'Hot' :
    score >= 50 ? 'Rising' :
    'New'

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <span style={{ fontSize: score >= 90 ? '14px' : '13px', lineHeight: 1 }}>
        {score >= 75 ? '🔥' : '💧'}
      </span>
      <span style={{ fontSize: '13px', fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>
        {score}
      </span>
      {showLabel && (
        <span style={{ fontSize: '11px', color: '#555570', marginLeft: '2px' }}>{label}</span>
      )}
    </span>
  )
}
