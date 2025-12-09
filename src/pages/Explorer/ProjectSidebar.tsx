import type { Project } from '../../api/client'

interface ProjectSidebarProps {
  projects: Project[]
  selectedProject: string
  onSelectProject: (projectName: string) => void
  loading: boolean
}

export default function ProjectSidebar({ 
  projects, 
  selectedProject, 
  onSelectProject,
  loading 
}: ProjectSidebarProps) {
  return (
    <div style={{
      width: '240px',
      borderRight: '1px solid var(--border)',
      padding: '16px 0',
      overflowY: 'auto',
      background: 'var(--surface)'
    }}>
      <div style={{
        padding: '0 16px 12px',
        fontSize: '12px',
        fontWeight: 600,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        项目名称
      </div>
      
      {loading && projects.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-disabled)', fontSize: '14px' }}>
          加载中...
        </div>
      ) : projects.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-disabled)', fontSize: '14px' }}>
          暂无项目
        </div>
      ) : (
        projects.map(project => (
          <div
            key={project.name}
            onClick={() => onSelectProject(project.name)}
            style={{
              padding: '10px 16px',
              cursor: 'pointer',
              background: selectedProject === project.name 
                ? 'rgba(59, 130, 246, 0.15)' 
                : 'transparent',
              borderLeft: selectedProject === project.name 
                ? '3px solid #3b82f6' 
                : '3px solid transparent',
              transition: 'all 0.2s',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
            onMouseEnter={(e) => {
              if (selectedProject !== project.name) {
                e.currentTarget.style.background = 'var(--surface-hover)'
              }
            }}
            onMouseLeave={(e) => {
              if (selectedProject !== project.name) {
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flex: 1,
              minWidth: 0
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              </svg>
              <span style={{
                fontSize: '13px',
                color: selectedProject === project.name ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: selectedProject === project.name ? 600 : 400,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {project.name}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}   