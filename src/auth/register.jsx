import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, database } from '../firebase';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth'; 
import { ref, set, serverTimestamp } from 'firebase/database';

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [errors, setErrors] = useState({});
  const [firebaseError, setFirebaseError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);

  const primaryColor = '#8B5CF6';

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Full Name is required.";
    
    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFirebaseError('');
    setSuccessMessage('');
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const newAdminRef = ref(database, `user_info/superadmin/${user.uid}`);
      await set(newAdminRef, {
        name: name.trim(),
        email: user.email,
        role: "superadmin",
        department: "IT Control",
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await signOut(auth);
      setSuccessMessage("Account successfully created! Redirecting to login...");
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setFirebaseError(err.message.replace('Firebase: ', ''));
      setIsLoading(false); 
    }
  };

  const styles = {
    pageContainer: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6', fontFamily: '"Inter", -apple-system, sans-serif', padding: '20px', boxSizing: 'border-box' },
    card: { display: 'flex', backgroundColor: '#FFFFFF', borderRadius: '28px', boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08)', overflow: 'hidden', width: '100%', maxWidth: '1040px', minHeight: '640px' },
    leftPanel: { flex: '1.2', padding: '64px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    rightPanel: { flex: '0.8', display: window.innerWidth > 768 ? 'flex' : 'none', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#FFFFFF', padding: '48px', textAlign: 'center', position: 'relative', overflow: 'hidden' },
    rightTitle: { fontSize: '40px', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '16px', position: 'relative', zIndex: 1 },
    rightSubtitle: { fontSize: '16px', lineHeight: '1.6', opacity: '0.9', maxWidth: '300px', position: 'relative', zIndex: 1 },
    title: { fontSize: '36px', fontWeight: '800', color: '#111827', marginBottom: '8px', letterSpacing: '-0.02em' },
    subtitle: { fontSize: '16px', color: '#6B7280', marginBottom: '40px' },
    formGroup: { marginBottom: '24px' },
    inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
    input: (hasError) => ({ width: '100%', padding: '16px 18px', borderRadius: '14px', border: `1.5px solid ${hasError ? '#EF4444' : '#E5E7EB'}`, backgroundColor: hasError ? '#FEF2F2' : '#F9FAFB', fontSize: '15px', outline: 'none', boxSizing: 'border-box', color: '#111827' }),
    eyeIcon: { position: 'absolute', right: '16px', cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', transition: 'color 0.2s ease' },
    inlineError: { color: '#EF4444', fontSize: '13px', marginTop: '8px', marginLeft: '4px', fontWeight: '500' },
    mainError: { color: '#EF4444', fontSize: '14px', marginBottom: '24px', backgroundColor: '#FEE2E2', padding: '16px', borderRadius: '14px', textAlign: 'center', fontWeight: '500', border: '1px solid #FCA5A5' },
    successBanner: { color: '#065F46', fontSize: '14px', marginBottom: '24px', backgroundColor: '#D1FAE5', padding: '16px', borderRadius: '14px', textAlign: 'center', fontWeight: '600', border: '1px solid #6EE7B7' },
    buttonPrimary: { width: '100%', padding: '16px', borderRadius: '14px', backgroundColor: primaryColor, color: 'white', fontWeight: '600', border: 'none', cursor: isLoading ? 'wait' : 'pointer', marginTop: '8px', fontSize: '16px', opacity: isLoading ? 0.7 : 1 },
    footerText: { fontSize: '15px', color: '#6B7280', textAlign: 'center', marginTop: '40px' },
    link: { color: primaryColor, fontWeight: '600', textDecoration: 'none', marginLeft: '6px' }
  };

  return (
    <>
      <style>
        {`
          .unselectable-wrapper { user-select: none; -webkit-user-select: none; -ms-user-select: none; }
          .unselectable-wrapper input, .unselectable-wrapper button, .unselectable-wrapper a { user-select: auto; -webkit-user-select: auto; -ms-user-select: auto; }

          /* TIGHTER, SMOOTHER ANIMATIONS */
          @keyframes microSlideLeft { 0% { opacity: 0; transform: translateX(8px); } 100% { opacity: 1; transform: translateX(0); } }
          @keyframes microFadeUp { 0% { opacity: 0; transform: translateY(6px); } 100% { opacity: 1; transform: translateY(0); } }
          @keyframes meshGradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
          
          /* Faster durations, quicker staggers, softer easing */
          .animate-page { animation: microSlideLeft 0.4s ease-out forwards; will-change: transform, opacity; }
          .stagger-1 { opacity: 0; animation: microFadeUp 0.4s ease-out 0.05s forwards; }
          .stagger-2 { opacity: 0; animation: microFadeUp 0.4s ease-out 0.1s forwards; }
          .stagger-3 { opacity: 0; animation: microFadeUp 0.4s ease-out 0.15s forwards; }
          
          .modern-input { transition: border-color 0.2s ease, background-color 0.2s ease; }
          .modern-input:focus { border-color: #8B5CF6 !important; box-shadow: none !important; background-color: #FFFFFF !important; }
          
          .modern-btn { transition: transform 0.2s ease, box-shadow 0.2s ease; }
          .modern-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px -4px rgba(139, 92, 246, 0.4) !important; }
          .modern-btn:active:not(:disabled) { transform: translateY(0); }
          
          .eye-icon:hover { color: #6B7280 !important; }

          .animated-gradient {
            background: linear-gradient(-45deg, #8B5CF6, #6D28D9, #4C1D95, #7C3AED);
            background-size: 300% 300%;
            animation: meshGradient 15s ease infinite; /* Slowed down for less distraction */
          }
        `}
      </style>

      <div className="unselectable-wrapper" style={styles.pageContainer}>
        <div style={styles.card} className="animate-page">
          <div style={styles.leftPanel}>
            <div className="stagger-1">
              <h1 style={styles.title}>System Setup</h1>
              <p style={styles.subtitle}>Create a new Seelai master control account.</p>
              {firebaseError && <div style={styles.mainError}>{firebaseError}</div>}
              {successMessage && <div style={styles.successBanner}>{successMessage}</div>}
            </div>

            <form onSubmit={handleSubmit} noValidate className="stagger-2">
              <div style={styles.formGroup}>
                <input type="text" placeholder="Full Name" style={styles.input(errors.name)} className="modern-input" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
                {errors.name && <div style={styles.inlineError}>{errors.name}</div>}
              </div>

              <div style={styles.formGroup}>
                <input type="email" placeholder="Email Address" style={styles.input(errors.email)} className="modern-input" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
                {errors.email && <div style={styles.inlineError}>{errors.email}</div>}
              </div>
              
              <div style={styles.formGroup}>
                <div style={styles.inputWrapper}>
                  <input type={showPassword ? "text" : "password"} placeholder="Create Password (Min. 6 chars)" style={{...styles.input(errors.password), paddingRight: '48px'}} className="modern-input" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
                  
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
                {isLoading && !successMessage ? 'Processing...' : successMessage ? 'Success!' : 'Create Account'}
              </button>
            </form>

            <div style={styles.footerText} className="stagger-3">
              Already have an account? <Link to="/login" style={styles.link}>Log In</Link>
            </div>
          </div>

          <div style={styles.rightPanel} className="animated-gradient">
              <h2 style={styles.rightTitle}>SEELAI</h2>
              <p style={styles.rightSubtitle}>Empowering independence and enhancing daily activities through vision AI.</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;