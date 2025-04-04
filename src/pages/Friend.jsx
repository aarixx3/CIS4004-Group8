import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import styles from './Friends.module.css';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Friends() {
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [emailToInvite, setEmailToInvite] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const fetchFriends = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('friends')
      .select(`
        id,
        user_id,
        friend_id,
        user:profiles!user_id(email),
        friend:profiles!friend_id(email)
      `)
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch friends error:', error.message);
    } else {
      setFriends(data || []);
    }
  };

  const fetchInvites = async () => {
    if (!user) return;
    const { data: invites, error } = await supabase
      .from('invitations')
      .select('id, sender_id, receiver_id, sender:profiles!sender_id(email)')
      .eq('receiver_id', user.id);

    if (error) {
      console.error('Error fetching invitations:', error.message);
    } else {
      setInvitations(invites || []);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchInvites();
    }
  }, [user]);

  const handleInvite = async () => {
    if (!emailToInvite || !user) return;

    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', emailToInvite)
      .single();

    if (!targetProfile) {
      setMessage('No user with that email found.');
      return;
    }

    if (targetProfile.id === user.id) {
      setMessage('You cannot add yourself as a friend.');
      return;
    }
    const alreadyFriends = friends.some(
      (f) =>
        (f.user_id === user.id && f.friend_id === targetProfile.id) ||
        (f.friend_id === user.id && f.user_id === targetProfile.id)
    );
    if (alreadyFriends) {
      setMessage('You are already friends with this user.');
      return;
    }
    const { data: existingInvite } = await supabase
      .from('invitations')
      .select('*')
      .or(
        `sender_id.eq.${user.id},receiver_id.eq.${targetProfile.id}`,
        `sender_id.eq.${targetProfile.id},receiver_id.eq.${user.id}`
      )
      .maybeSingle();

    if (existingInvite) {
      setMessage('There is already a pending invitation.');
      return;
    }

    const { error } = await supabase.from('invitations').insert({
      sender_id: user.id,
      receiver_id: targetProfile.id,
    });

    if (!error) {
      setMessage('Invitation sent successfully!');
      setEmailToInvite('');
      fetchInvites();
    } else {
      setMessage('Failed to send invitation.');
    }
  };

  const handleAccept = async (inviteId, senderId) => {
    if (!user) return;

    await supabase.from('friends').insert([
      { user_id: user.id, friend_id: senderId },
      { user_id: senderId, friend_id: user.id },
    ]);

    await supabase.from('invitations').delete().eq('user_id', inviteId);
    setMessage('Friend added!');
    fetchFriends();
    fetchInvites();
  };

  const handleReject = async (inviteId) => {
    await supabase.from('invitations').delete().eq('user_id', inviteId);
    setMessage('Invitation rejected.');
    fetchInvites();
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}> 
        <h1>Friends</h1>
        <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
      </div>

      <div className={styles.inviteSection}>
        <input
          type="email"
          placeholder="Enter email to invite"
          value={emailToInvite}
          onChange={(e) => setEmailToInvite(e.target.value)}
          className={styles.inviteInput}
        />
        <button onClick={handleInvite} className={styles.inviteButton}>Send Invite</button>
        {message && <p className={styles.message}>{message}</p>}
      </div>

      <div className={styles.cardWrapper}>
        <h2>Your Friends</h2>
        {friends.length === 0 ? (
          <p>No friends yet.</p>
        ) : (
          <ul>
            {friends.map((f) => {
              const otherEmail = f.user_id === user.id ? f.friend?.email : f.user?.email;
              return <li key={f.id}>{otherEmail}</li>;
            })}
          </ul>
        )}
      </div>

      <div className={styles.cardWrapper}>
        <h2>Pending Invitations</h2>
        {invitations.length === 0 ? (
          <p>No pending invites.</p>
        ) : (
          <ul>
            {invitations.map((inv) => (
              <li key={inv.id}>
                📩 {inv.sender?.email}
                <button onClick={() => handleAccept(inv.user_id, inv.sender_id)}>Accept</button>
                <button onClick={() => handleReject(inv.user_id)}>Reject</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
