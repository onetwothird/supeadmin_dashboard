//C:\seelai-web-dashboard\src\auth\login.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, database } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { ref, get, set, serverTimestamp } from 'firebase/database';
import { Player } from '@lottiefiles/react-lottie-player';
// Notice we removed the import seelaiAnimation line completely!

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [firebaseError, setFirebaseError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const primaryColor = '#8B5CF6';

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
    const superadminRef = ref(database, `user_info/superadmin/${user.uid}`);
    const superadminSnap = await get(superadminRef);

    if (superadminSnap.exists() && superadminSnap.val().role === 'superadmin') {
      navigate('/admin');
      return true;
    }

    const mswdRef = ref(database, `user_info/mswd/${user.uid}`);
    const mswdSnap = await get(mswdRef);

    if (mswdSnap.exists() && mswdSnap.val().role === 'admin') {
      navigate('/mswd');
      return true;
    }

    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFirebaseError('');
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const isAuthorized = await handleRoleRouting(userCredential.user);

      if (!isAuthorized) {
        await signOut(auth);
        throw new Error("Access denied. Authorized admin account required.");
      }
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

      const isAuthorized = await handleRoleRouting(user);

      if (!isAuthorized) {
        const newAdminRef = ref(database, `user_info/superadmin/${user.uid}`);
        await set(newAdminRef, {
          name: user.displayName || "Google Admin",
          email: user.email,
          role: "superadmin",
          department: "IT Control",
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        navigate('/admin');
      }
    } catch (err) {
      setFirebaseError(err.message.replace('Firebase: ', ''));
      setIsLoading(false);
    } 
  };

  const styles = {
    pageContainer: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F5F7', fontFamily: '"Inter", sans-serif', padding: '20px', boxSizing: 'border-box' },
    card: { display: 'flex', backgroundColor: '#FFFFFF', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)', overflow: 'hidden', width: '100%', maxWidth: '1000px', minHeight: '600px' },
    leftPanel: { flex: '1', padding: '48px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    rightPanel: { flex: '1', display: window.innerWidth > 768 ? 'flex' : 'none', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', borderLeft: '1px solid #F3F4F6' },
    lottieAnimation: { width: '80%', height: '80%', maxWidth: '400px' },
    title: { fontSize: '32px', fontWeight: '700', color: '#111827', marginBottom: '8px' },
    subtitle: { fontSize: '15px', color: '#6B7280', marginBottom: '32px' },
    formGroup: { marginBottom: '20px' },
    input: (hasError) => ({ width: '100%', padding: '14px 16px', borderRadius: '12px', border: `1.5px solid ${hasError ? '#EF4444' : '#E5E7EB'}`, backgroundColor: hasError ? '#FEF2F2' : '#F9FAFB', fontSize: '15px', outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s ease' }),
    inlineError: { color: '#EF4444', fontSize: '12px', marginTop: '6px', marginLeft: '4px', fontWeight: '500' },
    mainError: { color: '#EF4444', fontSize: '14px', marginBottom: '20px', backgroundColor: '#FEE2E2', padding: '14px', borderRadius: '12px', textAlign: 'center', fontWeight: '500', border: '1px solid #FCA5A5' },
    buttonPrimary: { width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: primaryColor, color: 'white', fontWeight: '600', border: 'none', cursor: isLoading ? 'wait' : 'pointer', marginTop: '10px', fontSize: '16px', transition: 'background-color 0.2s ease', opacity: isLoading ? 0.7 : 1, boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' },
    buttonGoogle: { width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#FFFFFF', color: '#374151', fontWeight: '600', border: '1px solid #D1D5DB', cursor: isLoading ? 'wait' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontSize: '15px', transition: 'background-color 0.2s ease' },
    divider: { display: 'flex', alignItems: 'center', textAlign: 'center', margin: '28px 0', color: '#9CA3AF', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' },
    line: { flex: 1, borderBottom: '1px solid #E5E7EB', margin: '0 15px' },
    footerText: { fontSize: '14px', color: '#6B7280', textAlign: 'center', marginTop: '32px' },
    link: { color: primaryColor, fontWeight: '600', textDecoration: 'none', marginLeft: '5px' }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        <div style={styles.leftPanel}>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Log in to the Seelai Control Center.</p>

          {firebaseError && <div style={styles.mainError}>{firebaseError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div style={styles.formGroup}>
              <input type="email" placeholder="Email Address" style={styles.input(errors.email)} value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
              {errors.email && <div style={styles.inlineError}>{errors.email}</div>}
            </div>
            
            <div style={styles.formGroup}>
              <input type="password" placeholder="Password" style={styles.input(errors.password)} value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
              {errors.password && <div style={styles.inlineError}>{errors.password}</div>}
            </div>

            <button type="submit" style={styles.buttonPrimary} disabled={isLoading}>
              {isLoading ? 'Authenticating...' : 'Login'}
            </button>
          </form>

          <div style={styles.divider}>
            <div style={styles.line}></div>OR<div style={styles.line}></div>
          </div>

          <button onClick={handleGoogleAuth} type="button" style={styles.buttonGoogle} disabled={isLoading}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>

          <div style={styles.footerText}>
            Don't have an admin account? <Link to="/register" style={styles.link}>Register</Link>
          </div>
        </div>

        <div style={styles.rightPanel}>
          {/* We now point directly to the file in the public folder */}
          <Player autoplay loop src="/Seelai.json" style={styles.lottieAnimation} />
        </div>
      </div>
    </div>
  );
}

export default Login;