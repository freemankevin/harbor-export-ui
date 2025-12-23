interface ActionButtonsProps {
  selectedProject: string
  files: FileItem[]
  isUploading: boolean
  onSelectFiles: () => void
  onStartUpload: () => void
  onCancelUpload: () => void
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
  onCancelUpload
}: ActionButtonsProps) {
  const canStartUpload = selectedProject !== '' && files.length > 0 && !isUploading

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
          backgroundColor: '#333',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        选择镜像文件
      </button>
      <button
        onClick={onStartUpload}
        disabled={!canStartUpload}
        style={{
          padding: '10px 20px',
          backgroundColor: canStartUpload ? '#666' : '#e0e0e0',
          color: canStartUpload ? 'white' : '#999',
          border: 'none',
          borderRadius: '6px',
          cursor: canStartUpload ? 'pointer' : 'not-allowed',
          fontSize: '14px'
        }}
      >
        开始上传
      </button>
      <button
        onClick={onCancelUpload}
        disabled={!isUploading}
        style={{
          padding: '10px 20px',
          backgroundColor: isUploading ? '#666' : '#e0e0e0',
          color: isUploading ? 'white' : '#999',
          border: 'none',
          borderRadius: '6px',
          cursor: isUploading ? 'pointer' : 'not-allowed',
          fontSize: '14px'
        }}
      >
        取消上传
      </button>
    </div>
  )
}