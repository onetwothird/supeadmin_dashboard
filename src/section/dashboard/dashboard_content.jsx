import React from 'react';

function DashboardContent({ userStats, setActiveView }) {
  const stats = userStats || { total: 0, partially_sighted: 0, caretakers: 0, mswd: 0, pending: 0 };
  const mswdCount = Math.max(0, stats.total - stats.partially_sighted - stats.caretakers);

  return (
    <div className="main-content">
      
      <div className="header-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
        Overview
      </div>
      <h1 className="page-title">System Dashboard</h1>
      <p className="page-subtitle">A real-time overview of the SEELAI platform, user registrations, and system health.</p>

      {/* UPDATED: Using the new responsive class from dashboard.css */}
      <div className="stats-grid">
        <div className="info-card" style={{ padding: '24px', marginBottom: '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '16px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Total Users
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1' }}>{stats.total}</div>
        </div>

        <div className="info-card" style={{ padding: '24px', marginBottom: '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '16px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            Partially Sighted
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1' }}>{stats.partially_sighted}</div>
        </div>

        <div className="info-card" style={{ padding: '24px', marginBottom: '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '16px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Caretakers
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1' }}>{stats.caretakers}</div>
        </div>

        <div className="info-card" style={{ padding: '24px', marginBottom: '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '16px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            MSWD / Admins
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1' }}>{mswdCount}</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Left Column */}
        <div>
          <div className="section-title">Action Required</div>
          <div className="tip-card">
            <div className="tip-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              {stats.pending > 0 ? `${stats.pending} Pending Caretaker Approvals` : 'No Pending Approvals'}
            </div>
            <div className="tip-desc" style={{ marginBottom: '16px' }}>
              {stats.pending > 0 
                ? 'There are new caretaker accounts waiting for verification. Please review their submitted details and approve or reject them to grant platform access.'
                : 'All caretaker registrations have been reviewed. No immediate action is required at this time.'}
            </div>
            <button 
              onClick={() => setActiveView && setActiveView('user_management')}
              style={{ padding: '8px 16px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', cursor: 'pointer', fontWeight: '600', fontSize: '13px', transition: 'all 0.2s ease', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              Go to User Management
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div>
          <div className="info-card">
            <h3 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 20px 0' }}>System Health Status</h3>
            <ul className="info-list">
              <li className="info-list-item">
                <div className="info-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg></div>
                Authentication Engine
              </li>
              <li className="info-list-item">
                <div className="info-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg></div>
                Realtime Database
              </li>
              <li className="info-list-item">
                <div className="info-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg></div>
                Activity Logging
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardContent;