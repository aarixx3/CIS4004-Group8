import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import styles from './Dashboard.module.css';
import { useNavigate } from 'react-router-dom';
import { Bell, User, Trophy, Users, AlertTriangle } from 'lucide-react';

const quotes = [
  "Stay hydrated, stay healthy!",
  "Water is life — drink more of it!",
  "Sip smart, feel better!",
  "Every drop counts — keep sipping!",
  "Hydration = Energy + Focus!",
  "A hydrated body is a happy body."
];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [logs, setLogs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDateTotal, setSelectedDateTotal] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [quote, setQuote] = useState('');
  const [reminder, setReminder] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showCustomAlert, setShowCustomAlert] = useState(true);
  const [customAlertMsg, setCustomAlertMsg] = useState('🌊 Welcome to Hydration Tracker! Enjoy the refreshing blue theme designed to encourage healthy habits.');
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [reminderEnabled, setReminderEnabled] = useState(true);

  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().toISOString().slice(0, 7);
  const navigate = useNavigate();
  const notificationRef = useRef();

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

      if (userData.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('daily_goal, reminders_enabled')
          .eq('id', userData.user.id)
          .single();

        if (profileData?.daily_goal) {
          setDailyGoal(profileData.daily_goal);
        }

        if (profileData?.reminders_enabled !== undefined) {
          setReminderEnabled(profileData.reminders_enabled);
        }
      }
    };
    fetchUserAndProfile();
  }, []);

  useEffect(() => {
    if (!reminderEnabled) return;

    const interval = setInterval(() => {
      setReminder("💺 Time to take a short break and stretch!");
      if (Notification.permission === "granted") {
        new Notification("💧 Time to drink water and take a short break!");
        setShowCustomAlert(true);
        setCustomAlertMsg('💧 Time to drink water and take a short break!');
      }
    }, 60 * 60 * 1000);

    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    return () => clearInterval(interval);
  }, [reminderEnabled]);

  const insertNotification = async (recipientId, senderId, message) => {
    await supabase.from('notifications').insert({
      recipient_id: recipientId,
      sender_id: senderId,
      message,
    });
  };

  const logWater = async () => {
    const parsed = parseInt(amount);
    if (!amount || !user || parsed < 50 || parsed > 500) {
      setShowCustomAlert(true);
      setCustomAlertMsg('⚠️ Please enter a value between 50ml and 500ml.');
      return;
    }

    const { error } = await supabase.from('hydration_logs').insert({
      user_id: user.id,
      date: today,
      amount: parsed,
    });

    if (!error) {
      setAmount('');

      const todayLogs = logs.filter((log) => log.date === today);
      const currentTotal = todayLogs.reduce((sum, log) => sum + log.amount, 0);
      const newTotal = currentTotal + parsed;

      if (newTotal >= dailyGoal) {
        await insertNotification(user.id, user.id, "🎉 You've hit your daily water goal!");

        const { data: otherUsers } = await supabase
          .from('hydration_logs')
          .select('user_id')
          .neq('user_id', user.id)
          .limit(50);

        const uniqueUserIds = [...new Set((otherUsers || []).map((u) => u.user_id))];
        for (const uid of uniqueUserIds) {
          await insertNotification(uid, user.id, `🎉 Your friend reached their daily hydration goal!`);
        }
      }

      await fetchLogs();
      await fetchNotifications();
    }
  };

  const fetchLogs = async () => {
    if (!user) return;
    const { data } = await supabase.from('hydration_logs').select('*').eq('user_id', user.id);
    if (data) setLogs(data);
  };

  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    setNotifications(data || []);
  };

  useEffect(() => {
    if (user) {
      fetchLogs();
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    const total = logs
      .filter((log) => log.date === selectedDate)
      .reduce((sum, log) => sum + log.amount, 0);
    setSelectedDateTotal(total);
  }, [logs, selectedDate]);

  const logsByDate = logs.reduce((acc, log) => {
    acc[log.date] = (acc[log.date] || 0) + log.amount;
    return acc;
  }, {});

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (!user) return <p>Loading... Please <a href="/">log in</a>.</p>;

  return (
    <div className={styles.pageWrapper}>
      {showCustomAlert && (
        <div className={styles.customAlert}>
          <div className={styles.alertContent}>
            <AlertTriangle size={20} style={{ color: '#0077b6' }} />
            <span>{customAlertMsg}</span>
            <button className={styles.alertClose} onClick={() => setShowCustomAlert(false)}>X</button>
          </div>
        </div>
      )}

      <header className={styles.header}>
        <h1>Hydration Tracker</h1>
        <div className={styles.navLinks}>
          <button onClick={() => navigate('/profile')}><User size={16} /> Profile</button>
          <button onClick={() => navigate('/achievements')}><Trophy size={16} /> Achievements</button>
          <button onClick={() => navigate('/friends')}><Users size={16} /> Friends</button>
          <button onClick={() => setShowNotifications(!showNotifications)}><Bell size={16} /> Notifications</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className={styles.dashboardWrapper}>
        <div className={styles.leftPanel}>
          <div className={styles.motivationQuote}>
            <p>{quote}</p>
          </div>

          <h2>{selectedDate}</h2>
          <h3>Consumed: {selectedDateTotal} ml</h3>
          <h4>Remaining: {Math.max(dailyGoal - selectedDateTotal, 0)} ml</h4>

          <input
            className={styles.input}
            type="number"
            placeholder="Add water (50–500 ml)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button className={styles.button} onClick={logWater}>
            Log Water
          </button>
        </div>

        <div className={styles.rightPanel}>
          <h2>Hydration History - {selectedDate}</h2>

          <ul className={styles.logList}>
            {logs
              .filter((log) => log.date === selectedDate)
              .map((log) => (
                <li className={styles.logItemCard} key={log.id}>
                  {log.date}: {log.amount} ml
                </li>
              ))}
          </ul>

          <h3>Calendar</h3>
          <div className={styles.calendarGrid}>
            {[...Array(31)].map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentMonth}-${day.toString().padStart(2, '0')}`;
              const total = logsByDate[dateStr] || 0;
              const percent = Math.min((total / dailyGoal) * 100, 100).toFixed(0);
              const color = percent >= 100 ? '#4caf50' : percent >= 50 ? '#ffc107' : '#f44336';
              return (
                <div
                  key={dateStr}
                  className={styles.calendarCell}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedDate(dateStr)}
                >
                  <strong>{day}</strong>
                  <p>{percent}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showNotifications && (
        <div className={styles.notificationPopup} ref={notificationRef}>
          <h4>Notifications</h4>
          <p>{reminder}</p>
          {notifications.map((note) => (
            <p key={note.id}>🔔 {note.message}</p>
          ))}
        </div>
      )}
    </div>
  );
}
