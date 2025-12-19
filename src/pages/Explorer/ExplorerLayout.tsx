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
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      margin: '100px 24px 24px 24px',
      position: 'relative'
    }}>
      {/* 主要内容区域 */}
      {children}
    </div>
  )
}