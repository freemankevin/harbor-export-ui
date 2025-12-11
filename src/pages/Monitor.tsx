import { useEffect, useState } from 'react'
import { SystemAPI } from '../api/client'

type CpuInfo = { count?: number; percent?: number }
type MemInfo = { used?: number; total?: number }
type DiskInfo = { used?: number; total?: number; percent?: number }
type SystemInfo = { cpu?: CpuInfo; memory?: MemInfo; disk?: DiskInfo; harbor_api_version?: string }
type HealthInfo = { service_ok?: boolean; harbor_ok?: boolean; ok?: boolean }

export default function Monitor() {
  const [info, setInfo] = useState<SystemInfo | null>(null)
  const [health, setHealth] = useState<HealthInfo | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [lastCheck, setLastCheck] = useState('')
  const [diagnosing, setDiagnosing] = useState(false)
  
  const fmtTime = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    const ss = String(d.getSeconds()).padStart(2, '0')
    return `${y}/${m}/${day} ${hh}:${mm}:${ss}`
  }

  const loadAll = async () => {
    try {
      const [i, h] = await Promise.all([SystemAPI.info(), SystemAPI.health()])
      setInfo(i.data)
      setHealth(h.data)
      const ts = fmtTime(new Date())
      setLastCheck(ts)
      try { localStorage.setItem('monitor_cache', JSON.stringify({ info: i.data, health: h.data, lastCheck: ts })) } catch {}
    } catch(e) { console.error(e) }
  }

  useEffect(()=> {
    try {
      const raw = localStorage.getItem('monitor_cache')
      if (raw) {
        const cached = JSON.parse(raw)
        if (cached?.info) setInfo(cached.info)
        if (cached?.health) setHealth(cached.health)
        if (cached?.lastCheck) setLastCheck(cached.lastCheck)
      }
    } catch {}
    loadAll()
  }, [])
  useEffect(()=> {
    const t = setInterval(loadAll, 5000)
    return () => clearInterval(t)
  }, [])

  const fmtGB = (n: number) => (n ? (n / 1024 / 1024 / 1024).toFixed(2) : '0.00')
  const fmtNum = (n: number) => n ? n.toFixed(2) : '0.00'

  const mem: MemInfo = info?.memory || {}
  const disk: DiskInfo = info?.disk || {}
  const cpu: CpuInfo = info?.cpu || {}

  const memPercent = mem.total ? Number((((mem.used || 0) / (mem.total || 1)) * 100).toFixed(2)) : 0
  const serviceOk = health?.service_ok === true || health?.ok === true || !!info
  const harborOk = health?.harbor_ok === true || !!info?.harbor_api_version
  const cpuOk = (cpu?.percent || 0) < 85
  const memOk = memPercent < 85
  const diskOk = (disk?.percent || 0) < 85
  const radarValues = [cpuOk ? 1 : 0, memOk ? 1 : 0, diskOk ? 1 : 0, harborOk ? 1 : 0, serviceOk ? 1 : 0]
  const totalScore = radarValues.reduce((s, v) => s + v * 20, 0)

  type CardProps = { title: string; icon: any; percent: number; detail1: string | number; detail2: string; detail3: string; tooltip?: string; loading?: boolean }
  const Card = ({ title, icon, percent, detail1, detail2, detail3, tooltip, loading }: CardProps) => {
    const [showTooltip, setShowTooltip] = useState(false)
    return (
    <div style={{ 
      background: 'var(--surface)', 
      borderRadius: 8, 
      border: '1px solid var(--border)',
      padding: 16,
      boxShadow: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      position: 'relative',
      opacity: loading ? 0.85 : 1
    }}>
      {/* 头部：图标 + 标题 + 进度条 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ 
          width: 36, height: 36, 
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
              background: percent > 90 ? '#ef4444' : percent > 75 ? '#f59e0b' : '#65d146',
              borderRadius: 3,
              transition: 'width 0.5s ease',
              opacity: loading ? 0.6 : 1
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
            {detail1 === '-' ? '-' : (title === 'CPU用量' ? (((cpu.count || 0) * (cpu.percent || 0) / 100).toFixed(2)) : (title === '内存用量' ? fmtGB(mem.used || 0) : fmtGB(disk.used || 0)))} 
            <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}> {detail2}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>已使用</div>
        </div>
      </div>
      {loading && (<div className="skeletonOverlay skeleton"></div>)}
    </div>
  )}

  function Radar({ values, size = 240, diagnosing = false }: { values: number[]; size?: number; diagnosing?: boolean }) {
    const n = values.length
    const cx = size / 2
    const cy = size / 2
    const r = size * 0.42
    const pts = values.map((v, i) => {
      const ang = (-90 + (360 / n) * i) * Math.PI / 180
      const rv = r * (0.2 + 0.8 * Math.max(0, Math.min(1, v)))
      return [cx + rv * Math.cos(ang), cy + rv * Math.sin(ang)]
    })
    const path = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join(' ') + ' Z'
    const ring = (rr: number) => (
      <circle cx={cx} cy={cy} r={rr} fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth={0.6} />
    )
    const labels = ['CPU','内存','磁盘','外部依赖','核心服务']
    const labelOffsets = [
      { dx: 0, dy: -4 },
      { dx: 6, dy: 0 },
      { dx: 12, dy: -4 },
      { dx: -20, dy: -3 },
      { dx: -13, dy: 2 }
    ]
    return (
      <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
          <defs>
            <radialGradient id="radarGrad" cx="50%" cy="50%" r="65%">
              <stop offset="0%" stopColor="#65d146" stopOpacity="0.62" />
              <stop offset="60%" stopColor="#65d146" stopOpacity="0.52" />
              <stop offset="100%" stopColor="#65d146" stopOpacity="0.42" />
            </radialGradient>
          </defs>
          <circle cx={cx} cy={cy} r={r * 1.0} fill="rgba(0,0,0,0.04)" stroke="none" />
          {(() => {
            const inner = r * 0.46
            const outer = r * 1.0
            const count = 4
            const step = (outer - inner) / count
            const radii = Array.from({ length: count }, (_, i) => outer - i * step)
            return radii.map((rr, i) => (<g key={i}>{ring(rr)}</g>))
          })()}
          <path d={path} fill="url(#radarGrad)" stroke="#65d146" strokeWidth={2.4} className={diagnosing ? 'pulse' : undefined} />
          {pts.map((p, i) => (<circle key={i} cx={p[0]} cy={p[1]} r={3} fill="#65d146" stroke="none" />))}
          {labels.map((t, i) => {
            const ang = (-90 + (360 / n) * i) * Math.PI / 180
            const c = Math.cos(ang)
            const s = Math.sin(ang)
            const off = 18
            const adj = labelOffsets[i] || { dx: 0, dy: 0 }
            const x = pts[i][0] + c * off + adj.dx
            const y = pts[i][1] + s * off + adj.dy
            return (
              <text key={t} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="var(--text-muted)">{t}</text>
            )
          })}
          <circle cx={cx} cy={cy} r={r * 0.46} fill="var(--surface)" stroke="none" />
          <text x={cx + 3} y={cy - 3} textAnchor="middle" dominantBaseline="middle" fontSize={20} fill="var(--text-primary)" fontWeight={700}>{totalScore}<tspan dx={2} dy={4} fontSize={11} fontWeight={400} fill="var(--text-muted)">分</tspan></text>
          <text x={cx} y={cy + 22} textAnchor="middle" fontSize={13} fill="var(--text-muted)">健康评分</text>
        </svg>
      </div>
    )
  }

  return (
    <div className="panel" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, padding: 24 }}>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes pulseScale { 0% { transform: scale(1); } 50% { transform: scale(1.03); } 100% { transform: scale(1); } }
        .pulse { transform-box: fill-box; transform-origin: center; animation: pulseScale 1s ease-in-out infinite; }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .skeletonOverlay { position: absolute; inset: 0; border-radius: 8px; background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(0,0,0,0.06) 50%, rgba(255,255,255,0) 100%); background-size: 200% 100%; animation: shimmer 1.2s linear infinite; pointer-events: none; }
        @keyframes fadeUp { 0% { opacity: 0; transform: translate(-50%, 8px); } 100% { opacity: 1; transform: translate(-50%, 0); } }
      `}</style>
      <div style={{ background: 'var(--surface)', border: 'none', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, marginLeft: 35, marginTop: 70 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Radar values={radarValues} size={240} diagnosing={diagnosing} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <button
            onClick={() => setShowDetails(v => !v)}
            style={{
              padding: '6px 12px',
              borderRadius: 16,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-primary)',
              fontSize: 12,
              cursor: 'pointer',
              minWidth: 96
            }}
          >查看详情</button>
          <button
            disabled={diagnosing}
            onClick={async () => { setDiagnosing(true); await loadAll(); setDiagnosing(false) }}
            style={{
              padding: '6px 12px',
              borderRadius: 16,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-primary)',
              fontSize: 12,
              cursor: diagnosing ? 'not-allowed' : 'pointer',
              minWidth: 96
            }}
          >{diagnosing && (
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style={{ marginRight: 6 }} className="spin">
              <path d="M8 1a7 7 0 1 1-7 7" />
            </svg>
          )}重新诊断</button>
        </div>
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>巡检时间：{lastCheck || '-'}</div>
        {diagnosing && (
          <div style={{ alignSelf: 'flex-start', marginTop: 8, marginLeft: 12, width: 260 }}>
            <div style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:10, padding:'10px 14px', border:'1px solid var(--border)', borderRadius:18, background:'var(--surface)', boxShadow:'0 8px 24px rgba(0,0,0,0.12)' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="spin"><path d="M8 1a7 7 0 1 1-7 7" /></svg>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>正在重新诊断…</span>
            </div>
          </div>
        )}
        {showDetails && (
          <div style={{
            alignSelf: 'flex-start',
            marginTop: 8,
            marginLeft: 12,
            width: 260,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            padding: 12
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>健康详情</div>
            <div style={{ borderTop: '1px dashed var(--border)', margin: '8px 0' }}></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span style={{ color:'var(--text-muted)' }}>核心服务</span><span style={{ color: serviceOk ? '#22c55e' : '#ef4444' }}>{serviceOk ? '✓' : '✗'}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span style={{ color:'var(--text-muted)' }}>外部依赖</span><span style={{ color: harborOk ? '#22c55e' : '#ef4444' }}>{harborOk ? '✓' : '✗'}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span style={{ color:'var(--text-muted)' }}>{'CPU<85%'}</span><span style={{ color: cpuOk ? '#22c55e' : '#ef4444' }}>{cpuOk ? '✓' : '✗'}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span style={{ color:'var(--text-muted)' }}>{'内存<85%'}</span><span style={{ color: memOk ? '#22c55e' : '#ef4444' }}>{memOk ? '✓' : '✗'}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span style={{ color:'var(--text-muted)' }}>{'磁盘<85%'}</span><span style={{ color: diskOk ? '#22c55e' : '#ef4444' }}>{diskOk ? '✓' : '✗'}</span></div>
            </div>
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', marginLeft: 0, marginRight: 0 }}>
      <Card 
        title="CPU用量"
        percent={cpu.percent || 0}
        detail1={fmtNum(cpu.count || 0)}
        detail2="Cores"
        detail3="总计"
        tooltip="服务器 CPU 逻辑核心总数"
        loading={diagnosing}
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
        percent={memPercent}
        detail1={fmtGB(mem.total || 0)}
        detail2="GiB"
        detail3="总计"
        tooltip="物理内存总量 (RAM)，已扣除内核预留空间"
        loading={diagnosing}
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
        detail1={fmtGB(disk.total || 0)}
        detail2="GiB"
        detail3="总计"
        tooltip="服务器磁盘分区总容量"
        loading={diagnosing}
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
    </div>
  )
}
