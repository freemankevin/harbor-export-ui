import { useState, useRef } from 'react'

import InfoBox from './InfoBox'
import ProjectSelector from './ProjectSelector'
import ActionButtons from './ActionButtons'
import FileList from './FileList'

interface FileItem {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
}

const MAX_UPLOAD_COUNT = 10

export default function Upload() {
  const [selectedProject, setSelectedProject] = useState('')
  const [files, setFiles] = useState<FileItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 模拟项目数据
  const projects = ['项目A', '项目B', '项目C', '项目D']

  const remainingCount = MAX_UPLOAD_COUNT - files.length

  const handleSelectFiles = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || [])
    const availableSlots = MAX_UPLOAD_COUNT - files.length
    const filesToAdd = newFiles.slice(0, availableSlots)
    
    const fileItems = filesToAdd.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const
    }))
    setFiles(prev => [...prev, ...fileItems])
  }

  const handleDropFiles = (newFiles: File[]) => {
    const availableSlots = MAX_UPLOAD_COUNT - files.length
    const filesToAdd = newFiles.slice(0, availableSlots)
    
    const fileItems = filesToAdd.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const
    }))
    setFiles(prev => [...prev, ...fileItems])
  }

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleStartUpload = async () => {
    if (!selectedProject || files.length === 0) return

    setIsUploading(true)
    
    // 模拟上传过程
    for (let i = 0; i < files.length; i++) {
      setFiles(prev => prev.map((item, index) => 
        index === i ? { ...item, status: 'uploading' } : item
      ))

      // 模拟上传进度
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200))
        setFiles(prev => prev.map((item, index) => 
          index === i ? { ...item, progress } : item
        ))
      }

      setFiles(prev => prev.map((item, index) => 
        index === i ? { ...item, status: 'completed' } : item
      ))
    }

    setIsUploading(false)
  }

  const handleCancelUpload = () => {
    setIsUploading(false)
    // 重置所有文件状态
    setFiles(prev => prev.map(item => ({
      ...item,
      progress: 0,
      status: 'pending' as const
    })))
  }

  return (
    <div style={{
      padding: '0 24px',
      height: '100%',
      overflow: 'auto'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        margin: '20px 0 16px 0'
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: 'var(--text-primary)',
          margin: 0
        }}>
          上传镜像
        </h2>
        <div style={{
          position: 'relative',
          display: 'inline-block'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ cursor: 'help', color: 'var(--text-secondary)' }}>
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--surface)',
            color: 'var(--text-primary)',
            padding: '6px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid var(--border)',
            opacity: 0,
            visibility: 'hidden',
            transition: 'opacity 0.2s',
            zIndex: 1000,
            marginBottom: '4px',
            pointerEvents: 'none'
          }}>
            上传镜像到指定项目
          </div>
        </div>
      </div>
      <div style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <InfoBox remainingCount={remainingCount} />
        
        <div style={{ marginBottom: '24px' }}>
          <ProjectSelector
            selectedProject={selectedProject}
            onProjectChange={setSelectedProject}
            projects={projects}
          />
          
          <ActionButtons
            selectedProject={selectedProject}
            files={files}
            isUploading={isUploading}
            onSelectFiles={handleSelectFiles}
            onStartUpload={handleStartUpload}
            onCancelUpload={handleCancelUpload}
          />
        </div>

        <FileList
          files={files}
          onRemoveFile={handleRemoveFile}
          onDropFiles={handleDropFiles}
        />

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".tar,.tar.gz"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
    </div>
  )
}