import { useEffect, useState } from 'react'
import { DockerAPI, HarborAPI, type Project, type Repository } from '../api/client'
import { loadConfig } from '../store/config'
import { SystemAPI } from '../api/client'

type HistoryItem = { image: string; tag: string; size?: number; time: string; ok: boolean }

export default function Download() {
  const cfg = loadConfig()
  const [projects, setProjects] = useState<Project[]>([])
  const [project, setProject] = useState('')
  const [repos, setRepos] = useState<Repository[]>([])
  const [repo, setRepo] = useState('')
  const [tag, setTag] = useState('latest')
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState<{loaded: number, total?: number} | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => { if (cfg) HarborAPI.projects(cfg).then(d => setProjects(d.projects)) }, [])

  const loadRepos = async (p: string) => {
    if (!cfg) return
    setProject(p); setRepo(''); setTag('latest')
    const d = await HarborAPI.repositories(cfg, p)
    setRepos(d.repositories)
  }

  const doDownload = async () => {
    if (!cfg || !project || !repo || !tag) return
    setDownloading(true)
    const image = repo
    try {
      setProgress({ loaded: 0, total: undefined })
      const blob = await DockerAPI.downloadStream(cfg, image, tag, (loaded, total)=> setProgress({ loaded, total }))
      const filename = `${image.replace('/', '_')}_${tag}.tar.gz`
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename
      a.click()
      URL.revokeObjectURL(a.href)
      setHistory((h) => [{ image, tag, size: blob.size, time: new Date().toLocaleString(), ok: true }, ...h])
      SystemAPI.record(cfg.operator, 'download', { image, tag }, true)
    } catch {
      setHistory((h) => [{ image, tag, time: new Date().toLocaleString(), ok: false }, ...h])
      SystemAPI.record(cfg?.operator, 'download', { image, tag }, false)
    } finally {
      setDownloading(false)
      setProgress(null)
    }
  }

  return (
    <div className="panel" style={{ padding: 24 }}>
      <h2 style={{ fontSize: 22, marginBottom: 16 }}>下载中心</h2>
      {!cfg && <div className="alert err">请先在“设置”页保存 Harbor 配置</div>}
      <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1.5fr 1fr', gap:16, alignItems:'center' }}>
        <div>
          <label>项目</label>
          <select value={project} onChange={(e)=> loadRepos(e.target.value)}>
            <option value="">请选择项目</option>
            {projects.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label>仓库</label>
          <select value={repo} onChange={(e)=> setRepo(e.target.value)}>
            <option value="">请选择仓库</option>
            {repos.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
          </select>
        </div>
        <div>
          <label>标签</label>
          <select value={tag} onChange={(e)=> setTag(e.target.value)}>
            {repos.find(r=> r.name===repo)?.tags?.map((t: string) => <option key={t} value={t}>{t}</option>) || <option value="latest">latest</option>}
          </select>
        </div>
      </div>
      <div className="actions" style={{ marginTop: 20 }}>
        <button className="primary" onClick={doDownload} disabled={downloading || !repo}>开始下载</button>
        {downloading && (
          <div style={{ marginLeft: 12, color: '#9aa6ff' }}>
            正在下载 {progress?.total ? `${(progress!.loaded/1024/1024).toFixed(1)}MB / ${(progress!.total/1024/1024).toFixed(1)}MB` : `${(progress!.loaded/1024/1024).toFixed(1)}MB`} ...
          </div>
        )}
      </div>
      <div style={{ marginTop:24 }}>
        <h3 style={{ marginBottom: 8 }}>历史记录</h3>
        <table style={{ width:'100%' }}>
          <thead><tr><th style={{ textAlign:'left' }}>镜像</th><th>标签</th><th>大小</th><th>时间</th><th>状态</th></tr></thead>
          <tbody>
            {history.map((h, i) => (
              <tr key={i}><td>{h.image}</td><td>{h.tag}</td><td>{h.size ? (h.size/1024/1024).toFixed(2)+' MB' : '-'}</td><td>{h.time}</td><td>{h.ok ? '成功' : '失败'}</td></tr>
            ))}
            {history.length===0 && <tr><td colSpan={5} style={{ textAlign:'center', color:'#888' }}>暂无记录</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
