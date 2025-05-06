import axios from 'axios';
import { 
  RegisterRequest, 
  LoginRequest, 
  ExternalAuthCallbackRequest,
  AuthResponse
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
  return window.location.origin; // Örn: "http://localhost:5173"
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
  // Always use dynamic redirectUri based on current origin
  const redirectUri = params.provider.toLowerCase() === 'github' 
    ? `${getCurrentOrigin()}/auth/github/callback`
    : `${getCurrentOrigin()}/auth/google/callback`;
  
  // Ensure state matches exactly what GitHub returns
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
      const response = await axios.post(
        AUTH_ENDPOINTS.login, 
        credentials,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
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
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  // Get OAuth URL for the specified provider
  getOAuthUrl: async (provider: string): Promise<string> => {
    try {
      // Generate state parameter
      const state = generateState();
      
      // Use dynamic redirect URI based on current origin
      const redirectUri = provider.toLowerCase() === 'github' 
        ? `${getCurrentOrigin()}/auth/github/callback`
        : `${getCurrentOrigin()}/auth/google/callback`;
      
      // Different handling for GitHub - use the specific endpoint
      if (provider.toLowerCase() === 'github') {
        const url = `/api/Auth/github-login-url?returnUrl=${encodeURIComponent(redirectUri)}`;
        const response = await axios.get(url, { withCredentials: true });
        
        // Store the state from backend
        if (response.data.state) {
          sessionStorage.setItem('oauth_state', response.data.state);
        }
        
        // Return the URL directly
        return response.data.url;
      }
      
      // For other providers, use the existing flow
      const url = `${AUTH_ENDPOINTS.getOAuthUrl}?provider=${provider}&returnUrl=${encodeURIComponent(redirectUri)}&state=${state}`;
      const response = await axios.get(url, { withCredentials: true });
      
      // Return the redirectUrl
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
  }
};

export default authService; 