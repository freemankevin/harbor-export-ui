import { useState, useEffect } from 'react'
import { HarborAPI, DockerAPI, SystemAPI, type Project, type Repository } from '../../api/client'
import { loadConfig, type HarborConfig } from '../../store/config'

export function useExplorerState() {
  const [cfg] = useState<HarborConfig | null>(loadConfig())
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedRepos, setSelectedRepos] = useState<Map<string, string>>(new Map())
  const [repoTags, setRepoTags] = useState<Map<string, string[]>>(new Map())
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState<{loaded: number, total?: number} | null>(null)

  const [loadingTags, setLoadingTags] = useState<Set<string>>(new Set())

  // 加载项目列表
  useEffect(() => {
    if (!cfg) return
    setLoading(true)
    HarborAPI.projects(cfg)
      .then(d => {
        const projectList = d.projects || []
        setProjects(projectList)
        if (projectList.length > 0 && !selectedProject) {
          setSelectedProject(projectList[0].name)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [cfg])

  // 加载仓库列表
  useEffect(() => {
    if (!cfg || !selectedProject) return
    setLoading(true)
    setSelectedRepos(new Map())
    setRepoTags(new Map())

    HarborAPI.repositories(cfg, selectedProject)
      .then(d => setRepositories(d.repositories || []))
      .catch(() => setRepositories([]))
      .finally(() => setLoading(false))
  }, [cfg, selectedProject])

  // 加载仓库标签（返回标签数组，避免异步状态读取不一致）
  const loadRepoTags = async (repoName: string): Promise<string[]> => {
    if (!cfg || !selectedProject) return []
    if (repoTags.has(repoName)) return repoTags.get(repoName) || []
    try {
      setLoadingTags(prev => new Set(prev).add(repoName))
      const result = await HarborAPI.tags(cfg, selectedProject, repoName)
      const tags = result.tags || []
      setRepoTags(prev => new Map(prev).set(repoName, tags))
      return tags
    } catch {
      setRepoTags(prev => new Map(prev).set(repoName, []))
      return []
    } finally {
      setLoadingTags(prev => { const s = new Set(prev); s.delete(repoName); return s })
    }
  }

  const pickDefaultTag = (tags: string[]) => {
    if (!tags || tags.length === 0) return ''
    return tags.includes('latest') ? 'latest' : tags[0]
  }

  // 切换仓库选中状态
  const toggleSelectRepo = async (repoName: string, checked: boolean) => {
    if (!checked) {
      const newSelected = new Map(selectedRepos)
      newSelected.delete(repoName)
      setSelectedRepos(newSelected)
      return
    }

    const tags = await loadRepoTags(repoName)
    const newSelected = new Map(selectedRepos)
    newSelected.set(repoName, pickDefaultTag(tags))
    setSelectedRepos(newSelected)
  }

  // 修改仓库标签
  const changeRepoTag = (repoName: string, tag: string) => {
    const newSelected = new Map(selectedRepos)
    newSelected.set(repoName, tag)
    setSelectedRepos(newSelected)
  }

  // 全选/取消全选
  const toggleSelectAll = async (filteredRepos: Repository[]) => {
    if (selectedRepos.size === filteredRepos.length) {
      setSelectedRepos(new Map())
    } else {
      const newSelected = new Map<string, string>()
      for (const repo of filteredRepos) {
        const tags = await loadRepoTags(repo.name)
        newSelected.set(repo.name, pickDefaultTag(tags))
      }
      setSelectedRepos(newSelected)
    }
  }

  // 批量下载
  const handleBatchDownload = async () => {
    if (!cfg || selectedRepos.size === 0) {
      alert('请先选择要下载的镜像')
      return
    }

    for (const [repoName, tag] of selectedRepos) {
      if (!tag) {
        alert(`请为镜像 ${repoName} 选择标签后再下载`)
        return
      }
    }

    await SystemAPI.record(
      cfg.username,
      'download_prepare',
      Array.from(selectedRepos.entries()).map(([image, tag]) => ({ image, tag })),
      true
    )

    setDownloading(true)
    let successCount = 0
    let failCount = 0

    const downloadOne = async (repoName: string, tag: string) => {
      setProgress({ loaded: 0 })
      const blob = await DockerAPI.downloadStream(
        cfg, 
        repoName, 
        tag, 
        (loaded, total) => setProgress({ loaded, total })
      )
      const filename = `${repoName.replace(/\//g, '_')}_${tag}.tar.gz`
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename
      a.click()
      URL.revokeObjectURL(a.href)
      await SystemAPI.record(cfg.username, 'download', { image: repoName, tag }, true)
    }

    const tasks = Array.from(selectedRepos.entries()).map(([repoName, tag]) =>
      downloadOne(repoName, tag).then(() => { successCount++ }).catch(async () => {
        await SystemAPI.record(cfg.username, 'download', { image: repoName, tag }, false)
        failCount++
      })
    )
    await Promise.allSettled(tasks)
    
    setDownloading(false)
    setProgress(null)
    alert(`下载完成！成功: ${successCount}，失败: ${failCount}`)
    setSelectedRepos(new Map())
  }

  // 单个下载
  const handleSingleDownload = async (repoName: string, tag: string) => {
    if (!cfg) return
    
    setDownloading(true)
    try {
      setProgress({ loaded: 0 })
      const blob = await DockerAPI.downloadStream(
        cfg, 
        repoName, 
        tag, 
        (loaded, total) => setProgress({ loaded, total })
      )
      
      const filename = `${repoName.replace(/\//g, '_')}_${tag}.tar.gz`
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename
      a.click()
      URL.revokeObjectURL(a.href)
      
      await SystemAPI.record(cfg.username, 'download', { image: repoName, tag }, true)
      alert('下载成功！')
    } catch (e) {
      await SystemAPI.record(cfg.username, 'download', { image: repoName, tag }, false)
      alert('下载失败！')
    } finally {
      setDownloading(false)
      setProgress(null)
    }
  }



  // 搜索过滤
  const filteredRepos = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return {
    cfg,
    projects,
    selectedProject,
    setSelectedProject,
    repositories,
    searchQuery,
    setSearchQuery,
    loading,
    selectedRepos,
    repoTags,
    downloading,
    progress,
    filteredRepos,
    loadingTags,
    loadRepoTags,
    toggleSelectRepo,
    changeRepoTag,
    toggleSelectAll,
    handleBatchDownload,
    handleSingleDownload
  }
}
