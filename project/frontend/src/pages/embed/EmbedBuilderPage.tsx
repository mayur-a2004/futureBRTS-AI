import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export const EmbedBuilderPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [studentName, setStudentName] = useState<string>('Student Developer');

  useEffect(() => {
    if (token) {
      setStudentName('ERP Student Developer');
    }
  }, [token]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      background: '#0a0a0f',
      color: '#ffffff',
      fontFamily: 'Inter, monospace',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header Bar */}
      <div style={{
        height: '40px',
        background: '#12131c',
        borderBottom: '1px solid #1e2030',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        fontSize: '13px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#6366f1', fontWeight: 'bold' }}>⚡ Future BRTS AI Builder IDE</span>
          <span style={{ color: '#475569' }}>|</span>
          <span style={{ color: '#94a3b8' }}>{studentName}</span>
        </div>
        <div style={{ fontSize: '11px', color: '#10b981' }}>
          ● Live Sandbox Ready
        </div>
      </div>

      {/* Editor & Preview Placeholder */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#090a0f',
        padding: '40px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '500px', background: '#12131c', padding: '32px', borderRadius: '16px', border: '1px solid #1e2030' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
          <h2 style={{ fontSize: '20px', color: '#f8fafc', marginBottom: '8px' }}>Future BRTS Coding & AI Builder</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
            Build web apps, Python automation scripts, and 3D simulations inside your ERP portal workspace.
          </p>
          <button style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
          }}>
            Start Coding Workspace
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmbedBuilderPage;
