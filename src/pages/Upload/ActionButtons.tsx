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
          backgroundColor: '#1890ff',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s',
          boxShadow: '0 2px 4px rgba(24,144,255,0.2)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#40a9ff'
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(24,144,255,0.3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#1890ff'
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(24,144,255,0.2)'
        }}
      >
        选择镜像文件
      </button>
      <button
        onClick={onStartUpload}
        disabled={!canStartUpload}
        style={{
          padding: '10px 20px',
          backgroundColor: canStartUpload ? '#52c41a' : '#d9d9d9',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: canStartUpload ? 'pointer' : 'not-allowed',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s',
          boxShadow: canStartUpload ? '0 2px 4px rgba(82,196,26,0.2)' : 'none'
        }}
        onMouseEnter={(e) => {
          if (canStartUpload) {
            e.currentTarget.style.backgroundColor = '#73d13d'
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(82,196,26,0.3)'
          }
        }}
        onMouseLeave={(e) => {
          if (canStartUpload) {
            e.currentTarget.style.backgroundColor = '#52c41a'
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(82,196,26,0.2)'
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
          backgroundColor: isUploading ? '#faad14' : '#d9d9d9',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: isUploading ? 'pointer' : 'not-allowed',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s',
          boxShadow: isUploading ? '0 2px 4px rgba(250,173,20,0.2)' : 'none'
        }}
        onMouseEnter={(e) => {
          if (isUploading) {
            e.currentTarget.style.backgroundColor = '#ffc53d'
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(250,173,20,0.3)'
          }
        }}
        onMouseLeave={(e) => {
          if (isUploading) {
            e.currentTarget.style.backgroundColor = '#faad14'
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(250,173,20,0.2)'
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
          backgroundColor: canClearAll ? '#ff4d4f' : '#d9d9d9',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: canClearAll ? 'pointer' : 'not-allowed',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s',
          boxShadow: canClearAll ? '0 2px 4px rgba(255,77,79,0.2)' : 'none'
        }}
        onMouseEnter={(e) => {
           if (canClearAll) {
             e.currentTarget.style.backgroundColor = '#ff7875'
             e.currentTarget.style.boxShadow = '0 4px 8px rgba(255,77,79,0.3)'
           }
         }}
        onMouseLeave={(e) => {
          if (canClearAll) {
            e.currentTarget.style.backgroundColor = '#ff4d4f'
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(255,77,79,0.2)'
          }
        }}
        title="清空所有文件记录"
      >
        一键清空
      </button>
    </div>
  )
}