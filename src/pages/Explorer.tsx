import { useEffect, useMemo, useState } from 'react'
import { HarborAPI, DockerAPI, type Project, type Repository } from '../api/client'
import { loadConfig, type HarborConfig } from '../store/config'

export default function Explorer() {
  const [cfg, setCfg] = useState<HarborConfig | null>(loadConfig())
  const [projects, setProjects] = useState<Project[]>([])
  const [project, setProject] = useState('')
  const [repos, setRepos] = useState<Repository[]>([])
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [repo, setRepo] = useState('')
  const [tag, setTag] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState<{loaded: number, total?: number} | null>(null)
  
  useEffect(() => {
    const c = loadConfig(); setCfg(c)
    if (c) HarborAPI.projects(c).then(d=> setProjects(d.projects)).catch(()=>{})
  }, [])

  // 单配置，不提供切换

  const loadRepos = async (p: string) => {
    if (!cfg) return
    setProject(p); setRepo(''); setTag('')
    const d = await HarborAPI.repositories(cfg, p)
    setRepos(d.repositories || [])
  }

  const [tags, setTags] = useState<string[]>([])
  const [rowTags, setRowTags] = useState<Record<string, string[]>>({})

  const doDownload = async () => {
    if (!cfg) return
    const entries = Object.entries(selected)
    if (entries.length > 0) {
      for (const [name, t] of entries) {
        setDownloading(true); setProgress({ loaded: 0 })
        try {
          const blob = await DockerAPI.downloadStream(cfg, name, t, (l, to)=> setProgress({ loaded: l, total: to }))
          const filename = `${name.replace('/', '_')}_${t}.tar.gz`
          const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click(); URL.revokeObjectURL(a.href)
          SystemAPI.record(cfg.username, 'download', { image: name, tag: t }, true)
        } catch (e) {
          SystemAPI.record(cfg.username, 'download', { image: name, tag: t }, false)
        } finally { setDownloading(false); setProgress(null) }
      }
      return
    }
    if (!repo || !tag) return
    setDownloading(true); setProgress({ loaded: 0 })
    try {
      const blob = await DockerAPI.downloadStream(cfg, repo, tag, (l,t)=> setProgress({ loaded: l, total: t }))
      const filename = `${repo.replace('/', '_')}_${tag}.tar.gz`
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click(); URL.revokeObjectURL(a.href)
      SystemAPI.record(cfg.username, 'download', { image: repo, tag }, true)
    } catch (e) {
      SystemAPI.record(cfg.username, 'download', { image: repo, tag }, false)
    } finally { setDownloading(false); setProgress(null) }
  }

  const toggleSelect = (name: string, checked: boolean) => {
    if (!checked) {
      setSelected((s)=> { const n = { ...s }; delete n[name]; return n })
      return
    }
    setSelected((s)=> ({ ...s, [name]: 'latest' }))
    if (cfg && project) {
      HarborAPI.tags(cfg, project, name)
        .then(r => {
          const all = r.tags || []
          setRowTags((m)=> ({ ...m, [name]: all }))
          setSelected((s)=> ({ ...s, [name]: (all[0] || 'latest') }))
        })
        .catch(()=> {})
    }
  }

  const setRowTag = (name: string, t: string) => {
    setSelected((s)=> ({ ...s, [name]: t }))
  }

  

  useEffect(()=> {
    const fetchTags = async () => {
      if (!cfg || !project || !repo) { setTags([]); return }
      try {
        const r = await HarborAPI.tags(cfg, project, repo)
        const all = r.tags || []
        setTags(all)
        setTag((prev)=> prev || (all[0] || ''))
      } catch { setTags([]) }
    }
    fetchTags()
  }, [project, repo])

  useEffect(()=> {
    // 当更换项目或镜像时，重置选中行与行标签
    setRowTags({})
    setSelected((s)=> (repo ? { [repo]: s[repo] || (tags[0] || 'latest') } : {}))
    if (repo && cfg && project) {
      HarborAPI.tags(cfg, project, repo).then(r=> setRowTags((m)=> ({ ...m, [repo]: r.tags || [] }))).catch(()=>{})
    }
  }, [project, repo, tags])

  return (
    <div className="panel" style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 12 }}>镜像中心</h2>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, alignItems:'center' }}>
        <div>
          <label>项目</label>
          <select value={project} onChange={(e)=> loadRepos(e.target.value)}>
            <option value="">请选择项目</option>
            {projects.map(p=> <option key={p.name} value={p.name}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label>镜像名称</label>
          <select value={repo} onChange={(e)=> setRepo(e.target.value)}>
            <option value="">请选择镜像</option>
            {repos.map(r=> <option key={r.name} value={r.name}>{r.name}</option>)}
          </select>
        </div>
        <div>
          <label>标签</label>
          <select value={tag} onChange={(e)=> setTag(e.target.value)}>
            <option value="">请选择标签</option>
            {tags.map((t)=> <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      {project && repos.length===0 && (
        <div className="notice err">当前项目下未获取到镜像名称，请检查 Harbor 权限或网络</div>
      )}
      <div className="actions" style={{ marginTop: 20 }}>
        <button className="primary" onClick={doDownload} disabled={downloading || (!tag && Object.keys(selected).length===0)}>下载</button>
        {downloading && (
          <div style={{ marginLeft: 12, color: '#9aa6ff' }}>
            正在下载 {progress?.total ? `${(progress!.loaded/1024/1024).toFixed(1)}MB / ${(progress!.total/1024/1024).toFixed(1)}MB` : `${(progress!.loaded/1024/1024).toFixed(1)}MB`} ...
          </div>
        )}
      </div>
      <div style={{ marginTop: 16 }}>
        <table style={{ width: '100%' }}>
          <thead><tr><th></th><th style={{ textAlign:'left' }}>镜像名称</th><th>标签</th></tr></thead>
          <tbody>
            {repos.map(r=> (
              <tr key={r.name}>
                <td><input type="checkbox" checked={selected[r.name] !== undefined} onChange={(e)=> toggleSelect(r.name, e.target.checked)} /></td>
                <td>{r.name}</td>
                <td>
                  <select value={selected[r.name] || ((rowTags[r.name] || [])[0] || 'latest')} onChange={(e)=> setRowTag(r.name, e.target.value)}>
                    {(rowTags[r.name] || ['latest']).map(t=> <option key={t} value={t}>{t}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {repos.length===0 && <tr><td colSpan={3} style={{ textAlign:'center', color:'#888' }}>请选择项目以加载仓库</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
