import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import styles from './Achievements.module.css';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Achievements() {
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);

      if (userData.user) {
        const { data: hydration } = await supabase
          .from('hydration_logs')
          .select('*')
          .eq('user_id', userData.user.id);
        setLogs(hydration || []);
      }
    };
    fetchData();
  }, []);

  const dailyTotals = logs.reduce((acc, log) => {
    acc[log.date] = (acc[log.date] || 0) + log.amount;
    return acc;
  }, {});

  const streak = Object.values(dailyTotals).length;
  const totalLogged = logs.reduce((sum, log) => sum + log.amount, 0);
  const daysLogged = new Set(logs.map(log => log.date)).size;

  const shareText = `🏆 My Hydration Achievements:\n🔥 ${streak} Day Streak\n💧 ${totalLogged} ml\n📅 ${daysLogged} Days Logged\nStay hydrated!`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Hydration Achievements',
        text: shareText
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert("📋 Copied your achievements! Share with friends 🎉");
    }
  };

  if (!user) return <p>Loading achievements...</p>;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
        <h1>Your Achievements</h1>
      </div>

      <div className={styles.achievementGrid}>
        <div className={styles.card}>
          <div className={styles.badge}>🔥</div>
          <h2>{streak} Day Streak</h2>
          <p>Stay consistent and hydrated every day!</p>
        </div>
        <div className={styles.card}>
          <div className={styles.badge}>💧</div>
          <h2>{totalLogged} ml Logged</h2>
          <p>Total water you've logged!</p>
        </div>
        <div className={styles.card}>
          <div className={styles.badge}>📅</div>
          <h2>{daysLogged} Days Tracked</h2>
          <p>You’ve tracked hydration for {daysLogged} day{daysLogged !== 1 ? 's' : ''}!</p>
        </div>
      </div>

      <div className={styles.shareSection}>
        <button className={styles.shareButton} onClick={handleShare}>
          🔗 Share with Friends
        </button>
      </div>
    </div>
  );
}
