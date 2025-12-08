import { useEffect, useState } from 'react'
import { HarborAPI, DockerAPI, type Project, type Repository } from '../api/client'
import { loadConfig, type HarborConfig } from '../store/config'
import { SystemAPI } from '../api/client'

type RepoWithTag = {
  repoName: string
  tag: string
}

export default function Explorer() {
  const [cfg] = useState<HarborConfig | null>(loadConfig())
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedRepos, setSelectedRepos] = useState<Map<string, string>>(new Map()) // repoName -> selectedTag
  const [repoTags, setRepoTags] = useState<Map<string, string[]>>(new Map()) // repoName -> tags[]
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState<{loaded: number, total?: number} | null>(null)
  const [expandedRepo, setExpandedRepo] = useState<string | null>(null) // 展开的镜像（显示版本列表）

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

  // 当选择项目时，加载该项目下的仓库
  useEffect(() => {
    if (!cfg || !selectedProject) return
    setLoading(true)
    setSelectedRepos(new Map())
    setRepoTags(new Map())
    setExpandedRepo(null)
    HarborAPI.repositories(cfg, selectedProject)
      .then(d => {
        setRepositories(d.repositories || [])
      })
      .catch(() => {
        setRepositories([])
      })
      .finally(() => setLoading(false))
  }, [cfg, selectedProject])

  // 搜索过滤
  const filteredRepos = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 加载某个仓库的标签列表
  const loadRepoTags = async (repoName: string) => {
    if (!cfg || !selectedProject) return
    if (repoTags.has(repoName)) return // 已加载过
    
    try {
      const result = await HarborAPI.tags(cfg, selectedProject, repoName)
      const tags = result.tags || ['latest']
      setRepoTags(prev => new Map(prev).set(repoName, tags))
    } catch {
      setRepoTags(prev => new Map(prev).set(repoName, ['latest']))
    }
  }

  // 切换仓库的选中状态
  const toggleSelectRepo = async (repoName: string, checked: boolean) => {
    if (!checked) {
      const newSelected = new Map(selectedRepos)
      newSelected.delete(repoName)
      setSelectedRepos(newSelected)
      return
    }

    // 加载标签
    await loadRepoTags(repoName)
    const tags = repoTags.get(repoName) || ['latest']
    const newSelected = new Map(selectedRepos)
    newSelected.set(repoName, tags[0] || 'latest')
    setSelectedRepos(newSelected)
  }

  // 修改某个仓库选择的标签
  const changeRepoTag = (repoName: string, tag: string) => {
    const newSelected = new Map(selectedRepos)
    newSelected.set(repoName, tag)
    setSelectedRepos(newSelected)
  }

  // 全选/取消全选
  const toggleSelectAll = async () => {
    if (selectedRepos.size === filteredRepos.length) {
      setSelectedRepos(new Map())
    } else {
      // 全选：为每个仓库加载标签并选择第一个标签
      const newSelected = new Map<string, string>()
      for (const repo of filteredRepos) {
        await loadRepoTags(repo.name)
        const tags = repoTags.get(repo.name) || ['latest']
        newSelected.set(repo.name, tags[0] || 'latest')
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

    setDownloading(true)
    let successCount = 0
    let failCount = 0

    for (const [repoName, tag] of selectedRepos) {
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
        successCount++
      } catch (e) {
        await SystemAPI.record(cfg.username, 'download', { image: repoName, tag }, false)
        failCount++
      }
    }
    
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

  // 展开/收起镜像版本列表
  const toggleExpandRepo = async (repoName: string) => {
    if (expandedRepo === repoName) {
      setExpandedRepo(null)
    } else {
      await loadRepoTags(repoName)
      setExpandedRepo(repoName)
    }
  }

  if (!cfg) {
    return (
      <div className="panel">
        <h2>镜像中心</h2>
        <div className="alert err">请先在"配置管理"页保存 Harbor 配置</div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(71, 85, 105, 0.3)',
      borderRadius: '16px',
      minHeight: '700px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    }}>
      {/* 头部标签栏 */}
      <div style={{
        borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
        padding: '20px 24px 0',
        background: 'rgba(30, 41, 59, 0.3)'
      }}>
        <div style={{ display: 'flex', gap: '32px', marginBottom: '-1px' }}>
          <button
            style={{
              background: 'none',
              border: 'none',
              borderBottom: '3px solid #3b82f6',
              color: '#3b82f6',
              padding: '12px 4px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'default'
            }}
          >
            我的镜像
          </button>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 左侧项目列表 */}
        <div style={{
          width: '240px',
          borderRight: '1px solid rgba(71, 85, 105, 0.3)',
          padding: '16px 0',
          overflowY: 'auto',
          background: 'rgba(15, 23, 42, 0.5)'
        }}>
          <div style={{
            padding: '0 16px 12px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            项目名称
          </div>
          
          {loading && projects.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
              加载中...
            </div>
          ) : projects.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
              暂无项目
            </div>
          ) : (
            projects.map(project => (
              <div
                key={project.name}
                onClick={() => setSelectedProject(project.name)}
                style={{
                  padding: '10px 16px',
                  cursor: 'pointer',
                  background: selectedProject === project.name 
                    ? 'rgba(59, 130, 246, 0.15)' 
                    : 'transparent',
                  borderLeft: selectedProject === project.name 
                    ? '3px solid #3b82f6' 
                    : '3px solid transparent',
                  transition: 'all 0.2s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => {
                  if (selectedProject !== project.name) {
                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedProject !== project.name) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flex: 1,
                  minWidth: 0
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  </svg>
                  <span style={{
                    fontSize: '13px',
                    color: selectedProject === project.name ? '#f1f5f9' : '#cbd5e1',
                    fontWeight: selectedProject === project.name ? 600 : 400,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {project.name}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 右侧镜像列表 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* 搜索和操作栏 */}
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            background: 'rgba(30, 41, 59, 0.2)'
          }}>
            <div style={{ flex: 1, position: 'relative', maxWidth: '400px' }}>
              <input
                type="text"
                placeholder="请输入镜像名称"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 40px',
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                  fontSize: '14px'
                }}
              />
              <svg 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#94a3b8" 
                strokeWidth="2"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </div>
            
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>
              已选择 <span style={{ color: '#3b82f6', fontWeight: 600 }}>{selectedRepos.size}</span> 个镜像
            </div>

            <button
              onClick={handleBatchDownload}
              disabled={selectedRepos.size === 0 || downloading}
              style={{
                padding: '10px 20px',
                background: selectedRepos.size > 0 
                  ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' 
                  : 'rgba(51, 65, 85, 0.3)',
                border: 'none',
                borderRadius: '8px',
                color: selectedRepos.size > 0 ? 'white' : '#64748b',
                fontSize: '14px',
                fontWeight: 600,
                cursor: selectedRepos.size > 0 && !downloading ? 'pointer' : 'not-allowed',
                opacity: downloading ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              批量下载
            </button>
          </div>

          {/* 进度显示 */}
          {downloading && progress && (
            <div style={{
              padding: '12px 24px',
              background: 'rgba(59, 130, 246, 0.1)',
              borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#93c5fd'
            }}>
              <div className="spinner" style={{ width: '16px', height: '16px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"></path>
                </svg>
              </div>
              <span style={{ fontSize: '14px' }}>
                正在下载... {progress.total 
                  ? `${(progress.loaded/1024/1024).toFixed(1)}MB / ${(progress.total/1024/1024).toFixed(1)}MB`
                  : `${(progress.loaded/1024/1024).toFixed(1)}MB`
                }
              </span>
            </div>
          )}

          {/* 镜像表格 */}
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
            {!selectedProject ? (
              <div style={{
                padding: '60px 24px',
                textAlign: 'center',
                color: '#64748b'
              }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 16px', opacity: 0.3 }}>
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <div style={{ fontSize: '16px' }}>请从左侧选择一个项目</div>
              </div>
            ) : loading ? (
              <div style={{
                padding: '60px 24px',
                textAlign: 'center',
                color: '#64748b'
              }}>
                <div className="spinner" style={{ width: '48px', height: '48px', margin: '0 auto 16px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"></path>
                  </svg>
                </div>
                <div style={{ fontSize: '16px' }}>加载中...</div>
              </div>
            ) : filteredRepos.length === 0 ? (
              <div style={{
                padding: '60px 24px',
                textAlign: 'center',
                color: '#64748b'
              }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 16px', opacity: 0.3 }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <div style={{ fontSize: '16px' }}>
                  {searchQuery ? '未找到匹配的镜像' : '该项目下暂无镜像'}
                </div>
              </div>
            ) : (
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: '1000px'
              }}>
                <thead style={{
                  position: 'sticky',
                  top: 0,
                  background: 'rgba(30, 41, 59, 0.95)',
                  backdropFilter: 'blur(10px)',
                  zIndex: 1
                }}>
                  <tr>
                    <th style={{
                      padding: '14px 20px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      width: '40px'
                    }}>
                      <input
                        type="checkbox"
                        checked={selectedRepos.size === filteredRepos.length && filteredRepos.length > 0}
                        onChange={toggleSelectAll}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                    </th>
                    <th style={{
                      padding: '14px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      minWidth: '300px'
                    }}>
                      镜像名称
                    </th>
                    <th style={{
                      padding: '14px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      width: '200px'
                    }}>
                      镜像版本
                    </th>
                    <th style={{
                      padding: '14px 16px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      width: '100px'
                    }}>
                      类型
                    </th>
                    <th style={{
                      padding: '14px 16px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      width: '100px'
                    }}>
                      版本数量
                    </th>
                    <th style={{
                      padding: '14px 16px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      width: '120px'
                    }}>
                      下载次数
                    </th>
                    <th style={{
                      padding: '14px 20px 14px 16px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      width: '140px'
                    }}>
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRepos.map((repo, index) => {
                    const isSelected = selectedRepos.has(repo.name)
                    const selectedTag = selectedRepos.get(repo.name) || 'latest'
                    const tags = repoTags.get(repo.name) || []
                    const isExpanded = expandedRepo === repo.name

                    return (
                      <tr
                        key={repo.name}
                        style={{
                          borderTop: index === 0 ? 'none' : '1px solid rgba(71, 85, 105, 0.3)',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(30, 41, 59, 0.3)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                        }}
                      >
                        <td style={{
                          padding: '14px 20px',
                          fontSize: '14px',
                          color: '#cbd5e1'
                        }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => toggleSelectRepo(repo.name, e.target.checked)}
                            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                          />
                        </td>
                        <td style={{
                          padding: '14px 16px',
                          fontSize: '14px',
                          color: '#cbd5e1'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                              <rect x="3" y="3" width="7" height="7"></rect>
                              <rect x="14" y="3" width="7" height="7"></rect>
                              <rect x="14" y="14" width="7" height="7"></rect>
                              <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                            <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{repo.name}</span>
                          </div>
                        </td>
                        <td style={{
                          padding: '14px 16px',
                          fontSize: '14px',
                          color: '#cbd5e1'
                        }}>
                          {isSelected && tags.length > 0 ? (
                            <select
                              value={selectedTag}
                              onChange={(e) => changeRepoTag(repo.name, e.target.value)}
                              style={{
                                width: '100%',
                                padding: '6px 10px',
                                background: 'rgba(30, 41, 59, 0.5)',
                                border: '1px solid rgba(71, 85, 105, 0.3)',
                                borderRadius: '6px',
                                color: '#f1f5f9',
                                fontSize: '13px',
                                cursor: 'pointer'
                              }}
                            >
                              {tags.map(tag => (
                                <option key={tag} value={tag}>{tag}</option>
                              ))}
                            </select>
                          ) : (
                            <button
                              onClick={() => toggleExpandRepo(repo.name)}
                              style={{
                                padding: '6px 12px',
                                background: 'rgba(59, 130, 246, 0.1)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: '6px',
                                color: '#93c5fd',
                                fontSize: '13px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s'
                              }}
                            >
                              查看版本
                              <svg 
                                width="14" 
                                height="14" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2"
                                style={{
                                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                  transition: 'transform 0.2s'
                                }}
                              >
                                <polyline points="6 9 12 15 18 9"></polyline>
                              </svg>
                            </button>
                          )}
                        </td>
                        <td style={{
                          padding: '14px 16px',
                          fontSize: '14px',
                          color: '#cbd5e1',
                          textAlign: 'center'
                        }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 500,
                            background: projects.find(p => p.name === selectedProject)?.public
                              ? 'rgba(16, 185, 129, 0.15)'
                              : 'rgba(239, 68, 68, 0.15)',
                            color: projects.find(p => p.name === selectedProject)?.public
                              ? '#6ee7b7'
                              : '#fca5a5'
                          }}>
                            {projects.find(p => p.name === selectedProject)?.public ? '公开' : '私有'}
                          </span>
                        </td>
                        <td style={{
                          padding: '14px 16px',
                          fontSize: '14px',
                          color: '#cbd5e1',
                          textAlign: 'center'
                        }}>
                          {repo.artifact_count || repo.tags?.length || 0}
                        </td>
                        <td style={{
                          padding: '14px 16px',
                          fontSize: '14px',
                          color: '#cbd5e1',
                          textAlign: 'center'
                        }}>
                          {repo.pull_count || 0}
                        </td>
                        <td style={{
                          padding: '14px 20px 14px 16px',
                          fontSize: '14px',
                          color: '#cbd5e1',
                          textAlign: 'center'
                        }}>
                          <button
                            onClick={() => handleSingleDownload(repo.name, selectedTag)}
                            disabled={downloading}
                            style={{
                              padding: '6px 16px',
                              background: 'rgba(59, 130, 246, 0.15)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              borderRadius: '6px',
                              color: '#93c5fd',
                              fontSize: '13px',
                              fontWeight: 500,
                              cursor: downloading ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s',
                              opacity: downloading ? 0.5 : 1
                            }}
                            onMouseEnter={(e) => {
                              if (!downloading) {
                                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.25)'
                                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!downloading) {
                                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)'
                                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)'
                              }
                            }}
                          >
                            下载
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
