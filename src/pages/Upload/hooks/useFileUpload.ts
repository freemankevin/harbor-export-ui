import { useState } from 'react'

export interface FileItem {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  errorMessage?: string
}

export interface UploadConfig {
  harborUrl: string
  username: string
  password: string
  project: string
}

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false)

  const uploadSingleFile = async (
    file: FileItem,
    config: UploadConfig,
    onProgress: (progress: number) => void,
    onStatusChange: (status: FileItem['status'], errorMessage?: string) => void
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append('file', file.file)
      formData.append('harborUrl', config.harborUrl)
      formData.append('username', config.username)
      formData.append('password', config.password)
      formData.append('project', config.project)

      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100)
          onProgress(percentComplete)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText)
            if (response.success) {
              onStatusChange('completed')
              onProgress(100)
              console.log(`✅ 文件上传成功: ${file.file.name}`)
              resolve()
            } else {
              const errorMsg = response.message || response.details || '上传失败'
              onStatusChange('error', errorMsg)
              console.error(`❌ 文件上传失败: ${file.file.name}`, errorMsg)
              alert(`镜像上传失败\n\n文件: ${file.file.name}\n错误: ${errorMsg}`)
              reject(new Error(errorMsg))
            }
          } catch (parseError) {
            const errorMsg = '服务器响应格式错误'
            onStatusChange('error', errorMsg)
            console.error(`❌ 解析响应失败: ${file.file.name}`, parseError)
            alert(`镜像上传失败\n\n文件: ${file.file.name}\n错误: ${errorMsg}`)
            reject(new Error(errorMsg))
          }
        } else {
          let errorMsg = `HTTP ${xhr.status}`
          try {
            const response = JSON.parse(xhr.responseText)
            errorMsg = response.message || response.details || errorMsg
          } catch (e) {
            errorMsg = xhr.responseText || errorMsg
          }
          onStatusChange('error', errorMsg)
          console.error(`❌ 文件上传失败: ${file.file.name}`, errorMsg)
          alert(`镜像上传失败\n\n文件: ${file.file.name}\n错误: ${errorMsg}`)
          reject(new Error(errorMsg))
        }
      })

      xhr.addEventListener('error', () => {
        const errorMsg = '网络错误，上传失败'
        onStatusChange('error', errorMsg)
        console.error(`❌ 网络错误: ${file.file.name}`)
        alert(`镜像上传失败\n\n文件: ${file.file.name}\n错误: ${errorMsg}`)
        reject(new Error(errorMsg))
      })

      xhr.addEventListener('timeout', () => {
        const errorMsg = '上传超时，请检查网络连接'
        onStatusChange('error', errorMsg)
        console.error(`❌ 上传超时: ${file.file.name}`)
        alert(`镜像上传失败\n\n文件: ${file.file.name}\n错误: ${errorMsg}`)
        reject(new Error(errorMsg))
      })

      xhr.open('POST', '/api/docker/upload')
      xhr.timeout = 30 * 60 * 1000
      xhr.send(formData)
    })
  }

  return {
    isUploading,
    setIsUploading,
    uploadSingleFile
  }
}
