import { useEffect, useRef, useState } from 'react'
import { SystemAPI } from '../api/client'

export default function SysLogs() {
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [auto, setAuto] = useState(false)
  const [intervalMs, setIntervalMs] = useState(10000)
  const [fullscreen, setFullscreen] = useState(false)
  const logRef = useRef<HTMLPreElement | null>(null)

  const load = async () => { 
    setLoading(true)
    try { 
      const l = await SystemAPI.logs()
      setLogs(l.data?.logs || []) 
    } finally { 
      setLoading(false) 
    } 
  }

  useEffect(()=> { load() }, [])

  useEffect(()=> {
    if (!auto) return
    const t = setInterval(load, intervalMs)
    return () => clearInterval(t)
  }, [auto, intervalMs])

  const download = () => {
    const blob = new Blob([logs.join('\n')], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'system.log'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const scrollToTop = () => { if (logRef.current) logRef.current.scrollTop = 0 }
  const scrollToBottom = () => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight }

  const panelStyle = fullscreen ? {
    position: 'fixed' as const,
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 9999,
    margin: 0,
    borderRadius: 0,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    padding: 0,
    background: 'var(--surface)'
  } : {
    display: 'flex',
    flexDirection: 'column' as const,
    height: 'calc(100vh - 140px)', // 适配剩余高度
    padding: 0,
    overflow: 'hidden' // 确保圆角不被子元素遮挡
  }

  // 华为云风格按钮样式 - 紧凑型
  const iconBtnStyle = {
    width: 28,
    height: 28,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 4,
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'all 0.2s'
  }

  const textBtnStyle = {
    height: 28,
    padding: '0 8px',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    background: 'transparent',
    border: '1px solid transparent', // 默认无边框
    borderRadius: 4,
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: 12,
    fontWeight: 400
  }

  return (
    <div className="panel" style={panelStyle}>
      {/* 顶部工具栏 */}
      <div style={{ 
        display:'flex', 
        justifyContent:'space-between', 
        alignItems:'center', 
        padding: '8px 20px', // 减小内边距
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        zIndex: 10,
        position: 'relative',
        height: 48 // 固定高度
      }}>
        <div style={{ display:'flex', gap:24 }}>
          <div style={{ 
            fontSize: 14, 
            fontWeight: 600, 
            color: 'var(--text-primary)', 
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            系统日志
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
          {/* 刷新按钮 */}
          <button 
            onClick={load} 
            disabled={loading}
            style={iconBtnStyle}
            title="刷新"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.color = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className={loading ? 'spinner' : ''}>
              <path d="M13.6,2.4 C12.2,0.9 10.2,0 8,0 C3.6,0 0,3.6 0,8 C0,12.4 3.6,16 8,16 C11.7,16 14.8,13.4 15.7,10 L13.6,10 C12.8,12.3 10.6,14 8,14 C4.7,14 2,11.3 2,8 C2,4.7 4.7,2 8,2 C9.7,2 11.1,2.7 12.2,3.8 L9,7 H16 V0 L13.6,2.4 Z"/>
            </svg>
          </button>

          {/* 定时刷新区域 */}
          <div style={{ display:'flex', alignItems:'center', gap: 8, fontSize: 12, color:'var(--text-primary)' }}>
            <span>定时刷新</span>
            <label className="switch" style={{ transform: 'scale(0.7)', margin: 0 }}>
              <input type="checkbox" checked={auto} onChange={(e)=> setAuto(e.target.checked)} />
              <span className="slider round"></span>
            </label>
            
            {auto && (
              <div style={{ position:'relative' }}>
                <select 
                  value={intervalMs} 
                  onChange={(e)=> setIntervalMs(Number(e.target.value))}
                  style={{ 
                    appearance: 'none',
                    height: 24, 
                    padding: '0 20px 0 8px', 
                    borderRadius: 12, // 胶囊形状
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text-primary)',
                    fontSize: 12,
                    cursor: 'pointer',
                    outline: 'none',
                    lineHeight: '22px',
                    minWidth: 60
                  }}
                >
                  <option value={5000}>5s</option>
                  <option value={10000}>10s</option>
                  <option value={30000}>30s</option>
                </select>
                <svg 
                  width="8" height="8" viewBox="0 0 16 16" fill="currentColor" 
                  style={{ position:'absolute', right: 8, top: 8, pointerEvents:'none', color:'var(--text-muted)' }}
                >
                  <path d="M8 11L3 6h10l-5 5z"/>
                </svg>
              </div>
            )}
          </div>

          {/* 竖线分隔符 */}
          <div style={{ width: 1, height: 14, background: 'var(--border)' }}></div>

          {/* 全屏按钮 */}
          <button 
            onClick={()=> setFullscreen(!fullscreen)}
            style={textBtnStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--surface-hover)';
              e.currentTarget.style.color = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              {fullscreen ? (
                // 退出全屏 (内缩箭头)
                <path d="M6 10H1V12H4V15H6V10ZM10 6H15V4H12V1H10V6ZM1 6H6V1H4V4H1V6ZM15 10H10V15H12V12H15V10Z"/>
              ) : (
                // 进入全屏 (外扩箭头 - 华为云风格)
                <path d="M4.5,3 L2,3 L2,5.5 L1,5.5 L1,2 L4.5,2 L4.5,3 Z M11.5,3 L14,3 L14,5.5 L15,5.5 L15,2 L11.5,2 L11.5,3 Z M4.5,13 L2,13 L2,10.5 L1,10.5 L1,14 L4.5,14 L4.5,13 Z M11.5,13 L14,13 L14,10.5 L15,10.5 L15,14 L11.5,14 L11.5,13 Z"/>
              )}
            </svg>
            {fullscreen ? '退出全屏' : '全屏'}
          </button>
        </div>
      </div>

      <div style={{ 
        flex: 1, 
        background: '#1e1e1e', 
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'inset 0 6px 12px rgba(0,0,0,0.4)' // 内部顶部阴影
      }}>
        <pre 
          ref={logRef} 
          style={{ 
            flex: 1,
            margin: 0,
            padding: 20,
            overflow: 'auto',
            fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
            fontSize: 13,
            lineHeight: 1.6,
            color: '#d4d4d4',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            textShadow: '0 1px 1px rgba(0,0,0,0.5)'
          }}
        >
          {logs.join('') || <span style={{ color: '#666' }}>暂无日志数据...</span>}
        </pre>
      </div>

      <div style={{ 
        padding: '12px 24px', 
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 12,
        background: 'var(--surface)',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.05)',
        zIndex: 10
      }}>
        <div style={{ flex: 1 }}></div>
        <button 
          onClick={scrollToTop}
          style={{ 
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '6px 20px'
          }}
        >
          回到顶部
        </button>
        <button 
          onClick={scrollToBottom}
          style={{ 
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '6px 20px'
          }}
        >
          回到底部
        </button>
        <button 
          onClick={download}
          style={{ 
            background: '#333',
            color: '#fff',
            border: '1px solid #444',
            borderRadius: 20,
            padding: '6px 20px'
          }}
        >
          下载日志
        </button>
      </div>
    </div>
  )
}
