import React from 'react';

export default function ContractPreview({ html, darkMode }) {
  if (!html) return null;

  // We use an iframe to isolate the contract styles from the app styles
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  return (
    <div style={{
      border: `1px solid ${darkMode ? '#334155' : '#E2E8F0'}`,
      borderRadius: 12,
      overflow: 'hidden',
      background: '#fff',
      height: '600px',
      width: '100%'
    }}>
      <iframe
        src={url}
        title="Contract Preview"
        style={{
          width: '100%',
          height: '100%',
          border: 'none'
        }}
        onLoad={() => URL.revokeObjectURL(url)}
      />
    </div>
  );
}
