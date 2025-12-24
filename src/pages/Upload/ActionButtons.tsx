interface ActionButtonsProps {
  selectedProject: string
  files: FileItem[]
  isUploading: boolean
  onSelectFiles: () => void
  onStartUpload: () => void
  onCancelUpload: () => void
  onClearAll: () => void
}

interface FileItem {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
}

export default function ActionButtons({
  selectedProject,
  files,
  isUploading,
  onSelectFiles,
  onStartUpload,
  onCancelUpload,
  onClearAll
}: ActionButtonsProps) {
  const hasPendingFiles = files.some(f => f.status === 'pending' || f.status === 'error')
  const canStartUpload = selectedProject !== '' && hasPendingFiles && !isUploading
  const canClearAll = files.length > 0 && !isUploading

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      marginBottom: '24px'
    }}>
      <button
        onClick={onSelectFiles}
        style={{
          padding: '10px 20px',
          backgroundColor: 'var(--primary)',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s',
          boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--primary-hover)'
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--primary)'
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.2)'
        }}
      >
        选择镜像文件
      </button>
      <button
        onClick={onStartUpload}
        disabled={!canStartUpload}
        style={{
          padding: '10px 20px',
          backgroundColor: canStartUpload ? 'var(--success)' : 'var(--text-disabled)',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: canStartUpload ? 'pointer' : 'not-allowed',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s',
          boxShadow: canStartUpload ? '0 2px 4px rgba(16, 185, 129, 0.2)' : 'none',
          opacity: canStartUpload ? 1 : 0.6
        }}
        onMouseEnter={(e) => {
          if (canStartUpload) {
            e.currentTarget.style.backgroundColor = 'var(--success-light)'
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.3)'
          }
        }}
        onMouseLeave={(e) => {
          if (canStartUpload) {
            e.currentTarget.style.backgroundColor = 'var(--success)'
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.2)'
          }
        }}
      >
        开始上传
      </button>
      <button
        onClick={onCancelUpload}
        disabled={!isUploading}
        style={{
          padding: '10px 20px',
          backgroundColor: isUploading ? 'var(--warning)' : 'var(--text-disabled)',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: isUploading ? 'pointer' : 'not-allowed',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s',
          boxShadow: isUploading ? '0 2px 4px rgba(245, 158, 11, 0.2)' : 'none',
          opacity: isUploading ? 1 : 0.6
        }}
        onMouseEnter={(e) => {
          if (isUploading) {
            e.currentTarget.style.backgroundColor = '#fbbf24'
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(245, 158, 11, 0.3)'
          }
        }}
        onMouseLeave={(e) => {
          if (isUploading) {
            e.currentTarget.style.backgroundColor = 'var(--warning)'
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(245, 158, 11, 0.2)'
          }
        }}
      >
        取消上传
      </button>
      <button
        onClick={onClearAll}
        disabled={!canClearAll}
        style={{
          padding: '10px 20px',
          backgroundColor: canClearAll ? 'var(--error)' : 'var(--text-disabled)',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: canClearAll ? 'pointer' : 'not-allowed',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s',
          boxShadow: canClearAll ? '0 2px 4px rgba(239, 68, 68, 0.2)' : 'none',
          opacity: canClearAll ? 1 : 0.6
        }}
        onMouseEnter={(e) => {
           if (canClearAll) {
             e.currentTarget.style.backgroundColor = 'var(--error-light)'
             e.currentTarget.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.3)'
           }
         }}
        onMouseLeave={(e) => {
          if (canClearAll) {
            e.currentTarget.style.backgroundColor = 'var(--error)'
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.2)'
          }
        }}
        title="清空所有文件记录"
      >
        一键清空
      </button>
    </div>
  )
}