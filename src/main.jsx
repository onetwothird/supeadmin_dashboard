import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';

// IMPORTANT: Put your Client ID here or in your .env file
const GOOGLE_CLIENT_ID = "985531066364-5hck5sakhct0j2keqkcdb2hca28mt260.apps.googleusercontent.com"; 

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <StrictMode>
      <App />
    </StrictMode>
  </GoogleOAuthProvider>,
)