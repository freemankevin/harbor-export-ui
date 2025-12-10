import { ReactNode } from 'react'

interface ExplorerLayoutProps {
  children: ReactNode
}

export default function ExplorerLayout({ children }: ExplorerLayoutProps) {
  return (
    <div style={{
      background: 'var(--surface)',
      backdropFilter: 'blur(20px)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      minHeight: '700px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: 'none'
    }}>
      {/* 头部标签栏 */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        padding: '20px 24px 0',
        background: 'var(--surface-hover)'
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
      {children}
    </div>
  )
}
