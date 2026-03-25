import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, database } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { ref, get, set, serverTimestamp } from 'firebase/database';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    pageContainer: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6', fontFamily: '"Poppins", -apple-system, sans-serif', padding: '20px', boxSizing: 'border-box' },
    card: { display: 'flex', backgroundColor: '#FFFFFF', borderRadius: '20px', boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08)', overflow: 'hidden', width: '100%', maxWidth: '1040px', minHeight: '640px' },
    // 💡 FIX: Updated padding from 14px to 40px here to match the login page
    leftPanel: { flex: '1', padding: '34Px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
     rightPanel: { flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#6225C5', padding: '0', position: 'relative', overflow: 'hidden' },
    posterImage: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
    title: { fontSize: '32px', fontWeight: '800', color: '#111827', marginBottom: '8px', letterSpacing: '-0.02em' },
    subtitle: { fontSize: '15px', color: '#6B7280', marginBottom: '40px' },
    formGroup: { marginBottom: '24px' },
    inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
    input: (hasError) => ({ width: '100%', padding: '16px 18px', borderRadius: '12px', border: `1px solid ${hasError ? '#EF4444' : '#E5E7EB'}`, backgroundColor: '#FFFFFF', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#111827', fontFamily: '"Poppins", sans-serif' }),
    eyeIcon: { position: 'absolute', right: '16px', cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', transition: 'color 0.2s ease' },
    inlineError: { color: '#EF4444', fontSize: '13px', marginTop: '8px', marginLeft: '4px', fontWeight: '500' },
    mainError: { color: '#EF4444', fontSize: '14px', marginBottom: '24px', backgroundColor: '#FEE2E2', padding: '16px', borderRadius: '14px', textAlign: 'center', fontWeight: '500', border: '1px solid #FCA5A5' },
    buttonPrimary: { width: '100%', padding: '16px', borderRadius: '12px', backgroundColor: primaryColor, color: 'white', fontWeight: '600', border: 'none', cursor: isLoading ? 'wait' : 'pointer', marginTop: '8px', fontSize: '15px', opacity: isLoading ? 0.7 : 1, fontFamily: '"Poppins", sans-serif' },
    buttonGoogle: { width: '100%', padding: '16px', borderRadius: '12px', backgroundColor: '#FFFFFF', color: '#374151', fontWeight: '600', border: '1px solid #E5E7EB', cursor: isLoading ? 'wait' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', fontSize: '14px', fontFamily: '"Poppins", sans-serif' },
    divider: { display: 'flex', alignItems: 'center', textAlign: 'center', margin: '32px 0', color: '#9CA3AF', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' },
    line: { flex: 1, borderBottom: '1px solid #E5E7EB', margin: '0 15px' },
    footerText: { fontSize: '14px', color: '#6B7280', textAlign: 'center', marginTop: '40px' },
    link: { color: primaryColor, fontWeight: '600', textDecoration: 'none', marginLeft: '6px' }
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
          .unselectable-wrapper { user-select: none; -webkit-user-select: none; -ms-user-select: none; }
          .unselectable-wrapper input, .unselectable-wrapper button, .unselectable-wrapper a { user-select: auto; -webkit-user-select: auto; -ms-user-select: auto; }
          @keyframes microSlideRight { 0% { opacity: 0; transform: translateX(-8px); } 100% { opacity: 1; transform: translateX(0); } }
          @keyframes microFadeUp { 0% { opacity: 0; transform: translateY(6px); } 100% { opacity: 1; transform: translateY(0); } }
          .animate-page { animation: microSlideRight 0.4s ease-out forwards; will-change: transform, opacity; }
          .stagger-1 { opacity: 0; animation: microFadeUp 0.4s ease-out 0.05s forwards; }
          .stagger-2 { opacity: 0; animation: microFadeUp 0.4s ease-out 0.1s forwards; }
          .stagger-3 { opacity: 0; animation: microFadeUp 0.4s ease-out 0.15s forwards; }
          .stagger-4 { opacity: 0; animation: microFadeUp 0.4s ease-out 0.2s forwards; }
          .modern-input { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
          .modern-input:focus { border-color: #8B5CF6 !important; box-shadow: none !important; }
          .modern-btn { transition: transform 0.2s ease, box-shadow 0.2s ease; }
          .modern-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px -2px rgba(139, 92, 246, 0.3) !important; }
          .google-btn { transition: transform 0.2s ease, background-color 0.2s ease; }
          .google-btn:hover:not(:disabled) { background-color: #F9FAFB !important; transform: translateY(-1px); }
          .eye-icon:hover { color: #6B7280 !important; }
          
          /* RESPONSIVE QUERIES */
          @media (max-width: 800px) {
            .right-panel { display: none !important; }
            .left-panel { padding: 30px 20px !important; }
            .responsive-card { min-height: auto !important; }
          }
        `}
      </style>

      <div className="unselectable-wrapper" style={styles.pageContainer}>
        <div style={styles.card} className="animate-page responsive-card">
          <div style={styles.leftPanel} className="left-panel">
            <div className="stagger-1">
              <h1 style={styles.title}>Welcome Back, MSWD!</h1>
              <p style={styles.subtitle}>Log in to the Seelai Control Center.</p>
              {firebaseError && <div style={styles.mainError}>{firebaseError}</div>}
            </div>

            <form onSubmit={handleSubmit} noValidate className="stagger-2">
              <div style={styles.formGroup}>
                <input type="email" placeholder="Email Address" style={styles.input(errors.email)} className="modern-input" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
                {errors.email && <div style={styles.inlineError}>{errors.email}</div>}
              </div>
              
              <div style={styles.formGroup}>
                <div style={styles.inputWrapper}>
                  <input type={showPassword ? "text" : "password"} placeholder="Password" style={{...styles.input(errors.password), paddingRight: '48px'}} className="modern-input" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
                  <div style={styles.eyeIcon} className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </div>
                </div>
                {errors.password && <div style={styles.inlineError}>{errors.password}</div>}
              </div>

              <button type="submit" style={styles.buttonPrimary} className="modern-btn" disabled={isLoading}>
                {isLoading ? 'Authenticating...' : 'Login'}
              </button>
            </form>

            <div style={styles.divider} className="stagger-3">
              <div style={styles.line}></div>OR<div style={styles.line}></div>
            </div>

            <div className="stagger-4">
              <button onClick={handleGoogleAuth} type="button" style={styles.buttonGoogle} className="google-btn" disabled={isLoading}>
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
          </div>

          <div style={styles.rightPanel} className="right-panel">
              <img src="/assets/logo.png" alt="Seelai Visual" style={styles.posterImage} />
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;