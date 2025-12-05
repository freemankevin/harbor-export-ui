import { useEffect, useMemo, useState } from 'react'
import { HarborAPI, DockerAPI, type Project, type Repository } from '../api/client'
import { getActiveConfig, loadConfigs, setActiveConfig, type HarborConfig } from '../store/config'
import { SystemAPI } from '../api/client'

export default function Explorer() {
  const [configs, setConfigs] = useState<HarborConfig[]>(loadConfigs())
  const [active, setActive] = useState<HarborConfig | null>(getActiveConfig())
  const [projects, setProjects] = useState<Project[]>([])
  const [project, setProject] = useState('')
  const [repos, setRepos] = useState<Repository[]>([])
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [repo, setRepo] = useState('')
  const [tag, setTag] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState<{loaded: number, total?: number} | null>(null)

  useEffect(() => {
    const ac = getActiveConfig(); setActive(ac)
    if (ac) HarborAPI.projects(ac).then(d=> setProjects(d.projects)).catch(()=>{})
  }, [])

  const onSwitchConfig = (id: string) => {
    setActive(configs.find(c=> c.id===id) || null)
    setActiveConfig(id)
    setProjects([]); setRepos([]); setProject(''); setRepo(''); setTag('')
    const ac = configs.find(c=> c.id===id)
    if (ac) HarborAPI.projects(ac).then(d=> setProjects(d.projects)).catch(()=>{})
  }

  const loadRepos = async (p: string) => {
    if (!active) return
    setProject(p); setRepo(''); setTag('')
    const d = await HarborAPI.repositories(active, p)
    setRepos(d.repositories)
  }

  const tags = useMemo(()=> repos.find(r=> r.name===repo)?.tags || [], [repos, repo])

  const doDownload = async () => {
    if (!active || !repo || !tag) return
    setDownloading(true); setProgress({ loaded: 0 })
    try {
      const blob = await DockerAPI.downloadStream(active, repo, tag, (l,t)=> setProgress({ loaded: l, total: t }))
      const filename = `${repo.replace('/', '_')}_${tag}.tar.gz`
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click(); URL.revokeObjectURL(a.href)
      SystemAPI.record(active.operator, 'download', { image: repo, tag }, true)
    } catch (e) {
      SystemAPI.record(active?.operator, 'download', { image: repo, tag }, false)
    } finally { setDownloading(false); setProgress(null) }
  }

  const toggleSelect = (name: string, checked: boolean) => {
    setSelected((s) => {
      const next = { ...s }
      if (!checked) delete next[name]
      else next[name] = repos.find(r=> r.name===name)?.tags?.[0] || 'latest'
      return next
    })
  }

  const setRowTag = (name: string, t: string) => {
    setSelected((s)=> ({ ...s, [name]: t }))
  }

  const downloadSelected = async () => {
    if (!active) return
    for (const [name, t] of Object.entries(selected)) {
      setDownloading(true); setProgress({ loaded: 0 })
      try {
        const blob = await DockerAPI.downloadStream(active, name, t, (l, to)=> setProgress({ loaded: l, total: to }))
        const filename = `${name.replace('/', '_')}_${t}.tar.gz`
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click(); URL.revokeObjectURL(a.href)
        SystemAPI.record(active.operator, 'download', { image: name, tag: t }, true)
      } catch (e) {
        SystemAPI.record(active?.operator, 'download', { image: name, tag: t }, false)
      } finally { setDownloading(false); setProgress(null) }
    }
  }

  return (
    <div className="panel" style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 12 }}>镜像中心</h2>
      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr 1.6fr 1fr', gap:16, alignItems:'center' }}>
        <div>
          <label>Harbor 配置</label>
          <select value={active?.id || ''} onChange={(e)=> onSwitchConfig(e.target.value)}>
            {configs.map(c=> <option key={c.id} value={c.id}>{c.harborUrl} ({c.username})</option>)}
          </select>
        </div>
        <div>
          <label>项目</label>
          <select value={project} onChange={(e)=> loadRepos(e.target.value)}>
            <option value="">请选择项目</option>
            {projects.map(p=> <option key={p.name} value={p.name}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label>仓库</label>
          <select value={repo} onChange={(e)=> setRepo(e.target.value)}>
            <option value="">请选择仓库</option>
            {repos.map(r=> <option key={r.name} value={r.name}>{r.name}</option>)}
          </select>
        </div>
        <div>
          <label>标签</label>
          <select value={tag} onChange={(e)=> setTag(e.target.value)}>
            <option value="">请选择标签</option>
            {tags.map((t: string)=> <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="actions" style={{ marginTop: 20 }}>
        <button className="primary" onClick={doDownload} disabled={downloading || !tag}>下载</button>
        <button onClick={downloadSelected} disabled={downloading || Object.keys(selected).length===0} style={{ marginLeft: 8 }}>下载选中</button>
        {downloading && (
          <div style={{ marginLeft: 12, color: '#9aa6ff' }}>
            正在下载 {progress?.total ? `${(progress!.loaded/1024/1024).toFixed(1)}MB / ${(progress!.total/1024/1024).toFixed(1)}MB` : `${(progress!.loaded/1024/1024).toFixed(1)}MB`} ...
          </div>
        )}
      </div>
      <div style={{ marginTop: 16 }}>
        <table style={{ width: '100%' }}>
          <thead><tr><th></th><th style={{ textAlign:'left' }}>仓库</th><th>标签</th></tr></thead>
          <tbody>
            {repos.map(r=> (
              <tr key={r.name}>
                <td><input type="checkbox" checked={selected[r.name] !== undefined} onChange={(e)=> toggleSelect(r.name, e.target.checked)} /></td>
                <td>{r.name}</td>
                <td>
                  <select value={selected[r.name] || (r.tags?.[0] || 'latest')} onChange={(e)=> setRowTag(r.name, e.target.value)}>
                    {(r.tags || ['latest']).map(t=> <option key={t} value={t}>{t}</option>)}
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
