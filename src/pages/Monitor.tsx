import { useEffect, useState } from 'react'
import { SystemAPI } from '../api/client'

export default function Monitor() {
  const [info, setInfo] = useState<any>(null)
  
  const load = async () => {
    try { const i = await SystemAPI.info(); setInfo(i.data) } catch(e) { console.error(e) }
  }

  useEffect(()=> { load() }, [])
  useEffect(()=> {
    const t = setInterval(load, 5000)
    return () => clearInterval(t)
  }, [])

  const pct = (n: number, d: number) => (d ? ((n / d) * 100).toFixed(2) : '0.00')
  const fmtGB = (n: number) => (n ? (n / 1024 / 1024 / 1024).toFixed(2) : '0.00')
  const fmtNum = (n: number) => n ? n.toFixed(2) : '0.00'

  const mem = info?.memory || {}
  const disk = info?.disk || {}
  const cpu = info?.cpu || {}

  const Card = ({ title, icon, percent, detail1, detail2, detail3, tooltip }: any) => {
    const [showTooltip, setShowTooltip] = useState(false)
    return (
    <div style={{ 
      background: 'var(--surface)', 
      borderRadius: 8, 
      border: '1px solid var(--border)',
      padding: 24,
      boxShadow: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }}>
      {/* 头部：图标 + 标题 + 进度条 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ 
          width: 42, height: 42, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid var(--border)', borderRadius: 4,
          color: 'var(--text-primary)'
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>{title}</div>
          <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ 
              width: `${Math.min(percent, 100)}%`, 
              height: '100%', 
              background: percent > 90 ? '#ef4444' : percent > 75 ? '#f59e0b' : '#65d146', // 绿色
              borderRadius: 3,
              transition: 'width 0.5s ease'
            }}></div>
          </div>
        </div>
      </div>

      {/* 数据详情：三列布局 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
            {percent}%
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>占比</div>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
            {detail1} <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}>{detail2}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', display:'flex', alignItems:'center', gap:4 }}>
            {detail3} 
            <div 
              style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'help' }}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style={{ opacity:0.6 }}>
                <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6zm-.5-9h1v3h-1V5zm0 4h1v2h-1V9z"/>
              </svg>
              {tooltip && showTooltip && (
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginBottom: 8,
                  padding: '8px 12px',
                  background: 'var(--surface)',
                  color: 'var(--text-primary)',
                  fontSize: 12,
                  borderRadius: 4,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  border: '1px solid var(--border)',
                  zIndex: 10,
                  width: 'max-content',
                  maxWidth: 240,
                  whiteSpace: 'normal',
                  textAlign: 'left',
                  lineHeight: 1.5
                }}>
                  {tooltip}
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    borderWidth: 6,
                    borderStyle: 'solid',
                    borderColor: 'var(--border) transparent transparent transparent'
                  }} />
                   <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%) translateY(-1px)',
                    borderWidth: 6,
                    borderStyle: 'solid',
                    borderColor: 'var(--surface) transparent transparent transparent'
                  }} />
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
            {detail1 === '-' ? '-' : (title === 'CPU用量' ? (cpu.count * cpu.percent / 100).toFixed(2) : (title === '内存用量' ? fmtGB(mem.used) : fmtGB(disk.used)))} 
            <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}> {detail2}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>已使用</div>
        </div>
      </div>
    </div>
  )}

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
      <Card 
        title="CPU用量"
        percent={cpu.percent || 0}
        detail1={fmtNum(cpu.count)}
        detail2="Cores"
        detail3="总计"
        tooltip="服务器 CPU 逻辑核心总数"
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
            <rect x="9" y="9" width="6" height="6"></rect>
            <line x1="9" y1="1" x2="9" y2="4"></line>
            <line x1="15" y1="1" x2="15" y2="4"></line>
            <line x1="9" y1="20" x2="9" y2="23"></line>
            <line x1="15" y1="20" x2="15" y2="23"></line>
            <line x1="20" y1="9" x2="23" y2="9"></line>
            <line x1="20" y1="14" x2="23" y2="14"></line>
            <line x1="1" y1="9" x2="4" y2="9"></line>
            <line x1="1" y1="14" x2="4" y2="14"></line>
          </svg>
        }
      />
      
      <Card 
        title="内存用量"
        percent={mem.total ? Number(((mem.used / mem.total) * 100).toFixed(2)) : 0}
        detail1={fmtGB(mem.total)}
        detail2="GiB"
        detail3="总计"
        tooltip="物理内存总量 (RAM)，已扣除内核预留空间"
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
        }
      />

      <Card 
        title="磁盘用量"
        percent={disk.percent || 0}
        detail1={fmtGB(disk.total)}
        detail2="GiB"
        detail3="总计"
        tooltip="服务器磁盘分区总容量"
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="4" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <circle cx="15" cy="16" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="18" cy="16" r="1.5" fill="currentColor" stroke="none" />
          </svg>
        }
      />
    </div>
  )
}
