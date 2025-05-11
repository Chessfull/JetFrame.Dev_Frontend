import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import logoOnly from '../assets/images/Logo-Only-removebg.png';

const AboutYouPage = () => {
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (orbRef.current) {
        // Calculate position relative to the center of the screen
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        
        // Apply the transform to the orb
        orbRef.current.style.transform = `translate(${x}px, ${y}px)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-dark text-white overflow-hidden relative">
      {/* Background effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div ref={orbRef} className="absolute top-1/3 left-1/2 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2">
          <div className="absolute w-full h-full bg-primary rounded-full filter blur-[100px] opacity-20 animate-pulse-slow"></div>
          <div className="absolute w-3/4 h-3/4 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-secondary rounded-full filter blur-[80px] opacity-20 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>
      
      {/* Content container */}
      <div className="container-fluid max-w-7xl mx-auto px-4 py-16 relative z-10">
        <div className="mb-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">About </span>
            <span className="text-primary">You</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Because JetFrame.Dev is built for you, not for us.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <span className="text-primary mr-3">01.</span> Your Time Matters
            </h2>
            <p className="text-lg text-gray-300 mb-4">
              In a world where deadlines loom and creativity is precious, you shouldn't waste hours on repetitive project setup and boilerplate code.
            </p>
            <p className="text-lg text-gray-300 mb-6">
              JetFrame.Dev automates the tedious parts of software development, giving you back valuable time to focus on what truly matters—bringing your unique ideas to life.
            </p>
            <div className="flex items-center">
              <div className="h-0.5 w-16 bg-primary mr-4"></div>
              <p className="text-primary font-medium">More time for innovation</p>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-dark-secondary rounded-lg border border-gray-800 p-8 relative z-10">
              <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-xs text-gray-400">productivity.js</div>
              </div>
              <pre className="text-sm font-mono text-gray-300 overflow-x-auto">
                <code>{`// Old way - manual setup
const yourTime = 100;
const projectSetup = 65;
const actualCoding = 35;

// JetFrame.Dev way
const yourTime = 100;
const projectSetup = 5;
const actualCoding = 25;
const innovation = 70; // <-- This is new!

console.log("Time saved: " + (65 - 5) + "%");
// Output: Time saved: 60%`}</code>
              </pre>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-5 -right-5 w-16 h-16 opacity-30">
              <img 
                src={logoOnly} 
                alt="JetFrame Wings" 
                className="w-full h-full animate-wing-flow" 
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
          <div className="order-2 md:order-1">
            <div className="relative">
              <div className="bg-dark-secondary rounded-lg border border-gray-800 p-8 relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-xs text-gray-400">imagination.js</div>
                </div>
                <pre className="text-sm font-mono text-gray-300 overflow-x-auto">
                  <code>{`// Your imagination is the only limit
const creativity = {
  unleashed: true,
  blockers: [
    "boilerplate",
    "config files",
    "setup frustration"
  ].filter(blocker => !jetframe.removes(blocker))
};

// With JetFrame.Dev
console.log(creativity.blockers.length);
// Output: 0`}</code>
                </pre>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -bottom-5 -left-5 w-16 h-16 opacity-30">
                <img 
                  src={logoOnly} 
                  alt="JetFrame Wings" 
                  className="w-full h-full animate-wing-flow" 
                  style={{ animationDelay: '1s' }}
                />
              </div>
            </div>
          </div>
          
          <div className="order-1 md:order-2">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <span className="text-primary mr-3">02.</span> Your Imagination Unleashed
            </h2>
            <p className="text-lg text-gray-300 mb-4">
              When computers handle the repetitive tasks, your mind is free to soar. JetFrame.Dev handles the predictable parts of development, so you can focus on the creative challenges that make your project unique.
            </p>
            <p className="text-lg text-gray-300 mb-6">
              Let the machines do what they're good at, while you do what humans do best—imagine, innovate, and create elegant solutions to complex problems.
            </p>
            <div className="flex items-center">
              <div className="h-0.5 w-16 bg-primary mr-4"></div>
              <p className="text-primary font-medium">Freedom to create</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <span className="text-primary mr-3">03.</span> Your Projects, Your Way
            </h2>
            <p className="text-lg text-gray-300 mb-4">
              We don't believe in one-size-fits-all solutions. JetFrame.Dev gives you the power to customize your project architecture, technology stack, and features to match your specific vision.
            </p>
            <p className="text-lg text-gray-300 mb-6">
              Start with a solid foundation that follows best practices, then shape it into exactly what you need. No bloat, no unnecessary components—just clean, efficient code tailored to your requirements.
            </p>
            <div className="flex items-center">
              <div className="h-0.5 w-16 bg-primary mr-4"></div>
              <p className="text-primary font-medium">Customized to your needs</p>
            </div>
          </div>
          
          <div className="flex justify-center flex-col items-center">
            <div className="text-center mb-4">
              <div className="text-5xl text-primary font-bold mb-2">100%</div>
              <p className="text-xl text-white font-medium">Your Vision</p>
              <p className="text-gray-400 mt-1">Without Compromise</p>
            </div>
            <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center animate-wing-spread">
                <img 
                  src={logoOnly} 
                  alt="JetFrame Wings" 
                  className="w-3/4 h-3/4 opacity-80" 
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Call to action */}
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-dark-secondary to-darkGray rounded-xl p-10 border border-gray-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 opacity-20">
            <img 
              src={logoOnly} 
              alt="JetFrame Wings" 
              className="w-full h-full animate-wing-flow" 
            />
          </div>
          
          <h2 className="text-3xl font-bold mb-6">Ready to Take Flight?</h2>
          <p className="text-lg text-gray-300 mb-8">
            Stop building the same foundations over and over again. Let JetFrame.Dev handle the repetitive work so you can focus on what makes your project special.
          </p>
          
          <Link 
            to="/generate" 
            className="btn-primary px-10 py-4 text-lg inline-block hover:scale-105 transition-transform"
          >
            Start Creating Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutYouPage; 