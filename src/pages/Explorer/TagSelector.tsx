interface TagSelectorProps {
  repoName: string
  isSelected: boolean
  selectedTag: string
  tags: string[]
  isExpanded: boolean
  onTagChange: (repoName: string, tag: string) => void
  onToggleExpand: (repoName: string) => void
}

export default function TagSelector({
  repoName,
  isSelected,
  selectedTag,
  tags,
  isExpanded,
  onTagChange,
  onToggleExpand
}: TagSelectorProps) {
  if (isSelected && tags.length > 0) {
    return (
      <select
        value={selectedTag}
        onChange={(e) => onTagChange(repoName, e.target.value)}
        style={{
          width: '100%',
          padding: '6px 10px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          color: 'var(--text-primary)',
          fontSize: '13px',
          cursor: 'pointer'
        }}
      >
        {tags.map(tag => (
          <option key={tag} value={tag}>{tag}</option>
        ))}
      </select>
    )
  }

  return (
    <button
      onClick={() => onToggleExpand(repoName)}
      style={{
        padding: '6px 12px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        color: 'var(--text-primary)',
        fontSize: '13px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.2s'
      }}
    >
      查看版本
      <svg 
        width="14" 
        height="14" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        style={{
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s'
        }}
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>
  )
}