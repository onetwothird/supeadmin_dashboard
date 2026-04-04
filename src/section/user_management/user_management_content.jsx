import React, { useState, useEffect } from 'react';
import { ref, onValue, update, serverTimestamp } from 'firebase/database';
import { database } from '../../firebase';
import '../../styles/user_management.css';

function UserManagement({ logActivity }) {
  const [activeTab, setActiveTab] = useState('pending'); 
  const [pendingCaretakers, setPendingCaretakers] = useState([]);
  const [activeCaretakers, setActiveCaretakers] = useState([]);

  // Helper to format dates
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Robust helper to check for empty strings from Firebase and apply fallback
  const getDisplayValue = (value, fallback = 'N/A') => {
    if (value === undefined || value === null) return fallback;
    if (typeof value === 'string' && value.trim() === '') return fallback;
    return value;
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
          
          if (user.approved === false && user.rejected !== true) { 
            pending.push(user); 
          } 
          else if (user.approved === true) { 
            active.push(user); 
          }
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
        await update(ref(database, `user_info/caretaker/${user.id}`), { 
          approved: true, 
          approvedAt: serverTimestamp(), 
          updatedAt: serverTimestamp() 
        });
        if (logActivity) logActivity(`Approved caretaker: ${user.name}`);
      } catch (error) { 
        console.error("Error approving caretaker:", error);
        alert("Failed to approve user."); 
      }
    }
  };

  const handleReject = async (user) => {
    const reason = window.prompt(`Please provide a reason for rejecting ${user.name}:`, "Information mismatch.");
    if (reason !== null) { 
      try {
        await update(ref(database, `user_info/caretaker/${user.id}`), { 
          approved: false, 
          rejected: true, 
          rejectionReason: reason || 'Not specified', 
          rejectedAt: serverTimestamp(), 
          updatedAt: serverTimestamp() 
        });
        if (logActivity) logActivity(`Rejected caretaker: ${user.name}`);
      } catch (error) { 
        console.error("Error rejecting caretaker:", error);
        alert("Failed to reject user."); 
      }
    }
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', width: '100%' }}>
      <div className="main-content" style={{ paddingBottom: '100px' }}>
        
        <div className="header-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
          User Management
        </div>
        <h1 className="page-title">Caretaker Approvals</h1>
        <p className="page-subtitle">Review, approve, or reject new caretaker registrations to ensure patient safety.</p>

        {/* Custom Tabs */}
        <div className="um-tabs-container">
          <div 
            className={`um-tab ${activeTab === 'pending' ? 'active' : ''}`} 
            onClick={() => setActiveTab('pending')}
          >
            Pending Approvals 
            <span className="um-badge">{pendingCaretakers.length}</span>
          </div>
          <div 
            className={`um-tab ${activeTab === 'active' ? 'active' : ''}`} 
            onClick={() => setActiveTab('active')}
          >
            Active Caretakers 
            <span className="um-badge">{activeCaretakers.length}</span>
          </div>
        </div>

        {/* Pending Tab Content */}
        {activeTab === 'pending' && (
          <div>
            {pendingCaretakers.length === 0 ? (
              <div className="um-empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <h3 className="um-empty-title">All Caught Up!</h3>
                <p className="um-empty-desc">There are no pending caretaker accounts awaiting your review at this time.</p>
              </div>
            ) : (
              <div className="um-grid">
                {pendingCaretakers.map(user => (
                  <div key={user.id} className="um-card">
                    <div className="um-card-header">
                      <div>
                        <h3 className="um-card-title">{getDisplayValue(user.name, 'Unknown User')}</h3>
                        <div className="um-card-subtitle">{getDisplayValue(user.email, 'No email')}</div>
                      </div>
                      <span className="um-status-badge">Review Required</span>
                    </div>
                    
                    <div className="um-card-body">
                      <div className="um-detail-group">
                        <span className="um-label">ID Number</span>
                        <span className="um-value">{getDisplayValue(user.idNumber)}</span>
                      </div>
                      <div className="um-detail-group">
                        <span className="um-label">Contact</span>
                        <span className="um-value">{getDisplayValue(user.phone || user.contactNumber, 'No contact info')}</span>
                      </div>
                      <div className="um-detail-group">
                        <span className="um-label">Relationship</span>
                        <span className="um-value">{getDisplayValue(user.relationship)}</span>
                      </div>
                      <div className="um-detail-group">
                        <span className="um-label">Demographics</span>
                        <span className="um-value">
                          {getDisplayValue(user.sex, 'Not Specified')} • {user.age ? `${user.age} yrs` : 'N/A'}
                        </span>
                      </div>
                      <div className="um-detail-group full-width">
                        <span className="um-label">Address</span>
                        <span className="um-value">{getDisplayValue(user.address, 'No address provided')}</span>
                      </div>
                    </div>

                    <div className="um-card-actions">
                      <button className="um-btn-approve" onClick={() => handleApprove(user)}>
                        Approve
                      </button>
                      <button className="um-btn-reject" onClick={() => handleReject(user)}>
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Active Tab Content */}
        {activeTab === 'active' && (
          <div className="um-table-container">
            <table className="um-table">
              <thead>
                <tr>
                  <th className="um-th">Profile</th>
                  <th className="um-th">Contact & Location</th>
                  <th className="um-th">Platform Activity</th>
                  <th className="um-th">Verification Details</th>
                  <th className="um-th">Account Status</th>
                </tr>
              </thead>
              <tbody>
                {activeCaretakers.map((user) => (
                  <tr key={user.id} className="um-tr">
                    <td className="um-td">
                      <div className="um-user-name">{getDisplayValue(user.name, 'Unknown User')}</div>
                      <div className="um-user-email">{getDisplayValue(user.email, 'No email')}</div>
                      <span className="um-demo-pill">
                        {getDisplayValue(user.sex, 'Not Specified')} • {user.age ? `${user.age} yrs` : 'N/A'}
                      </span>
                    </td>
                    
                    <td className="um-td">
                      <div className="um-contact-main">{getDisplayValue(user.phone || user.contactNumber, 'No contact info')}</div>
                      <div className="um-contact-sub">{getDisplayValue(user.address, 'No address provided')}</div>
                    </td>
                    
                    <td className="um-td">
                      <div className="um-patients-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        <span className="um-patients-text">
                          {user.assignedPatients ? Object.keys(user.assignedPatients).length : 0} Patients
                        </span>
                      </div>
                    </td>
                    
                    <td className="um-td">
                      <div className="um-info-row">
                        <span className="um-info-label">REL:</span>
                        <strong>{getDisplayValue(user.relationship)}</strong>
                      </div>
                      <div className="um-info-row">
                        <span className="um-info-label">ID:</span>
                        <strong>{getDisplayValue(user.idNumber)}</strong>
                      </div>
                    </td>
                    
                    <td className="um-td">
                      <div className="um-status-active">
                        <div className="um-status-dot"></div>
                        Active
                      </div>
                      <div className="um-date-text">
                        Approved: {formatDate(user.approvedAt || user.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))}
                
                {activeCaretakers.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                      No active caretakers found in the system.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserManagement;