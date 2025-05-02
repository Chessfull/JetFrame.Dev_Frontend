import axios from 'axios';
import authService from './authService';

// Setup axios with credentials support for cookies
axios.defaults.withCredentials = true;

// API URL'i burada sabit olarak tanımlayın - tüm isteklerde kullanılacak
axios.defaults.baseURL = 'https://localhost:60713';

// CORS için gerekli header'ları ekle
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Flag to track token refresh status to prevent infinite loops
let isRefreshing = false;
let isLoggingOut = false;
let lastRedirectTime = 0;

// Request interceptor
axios.interceptors.request.use(
  async (config) => {
    // No need to manually add token as it will be sent in cookies
    // Just ensure withCredentials is set for every request
    config.withCredentials = true;

    // API URL'i tanımlı değilse ve tam URL değilse baseURL'i kullan
    if (!config.url?.startsWith('http')) {
      config.url = config.url?.startsWith('/') 
        ? config.url 
        : `/${config.url}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 errors
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Eğer bir istek yapılamadıysa (ağ hatası vs.)
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject(error);
    }
    
    const originalRequest = error.config;
    
    // Ignore auth-related URLs to prevent loops and don't attempt refresh for them
    const isAuthUrl = originalRequest.url?.includes('/api/Auth/refresh-token') || 
                      originalRequest.url?.includes('/api/Auth/revoke-token') ||
                      originalRequest.url?.includes('/api/Auth/user-info') ||
                      originalRequest.url?.includes('/api/Auth/login') ||
                      originalRequest.url?.includes('/api/Auth/register') ||
                      originalRequest.url?.includes('/api/Auth/external-login') ||
                      originalRequest.url?.includes('/api/Auth/external-callback');
    
    // If we're in the middle of logging out, don't retry or refresh
    if (isLoggingOut) {
      return Promise.reject(error);
    }
    
    // Check if we have any auth cookies before attempting refresh
    const hasCookies = document.cookie.includes('auth_token') || 
                       document.cookie.includes('refresh_token');
    
    // If the error is 401 and we haven't already tried to refresh and it's not an auth URL
    // and we have auth cookies (meaning the user was likely authenticated before)
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthUrl && !isRefreshing && hasCookies) {
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Try to refresh the token
        await authService.refreshToken();
        isRefreshing = false;
        
        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh failed, clear local state and redirect
        console.error('Token refresh failed:', refreshError);
        isRefreshing = false;
        isLoggingOut = true;
        
        // Clean up cookies manually with proper settings
        document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=none;";
        document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=none;";
        
        // Prevent multiple redirects in a short time
        const currentTime = Date.now();
        if (currentTime - lastRedirectTime > 2000) { // Only redirect if more than 2 seconds since last redirect
          lastRedirectTime = currentTime;
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    // For 401 errors on auth endpoints or when no cookies exist, just reject without redirecting
    if (error.response?.status === 401 && (isAuthUrl || !hasCookies)) {
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

export default axios; 