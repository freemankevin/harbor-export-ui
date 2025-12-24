import { useState, useEffect } from 'react'
import type { FileItem } from './useFileUpload'

const MAX_UPLOAD_COUNT = 10
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024
const STORAGE_KEY = 'harbor_upload_state'

interface StoredFileItem {
  fileName: string
  fileSize: number
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  errorMessage?: string
}

export const useFileManager = () => {
  const [files, setFiles] = useState<FileItem[]>([])

  useEffect(() => {
    loadUploadState()
  }, [])

  useEffect(() => {
    saveUploadState()
  }, [files])

  const saveUploadState = () => {
    try {
      const storedFiles: StoredFileItem[] = files.map(f => ({
        fileName: f.file.name,
        fileSize: f.file.size,
        progress: f.progress,
        status: f.status,
        errorMessage: f.errorMessage
      }))

      const state = {
        files: storedFiles,
        timestamp: Date.now()
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      console.log('保存上传状态:', state)
    } catch (error) {
      console.error('保存上传状态失败:', error)
    }
  }

  const loadUploadState = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        console.log('没有找到保存的上传状态')
        return
      }

      const state = JSON.parse(stored)
      console.log('加载上传状态:', state)

      const dayAgo = Date.now() - 24 * 60 * 60 * 1000

      if (state.timestamp && state.timestamp > dayAgo) {
        if (state.files && state.files.length > 0) {
          const restoredFiles: FileItem[] = state.files.map((sf: StoredFileItem) => {
            const blob = new Blob([], { type: 'application/x-tar' })
            Object.defineProperty(blob, 'size', {
              value: sf.fileSize,
              writable: false
            })
            const file = new File([blob], sf.fileName, { type: 'application/x-tar' })
            Object.defineProperty(file, 'size', {
              value: sf.fileSize,
              writable: false
            })
            return {
              file,
              progress: sf.progress,
              status: sf.status,
              errorMessage: sf.errorMessage
            }
          })
          setFiles(restoredFiles)
          console.log('恢复文件列表:', restoredFiles.length, '个文件')
        }
      } else {
        console.log('上传状态已过期，清除数据')
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch (error) {
      console.error('加载上传状态失败:', error)
    }
  }

  const addFiles = (droppedFiles: File[]): boolean => {
    const validFiles = droppedFiles.filter(file =>
      file.name.endsWith('.tar') || file.name.endsWith('.tar.gz')
    )

    if (validFiles.length === 0) {
      alert('请选择 .tar 或 .tar.gz 格式的镜像文件')
      return false
    }

    const oversizedFiles = validFiles.filter(file => file.size > MAX_FILE_SIZE)
    if (oversizedFiles.length > 0) {
      const fileList = oversizedFiles.map(f =>
        `  • ${f.name} (${(f.size / 1024 / 1024 / 1024).toFixed(2)} GB)`
      ).join('\n')
      alert(`以下文件超过 2GB 大小限制，无法上传：\n\n${fileList}\n\n请选择小于 2GB 的镜像文件。`)
      return false
    }

    const remainingSlots = MAX_UPLOAD_COUNT - files.length
    if (remainingSlots === 0) {
      alert(`已达到上传额度上限（${MAX_UPLOAD_COUNT}个文件）\n\n请先点击"一键清空"按钮清除已有记录，\n然后再添加新的镜像文件。`)
      return false
    }

    if (validFiles.length > remainingSlots) {
      alert(`最多只能上传 ${MAX_UPLOAD_COUNT} 个文件\n当前还可以添加 ${remainingSlots} 个\n您选择了 ${validFiles.length} 个文件`)
      return false
    }

    const duplicateFiles: string[] = []
    const newValidFiles: File[] = []

    validFiles.forEach(file => {
      const isDuplicate = files.some(existingFile => existingFile.file.name === file.name)
      if (isDuplicate) {
        duplicateFiles.push(file.name)
      } else {
        newValidFiles.push(file)
      }
    })

    if (duplicateFiles.length > 0) {
      const fileList = duplicateFiles.map(name => `  • ${name}`).join('\n')
      alert(`检测到重复的文件名：\n\n${fileList}\n\n如需重新上传，请先删除列表中的同名记录。`)
      return false
    }

    const newFiles: FileItem[] = newValidFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }))

    setFiles(prev => [...prev, ...newFiles])
    return true
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const clearAll = () => {
    if (window.confirm('确定要清空所有文件记录吗？')) {
      setFiles([])
      localStorage.removeItem(STORAGE_KEY)
      console.log('已清空所有文件记录')
    }
  }

  const updateFileStatus = (index: number, status: FileItem['status'], progress?: number, errorMessage?: string) => {
    setFiles(prev => prev.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          status,
          progress: progress !== undefined ? progress : item.progress,
          errorMessage
        }
      }
      return item
    }))
  }

  const updateFileProgress = (index: number, progress: number) => {
    setFiles(prev => prev.map((item, i) =>
      i === index ? { ...item, progress } : item
    ))
  }

  return {
    files,
    addFiles,
    removeFile,
    clearAll,
    updateFileStatus,
    updateFileProgress,
    maxUploadCount: MAX_UPLOAD_COUNT
  }
}
