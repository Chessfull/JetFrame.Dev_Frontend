const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-darkGray py-6 mt-auto">
      <div className="container-fluid">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <span className="text-primary font-mono text-xl font-bold">JetFrame</span>
              <span className="text-white text-md">.Dev</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">Code with wings</p>
          </div>
          
          <div className="text-sm text-gray-400">
            &copy; {currentYear} JetFrame.Dev. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 