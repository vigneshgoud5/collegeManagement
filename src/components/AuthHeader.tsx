export function AuthHeader() {
  return (
    <div style={{
      textAlign: 'center',
      marginBottom: '2rem',
      paddingBottom: '1.5rem',
      borderBottom: '2px solid var(--border-color)',
    }}>
      <div>
        <h1 style={{
          margin: 0,
          fontSize: '1.75rem',
          fontWeight: 700,
          color: 'var(--nav-color)',
          letterSpacing: '0.05em',
        }}>
          GURUNANAK COLLEGE PORTAL
        </h1>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <img
          src="/gnit-banner.jpg"
          alt="Guru Nanak Institute of Technology banner"
          style={{
            width: '100%',
            height: 'auto',
            maxWidth: '900px',
            margin: '0 auto',
            display: 'block',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
          }}
        />
      </div>
    </div>
  );
}

