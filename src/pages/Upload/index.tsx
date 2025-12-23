import { useState, useRef } from 'react'
import Header from './Header'
import InfoBox from './InfoBox'
import ProjectSelector from './ProjectSelector'
import ActionButtons from './ActionButtons'
import FileList from './FileList'

interface FileItem {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
}

export default function Upload() {
  const [selectedProject, setSelectedProject] = useState('')
  const [files, setFiles] = useState<FileItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 模拟项目数据
  const projects = ['项目A', '项目B', '项目C', '项目D']

  const handleSelectFiles = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || [])
    const fileItems = newFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const
    }))
    setFiles(prev => [...prev, ...fileItems])
  }

  const handleDropFiles = (newFiles: File[]) => {
    const fileItems = newFiles.map(file => ({
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
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <Header />
      <InfoBox />
      
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
  )
}