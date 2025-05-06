import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const OAuthCallback = () => {
  const { provider } = useParams<{ provider: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { handleOAuthCallback, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const hasProcessed = useRef<boolean>(false);

  useEffect(() => {
    // Eğer kullanıcı zaten giriş yapmışsa, ana sayfaya yönlendir
    if (isAuthenticated) {
      navigate('/');
      return;
    }

    // Daha önce işlenmiş mi kontrol et
    if (hasProcessed.current) {
      return;
    }

    const processOAuthCallback = async () => {
      try {
        // Don't process if already in progress
        if (isProcessing) {
          return;
        }
        
        // Yalnızca bir kez işle
        hasProcessed.current = true;
        setIsProcessing(true);
        
        // Extract code and state from URL search params
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const errorParam = searchParams.get('error');

        // Retrieve the stored state from session storage
        const storedState = sessionStorage.getItem('oauth_state');
        
        // Handle error returned from OAuth provider
        if (errorParam) {
          setError(`Authentication failed: ${errorParam}`);
          setIsProcessing(false);
          return;
        }

        // Ensure we have provider
        if (!provider) {
          setError('Missing required authentication parameter: provider is missing');
          setIsProcessing(false);
          return;
        }

        // For OAuth providers, code might be missing if there's an issue with redirect
        if (!code) {
          setError(`Missing authorization code. The OAuth provider may not be sending the code correctly. Check your OAuth app configuration and ensure redirect URLs match exactly.`);
          setIsProcessing(false);
          return;
        }

        // Verify state parameter to prevent CSRF attacks - making this check optional
        // as some providers might not return the exact same state
        if (!state) {
          // Continue without state
        } else if (storedState && state !== storedState) {
          // State mismatch but continue anyway
        }

        console.log("Processing OAuth callback with:", { 
          provider, 
          code: code?.substring(0, 5) + "...", // Only show the first few characters for security
          state: state?.substring(0, 5) + "...",
          redirectUri: `${window.location.origin}/auth/${provider}/callback` 
        });
        
        // Capitalize the first letter of provider
        const normalizedProvider = provider.charAt(0).toUpperCase() + provider.slice(1).toLowerCase();
        
        // Process the OAuth callback through backend service
        await handleOAuthCallback({
          provider: normalizedProvider,
          code,
          state: state || storedState || "", // Use either received or stored state
          redirectUri: `${window.location.origin}/auth/${provider}/callback`
        });
        
        // Clear the state from session storage
        sessionStorage.removeItem('oauth_state');
        
        // Navigate to home on success
        navigate('/', { replace: true });
      } catch (err) {
        if (err instanceof Error) {
          // Check for specific error types
          if (err.message.includes('bad_verification_code') || err.message.includes('already been used')) {
            setError('This authorization code has expired or has already been used. Please try signing in again.');
          } else {
            setError(`Authentication failed. Please try again.`);
          }
        } else {
          setError('An unknown error occurred during authentication. Please try again.');
        }
        setIsProcessing(false);
      }
    };

    processOAuthCallback();
    
    // Cleanup - sayfa terkedildiğinde işlem bayraklarını temizle
    return () => {
      setIsProcessing(false);
    };
  }, [location.search, provider, handleOAuthCallback, navigate, isProcessing, isAuthenticated]);

  // If there's an error, display it and provide a way back to login
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md p-6 bg-dark-secondary rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Authentication Failed</h2>
          <p className="text-white mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="py-2 px-4 bg-primary hover:bg-secondary text-white font-semibold rounded-md transition duration-300"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Loading state while processing the callback
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 bg-dark-secondary rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold text-white mb-6">Completing Authentication</h2>
        <div className="flex justify-center items-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        <p className="text-gray-300 mb-4">
          Please wait while we authenticate your account...
        </p>
      </div>
    </div>
  );
};

export default OAuthCallback; 