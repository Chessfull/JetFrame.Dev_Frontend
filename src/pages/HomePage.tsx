import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import logoOnly from '../assets/images/Logo-Only-removebg.png';

const HomePage = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Parallax effect on scroll
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollY = window.scrollY;
        heroRef.current.style.transform = `translateY(${scrollY * 0.3}px)`;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden flex items-center justify-center">
        {/* Background gradient with animation */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark to-darkGray z-0">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full filter blur-[100px] animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary rounded-full filter blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
        
        {/* Hero content */}
        <div className="container-fluid relative z-10 mt-24 md:mt-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div ref={heroRef} className="text-center lg:text-left">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="text-white">JetFrame</span>
                <span className="text-primary">.Dev</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 font-mono">Code with wings</p>
              <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto lg:mx-0">
                Generate complete, ready-to-run projects based on your specifications. 
                Select your tech stack, architecture, and database - and take flight.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/generate" className="btn-primary">
                  Start Generating
                </Link>
                <Link to="/documents" className="btn-secondary">
                  View Documentation
                </Link>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-primary bg-opacity-20 rounded-lg filter blur-md"></div>
                <div className="relative p-4 bg-darkGray rounded-lg border border-gray-700 shadow-lg">
                  <pre className="text-sm font-mono text-gray-300 overflow-x-auto">
                    <code>
{`// JetFrame.Dev - Code Generator
import { ProjectBuilder } from 'jetframe';

const project = new ProjectBuilder()
  .setTechnology('DotNet')
  .setArchitecture('Clean')
  .setPattern('CQRS')
  .setDatabase('SqlServer')
  .addEntity({
    name: 'Product',
    properties: [
      { name: 'Id', type: 'int', isPrimary: true },
      { name: 'Name', type: 'string' },
      { name: 'Price', type: 'decimal' }
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

        {/* Flying logos in the background */}
        <div className="absolute bottom-20 left-10 opacity-40">
          <img 
            src={logoOnly} 
            alt="JetFrame Logo" 
            className="w-24 h-24" 
            style={{ animation: 'float-plane 8s ease-in-out infinite' }}
          />
        </div>
        <div className="absolute top-40 right-20 opacity-30">
          <img 
            src={logoOnly} 
            alt="JetFrame Logo" 
            className="w-16 h-16" 
            style={{ animation: 'float-plane 6s ease-in-out infinite', animationDelay: '1s' }}
          />
        </div>
        <div className="absolute bottom-40 right-10 opacity-20">
          <img 
            src={logoOnly} 
            alt="JetFrame Logo" 
            className="w-20 h-20" 
            style={{ animation: 'float-plane 7s ease-in-out infinite', animationDelay: '2s' }}
          />
        </div>
      </section>
      
      {/* Platform Flow Section */}
      <section className="py-20 bg-darkGray">
        <div className="container-fluid">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="bg-dark p-6 rounded-lg border border-gray-800 hover:border-primary transition-all group hover-card"
              >
                <div className="w-20 h-20 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary group-hover:bg-opacity-100 transition-all">
                  <img 
                    src={logoOnly} 
                    alt="JetFrame Logo" 
                    className="w-12 h-12 group-hover:filter group-hover:brightness-200 transition-all" 
                  />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
                {/* Step icon */}
                <div className="mt-4 text-primary opacity-60 group-hover:opacity-100 transition-opacity">
                  {step.icon}
                </div>
              </div>
            ))}
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