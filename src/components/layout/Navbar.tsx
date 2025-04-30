import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logoWithTitle from '../../assets/images/Logo-With-Title-removebg.png';

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
        <div className="flex items-center flex-grow justify-center md:justify-start">
          <Link to="/" className="flex items-center">
            <img 
              src={logoWithTitle} 
              alt="JetFrame.Dev" 
              className="h-16 md:h-20 animate-float"
            />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item, index) => (
            <NavLink key={index} to={item.path} title={item.title} />
          ))}
          <button className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md transition-all duration-300 flex items-center gap-2 transform hover:scale-105 shadow-glow">
            <span>Get Started</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
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

const navItems = [
  { path: "/", title: "Home" },
  { path: "/generate", title: "Generate" },
  { path: "/documents", title: "Documents" },
  { path: "/about", title: "About us" }
];

const NavLink = ({ to, title }: { to: string; title: string }) => {
  return (
    <Link 
      to={to} 
      className="relative group text-white opacity-70 hover:opacity-100 hover:text-primary transition-all duration-300"
    >
      {title}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
    </Link>
  );
};

export default Navbar; 