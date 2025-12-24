import { useState, useEffect } from 'react'
import { loadConfig } from '../../../store/config'
import { HarborAPI } from '../../../api/client'

const STORAGE_KEY = 'harbor_upload_project_state'

export const useProjectManager = () => {
  const [selectedProject, setSelectedProject] = useState('')
  const [projects, setProjects] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadProjects()
    loadSelectedProject()
  }, [])

  useEffect(() => {
    saveSelectedProject()
  }, [selectedProject])

  const saveSelectedProject = () => {
    try {
      const state = {
        selectedProject: selectedProject,
        timestamp: Date.now()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      if (selectedProject) {
        console.log(`💾 已保存选中的项目: ${selectedProject}`)
      }
    } catch (error) {
      console.error('保存项目选择失败:', error)
    }
  }

  const loadSelectedProject = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        console.log('📂 没有找到保存的项目选择')
        return
      }

      const state = JSON.parse(stored)
      const dayAgo = Date.now() - 24 * 60 * 60 * 1000

      if (state.timestamp && state.timestamp > dayAgo && state.selectedProject) {
        setSelectedProject(state.selectedProject)
        console.log(`📂 已恢复选中的项目: ${state.selectedProject}`)
      } else {
        console.log('📂 项目选择已过期，已清除')
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch (error) {
      console.error('加载项目选择失败:', error)
    }
  }

  const loadProjects = async () => {
    const cfg = loadConfig()
    if (!cfg) {
      console.warn('未找到 Harbor 配置，请先在设置页面配置')
      return
    }

    setLoading(true)
    try {
      console.log('正在加载项目列表...', cfg.harborUrl)
      const res = await HarborAPI.projects(cfg)
      console.log('项目列表响应:', res)
      if (res.projects && res.projects.length > 0) {
        const privateProjects = res.projects.filter(p => !p.public)
        const projectNames = privateProjects.map(p => p.name)
        console.log('解析到的私有项目名称:', projectNames)
        setProjects(projectNames)
      } else {
        console.warn('未找到任何项目')
        setProjects([])
      }
    } catch (error) {
      console.error('加载项目列表失败:', error)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  return {
    selectedProject,
    setSelectedProject,
    projects,
    loading,
    loadProjects
  }
}
