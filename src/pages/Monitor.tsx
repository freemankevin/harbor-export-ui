import { useEffect, useState } from 'react'
import { SystemAPI } from '../api/client'

export default function Monitor() {
  const [info, setInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try { const i = await SystemAPI.info(); setInfo(i.data) } finally { setLoading(false) }
  }

  useEffect(()=> { load() }, [])
  useEffect(()=> {
    const t = setInterval(load, 5000)
    return () => clearInterval(t)
  }, [])

  const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0)
  const fmtGB = (n: number) => (n ? (n / 1024 / 1024 / 1024).toFixed(2) + ' GB' : '0 GB')

  const mem = info?.memory || {}
  const disk = info?.disk || {}
  const cpu = info?.cpu || {}

  return (
    <div className="panel">
      {/* 自动刷新内置，不展示控制 */}
      <h2>系统监控</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16 }}>
        <div className="card">
          <h3>CPU</h3>
          <div>核心数：{cpu.count ?? '-'}</div>
          <div style={{ marginTop:8 }} className="meter"><span style={{ width: `${cpu.percent || 0}%` }} /></div>
          <div style={{ marginTop:6, fontSize:12, color:'#9aa6ff' }}>{cpu.percent || 0}%</div>
        </div>
        <div className="card">
          <h3>内存</h3>
          <div>已用/总计：{fmtGB(mem.used || 0)} / {fmtGB(mem.total || 0)}</div>
          <div style={{ marginTop:8 }} className="meter"><span style={{ width: `${pct(mem.used || 0, mem.total || 1)}%` }} /></div>
          <div style={{ marginTop:6, fontSize:12, color:'#9aa6ff' }}>{pct(mem.used || 0, mem.total || 1)}%</div>
        </div>
        <div className="card">
          <h3>磁盘</h3>
          <div>已用/总计：{fmtGB(disk.used || 0)} / {fmtGB(disk.total || 0)}</div>
          <div style={{ marginTop:8 }} className="meter"><span style={{ width: `${disk.percent || 0}%` }} /></div>
          <div style={{ marginTop:6, fontSize:12, color:'#9aa6ff' }}>{disk.percent || 0}%</div>
        </div>
      </div>
    </div>
  )
}
