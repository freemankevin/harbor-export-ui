interface SearchToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCount: number
  onBatchDownload: () => void
  downloading: boolean
}

export default function SearchToolbar({
  searchQuery,
  onSearchChange,
  selectedCount,
  onBatchDownload,
  downloading
}: SearchToolbarProps) {
  return (
    <div style={{
      padding: '16px 24px',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      background: 'var(--surface)'
    }}>
      <div style={{ flex: 1, position: 'relative', maxWidth: '400px' }}>
        <input
          type="text"
          placeholder="请输入镜像名称"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px 10px 40px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '14px'
          }}
        />
        <svg 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#94a3b8" 
          strokeWidth="2"
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)'
          }}
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
      </div>
      
      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
        已选择 <span style={{ color: '#3b82f6', fontWeight: 600 }}>{selectedCount}</span> 个镜像
      </div>

      <button
        onClick={onBatchDownload}
        disabled={selectedCount === 0 || downloading}
        style={{
          padding: '10px 20px',
          background: selectedCount > 0 
            ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' 
            : 'rgba(51, 65, 85, 0.3)',
          border: 'none',
          borderRadius: '8px',
          color: selectedCount > 0 ? 'white' : '#64748b',
          fontSize: '14px',
          fontWeight: 600,
          cursor: selectedCount > 0 && !downloading ? 'pointer' : 'not-allowed',
          opacity: downloading ? 0.6 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s'
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        批量下载
      </button>
    </div>
  )
}