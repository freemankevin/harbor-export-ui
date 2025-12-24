import { useState } from 'react'

interface ProjectSelectorProps {
  selectedProject: string
  onProjectChange: (project: string) => void
  projects: string[]
  onRefresh?: () => void
}

export default function ProjectSelector({ selectedProject, onProjectChange, projects, onRefresh }: ProjectSelectorProps) {
  const [isError, setIsError] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    onProjectChange(value)
    setIsError(value === '')
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      marginBottom: '24px'
    }}>
      <label style={{
        marginRight: '12px',
        fontSize: '14px',
        color: 'var(--text-primary)',
        whiteSpace: 'nowrap'
      }}>
        <span style={{ color: 'red' }}>*</span> 项目
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <select
          value={selectedProject}
          onChange={handleChange}
          style={{
            width: '200px',
            padding: '8px 32px 8px 12px',
            border: `1px solid ${isError ? 'red' : '#ccc'}`,
            borderRadius: '4px',
            backgroundColor: isError ? '#fff5f5' : 'white',
            fontSize: '14px',
            cursor: 'pointer',
            appearance: 'none',
            backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 8px center',
            backgroundSize: '16px'
          }}
        >
          <option value="">--请选择--</option>
          {projects.map(project => (
            <option key={project} value={project}>{project}</option>
          ))}
        </select>
        <button
          onClick={() => {
            if (onRefresh) {
              onRefresh()
            }
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="刷新项目列表"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38"/>
          </svg>
        </button>
      </div>
    </div>
  )
}