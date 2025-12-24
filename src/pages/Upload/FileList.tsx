import { useState } from 'react'

interface FileItem {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  errorMessage?: string
}

interface FileListProps {
  files: FileItem[]
  onRemoveFile: (index: number) => void
  onDropFiles: (files: File[]) => void
  onUploadSingle?: (index: number) => void
}

export default function FileList({ files, onRemoveFile, onDropFiles, onUploadSingle }: FileListProps) {
  
  const getStatusColor = (status: FileItem['status']) => {
    switch (status) {
      case 'pending': return 'var(--text-muted)'
      case 'uploading': return 'var(--primary)'
      case 'completed': return 'var(--success)'
      case 'error': return 'var(--error)'
      default: return 'var(--text-muted)'
    }
  }
  
  const getStatusText = (status: FileItem['status']) => {
    switch (status) {
      case 'pending': return '待上传'
      case 'uploading': return '上传中'
      case 'completed': return '已完成'
      case 'error': return '上传失败'
      default: return '未知'
    }
  }
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    onDropFiles(droppedFiles)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div
      style={{
        border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--border)'}`,
        borderRadius: '8px',
        padding: '20px',
        minHeight: '200px',
        backgroundColor: isDragging ? 'var(--hover-bg)' : 'transparent'
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {files.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '160px',
          color: 'var(--text-secondary)'
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: '12px', opacity: 0.5 }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <div style={{ marginBottom: '8px', fontSize: '14px' }}>请将镜像拖至此处</div>
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.accept = '.tar,.tar.gz';
              input.onchange = (e) => {
                const files = Array.from((e.target as HTMLInputElement).files || []);
                onDropFiles(files);
              };
              input.click();
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
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
        </div>
      ) : (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1.2fr 1fr 0.8fr',
            gap: '16px',
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            backgroundColor: 'var(--bg-tertiary)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            borderRadius: '8px 8px 0 0'
          }}>
            <div>名称</div>
            <div>大小</div>
            <div>任务进度</div>
            <div style={{ paddingLeft: '8px' }}>操作</div>
            <div style={{ paddingLeft: '8px' }}>状态</div>
          </div>
          {files.map((item, index) => (
            <div key={index} style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1.2fr 1fr 0.8fr',
              gap: '16px',
              padding: '12px 16px',
              borderBottom: '1px solid var(--border)',
              alignItems: 'center',
              fontSize: '14px',
              color: 'var(--text-primary)'
            }}>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.file.name}
              </div>
              <div>{formatFileSize(item.file.size)}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  flex: 1,
                  height: '4px',
                  backgroundColor: 'var(--border)',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${item.progress}%`,
                    height: '100%',
                    backgroundColor: item.status === 'error' ? 'var(--error)' : 'var(--primary)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {item.progress}%
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', paddingLeft: '8px' }}>
                {onUploadSingle && (
                  <button
                    onClick={() => onUploadSingle(index)}
                    disabled={item.status === 'uploading' || item.status === 'completed'}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: item.status === 'uploading' || item.status === 'completed' ? 'var(--text-disabled)' : 'var(--primary)',
                      cursor: item.status === 'uploading' || item.status === 'completed' ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      padding: '4px 8px',
                      transition: 'color 0.2s'
                    }}
                    title={item.status === 'completed' ? '已完成' : item.status === 'uploading' ? '上传中' : '上传此文件'}
                    onMouseEnter={(e) => {
                      if (item.status !== 'uploading' && item.status !== 'completed') {
                        e.currentTarget.style.color = 'var(--primary-hover)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (item.status !== 'uploading' && item.status !== 'completed') {
                        e.currentTarget.style.color = 'var(--primary)'
                      }
                    }}
                  >
                    上传
                  </button>
                )}
                <button
                  onClick={() => onRemoveFile(index)}
                  disabled={item.status === 'uploading'}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: item.status === 'uploading' ? 'var(--text-disabled)' : 'var(--error)',
                    cursor: item.status === 'uploading' ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    padding: '4px 8px',
                    transition: 'color 0.2s'
                  }}
                  title={item.status === 'uploading' ? '上传中无法删除' : '删除此文件'}
                  onMouseEnter={(e) => {
                    if (item.status !== 'uploading') {
                      e.currentTarget.style.color = 'var(--error-light)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (item.status !== 'uploading') {
                      e.currentTarget.style.color = 'var(--error)'
                    }
                  }}
                >
                  删除
                </button>
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: getStatusColor(item.status),
                fontWeight: item.status === 'error' || item.status === 'completed' ? '600' : '400',
                paddingLeft: '8px'
              }}>
                {item.status === 'error' ? (
                  <span title={item.errorMessage || '上传失败'}>
                    {getStatusText(item.status)}
                  </span>
                ) : (
                  getStatusText(item.status)
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}