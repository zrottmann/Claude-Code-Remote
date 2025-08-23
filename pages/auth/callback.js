import { useEffect } from 'react';
import EasyAppwriteSSO from '../../lib/easy-appwrite-sso';

export default function AuthCallback() {
  useEffect(() => {
    const sso = new EasyAppwriteSSO();
    sso.handleCallback();
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h2>Completing sign in...</h2>
      <p>Please wait while we redirect you.</p>
    </div>
  );
}
