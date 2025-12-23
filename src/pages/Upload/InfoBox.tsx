interface InfoBoxProps {
  remainingCount: number
}

export default function InfoBox({ remainingCount }: InfoBoxProps) {
  const infoItems = [
    `您还可以添加 ${ remainingCount } 个镜像压缩包，支持 tar、tar.gz 格式，文件大小(含解压后)不得超过 2 GB。`,
    "如需上传大规格镜像或同时上传多个镜像，建议使用 docker 命令行上传，以避免页面上传时间过长导致上传失败。",
    "仅支持上传 18.06 及以上 docker 容器引擎版本制作的镜像压缩包。"
  ]

  return (
    <div style={{
      backgroundColor: '#e3f2fd',
      border: '1px solid #90caf9',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'flex-start'
    }}>
      <div style={{
        width: '24px',
        height: '24px',
        backgroundColor: '#1565c0',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '12px',
        flexShrink: 0
      }}>
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>!</span>
      </div>
      <div style={{ flex: 1 }}>
        {infoItems.map((item, index) => (
          <div key={index} style={{
            color: '#000',
            fontSize: '14px',
            lineHeight: '1.6',
            marginBottom: index < infoItems.length - 1 ? '8px' : '0',
            textAlign: 'left'
          }}>
            {index === 0 ? (
              <>
                {index + 1}. 您还可以添加
                <strong style={{ color: '#d32f2f', fontWeight: 'bold', margin: '0 4px' }}>
                  {remainingCount}
                </strong>
                个镜像压缩包，支持 tar、tar.gz 格式，文件大小(含解压后)不得超过 2 GB。
              </>
            ) : (
              <>{index + 1}. {item}</>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}