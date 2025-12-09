interface DownloadProgressProps {
  downloading: boolean
  progress: { loaded: number; total?: number } | null
}

export default function DownloadProgress({ downloading, progress }: DownloadProgressProps) {
  if (!downloading || !progress) return null

  return (
    <div style={{
      padding: '12px 24px',
      background: 'rgba(59, 130, 246, 0.1)',
      borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      color: '#93c5fd'
    }}>
      <div className="spinner" style={{ width: '16px', height: '16px' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"></path>
        </svg>
      </div>
      <span style={{ fontSize: '14px' }}>
        正在下载... {progress.total 
          ? `${(progress.loaded/1024/1024).toFixed(1)}MB / ${(progress.total/1024/1024).toFixed(1)}MB`
          : `${(progress.loaded/1024/1024).toFixed(1)}MB`
        }
      </span>
    </div>
  )
}