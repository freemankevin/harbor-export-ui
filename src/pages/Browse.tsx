import { useEffect, useState } from 'react'
import { HarborAPI, type Project, type Repository } from '../api/client'
import { loadConfig } from '../store/config'

export default function Browse() {
  const cfg = loadConfig()
  const [projects, setProjects] = useState<Project[]>([])
  const [project, setProject] = useState<string>('')
  const [repos, setRepos] = useState<Repository[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!cfg) return
    HarborAPI.projects(cfg).then((d) => setProjects(d.projects)).catch(() => {})
  }, [])

  const loadRepos = async (p: string) => {
    if (!cfg) return
    setProject(p); setLoading(true)
    try { const d = await HarborAPI.repositories(cfg, p); setRepos(d.repositories) } finally { setLoading(false) }
  }

  const doSearch = async () => {
    if (!cfg || !query.trim()) return
    setLoading(true)
    try { await HarborAPI.search(cfg, query); } finally { setLoading(false) }
  }

  return (
    <div className="panel">
      <h2>项目与仓库</h2>
      {!cfg && <div className="alert err">请先在“设置”页保存 Harbor 配置</div>}
      <div style={{ display:'flex', gap:12 }}>
        <div style={{ flex:1 }}>
          <label htmlFor="projectSel">项目列表</label>
          <select id="projectSel" value={project} onChange={(e)=> loadRepos(e.target.value)}>
            <option value="">请选择项目</option>
            {projects.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
          </select>
        </div>
        <div style={{ flex:1 }}>
          <label htmlFor="search">搜索仓库</label>
          <div style={{ display:'flex', gap:8 }}>
            <input id="search" value={query} onChange={(e)=> setQuery(e.target.value)} placeholder="输入关键字" />
            <button onClick={doSearch} disabled={loading}>搜索</button>
          </div>
        </div>
      </div>
      <div style={{ marginTop:12 }}>
        <table style={{ width:'100%' }}>
          <thead>
            <tr><th style={{ textAlign:'left' }}>仓库</th><th>标签数</th><th>拉取次数</th></tr>
          </thead>
          <tbody>
            {repos.map(r => (
              <tr key={r.name}>
                <td>{r.name}</td>
                <td>{r.tags?.length ?? r.artifact_count}</td>
                <td>{r.pull_count}</td>
              </tr>
            ))}
            {repos.length===0 && <tr><td colSpan={3} style={{ textAlign:'center', color:'#888' }}>{loading ? '加载中...' : '请选择项目以查看仓库'}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
