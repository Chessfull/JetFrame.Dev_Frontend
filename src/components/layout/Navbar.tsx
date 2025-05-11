import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      // Logout failed silently
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && 
          !(event.target as Element).closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-dark-secondary shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="mobile-menu-button inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-dark focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Icon when menu is open */}
              <svg
                className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 hidden md:block"></div>
          
          {/* Desktop nav links */}
          <div className="hidden md:flex space-x-10 items-center justify-center">
            <Link
              to="/"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium"
            >
              Home
            </Link>
            <Link
              to="/generate"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium"
            >
              Generate
            </Link>
            <Link
              to="/documents"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium"
            >
              Documents
            </Link>
            <Link
              to="/about"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium"
            >
              About us
            </Link>
          </div>
          
          <div className="flex items-center md:ml-10">
            {!isAuthenticated ? (
              <Link
                to="/login"
                className="bg-primary hover:bg-secondary text-white font-bold py-2 px-6 rounded transition duration-300"
              >
                Get Started
              </Link>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center text-white hover:text-gray-300 focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center mr-2 text-sm font-medium">
                    {user?.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        alt="Avatar" 
                        className="h-8 w-8 rounded-full" 
                        onError={(e) => {
                          e.currentTarget.onerror = null; // Prevent infinite loop
                          e.currentTarget.style.display = 'none'; // Hide the img element
                          e.currentTarget.parentElement.classList.add('flex', 'items-center', 'justify-center'); // Ensure proper styling for fallback
                          e.currentTarget.parentElement.textContent = user?.firstName?.charAt(0)?.toUpperCase() || 'U';
                        }}
                      />
                    ) : (
                      user?.firstName?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                  <span className="mr-1 hidden sm:inline">{user?.firstName || 'User'}</span>
                  <svg
                    className={`ml-1 h-5 w-5 transform ${isDropdownOpen ? 'rotate-180' : 'rotate-0'} transition-transform duration-200`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-dark rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-dark-secondary hover:text-white"
                    >
                      Your Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-dark-secondary hover:text-white"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      <div 
        ref={mobileMenuRef}
        className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-dark border-t border-gray-700`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/"
            className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/generate"
            className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Generate
          </Link>
          <Link
            to="/documents"
            className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Documents
          </Link>
          <Link
            to="/about"
            className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About us
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 