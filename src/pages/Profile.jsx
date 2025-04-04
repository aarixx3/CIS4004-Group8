import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import styles from './Profile.module.css';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setEmail(user.email);

        const { data, error } = await supabase
          .from('profiles')
          .select('daily_goal, reminders_enabled')
          .eq('id', user.id)
          .single();

        if (data) {
          setDailyGoal(data.daily_goal || 2000);
          setReminderEnabled(data.reminders_enabled ?? true);
        }
      }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    if (!user) return;

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      email,
      daily_goal: dailyGoal,
      reminders_enabled: reminderEnabled,
    });

    if (!error) {
      setMessage('✅ Profile updated successfully!');
    } else {
      setMessage('❌ Failed to update profile.');
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.header}>
        <h1><User size={22} /> Hydration Tracker - Profile</h1>
      </header>

      <main className={styles.centerContent}>
        <div className={styles.profileCard}>
          <h2>Your Profile</h2>

          <label>Email:</label>
          <input type="text" value={email} disabled className={styles.input} />

          <label>Daily Water Goal (ml):</label>
          <input
            type="number"
            className={styles.input}
            value={dailyGoal}
            onChange={(e) => setDailyGoal(parseInt(e.target.value))}
          />

          <div className={styles.checkboxWrapper}>
            <input
              type="checkbox"
              checked={reminderEnabled}
              onChange={(e) => setReminderEnabled(e.target.checked)}
            />
            <span>Enable Reminders</span>
          </div>

          <button className={styles.saveButton} onClick={handleSave}>Save</button>
          {message && <p className={styles.message}>{message}</p>}
        </div>

        <button className={styles.backBtnBottom} onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </main>
    </div>
  );
}
