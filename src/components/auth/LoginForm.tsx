import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoginRequest } from '../../types/auth';
import authService from '../../services/authService';

const LoginForm = () => {
  const { login, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof LoginRequest, string>>>({});

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when typing
    if (formErrors[name as keyof LoginRequest]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear API error when user starts typing
    if (error) clearError();
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof LoginRequest, string>> = {};
    let isValid = true;

    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      errors.email = 'Invalid email address';
      isValid = false;
    }

    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await login(formData);
      // Redirect is handled in the AuthContext after successful login
    } catch (err) {
      // Error handling is done in the AuthContext
    }
  };

  // Handle OAuth login
  const handleOAuthLogin = async (provider: string) => {
    try {
      // Önce loading durumunu ayarla
      setFormData({ email: '', password: '' });
      
      // Get OAuth URL using authService
      const url = await authService.getOAuthUrl(provider);
      
      if (!url) {
        throw new Error('Invalid response from backend: missing URL');
      }
      
      // Important: Perform a redirect, not a fetch
      window.location.href = url;
    } catch (err) {
      // Error handling
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-dark-secondary rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center text-white mb-6">Sign In</h2>
      
      {error && (
        <div className="bg-red-900/30 text-red-400 p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="your@email.com"
          />
          {formErrors.email && (
            <p className="mt-1 text-sm text-red-400">{formErrors.email}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="••••••••"
          />
          {formErrors.password && (
            <p className="mt-1 text-sm text-red-400">{formErrors.password}</p>
          )}
        </div>
        
        <div>
          <button 
            type="submit" 
            className="w-full py-2 px-4 bg-primary hover:bg-secondary text-white font-semibold rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="mr-2">Signing in</span>
                <span className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></span>
              </span>
            ) : 'Sign In'}
          </button>
        </div>
      </form>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-dark-secondary text-gray-400">Or continue with</span>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleOAuthLogin('Google')}
            className="w-full flex items-center justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-white bg-dark hover:bg-dark-secondary"
            disabled={loading}
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.798-1.677-4.198-2.707-6.735-2.707-5.523 0-10 4.477-10 10s4.477 10 10 10c8.396 0 10-7.326 10-12 0-0.791-0.089-1.562-0.252-2.311h-9.748z"/>
            </svg>
            Google
          </button>
          
          <button
            type="button"
            onClick={() => handleOAuthLogin('GitHub')}
            className="w-full flex items-center justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-white bg-dark hover:bg-dark-secondary"
            disabled={loading}
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </button>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:text-secondary">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm; 