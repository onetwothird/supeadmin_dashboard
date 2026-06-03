// C:\seelai-web-dashboard\src\auth\login.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, database } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import '../styles/auth.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [firebaseError, setFirebaseError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null); 

  useEffect(() => {
    if (sessionStorage.getItem('showLogoutToast') === 'true') {
      setToast({ message: 'Logged out successfully.', type: 'info' });
      sessionStorage.removeItem('showLogoutToast'); 
      setTimeout(() => setToast(null), 3000);
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!password) newErrors.password = "Password is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRoleRouting = async (user) => {
    // Check Superadmin
    const superadminRef = ref(database, `user_info/superadmin/${user.uid}`);
    const superadminSnap = await get(superadminRef);

    if (superadminSnap.exists() && superadminSnap.val().role === 'superadmin') {
      return { route: '/admin', name: superadminSnap.val().name || user.displayName || 'Admin' };
    }

    // Check MSWD fallback
    const mswdRef = ref(database, `user_info/mswd/${user.uid}`);
    const mswdSnap = await get(mswdRef);

    if (mswdSnap.exists() && mswdSnap.val().role === 'admin') {
      return { route: '/admin', name: mswdSnap.val().name || user.displayName || 'MSWD Admin' };
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFirebaseError('');
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const authData = await handleRoleRouting(userCredential.user);

      if (!authData) {
        await signOut(auth); // Sign them out immediately
        throw new Error("Access denied. Authorized admin account required.");
      }

      setToast({ message: `Welcome back, ${authData.name}!`, type: 'success' });
      setTimeout(() => navigate(authData.route), 1500);

    } catch (err) {
      setFirebaseError(err.message.replace('Firebase: ', ''));
      setIsLoading(false);
    } 
  };

  const handleGoogleAuth = async () => {
    setFirebaseError('');
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const authData = await handleRoleRouting(user);

      if (!authData) {
        // STRICT VALIDATION: Do NOT create an account. Kick them out.
        await signOut(auth);
        throw new Error("Access denied. Your Google account is not mapped to an Admin or MSWD role.");
      } 
      
      setToast({ message: `Welcome back, ${authData.name}!`, type: 'success' });
      setTimeout(() => navigate(authData.route), 1500);
      
    } catch (err) {
      setFirebaseError(err.message.replace('Firebase: ', ''));
      setIsLoading(false);
    } 
  };

  return (
    <>
      {toast && (
        <div className="custom-toast">
          {toast.type === 'success' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          )}
          {toast.message}
        </div>
      )}

      <div className="unselectable-wrapper page-container">
        <div className="auth-card animate-page login-error">
          <div className="left-panel">
            <div className="stagger-1">
              <h1 className="auth-title">Welcome Back, MSWD!</h1>
              <p className="auth-subtitle">Log in to the Seelai Control Center.</p>
              {firebaseError && <div className="main-error login-style">{firebaseError}</div>}
            </div>

            <form onSubmit={handleSubmit} noValidate className="stagger-2">
              <div className="form-group">
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className={`modern-input ${errors.email ? 'input-error' : ''}`}
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  disabled={isLoading} 
                />
                {errors.email && <div className="inline-error">{errors.email}</div>}
              </div>
              
              <div className="form-group">
                <div className="input-wrapper">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                    className={`modern-input password-input ${errors.password ? 'input-error' : ''}`}
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    disabled={isLoading} 
                  />
                  <div className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </div>
                </div>
                {errors.password && <div className="inline-error">{errors.password}</div>}
              </div>

              <button type="submit" className="modern-btn" disabled={isLoading}>
                {isLoading ? 'Authenticating...' : 'Login'}
              </button>
            </form>

            <div className="auth-divider stagger-3">
              <div className="line"></div>OR<div className="line"></div>
            </div>

            <div className="stagger-4">
              <button onClick={handleGoogleAuth} type="button" className="google-btn" disabled={isLoading}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>

              <div className="footer-text">
                Don't have an admin account? <Link to="/register" className="footer-link">Register</Link>
              </div>
            </div>
          </div>

          <div className="right-panel login-bg">
              <img src="/assets/logo.png" alt="Seelai Visual" className="poster-image" />
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;