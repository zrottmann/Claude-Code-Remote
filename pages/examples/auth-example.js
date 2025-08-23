/**
 * Easy Appwrite SSO Example for Claude Code Remote (Next.js)
 */

import { useState, useEffect } from 'react';
import EasyAppwriteSSO from '../lib/easy-appwrite-sso';
import EasySSOButton from '../components/EasySSOButton';

export default function AuthExample() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sso, setSSO] = useState(null);

  useEffect(() => {
    const ssoInstance = new EasyAppwriteSSO();
    setSSO(ssoInstance);

    ssoInstance.getUser()
      .then(setUser)
      .catch(() => {})
      .finally(() => setLoading(false));

    return ssoInstance.onAuthChange(setUser);
  }, []);

  if (loading) return <div>Loading...</div>;

  if (user) {
    return (
      <div>
        <h1>Welcome, {user.name}!</h1>
        <button onClick={() => sso.signOut().then(() => setUser(null))}>
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Sign In</h1>
      <EasySSOButton
        provider="google"
        onSuccess={setUser}
        onError={console.error}
      />
    </div>
  );
}
