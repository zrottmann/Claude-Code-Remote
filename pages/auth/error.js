import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function AuthError() {
  const router = useRouter();
  const [error, setError] = useState('Authentication failed');

  useEffect(() => {
    const { error: errorParam } = router.query;
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [router.query]);

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h2>Authentication Error</h2>
      <p>{error}</p>
      <button onClick={() => router.push('/login')}>
        Try Again
      </button>
    </div>
  );
}
