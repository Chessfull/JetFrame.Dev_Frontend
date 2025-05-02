import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;  // Default is true
}

const ProtectedRoute = ({ children, requireAuth = true }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [lastNavigationTime, setLastNavigationTime] = useState(0);

  // Add an effect to handle navigation when auth state changes
  useEffect(() => {
    if (!loading) {
      const currentTime = Date.now();
      // Only navigate if it's been more than 2 seconds since the last navigation
      if (requireAuth && !isAuthenticated && currentTime - lastNavigationTime > 2000) {
        setLastNavigationTime(currentTime);
        navigate('/login', { state: { from: location }, replace: true });
      }
    }
  }, [isAuthenticated, loading, navigate, location, requireAuth, lastNavigationTime]);

  // If we're still loading, don't render anything yet
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If requireAuth is true but user is not authenticated, redirect to login
  if (requireAuth && !isAuthenticated) {
    // Prevent rapid redirects
    const currentTime = Date.now();
    if (currentTime - lastNavigationTime > 2000) {
      setLastNavigationTime(currentTime);
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    // Show loading while we prevent rapid redirects
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If requireAuth is false and user is authenticated (like login/register pages), redirect to home
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If conditions are met, render the children components
  return <>{children}</>;
};

export default ProtectedRoute; 