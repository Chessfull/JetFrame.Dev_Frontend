import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="py-4 border-t border-gray-800 bg-dark-secondary mt-auto">
      <div className="container-fluid max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-lg font-bold">
              <span className="text-white">JetFrame</span>
              <span className="text-primary">.Dev</span>
            </span>
          </div>
          <div className="text-gray-400 text-sm">
            © {new Date().getFullYear()} JetFrame.Dev. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 