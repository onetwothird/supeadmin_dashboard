import React from 'react';

function DashboardContent({ userStats, setActiveView }) {
  // Defensive fallback just in case data hasn't loaded
  const stats = userStats || { total: 0, partially_sighted: 0, caretakers: 0, mswd: 0, pending: 0 };
  const mswdCount = Math.max(0, stats.total - stats.partially_sighted - stats.caretakers);

  return (
    <div className="main-content" style={{ padding: '40px 48px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Poppins, sans-serif' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#EFF6FF', color: '#3B82F6', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
        Overview
      </div>
      <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>System Dashboard</h1>
      <p style={{ fontSize: '15px', color: '#6B7280', margin: '0 0 40px 0', maxWidth: '600px', lineHeight: '1.6' }}>
        A real-time overview of the SEELAI platform, user registrations, and system health.
      </p>

      {/* METRIC CARDS - Styled exactly like the unselected Model Training cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
        
        <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Total Users
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#111827', lineHeight: '1' }}>{stats.total}</div>
        </div>

        <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            Partially Sighted
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#111827', lineHeight: '1' }}>{stats.partially_sighted}</div>
        </div>

        <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Caretakers
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#111827', lineHeight: '1' }}>{stats.caretakers}</div>
        </div>

        <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            MSWD / Admins
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#111827', lineHeight: '1' }}>{mswdCount}</div>
        </div>

      </div>

      {/* MATCHING GRID PROPORTIONS: 1.8fr 1fr */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '32px' }}>
        
        {/* LEFT COLUMN: Action Required */}
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 16px 0' }}>Action Required</h2>
          
          {/* Styled identically to the "Pro tip" box */}
          <div style={{ backgroundColor: '#FFFDF5', border: '1px solid #FEF3C7', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: '700', color: '#D97706', marginBottom: '12px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              {stats.pending > 0 ? `${stats.pending} Pending Caretaker Approvals` : 'No Pending Approvals'}
            </div>
            <div style={{ fontSize: '13px', color: '#B45309', lineHeight: '1.6', marginBottom: '20px' }}>
              {stats.pending > 0 
                ? 'There are new caretaker accounts waiting for verification. Please review their submitted details and approve or reject them to grant platform access.'
                : 'All caretaker registrations have been reviewed. No immediate action is required at this time.'}
            </div>
            
            <button 
              onClick={() => setActiveView && setActiveView('user_management')}
              style={{ 
                padding: '8px 16px', backgroundColor: '#FFFFFF', border: '1px solid #FDE68A', 
                borderRadius: '6px', color: '#92400E', cursor: 'pointer', fontWeight: '600',
                fontSize: '13px', transition: 'all 0.2s ease', display: 'inline-flex', alignItems: 'center', gap: '6px'
              }}
            >
              Go to User Management
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: System Health (Styled like "Live System Status") */}
        <div>
          <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px', background: '#FFFFFF' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: '0 0 20px 0' }}>System Health Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#4B5563' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                Authentication Engine
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#4B5563' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
                Realtime Database
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#4B5563' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                Activity Logging
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#4B5563' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                WebRTC Communications
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default DashboardContent;