import { useState, useRef, useEffect } from 'react'
import { HarborAPI } from '../../api/client'
import { loadConfig } from '../../store/config'

interface VersionSelectorProps {
  repoName: string
  selectedTag: string
  tags: string[]
  onTagChange: (repoName: string, tag: string) => void
  disabled?: boolean
  selectedProject: string
}

export default function VersionSelector({
  repoName,
  selectedTag,
  tags,
  onTagChange,
  disabled = false,
  selectedProject
}: VersionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [localTags, setLocalTags] = useState<string[]>(tags)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // 自动加载版本数据
  useEffect(() => {
    if (selectedProject && repoName && localTags.length === 0) {
      loadTags()
    }
  }, [selectedProject, repoName])

  // 同步外部传入的版本数据
  useEffect(() => {
    if (tags && tags.length > 0) {
      setLocalTags(tags)
    }
  }, [tags])

  const loadTags = async () => {
    if (!selectedProject || !repoName) return
    
    const cfg = loadConfig()
    if (!cfg) return

    // 如果已经有外部传入的数据，就不再加载
    if (tags && tags.length > 0) {
      setLocalTags(tags)
      return
    }

    setLoading(true)
    try {
      const result = await HarborAPI.tags(cfg, selectedProject, repoName)
      setLocalTags(result.tags || [])
    } catch (error) {
      console.error('加载版本失败:', error)
      setLocalTags([])
    } finally {
      setLoading(false)
    }
  }

  // 过滤版本
  const filteredTags = localTags.filter(tag => 
    tag.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 获取显示的标签（优先显示latest，其次已选择的，最后显示第一个版本）
  const displayTag = selectedTag || localTags.find(tag => tag === 'latest') || localTags[0] || (tags.length > 0 ? tags[0] : '暂无版本')

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleTagSelect = (tag: string) => {
    onTagChange(repoName, tag)
    setIsOpen(false)
    setSearchQuery('')
  }

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* 触发按钮 */}
      <button
        ref={buttonRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          minWidth: '120px',
          padding: '6px 12px',
          background: disabled ? 'var(--surface-disabled)' : 'var(--surface)',
          border: `1px solid ${disabled ? 'var(--border-disabled)' : (selectedTag ? 'var(--primary)' : 'var(--border)')}`,
          borderRadius: '6px',
          color: disabled ? 'var(--text-disabled)' : (selectedTag ? 'var(--primary)' : 'var(--text-primary)'),
          fontSize: '14px',
          fontWeight: selectedTag ? 600 : 500,
          fontFamily: 'var(--font-body)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all var(--transition-base)',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.background = 'var(--surface-hover)'
            e.currentTarget.style.borderColor = 'var(--primary)'
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.background = 'var(--surface)'
            e.currentTarget.style.borderColor = 'var(--border)'
          }
        }}
      >
        <span style={{ whiteSpace: 'nowrap', marginRight: '4px' }}>
          {displayTag}
        </span>
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            flexShrink: 0
          }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {/* 下拉面板 */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          maxHeight: '300px',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {/* 搜索框 */}
          <div style={{ padding: '6px', borderBottom: '1px solid var(--border)' }}>
            <input
              type="text"
              placeholder="搜索版本..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 8px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontFamily: 'var(--font-body)',
                outline: 'none',
                transition: 'all var(--transition-base)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            />
          </div>

          {/* 版本列表 */}
          <div style={{
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {loading ? (
              <div style={{
                padding: '16px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '14px',
                fontFamily: 'var(--font-body)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <div className="spinner" style={{ width: '16px', height: '16px' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
                      <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  加载版本中...
                </div>
              </div>
            ) : filteredTags.length > 0 ? (
              filteredTags.map((tag) => (
                <div
                  key={tag}
                  onClick={() => handleTagSelect(tag)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: '38px',
                    padding: '0 12px 0 9px',
                    background: tag === selectedTag ? 'var(--surface-hover)' : 'transparent',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    fontFamily: 'var(--font-body)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-base)',
                    borderBottom: '1px solid var(--border)',
                    borderLeft: tag === selectedTag ? '3px solid var(--primary)' : 'none',
                    boxSizing: 'border-box'
                  }}
                  onMouseEnter={(e) => {
                    if (tag !== selectedTag) {
                      e.currentTarget.style.background = 'var(--surface-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (tag !== selectedTag) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span style={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginLeft: '4px'
                  }}>
                    {tag}
                  </span>
                  {tag === selectedTag && (
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="var(--primary)" 
                      strokeWidth="2"
                      style={{ flexShrink: 0 }}
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
              ))
            ) : localTags.length === 0 ? (
              <div style={{
                padding: '16px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '14px',
                fontFamily: 'var(--font-body)'
              }}>
                暂无版本数据
              </div>
            ) : (
              <div style={{
                padding: '16px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '14px',
                fontFamily: 'var(--font-body)'
              }}>
                未找到匹配的版本
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}