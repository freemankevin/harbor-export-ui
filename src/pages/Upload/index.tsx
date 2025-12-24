import { useRef, useState } from 'react'
import { loadConfig } from '../../store/config'
import { useFileManager } from './hooks/useFileManager'
import { useProjectManager } from './hooks/useProjectManager'
import { useFileUpload } from './hooks/useFileUpload'
import type { UploadConfig } from './hooks/useFileUpload'
import { SystemAPI } from '../../api/client'

import InfoBox from './InfoBox'
import ProjectSelector from './ProjectSelector'
import ActionButtons from './ActionButtons'
import FileList from './FileList'

export default function Upload() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showHelp, setShowHelp] = useState(false)
  const hideTimer = useRef<number | null>(null)
  const TITLE_LEFT = 48
  const TITLE_TOP = 46

  const { selectedProject, setSelectedProject, projects, loadProjects } = useProjectManager()
  const { files, addFiles, removeFile, clearAll, updateFileStatus, updateFileProgress } = useFileManager()
  const { isUploading, setIsUploading, uploadSingleFile } = useFileUpload()

  const handleSelectFiles = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length > 0) {
      addFiles(selectedFiles)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDropFiles = (droppedFiles: File[]) => {
    addFiles(droppedFiles)
  }

  const handleClearAll = () => {
    clearAll()
  }

  const checkPermission = async (config: UploadConfig): Promise<boolean> => {
    try {
      const permissionRes = await fetch('/api/harbor/check-upload-permission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          harborUrl: config.harborUrl,
          username: config.username,
          password: config.password,
          project: config.project
        })
      })

      const permissionData = await permissionRes.json()

      if (!permissionData.success) {
        console.error(`❌ 权限检查失败: 用户 ${config.username} 无权限上传到项目 ${config.project}`)
        await SystemAPI.record(config.username, 'upload_permission_denied', { 
          project: config.project,
          message: permissionData.message 
        }, false)
        alert(permissionData.message || '您没有权限上传镜像到此项目')
        return false
      }
      
      console.log(`✅ 权限检查通过: 用户 ${config.username} 可以上传到项目 ${config.project}`)
      return true
    } catch (error) {
      console.error('权限校验失败:', error)
      await SystemAPI.record(config.username, 'upload_permission_check_error', { 
        project: config.project,
        error: error instanceof Error ? error.message : '未知错误'
      }, false)
      alert('权限校验失败，请稍后重试')
      return false
    }
  }

  const handleUploadSingle = async (index: number) => {
    if (!selectedProject) {
      alert('请先选择项目')
      return
    }

    const cfg = loadConfig()
    if (!cfg) {
      alert('请先在设置页面配置 Harbor 连接信息')
      return
    }

    const currentFile = files[index]
    if (!currentFile) {
      alert('文件不存在')
      return
    }

    const config: UploadConfig = {
      harborUrl: cfg.harborUrl,
      username: cfg.username,
      password: cfg.password,
      project: selectedProject
    }

    const hasPermission = await checkPermission(config)
    if (!hasPermission) return

    updateFileStatus(index, 'uploading', 0)

    console.log(`🚀 开始上传镜像: ${currentFile.file.name} 到项目 ${selectedProject}`)
    await SystemAPI.record(cfg.username, 'upload_start', { 
      filename: currentFile.file.name, 
      project: selectedProject,
      size: currentFile.file.size 
    }, true)

    try {
      await uploadSingleFile(
        currentFile,
        config,
        (progress) => updateFileProgress(index, progress),
        (status, errorMessage) => updateFileStatus(index, status, status === 'completed' ? 100 : undefined, errorMessage)
      )
      
      console.log(`✅ 镜像上传成功: ${currentFile.file.name}`)
      await SystemAPI.record(cfg.username, 'upload_success', { 
        filename: currentFile.file.name, 
        project: selectedProject 
      }, true)
    } catch (error: any) {
      console.error(`❌ 上传文件异常: ${currentFile.file.name}`, error)
      await SystemAPI.record(cfg.username, 'upload_failed', { 
        filename: currentFile.file.name, 
        project: selectedProject,
        error: error.message || '未知错误'
      }, false)
    }
  }

  const handleStartUpload = async () => {
    if (!selectedProject || files.length === 0) return

    const cfg = loadConfig()
    if (!cfg) {
      alert('请先在设置页面配置 Harbor 连接信息')
      return
    }

    const config: UploadConfig = {
      harborUrl: cfg.harborUrl,
      username: cfg.username,
      password: cfg.password,
      project: selectedProject
    }

    const hasPermission = await checkPermission(config)
    if (!hasPermission) return

    setIsUploading(true)

    const pendingFiles = files.filter(f => f.status !== 'completed' && f.status !== 'uploading' && f.file.size > 0)
    console.log(`🚀 开始批量上传 ${pendingFiles.length} 个镜像到项目 ${selectedProject}`)
    await SystemAPI.record(cfg.username, 'upload_batch_start', { 
      project: selectedProject,
      fileCount: pendingFiles.length,
      files: pendingFiles.map(f => f.file.name)
    }, true)

    let successCount = 0
    let failCount = 0

    const uploadPromises = files.map(async (currentFile, i) => {
      if (currentFile.status === 'completed') {
        console.log(`跳过已完成的文件: ${currentFile.file.name}`)
        return
      }

      if (currentFile.status === 'uploading') {
        console.log(`跳过正在上传的文件: ${currentFile.file.name}`)
        return
      }

      if (currentFile.file.size === 0 || (currentFile.file instanceof File && currentFile.file.size > 0 && currentFile.file.lastModified === 0)) { 
        console.log(`跳过占位文件（从持久化恢复）: ${currentFile.file.name}`)
        updateFileStatus(i, 'error', undefined, '文件已丢失，请重新添加')
        return
      }

      updateFileStatus(i, 'uploading', 0)

      console.log(`📤 上传镜像: ${currentFile.file.name}`)
      await SystemAPI.record(cfg.username, 'upload_start', { 
        filename: currentFile.file.name, 
        project: selectedProject,
        size: currentFile.file.size 
      }, true)

      try {
        await uploadSingleFile(
          currentFile,
          config,
          (progress) => updateFileProgress(i, progress),
          (status, errorMessage) => updateFileStatus(i, status, status === 'completed' ? 100 : undefined, errorMessage)
        )
        
        successCount++
        console.log(`✅ 镜像上传成功: ${currentFile.file.name}`)
        await SystemAPI.record(cfg.username, 'upload_success', { 
          filename: currentFile.file.name, 
          project: selectedProject 
        }, true)
      } catch (error: any) {
        failCount++
        console.error(`❌ 上传文件异常: ${currentFile.file.name}`, error)
        await SystemAPI.record(cfg.username, 'upload_failed', { 
          filename: currentFile.file.name, 
          project: selectedProject,
          error: error.message || '未知错误'
        }, false)
      }
    })

    await Promise.all(uploadPromises)

    console.log(`📊 批量上传完成: 成功 ${successCount} 个，失败 ${failCount} 个`)
    await SystemAPI.record(cfg.username, 'upload_batch_complete', { 
      project: selectedProject,
      successCount,
      failCount,
      totalCount: pendingFiles.length
    }, failCount === 0)

    setIsUploading(false)
  }

  const handleCancelUpload = () => {
    setIsUploading(false)
    files.forEach((item, index) => {
      if (item.status === 'uploading' && item.progress < 100) {
        updateFileStatus(index, 'pending', 0)
      }
    })
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', left: TITLE_LEFT, top: TITLE_TOP, zIndex: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>上传镜像</h2>
        <div
          onMouseEnter={() => { if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null } setShowHelp(true) }}
          onMouseLeave={() => { hideTimer.current = window.setTimeout(() => setShowHelp(false), 150) }}
          style={{ position: 'relative', marginTop: 3, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', background: 'transparent' }}
          aria-label="帮助"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ display: 'block' }}>
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9.5a2.5 2.5 0 1 1 4.9.8c0 1.7-2.4 1.7-2.4 3.2" />
            <circle cx="12" cy="16.5" r="0.75" />
          </svg>
          {showHelp && (
            <div
              onMouseEnter={() => { if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null } }}
              onMouseLeave={() => { hideTimer.current = window.setTimeout(() => setShowHelp(false), 150) }}
              style={{ position: 'absolute', top: '50%', left: 32, transform: 'translateY(-50%)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '10px 14px', boxShadow: '0 8px 20px rgba(0,0,0,0.08)', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'nowrap', zIndex: 4 }}
            >
              <span style={{ fontSize: 12 }}>上传镜像到指定 Harbor 项目</span>
              <div style={{ position: 'absolute', left: -6, top: '50%', transform: 'translateY(-50%) rotate(45deg)', width: 10, height: 10, background: 'var(--surface)', borderLeft: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}></div>
            </div>
          )}
        </div>
      </div>

      <div style={{
        margin: '100px 24px 24px 24px',
        borderRadius: '16px',
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <InfoBox remainingCount={10 - files.length} />
        
        <div style={{ marginBottom: '24px' }}>
          <ProjectSelector
            selectedProject={selectedProject}
            onProjectChange={setSelectedProject}
            projects={projects}
            onRefresh={loadProjects}
          />
          
          <ActionButtons
            selectedProject={selectedProject}
            files={files}
            isUploading={isUploading}
            onSelectFiles={handleSelectFiles}
            onStartUpload={handleStartUpload}
            onCancelUpload={handleCancelUpload}
            onClearAll={handleClearAll}
          />
        </div>

        <FileList
          files={files}
          onRemoveFile={removeFile}
          onDropFiles={handleDropFiles}
          onUploadSingle={handleUploadSingle}
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
