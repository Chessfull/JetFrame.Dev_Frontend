import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoOnly from '../assets/images/Logo-Only-removebg.png';

const HomePage = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Protected route navigation
  const handleGenerateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/generate');
    }
  };
  
  useEffect(() => {
    // Smooth scroll navigation with wheel
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      // Check scroll direction
      if (e.deltaY > 0) {
        // Scrolling down - go to second section
        window.scrollTo({
          top: window.innerHeight,
          behavior: 'smooth'
        });
      } else {
        // Scrolling up - go to first section
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    };
    
    // Add event listener with passive: false to allow preventDefault
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);
  
  return (
    <div className="relative">
      {/* Hero Section - Full height first "page" */}
      <section className="relative h-screen overflow-hidden flex items-center justify-center snap-start">
        {/* Background gradient with animation */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark to-darkGray z-0">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full filter blur-[100px] animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary rounded-full filter blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
        
        {/* Hero content */}
        <div className="container-fluid relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left side with logo and text - adjusted positioning */}
            <div ref={heroRef} className="flex flex-col items-center lg:items-center lg:mt-[-20px] mt-12">
              {/* Wing logo centered above text */}
              <div className="relative mb-0 w-48 h-48 md:w-64 md:h-64 flex justify-center mx-auto main-logo animate-wing-spread">
                <img 
                  src={logoOnly} 
                  alt="JetFrame Wings" 
                  className="w-full h-full opacity-100"
                />
              </div>
              
              {/* Smaller heading */}
              <h1 className="text-6xl md:text-7xl font-bold mb-1 relative text-center mt-[-10px]">
                <span className="text-white">JetFrame</span>
                <span className="text-primary">.Dev</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-12 font-mono text-center">Code with wings</p>
              <p className="text-lg text-gray-400 mb-10 max-w-md text-center whitespace-pre-line">
                Generate complete, ready-to-run 
projects based on your specifications. 
Select your tech stack, architecture, 
and database - and take flight.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={handleGenerateClick} className="btn-primary w-[200px] text-center">
                  Start Generating
                </button>
                <Link to="/documents" className="btn-secondary w-[200px] text-center">
                  Documentation
                </Link>
              </div>
            </div>
            
            {/* Enhanced code editor on the right side - terminal-like style with full height */}
            <div className="flex items-center justify-center h-full">
              <div className="w-full h-[650px] mt-4">
                <div className="relative w-full h-full overflow-hidden">
                  <div className="bg-[#1e1e1e] rounded-md border border-gray-700 shadow-lg h-full w-full overflow-hidden">
                    <div className="bg-[#252526] px-4 py-2 border-b border-gray-700 flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-gray-400 text-xs">JetFrame.Dev - Code Generator</span>
                    </div>
                    <pre className="text-xs font-mono text-gray-300 p-5 h-full overflow-hidden no-scrollbar">
                      <code className="text-left">
{`import { ProjectBuilder } from 'jetframe';

const project = new ProjectBuilder()
  .setTechnology('DotNet')
  .setArchitecture('Clean')
  .setPattern('CQRS')
  .setDatabase('SqlServer')
  .addEntity({
    name: 'Category',
    properties: [
      { name: 'Id', type: 'int', isPrimary: true },
      { name: 'Name', type: 'string' },
      { name: 'Description', type: 'string' }
    ]
  })
  .addEntity({
    name: 'Product',
    properties: [
      { name: 'Id', type: 'int', isPrimary: true },
      { name: 'Name', type: 'string' },
      { name: 'Price', type: 'decimal' },
      { name: 'CategoryId', type: 'int', isForeignKey: true }
    ],
    relationships: [
      {
        name: 'Category',
        type: 'ManyToOne',
        sourceProperty: 'CategoryId',
        targetEntity: 'Category',
        targetProperty: 'Id'
      }
    ]
  })
  .build();

// Your project is ready to deploy!`}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Repositioned wing icons - moved higher and more to the right */}
        <div className="wing-scatter absolute top-24 right-10 opacity-60">
          <img 
            src={logoOnly} 
            alt="JetFrame Logo" 
            className="w-16 h-16" 
            style={{ animation: 'float-plane 6s ease-in-out infinite', animationDelay: '1s' }}
          />
        </div>
        <div className="wing-scatter absolute top-16 right-40 opacity-50">
          <img 
            src={logoOnly} 
            alt="JetFrame Logo" 
            className="w-20 h-20" 
            style={{ animation: 'float-plane 7s ease-in-out infinite', animationDelay: '2s' }}
          />
        </div>
        <div className="wing-scatter absolute top-56 right-16 opacity-40">
          <img 
            src={logoOnly} 
            alt="JetFrame Logo" 
            className="w-14 h-14" 
            style={{ animation: 'float-plane 8s ease-in-out infinite', animationDelay: '1.5s' }}
          />
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer"
             onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>
      
      {/* How It Works Section - Second "page" */}
      <section className="bg-darkGray snap-start py-24">
        <div className="container-fluid max-w-7xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            <span className="text-white">How It </span>
            <span className="text-primary">Works</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="bg-dark p-8 rounded-xl border border-gray-800 hover:border-primary transition-all group hover:shadow-lg hover:shadow-primary/10 transform hover:-translate-y-1 duration-300"
              >
                <div className="w-24 h-24 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mb-8 group-hover:bg-primary group-hover:bg-opacity-100 transition-all mx-auto">
                  <img 
                    src={logoOnly} 
                    alt="JetFrame Logo" 
                    className="w-14 h-14 group-hover:filter group-hover:brightness-200 transition-all" 
                  />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center">{step.title}</h3>
                <p className="text-gray-400 text-center mb-6">{step.description}</p>
                {/* Step icon */}
                <div className="mt-4 text-primary opacity-60 group-hover:opacity-100 transition-opacity text-center">
                  {step.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Call to action button */}
          <div className="text-center mt-12">
            <button 
              onClick={handleGenerateClick} 
              className="btn-primary px-10 py-4 text-lg hover:scale-105 transition-transform"
            >
              Start Building Your Project
            </button>
          </div>

          {/* Additional wing in bottom-right corner */}
          <div className="relative h-24 mt-12 mb-32">
            <div className="wing-scatter absolute bottom-0 right-0 opacity-30">
              <img 
                src={logoOnly} 
                alt="JetFrame Logo" 
                className="w-24 h-24" 
                style={{ animation: 'float-plane 8s ease-in-out infinite' }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const steps = [
  {
    title: "Select Project Options",
    description: "Choose your technology stack, architecture pattern, and database to match your project requirements.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  },
  {
    title: "Define Your Entities",
    description: "Create your data model by defining entities, properties, and relationships in our visual editor.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  },
  {
    title: "Generate & Download",
    description: "Our system generates a complete, ready-to-run project that you can download and deploy immediately.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  }
];

export default HomePage; 