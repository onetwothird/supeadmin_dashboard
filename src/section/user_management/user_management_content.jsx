import React, { useState, useEffect } from 'react';
import { ref, onValue, update, serverTimestamp } from 'firebase/database';
import { database } from '../../firebase';

function UserManagement({ logActivity }) {
  const [activeTab, setActiveTab] = useState('pending'); 
  const [pendingCaretakers, setPendingCaretakers] = useState([]);
  const [activeCaretakers, setActiveCaretakers] = useState([]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  useEffect(() => {
    const caretakersRef = ref(database, 'user_info/caretaker');
    const unsubscribe = onValue(caretakersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const pending = [];
        const active = [];
        Object.keys(data).forEach(userId => {
          const user = { id: userId, ...data[userId] };
          if (user.approved === false && user.rejected !== true) { pending.push(user); } 
          else if (user.approved === true) { active.push(user); }
        });
        pending.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        active.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setPendingCaretakers(pending);
        setActiveCaretakers(active);
      } else {
        setPendingCaretakers([]);
        setActiveCaretakers([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleApprove = async (user) => {
    if (window.confirm(`Are you sure you want to approve ${user.name}?`)) {
      try {
        await update(ref(database, `user_info/caretaker/${user.id}`), { approved: true, approvedAt: serverTimestamp(), updatedAt: serverTimestamp() });
        if (logActivity) logActivity(`Approved caretaker: ${user.name}`);
      // eslint-disable-next-line no-unused-vars
      } catch (error) { alert("Failed to approve user."); }
    }
  };

  const handleReject = async (user) => {
    const reason = window.prompt(`Please provide a reason for rejecting ${user.name}:`, "Information mismatch.");
    if (reason !== null) { 
      try {
        await update(ref(database, `user_info/caretaker/${user.id}`), { approved: false, rejected: true, rejectionReason: reason || 'Not specified', rejectedAt: serverTimestamp(), updatedAt: serverTimestamp() });
        if (logActivity) logActivity(`Rejected caretaker: ${user.name}`);
      // eslint-disable-next-line no-unused-vars
      } catch (error) { alert("Failed to reject user."); }
    }
  };

  const tabStyle = (isActive) => ({
    padding: '12px 24px', cursor: 'pointer', fontWeight: isActive ? '600' : '500', fontSize: '14px',
    borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
    color: isActive ? 'var(--primary)' : 'var(--text-muted)',
    transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '8px'
  });

  return (
    <div className="main-content">
      <div className="header-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
        User Management
      </div>
      <h1 className="page-title">Caretaker Approvals</h1>
      <p className="page-subtitle">Review, approve, or reject new caretaker registrations to ensure patient safety.</p>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '32px' }}>
        <div style={tabStyle(activeTab === 'pending')} onClick={() => setActiveTab('pending')}>
          Pending Approvals <span style={{ background: activeTab === 'pending' ? 'var(--primary)' : 'var(--border-color)', color: activeTab === 'pending' ? 'white' : 'var(--text-muted)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>{pendingCaretakers.length}</span>
        </div>
        <div style={tabStyle(activeTab === 'active')} onClick={() => setActiveTab('active')}>
          Active Caretakers <span style={{ background: activeTab === 'active' ? 'var(--primary)' : 'var(--border-color)', color: activeTab === 'active' ? 'white' : 'var(--text-muted)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>{activeCaretakers.length}</span>
        </div>
      </div>

      {activeTab === 'pending' && (
        <div>
          {pendingCaretakers.length === 0 ? (
            <div style={{ padding: '64px', textAlign: 'center', background: 'var(--card-bg)', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)', margin: '0 0 8px 0' }}>All Caught Up!</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>There are no pending caretaker accounts awaiting your review.</p>
            </div>
          ) : (
            <div className="cards-grid">
              {pendingCaretakers.map(user => (
                <div key={user.id} className="info-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 0 }}>
                  <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', background: 'var(--bg-color)' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)', margin: '0 0 4px 0' }}>{user.name}</h3>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{user.email}</div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '600', padding: '4px 8px', background: 'var(--primary-bg)', color: 'var(--primary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>Review Required</span>
                  </div>
                  
                  <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
                    <div><span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>ID Number</span><strong style={{ color: 'var(--text-main)', fontWeight: '500' }}>{user.idNumber || 'N/A'}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Phone / Contact</span><strong style={{ color: 'var(--text-main)', fontWeight: '500' }}>{user.phone || user.contactNumber || 'N/A'}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Relationship</span><strong style={{ color: 'var(--text-main)', fontWeight: '500' }}>{user.relationship || 'N/A'}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Demographics</span><strong style={{ color: 'var(--text-main)', fontWeight: '500' }}>{user.sex || 'N/A'} • {user.age ? `${user.age} yrs` : 'N/A'}</strong></div>
                    <div style={{ gridColumn: 'span 2' }}><span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Address</span><strong style={{ color: 'var(--text-main)', fontWeight: '500' }}>{user.address || 'N/A'}</strong></div>
                  </div>

                  <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px', background: 'var(--bg-color)' }}>
                    <button onClick={() => handleApprove(user)} style={{ flex: 1, padding: '10px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer', transition: 'opacity 0.2s' }} onMouseOver={(e) => e.target.style.opacity = '0.9'} onMouseOut={(e) => e.target.style.opacity = '1'}>Approve</button>
                    <button onClick={() => handleReject(user)} style={{ flex: 1, padding: '10px', background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '6px', fontWeight: '500', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background = 'var(--hover-bg)'} onMouseOut={(e) => e.target.style.background = 'transparent'}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'active' && (
        <div className="info-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ borderBottom: '1px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Profile</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Contact & Location</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Platform Activity</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Verification Details</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Account Status</th>
              </tr>
            </thead>
            <tbody>
              {activeCaretakers.map((user, index) => (
                <tr key={user.id} style={{ borderBottom: index !== activeCaretakers.length - 1 ? '1px solid var(--border-color)' : 'none', transition: 'background-color 0.2s', ':hover': { backgroundColor: 'var(--hover-bg)' } }}>
                  <td style={{ padding: '20px 24px', verticalAlign: 'top' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>{user.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{user.email}</div>
                    <span style={{ fontSize: '11px', color: 'var(--primary)', background: 'var(--primary-bg)', padding: '2px 6px', borderRadius: '4px', fontWeight: '500' }}>
                      {user.sex || 'N/A'} • {user.age ? `${user.age} yrs` : 'N/A'}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px', verticalAlign: 'top' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '500', marginBottom: '4px' }}>{user.phone || user.contactNumber || 'No phone'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '180px', lineHeight: '1.4' }}>{user.address || 'No address provided'}</div>
                  </td>
                  <td style={{ padding: '20px 24px', verticalAlign: 'top' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--bg-color)', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)' }}>{user.assignedPatients ? Object.keys(user.assignedPatients).length : 0} Patients</span>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', verticalAlign: 'top' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-main)', marginBottom: '4px' }}><span style={{ color: 'var(--text-muted)', marginRight: '6px' }}>REL:</span><strong style={{ fontWeight: '500' }}>{user.relationship || 'N/A'}</strong></div>
                    <div style={{ fontSize: '12px', color: 'var(--text-main)' }}><span style={{ color: 'var(--text-muted)', marginRight: '6px' }}>ID:</span><strong style={{ fontWeight: '500' }}>{user.idNumber || 'N/A'}</strong></div>
                  </td>
                  <td style={{ padding: '20px 24px', verticalAlign: 'top' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '600', padding: '4px 10px', background: 'var(--primary-bg)', color: 'var(--primary)', borderRadius: '20px', marginBottom: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }}></div> Active
                    </span>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatDate(user.approvedAt || user.createdAt)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UserManagement;