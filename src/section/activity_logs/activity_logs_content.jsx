import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebase';

function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'Unknown Time';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric', 
      hour: 'numeric', minute: '2-digit', hour12: true 
    });
  };

  const getActionDetails = (actionStr) => {
    const lowerAction = actionStr.toLowerCase();
    let icon = <><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></>;
    
    if (lowerAction.includes('approve')) 
      icon = <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></>;
    else if (lowerAction.includes('reject')) 
      icon = <><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></>;
    else if (lowerAction.includes('login') || lowerAction.includes('auth')) 
      icon = <><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></>;
    else if (lowerAction.includes('model') || lowerAction.includes('colab') || lowerAction.includes('roboflow')) 
      icon = <><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></>;
    
    return { color: 'var(--primary)', bg: 'var(--primary-bg)', icon: icon };
  };

  useEffect(() => {
    const usersRef = ref(database, 'user_info');
    const logsRef = ref(database, 'activity_logs');

    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const tempUserMap = {};
        ['superadmin', 'mswd', 'caretaker', 'partially_sighted'].forEach(role => {
          if (data[role]) {
            Object.keys(data[role]).forEach(uid => { tempUserMap[uid] = { ...data[role][uid], specificRole: role }; });
          }
        });
        setUserMap(tempUserMap);
      }
    }, (error) => {
      console.error("Users Read Error:", error);
    });

    const unsubscribeLogs = onValue(logsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const rawLogs = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        rawLogs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setLogs(rawLogs);
      } else {
        setLogs([]);
      }
      setIsLoading(false);
      setErrorMsg('');
    }, (error) => {
      console.error("Logs Read Error:", error);
      setErrorMsg("Firebase Permission Denied: Superadmins may not have access to activity_logs rules.");
      setIsLoading(false);
    });

    return () => { unsubscribeUsers(); unsubscribeLogs(); };
  }, []);

  const filteredLogs = logs.filter(log => {
    const user = userMap[log.userId] || {};
    const searchString = `${log.action} ${user.name || ''} ${user.email || ''} ${user.specificRole || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  return (
    <div className="main-content" style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <div className="header-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            System Audit
          </div>
          <h1 className="page-title">Activity Logs</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Monitor real-time system events, administrative actions, and user lifecycle changes across the SEELAI platform.
          </p>
        </div>

        <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            placeholder="Search by name, action, or role..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Resets pagination instantly on search
            }}
            style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-main)', fontSize: '13px', boxSizing: 'border-box', outline: 'none', fontFamily: 'Poppins' }}
          />
        </div>
      </div>

      <div style={{ 
        background: 'var(--card-bg)', 
        border: '1px solid var(--border-color)', 
        borderRadius: '12px', 
        marginBottom: '40px', // FIX: Added margin-bottom so it doesn't touch the floor
        overflow: 'hidden'
      }}>
        <div style={{
          overflowY: 'auto', 
          maxHeight: 'calc(100vh - 320px)' // FIX: Made the table slightly shorter to enforce the margin
        }}>
          {isLoading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading logs...</div>
          ) : errorMsg ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#EF4444' }}>{errorMsg}</div>
          ) : filteredLogs.length === 0 ? (
            <div style={{ padding: '64px', textAlign: 'center', background: 'var(--card-bg)' }}>
               <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)', margin: '0 0 8px 0' }}>No activities found</h3>
               <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>We couldn't find any logs matching your search criteria.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ 
                position: 'sticky', 
                top: 0, 
                zIndex: 10, 
                background: 'var(--card-bg)', 
                boxShadow: 'inset 0 -1px 0 var(--border-color)' 
              }}>
                <tr>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Action Performed</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Initiated By</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.map((log, index) => {
                  const user = userMap[log.userId];
                  const actionData = getActionDetails(log.action);
                  
                  return (
                    <tr key={log.id} style={{ borderBottom: index !== currentLogs.length - 1 ? '1px solid var(--border-color)' : 'none', transition: 'background-color 0.2s', ':hover': { backgroundColor: 'var(--hover-bg)' } }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: actionData.bg, color: actionData.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              {actionData.icon}
                            </svg>
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>{log.action}</div>
                            {log.details && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{log.details}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        {user ? (
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-main)', marginBottom: '4px' }}>{user.name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', background: 'var(--hover-bg)', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                                {user.specificRole.replace('_', ' ')}
                              </span>
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</span>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-main)', marginBottom: '4px' }}>System</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: {log.userId}</div>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)' }}>
                        {formatDateTime(log.timestamp)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {!isLoading && filteredLogs.length > 0 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '16px 24px', 
            borderTop: '1px solid var(--border-color)',
            background: 'var(--card-bg)' 
          }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Showing {filteredLogs.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredLogs.length)} of {filteredLogs.length} entries
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '6px 12px',
                  fontSize: '13px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: currentPage === 1 ? 'transparent' : 'var(--card-bg)',
                  color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-main)',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1
                }}
              >
                Previous
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '6px 12px',
                  fontSize: '13px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: currentPage === totalPages ? 'transparent' : 'var(--card-bg)',
                  color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-main)',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivityLogs;