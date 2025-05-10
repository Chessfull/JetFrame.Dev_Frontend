import axios from './axiosConfig';
import { 
  RegisterRequest, 
  LoginRequest, 
  ExternalAuthCallbackRequest,
  AuthResponse,
  UserInfo
} from '../types/auth';

// API endpoints for authentication
const AUTH_ENDPOINTS = {
  register: '/api/Auth/register',
  login: '/api/Auth/login',
  refreshToken: '/api/Auth/refresh-token',
  revokeToken: '/api/Auth/revoke-token',
  externalLogin: '/api/Auth/external-login',
  externalCallback: '/api/Auth/external-callback',
  getOAuthUrl: '/api/Auth/external-login',
  githubDirect: '/api/Auth/github-direct-auth',
  userInfo: '/api/Auth/user-info'
};

// OAuth Settings - use the current window location for callbacks
const getCurrentOrigin = () => {
  return window.location.origin; // e.g. "http://localhost:5173" in dev, "https://jetframe.dev" in prod
};

// Determine if we're in development or production
const isDevelopment = () => {
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
};

// Get environment-specific redirect URI
const getRedirectUri = (provider: string) => {
  const base = getCurrentOrigin();
  return `${base}/auth/${provider.toLowerCase()}/callback`;
};

// Generate secure state parameter for OAuth flow
const generateState = (): string => {
  // Create a random string for state parameter
  const randomBytes = new Uint8Array(16);
  window.crypto.getRandomValues(randomBytes);
  const state = Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Store the state in session storage for verification on return
  sessionStorage.setItem('oauth_state', state);
  return state;
};

// Common headers
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Format OAuth request for backend compatibility
const formatOAuthRequest = (params: ExternalAuthCallbackRequest) => {
  // Use environment-specific redirect URI
  const redirectUri = getRedirectUri(params.provider);
  
  return {
    provider: params.provider,
    code: params.code,
    state: params.state,
    redirectUri: redirectUri
  };
};

// Auth service for handling all authentication-related API calls
const authService = {
  // Register a new user with email and password
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await axios.post(
        AUTH_ENDPOINTS.register, 
        userData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  // Login with email and password
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      console.log('Attempting login with:', {...credentials, password: '********'});
      
      const response = await axios.post(
        AUTH_ENDPOINTS.login, 
        credentials,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      console.log('Login response status:', response.status);
      console.log('Login success for:', credentials.email);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  },
  
  // Refresh the access token using the HttpOnly cookie
  refreshToken: async (): Promise<AuthResponse> => {
    try {
      const response = await axios.post(
        AUTH_ENDPOINTS.refreshToken, 
        {},
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  },
  
  // Revoke the refresh token (logout)
  logout: async (): Promise<void> => {
    try {
      await axios.post(
        AUTH_ENDPOINTS.revokeToken,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      // Don't throw error on 401 - it just means we're already logged out
      if (axios.isAxiosError(error) && error.response?.status !== 401) {
        console.error('Logout error:', error);
        throw error;
      } else {
        console.log('Logout completed (token already expired)');
      }
    } finally {
      // Always clear any local auth state regardless of API response
      // Add any local state cleanup here if needed
    }
  },
  
  // Get OAuth URL for the specified provider
  getOAuthUrl: async (provider: string): Promise<string> => {
    try {
      // Generate state parameter
      const state = generateState();
      
      // Use environment-specific redirect URI
      const redirectUri = getRedirectUri(provider);
      
      // Different endpoints for different providers
      let url;
      if (provider.toLowerCase() === 'github') {
        url = `/api/Auth/github-login-url?returnUrl=${encodeURIComponent(redirectUri)}`;
      } else if (provider.toLowerCase() === 'google') {
        url = `/api/Auth/google-login-url?returnUrl=${encodeURIComponent(redirectUri)}`;
      } else {
        url = `${AUTH_ENDPOINTS.getOAuthUrl}?provider=${provider}&returnUrl=${encodeURIComponent(redirectUri)}&state=${state}`;
      }
      
      console.log(`Requesting OAuth URL for ${provider} with redirect to ${redirectUri}`);
      const response = await axios.get(url, { withCredentials: true });
      
      // Store the state from backend if provided
      if (response.data.state) {
        sessionStorage.setItem('oauth_state', response.data.state);
      }
      
      // Log the redirect URL for debugging
      if (isDevelopment()) {
        console.log(`Got OAuth URL for ${provider}:`, response.data.redirectUrl);
      }
      
      return response.data.redirectUrl;
    } catch (error) {
      console.error(`${provider} OAuth URL error:`, error);
      throw error;
    }
  },
  
  // Handle OAuth callback with authorization code
  handleOAuthCallback: async (params: ExternalAuthCallbackRequest): Promise<AuthResponse> => {
    try {
      // Format the request for backend compatibility
      const formattedRequest = formatOAuthRequest(params);
      
      // Send to backend to handle OAuth flow securely
      try {
        const response = await axios.post(
          AUTH_ENDPOINTS.externalCallback,
          formattedRequest,
          { 
            withCredentials: true,
            timeout: 30000 // 30 saniye timeout
          }
        );
        
        return response.data;
      } catch (err) {
        console.error('Primary OAuth handling failed, trying alternative endpoint', err);
        
        // Alternative: Use backend's dedicated GitHub direct auth endpoint as a fallback
        if (params.provider.toLowerCase() === 'github') {
          const response = await axios.post(
            '/api/Auth/github-direct-auth',
            formattedRequest,
            { withCredentials: true }
          );
          
          return response.data;
        }
        
        // Re-throw the error if we can't handle it
        throw err;
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
        throw new Error(`Authentication failed: ${error.response?.data?.message || error.message}`);
      }
      
      throw error;
    }
  },

  // Get user info
  getUserInfo: async (): Promise<any> => {
    try {
      // Özel istekler için açık seçeneklerle çağır
      const response = await axios.get(AUTH_ENDPOINTS.userInfo, { 
        withCredentials: true,
        timeout: 10000, // 10 saniyelik timeout
        headers: {
          ...headers,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get user info error:', error);
      // Yetkilendirme hatası ise, sessiz hata ver ki sürekli popup çıkmasın
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return null;
      }
      throw error;
    }
  },

  // For backward compatibility with existing code, these can be removed later
  isAuthenticated: (): boolean => {
    try {
      // For HTTP-only cookies, let's set a reasonable initial value
      return false; // Default to not authenticated until proven otherwise
    } catch (e) {
      return false;
    }
  },

  // External auth methods
  loginWithGoogle: async (): Promise<UserInfo | null> => {
    try {
      // Get the current URL to send as return URL
      const returnUrl = encodeURIComponent(window.location.origin + '/auth/callback');
      
      // Redirect to backend for Google authentication
      const response = await axios.get(`/api/Auth/external-login?provider=Google&returnUrl=${returnUrl}`);
      
      if (response.data && response.data.redirectUrl) {
        // Follow the redirect URL from the API
        window.location.href = response.data.redirectUrl;
      } else {
        // Fallback to direct endpoint in case API doesn't return redirect URL
        window.location.href = `${axios.defaults.baseURL}/api/Auth/external-login?provider=Google&returnUrl=${returnUrl}`;
      }
      
      console.log('Redirecting to Google login...');
      return null;
    } catch (error) {
      console.error('Error during Google authentication:', error);
      return null;
    }
  },

  loginWithGitHub: async (): Promise<UserInfo | null> => {
    try {
      // Get the current URL to send as return URL
      const returnUrl = encodeURIComponent(window.location.origin + '/auth/callback');
      
      // Redirect to backend for GitHub authentication
      const response = await axios.get(`/api/Auth/external-login?provider=GitHub&returnUrl=${returnUrl}`);
      
      if (response.data && response.data.redirectUrl) {
        // Follow the redirect URL from the API
        window.location.href = response.data.redirectUrl;
      } else {
        // Fallback to direct endpoint in case API doesn't return redirect URL
        window.location.href = `${axios.defaults.baseURL}/api/Auth/external-login?provider=GitHub&returnUrl=${returnUrl}`;
      }
      
      console.log('Redirecting to GitHub login...');
      return null;
    } catch (error) {
      console.error('Error during GitHub authentication:', error);
      return null;
    }
  }
};

export default authService; 