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

const formatErrorMessage = (technicalError: string): string => {
  const errorLower = technicalError.toLowerCase()
  
  if (errorLower.includes('already exists') || errorLower.includes('blob already exists')) {
    return '镜像已存在于 Harbor'
  }
  
  if (errorLower.includes('corrupted') || errorLower.includes('invalid deflate') || errorLower.includes('invalid block type')) {
    return '镜像文件已损坏或格式不正确，请检查文件完整性'
  }
  
  if (errorLower.includes('unpigz') || errorLower.includes('gunzip')) {
    return '镜像文件解压失败，可能文件已损坏'
  }
  
  if (errorLower.includes('unauthorized') || errorLower.includes('401')) {
    return '认证失败，请检查 Harbor 用户名和密码'
  }
  
  if (errorLower.includes('forbidden') || errorLower.includes('403')) {
    return '权限不足，您没有上传镜像到此项目的权限'
  }
  
  if (errorLower.includes('not found') || errorLower.includes('404')) {
    return '项目不存在或 Harbor 地址配置错误'
  }
  
  if (errorLower.includes('timeout') || errorLower.includes('timed out')) {
    return '上传超时，请检查网络连接或稍后重试'
  }
  
  if (errorLower.includes('network') || errorLower.includes('connection')) {
    return '网络连接失败，请检查网络设置'
  }
  
  if (errorLower.includes('disk') || errorLower.includes('space')) {
    return '磁盘空间不足，请清理服务器磁盘空间'
  }
  
  if (errorLower.includes('manifest') || errorLower.includes('invalid image')) {
    return '镜像格式不正确，请确保文件是有效的 Docker 镜像'
  }
  
  if (technicalError.length > 100) {
    return '上传失败，请联系管理员查看详细日志'
  }
  
  return technicalError
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
          if (percentComplete % 20 === 0 && percentComplete > 0 && percentComplete < 100) {
            console.log(`📊 上传进度: ${file.file.name} - ${percentComplete}%`)
          }
        }
      })

      xhr.upload.addEventListener('loadend', () => {
        onProgress(100)
        console.log(`📦 文件上传完成，后端正在处理镜像: ${file.file.name}`)
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText)
            if (response.success) {
              const hasAlreadyExists = response.data?.uploaded_images?.some((img: any) => img.already_exists)
              
              onStatusChange('completed')
              onProgress(100)
              
              if (hasAlreadyExists) {
                console.log(`✅ 文件上传成功（镜像已存在）: ${file.file.name}`)
                console.log(`📝 镜像已存在于 Harbor，所有层均已跳过`)
              } else {
                console.log(`✅ 文件上传成功: ${file.file.name}`)
                console.log(`📝 上传详情: 文件大小 ${(file.file.size / 1024 / 1024).toFixed(2)}MB`)
              }
              resolve()
            } else {
              const technicalError = response.message || response.details || '上传失败'
              const userFriendlyError = formatErrorMessage(technicalError)
              onStatusChange('error', userFriendlyError)
              console.error(`❌ 文件上传失败: ${file.file.name}`)
              console.error(`📝 错误详情: ${technicalError}`)
              console.error(`📝 用户提示: ${userFriendlyError}`)
              alert(`镜像上传失败\n\n文件: ${file.file.name}\n错误: ${userFriendlyError}`)
              reject(new Error(userFriendlyError))
            }
          } catch (parseError) {
            const errorMsg = '服务器响应格式错误'
            onStatusChange('error', errorMsg)
            console.error(`❌ 解析响应失败: ${file.file.name}`)
            console.error(`📝 解析错误:`, parseError)
            console.error(`📝 原始响应:`, xhr.responseText)
            alert(`镜像上传失败\n\n文件: ${file.file.name}\n错误: ${errorMsg}`)
            reject(new Error(errorMsg))
          }
        } else {
          let technicalError = `HTTP ${xhr.status}`
          try {
            const response = JSON.parse(xhr.responseText)
            technicalError = response.message || response.details || technicalError
          } catch (e) {
            technicalError = xhr.responseText || technicalError
          }
          const userFriendlyError = formatErrorMessage(technicalError)
          onStatusChange('error', userFriendlyError)
          console.error(`❌ 文件上传失败: ${file.file.name}`)
          console.error(`📝 HTTP 状态码: ${xhr.status}`)
          console.error(`📝 错误详情: ${technicalError}`)
          console.error(`📝 用户提示: ${userFriendlyError}`)
          alert(`镜像上传失败\n\n文件: ${file.file.name}\n错误: ${userFriendlyError}`)
          reject(new Error(userFriendlyError))
        }
      })

      xhr.addEventListener('error', () => {
        const errorMsg = '网络错误，上传失败'
        onStatusChange('error', errorMsg)
        console.error(`❌ 网络错误: ${file.file.name}`)
        console.error(`📝 可能原因: 网络连接中断、服务器无响应或防火墙阻止`)
        alert(`镜像上传失败\n\n文件: ${file.file.name}\n错误: ${errorMsg}`)
        reject(new Error(errorMsg))
      })

      xhr.addEventListener('timeout', () => {
        const errorMsg = '上传超时，请检查网络连接'
        onStatusChange('error', errorMsg)
        console.error(`❌ 上传超时: ${file.file.name}`)
        console.error(`📝 超时时间: 30分钟`)
        console.error(`📝 文件大小: ${(file.file.size / 1024 / 1024).toFixed(2)}MB`)
        alert(`镜像上传失败\n\n文件: ${file.file.name}\n错误: ${errorMsg}`)
        reject(new Error(errorMsg))
      })

      console.log(`🔄 开始上传请求: ${file.file.name}`)
      console.log(`📝 文件大小: ${(file.file.size / 1024 / 1024).toFixed(2)}MB`)
      console.log(`📝 目标项目: ${config.project}`)
      console.log(`📝 Harbor 地址: ${config.harborUrl}`)
      
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
