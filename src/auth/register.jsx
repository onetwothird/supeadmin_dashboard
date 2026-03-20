//C:\seelai-web-dashboard\src\auth\register.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, database } from '../firebase';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth'; 
import { ref, set, serverTimestamp } from 'firebase/database';
import { Player } from '@lottiefiles/react-lottie-player';
// Notice we removed the import seelaiAnimation line completely!

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    successBanner: { color: '#065F46', fontSize: '14px', marginBottom: '20px', backgroundColor: '#D1FAE5', padding: '14px', borderRadius: '12px', textAlign: 'center', fontWeight: '600', border: '1px solid #6EE7B7' },
    buttonPrimary: { width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: primaryColor, color: 'white', fontWeight: '600', border: 'none', cursor: isLoading ? 'wait' : 'pointer', marginTop: '10px', fontSize: '16px', transition: 'background-color 0.2s ease', opacity: isLoading ? 0.7 : 1, boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' },
    footerText: { fontSize: '14px', color: '#6B7280', textAlign: 'center', marginTop: '32px' },
    link: { color: primaryColor, fontWeight: '600', textDecoration: 'none', marginLeft: '5px' }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        <div style={styles.leftPanel}>
          <h1 style={styles.title}>System Setup</h1>
          <p style={styles.subtitle}>Create a new Seelai master control account.</p>

          {firebaseError && <div style={styles.mainError}>{firebaseError}</div>}
          {successMessage && <div style={styles.successBanner}>{successMessage}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div style={styles.formGroup}>
              <input type="text" placeholder="Full Name" style={styles.input(errors.name)} value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
              {errors.name && <div style={styles.inlineError}>{errors.name}</div>}
            </div>

            <div style={styles.formGroup}>
              <input type="email" placeholder="Email Address" style={styles.input(errors.email)} value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
              {errors.email && <div style={styles.inlineError}>{errors.email}</div>}
            </div>
            
            <div style={styles.formGroup}>
              <input type="password" placeholder="Create Password (Min. 6 chars)" style={styles.input(errors.password)} value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
              {errors.password && <div style={styles.inlineError}>{errors.password}</div>}
            </div>

            <button type="submit" style={styles.buttonPrimary} disabled={isLoading}>
              {isLoading && !successMessage ? 'Processing...' : successMessage ? 'Success!' : 'Create Account'}
            </button>
          </form>

          <div style={styles.footerText}>
            Already have an account? <Link to="/login" style={styles.link}>Log In</Link>
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

export default Register;