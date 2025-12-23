import { useState } from 'react'

interface ProjectSelectorProps {
  selectedProject: string
  onProjectChange: (project: string) => void
  projects: string[]
}

export default function ProjectSelector({ selectedProject, onProjectChange, projects }: ProjectSelectorProps) {
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
            padding: '8px 12px',
            border: `1px solid ${isError ? 'red' : '#ccc'}`,
            borderRadius: '4px',
            backgroundColor: isError ? '#fff5f5' : 'white',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          <option value="">--请选择--</option>
          {projects.map(project => (
            <option key={project} value={project}>{project}</option>
          ))}
        </select>
        <button
          onClick={() => {
            // 刷新项目列表逻辑
            console.log('刷新项目列表')
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