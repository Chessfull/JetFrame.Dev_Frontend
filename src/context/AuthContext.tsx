import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { AuthResponse, User, LoginRequest, RegisterRequest, ExternalAuthCallbackRequest } from '../types/auth';
import axios from 'axios';

// Define the context shape
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  register: (userData: RegisterRequest) => Promise<void>;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  getOAuthUrl: (provider: string) => Promise<string>;
  handleOAuthCallback: (params: ExternalAuthCallbackRequest) => Promise<void>;
  clearError: () => void;
  loginWithProvider: (provider: string) => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props for the AuthProvider component
interface AuthProviderProps {
  children: React.ReactNode;
}

// Provider component that wraps the app and makes auth object available
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authCheckComplete, setAuthCheckComplete] = useState<boolean>(false);
  const navigate = useNavigate();

  // Load user info on startup
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        // Prevent multiple auth checks
        if (authCheckComplete) return;
        
        setAuthCheckComplete(true);
        
        // Check if we have any auth-related cookies before making the API call
        const hasCookies = document.cookie.includes('auth_token') || 
                          document.cookie.includes('refresh_token');
        
        if (!hasCookies) {
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        
        try {
          // Only proceed with the API call if we have cookies
          const userData = await authService.getUserInfo();
          
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          // Hata durumunda kullanıcı bilgisini temizle
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserInfo();
  }, [authCheckComplete]);

  // Handle user registration
  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(userData);
      handleAuthResponse(response);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle user login
  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(credentials);
      handleAuthResponse(response);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle user logout
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // İlk önce kullanıcı bilgisini temizle (UI için)
      setUser(null);
      setIsAuthenticated(false);
      
      // Cookies temizleme - client side
      document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      // Sonra backend'e çıkış isteği gönder (cookie'leri temizlemek için)
      try {
        await axios.post('/api/Auth/revoke-token', {}, 
          { withCredentials: true }
        );
      } catch (logoutError) {
        console.error('Backend logout error:', logoutError);
        // Backend hatası yine de kullanıcıyı çıkış yapmış sayıyoruz
      }
      
      // Yönlendirme
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
      
      // Even if the backend request fails, clear local data
      setUser(null);
      setIsAuthenticated(false);
      
      // Cookies temizleme - client side
      document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  // Get OAuth URL for the specified provider
  const getOAuthUrl = async (provider: string): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      
      return await authService.getOAuthUrl(provider);
    } catch (err: any) {
      console.error(`OAuth URL generation error:`, err);
      const errorMsg = err.response?.data?.message || `Failed to get ${provider} authentication URL.`;
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle OAuth callback
  const handleOAuthCallback = async (params: ExternalAuthCallbackRequest): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.handleOAuthCallback(params);
      handleAuthResponse(response);
    } catch (err: any) {
      console.error('OAuth callback handling error in AuthContext:', err);
      let errorMsg = 'Authentication failed. Please try again.';
      
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Helper to process authentication response
  const handleAuthResponse = (response: AuthResponse): void => {
    // Extract user data from response
    const { accessToken, refreshToken, expiresAt, ...userInfo } = response;
    setUser(userInfo);
    setIsAuthenticated(true);
    navigate('/');
  };

  // Clear any error message
  const clearError = (): void => {
    setError(null);
  };

  const loginWithProvider = async (provider: string) => {
    setLoading(true);
    setError(null);
    try {
      const redirectUrl = await authService.getOAuthUrl(provider);
      window.location.href = redirectUrl;
    } catch (err: any) {
      console.error(`${provider} login error:`, err);
      const errorMessage = err.response?.data?.message || `${provider} login failed. Please try again.`;
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  };

  // Context value that will be provided
  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    register,
    login,
    logout,
    getOAuthUrl,
    handleOAuthCallback,
    clearError,
    loginWithProvider,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 