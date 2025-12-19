import type { ReactNode } from 'react'

interface ExplorerLayoutProps {
  children: ReactNode
}

export default function ExplorerLayout({ children }: ExplorerLayoutProps) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      height: 'calc(100vh - 130px)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: 'none',
      margin: '100px 24px 24px 24px'
    }}>


      {/* 主要内容区域 */}
      {children}
    </div>
  )
}
