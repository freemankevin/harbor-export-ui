import type { ReactNode } from 'react'

interface ExplorerLayoutProps {
  children: ReactNode
}

export default function ExplorerLayout({ children }: ExplorerLayoutProps) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '16px 16px 0 0',
      height: 'calc(100vh - 130px)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'visible',
      boxShadow: 'none',
      margin: '100px 24px 24px 24px',
      position: 'relative'
    }}>
      {/* 主要内容区域 */}
      {children}
    </div>
  )
}