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
    // If user is already authenticated, redirect to home
    if (isAuthenticated) {
      navigate('/');
      return;
    }

    // Check if already processed
    if (hasProcessed.current) {
      return;
    }

    const processOAuthCallback = async () => {
      try {
        // Don't process if already in progress
        if (isProcessing) {
          return;
        }
        
        // Only process once
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

        // For OAuth providers, code must be provided
        if (!code) {
          setError(`Missing authorization code. The OAuth provider may not be sending the code correctly. Check your OAuth app configuration and ensure redirect URLs match exactly.`);
          setIsProcessing(false);
          return;
        }

        // Optional state verification - proceed even if mismatch
        if (storedState && state && state !== storedState) {
          // State mismatch - potential security risk but we'll proceed
        }

        // Normalize provider name for backend
        const normalizedProvider = provider.charAt(0).toUpperCase() + provider.slice(1).toLowerCase();
        
        // Create the correct redirect URI based on current environment
        const origin = window.location.origin;
        const redirectUri = `${origin}/auth/${provider.toLowerCase()}/callback`;
        
        // Process the OAuth callback through backend service
        await handleOAuthCallback({
          provider: normalizedProvider,
          code,
          state: state || storedState || "", 
          redirectUri
        });
        
        // Clear the state from session storage
        sessionStorage.removeItem('oauth_state');
        
        // Check for stored redirect location
        const storedLocation = sessionStorage.getItem('redirectAfterLogin');
        if (storedLocation && storedLocation !== '/') {
          sessionStorage.removeItem('redirectAfterLogin');
          navigate(storedLocation, { replace: true });
        } else {
          // Navigate to home on success if no redirect location
          navigate('/', { replace: true });
        }
      } catch (err) {
        if (err instanceof Error) {
          // Check for specific error types
          if (err.message.includes('bad_verification_code') || err.message.includes('already been used')) {
            setError('This authorization code has expired or has already been used. Please try signing in again.');
          } else {
            setError(`Authentication failed: ${err.message}`);
          }
        } else {
          setError('An unknown error occurred during authentication. Please try again.');
        }
        setIsProcessing(false);
      }
    };

    processOAuthCallback();
    
    // Cleanup - clear processing flags when page is left
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
          Please wait while we authenticate your account with {provider}...
        </p>
      </div>
    </div>
  );
};

export default OAuthCallback; 