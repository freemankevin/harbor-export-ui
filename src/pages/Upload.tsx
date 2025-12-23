export default function Upload() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: 'var(--text-muted)',
      fontSize: '16px'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '60px 40px',
        border: '2px dashed var(--border)',
        borderRadius: '12px',
        background: 'var(--surface)'
      }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 16px', opacity: 0.3 }}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <div>上传镜像功能开发中...</div>
        <div style={{ fontSize: '14px', marginTop: '8px', color: 'var(--text-secondary)' }}>
          敬请期待后续版本
        </div>
      </div>
    </div>
  )
}