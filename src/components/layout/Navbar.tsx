import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-dark bg-opacity-90 backdrop-blur-sm py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container-fluid flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-primary font-mono text-2xl font-bold">JetFrame</span>
            <span className="text-white text-lg">.Dev</span>
          </Link>
          <p className="ml-3 text-sm opacity-70 hidden md:block">Code with wings</p>
        </div>

        <div className="hidden md:flex items-center gap-10">
          <NavLink to="/" title="Home" />
          <NavLink to="/generate" title="Generate" />
          <NavLink to="/documents" title="Documents" />
          <NavLink to="/about" title="About us" />
        </div>

        <div className="md:hidden flex items-center">
          <button className="text-white text-2xl">
            <span>☰</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, title }: { to: string; title: string }) => {
  return (
    <Link 
      to={to} 
      className="text-white opacity-70 hover:opacity-100 hover:text-primary transition-all duration-300"
    >
      {title}
    </Link>
  );
};

export default Navbar; 