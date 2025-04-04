import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Lottie from 'lottie-react';
import leftAnimation from '../assets/water-animation.json';
import formAnimation from '../assets/form-water-animation.json';
import styles from './Auth.module.css';
import { useNavigate } from 'react-router-dom'; 
export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleAuth = async () => {
    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(isSignUp ? 'Check your email to confirm.' : 'Login successful!');
      setMessage('Login successful!');
      navigate('/dashboard');
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.leftPanel}>
        <Lottie animationData={leftAnimation} loop />
      </div>
      <div className={styles.rightPanel}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <div className={styles.iconBox}>
              <Lottie animationData={formAnimation} loop />
            </div>
            <h2>{isSignUp ? 'Sign Up' : 'Login'}</h2>
          </div>

          <input
            type="email"
            placeholder="Email"
            className={styles.input}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className={styles.input}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className={styles.button} onClick={handleAuth}>
            {isSignUp ? 'Create Account' : 'Login'}
          </button>

          <p className={styles.toggle} onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign up"}
          </p>

          {message && <p className={styles.message}>{message}</p>}
        </div>
      </div>
    </div>
  );
}
