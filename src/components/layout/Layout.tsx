import { ReactNode, useEffect, useState } from 'react';
import Navbar from './Navbar';
import logoOnly from '../../assets/images/Logo-Only-removebg.png';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
      if (!cursorVisible) setCursorVisible(true);
    };

    const handleMouseLeave = () => {
      setCursorVisible(false);
    };

    const handleMouseEnter = () => {
      setCursorVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || 
          target.closest('button') || target.closest('a')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [cursorVisible]);

  return (
    <div className="flex flex-col min-h-screen bg-dark text-white overflow-hidden">
      {/* Custom logo cursor */}
      <div 
        className={`custom-cursor ${isHovering ? 'scale-125' : ''} ${cursorVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{ 
          left: `${cursorPosition.x}px`, 
          top: `${cursorPosition.y}px`,
          transform: `translate(-50%, -50%) ${isHovering ? 'rotate(10deg)' : ''}`
        }}
      >
        <img 
          src={logoOnly} 
          alt="Cursor Logo" 
          className="w-14 h-14 transition-all duration-300" 
        />
      </div>
      
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
};

export default Layout; 