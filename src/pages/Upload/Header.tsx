export default function Header() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 0',
      borderBottom: '1px solid var(--border)',
      marginBottom: '16px'
    }}>
      <h1 style={{
        fontSize: '20px',
        fontWeight: '600',
        color: 'var(--text-primary)',
        margin: 0
      }}>
        上传镜像
      </h1>
    </div>
  )
}