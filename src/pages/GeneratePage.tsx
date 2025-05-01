import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoOnly from '../assets/images/Logo-Only-removebg.png';
import { apiService } from '../services/api';

// Type definitions for API responses
interface Technology {
  id: number;
  name: string;
  isAvailable: boolean;
}

interface Architecture {
  id: number;
  name: string;
}

interface Pattern {
  name: string;
}

interface Database {
  id: number;
  name: string;
}

interface ProjectConfig {
  projectName: string;
  projectDescription: string;
  technology: string;
  architecture: string;
  designPattern: string;
  database: string;
  connectionString: string;
  entities: any[]; // Will be replaced with proper Entity interface later
}

const GeneratePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'technology' | 'entity' | 'database'>('technology');
  const [isLoading, setIsLoading] = useState(false);

  // Project configuration state
  const [projectConfig, setProjectConfig] = useState<ProjectConfig>({
    projectName: '',
    projectDescription: '',
    technology: '',
    architecture: '',
    designPattern: '',
    database: '',
    connectionString: '',
    entities: []
  });

  // Available options (will be fetched from API)
  const [availableTechnologies, setAvailableTechnologies] = useState<Technology[]>([]);
  const [availableArchitectures, setAvailableArchitectures] = useState<Architecture[]>([]);
  const [availablePatterns, setAvailablePatterns] = useState<Pattern[]>([]);
  const [availableDatabases, setAvailableDatabases] = useState<Database[]>([]);

  // Handle tab navigation
  const goToNextTab = () => {
    if (activeTab === 'technology') setActiveTab('entity');
    else if (activeTab === 'entity') setActiveTab('database');
  };

  const goToPreviousTab = () => {
    if (activeTab === 'database') setActiveTab('entity');
    else if (activeTab === 'entity') setActiveTab('technology');
  };

  // Load technologies when component mounts
  useEffect(() => {
    const fetchTechnologies = async () => {
      try {
        const data = await apiService.getTechnologies();
        setAvailableTechnologies(data);
      } catch (error) {
        console.error('Error fetching technologies:', error);
      }
    };

    fetchTechnologies();
  }, []);

  // Load architectures when technology changes
  useEffect(() => {
    const fetchArchitectures = async () => {
      if (!projectConfig.technology) return;
      
      try {
        const data = await apiService.getArchitectures(projectConfig.technology);
        setAvailableArchitectures(data);
        setProjectConfig(prev => ({ ...prev, architecture: '' })); // Reset architecture when technology changes
      } catch (error) {
        console.error('Error fetching architectures:', error);
      }
    };

    fetchArchitectures();
  }, [projectConfig.technology]);

  // Load patterns when technology and architecture change
  useEffect(() => {
    const fetchPatterns = async () => {
      if (!projectConfig.technology || !projectConfig.architecture) return;
      
      try {
        const data = await apiService.getPatterns(projectConfig.technology, projectConfig.architecture);
        setAvailablePatterns(data);
        setProjectConfig(prev => ({ ...prev, designPattern: '' })); // Reset pattern when architecture changes
      } catch (error) {
        console.error('Error fetching patterns:', error);
      }
    };

    fetchPatterns();
  }, [projectConfig.technology, projectConfig.architecture]);

  // Load databases when technology changes
  useEffect(() => {
    const fetchDatabases = async () => {
      if (!projectConfig.technology) return;
      
      try {
        const data = await apiService.getDatabases(projectConfig.technology);
        setAvailableDatabases(data);
        setProjectConfig(prev => ({ ...prev, database: '' })); // Reset database when technology changes
      } catch (error) {
        console.error('Error fetching databases:', error);
      }
    };

    fetchDatabases();
  }, [projectConfig.technology]);

  // Handle technology selection
  const handleTechnologyChange = (tech: string, isAvailable: boolean) => {
    if (!isAvailable) return; // Prevent selecting unavailable technologies
    setProjectConfig(prev => ({ ...prev, technology: tech }));
  };

  // Handle architecture selection
  const handleArchitectureChange = (arch: string) => {
    setProjectConfig(prev => ({ ...prev, architecture: arch }));
  };

  // Handle pattern selection
  const handlePatternChange = (pattern: string) => {
    setProjectConfig(prev => ({ ...prev, designPattern: pattern }));
  };

  // Proje oluşturma fonksiyonu ekleyelim
  const handleGenerateProject = async () => {
    if (!projectConfig.technology || !projectConfig.database) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.generateProject({
        projectName: projectConfig.projectName,
        projectDescription: projectConfig.projectDescription,
        technology: projectConfig.technology,
        architecture: projectConfig.architecture,
        designPattern: projectConfig.designPattern,
        database: projectConfig.database,
        connectionString: projectConfig.connectionString,
        entities: projectConfig.entities
      });
      
      // Başarılı yanıt kontrolü
      if (response.id) {
        // Projenin oluşturulma durumunu kontrol etmek için bir zamanlayıcı başlatalım
        const checkStatusInterval = setInterval(async () => {
          const statusResponse = await apiService.getProjectStatus(response.id);
          
          if (statusResponse.status === 'Completed') {
            clearInterval(checkStatusInterval);
            setIsLoading(false);
            
            // Projeyi indirme bağlantısını aç
            window.open(apiService.downloadProject(response.id), '_blank');
          } else if (statusResponse.status === 'Failed') {
            clearInterval(checkStatusInterval);
            setIsLoading(false);
            alert('Project generation failed. Please try again.');
          }
          // 'Queued' veya 'InProgress' durumlarında bekle
        }, 2000); // Her 2 saniyede bir kontrol et
      }
    } catch (error) {
      console.error('Error generating project:', error);
      setIsLoading(false);
      alert('An error occurred while generating the project. Please try again.');
    }
  };

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'technology':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-dark rounded-lg border border-gray-800 p-6">
              <h3 className="text-xl font-bold mb-4">Technology</h3>
              <div className="space-y-3">
                {availableTechnologies.map((tech) => (
                  <div 
                    key={tech.id}
                    className={`p-4 border rounded-md transition-all relative ${
                      tech.isAvailable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                    } ${
                      projectConfig.technology === tech.name 
                        ? 'border-primary bg-primary bg-opacity-10' 
                        : 'border-gray-700 hover:border-gray-500'
                    }`}
                    onClick={() => handleTechnologyChange(tech.name, tech.isAvailable)}
                  >
                    <div className="flex justify-between items-center">
                      <span>{tech.name}</span>
                      {!tech.isAvailable && (
                        <span className="text-xs bg-gray-800 text-gray-400 py-1 px-2 rounded-full">Coming Soon</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-dark rounded-lg border border-gray-800 p-6">
              <h3 className="text-xl font-bold mb-4">Architecture</h3>
              <div className="space-y-3">
                {projectConfig.technology ? (
                  availableArchitectures.map((arch) => (
                    <div 
                      key={arch.id}
                      className={`p-4 border rounded-md cursor-pointer transition-all ${
                        projectConfig.architecture === arch.name 
                          ? 'border-primary bg-primary bg-opacity-10' 
                          : 'border-gray-700 hover:border-gray-500'
                      }`}
                      onClick={() => handleArchitectureChange(arch.name)}
                    >
                      {arch.name}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 italic">Please select a technology first</div>
                )}
              </div>
            </div>

            <div className="bg-dark rounded-lg border border-gray-800 p-6">
              <h3 className="text-xl font-bold mb-4">Pattern</h3>
              <div className="space-y-3">
                {projectConfig.technology && projectConfig.architecture ? (
                  availablePatterns.map((pattern, index) => (
                    <div 
                      key={index}
                      className={`p-4 border rounded-md cursor-pointer transition-all ${
                        projectConfig.designPattern === pattern.name 
                          ? 'border-primary bg-primary bg-opacity-10' 
                          : 'border-gray-700 hover:border-gray-500'
                      }`}
                      onClick={() => handlePatternChange(pattern.name)}
                    >
                      {pattern.name}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 italic">Please select technology and architecture first</div>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'entity':
        return (
          <div className="bg-dark rounded-lg border border-gray-800 p-6">
            <h3 className="text-xl font-bold mb-4">Entity Editor</h3>
            <p>Entity editor will be implemented here. This area will include:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2 text-gray-300">
              <li>Interactive database diagram editor</li>
              <li>Add Entity modal (entity name, columns with name & type)</li>
              <li>Draggable canvas blocks for entities</li>
              <li>Drag-and-drop arrows for relationships</li>
            </ul>
            {/* Placeholder for entity editor - will be implemented later */}
            <div className="mt-8 p-10 border border-dashed border-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-300">Entity Editor Canvas</h4>
                <p className="text-gray-500 mt-2">Interactive editor will be displayed here</p>
              </div>
            </div>
          </div>
        );
      
      case 'database':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-dark rounded-lg border border-gray-800 p-6">
              <h3 className="text-xl font-bold mb-4">Database</h3>
              <div className="space-y-3">
                {projectConfig.technology ? (
                  availableDatabases.map((db) => (
                    <div 
                      key={db.id}
                      className={`p-4 border rounded-md cursor-pointer transition-all ${
                        projectConfig.database === db.name 
                          ? 'border-primary bg-primary bg-opacity-10' 
                          : 'border-gray-700 hover:border-gray-500'
                      }`}
                      onClick={() => setProjectConfig(prev => ({ ...prev, database: db.name }))}
                    >
                      {db.name}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 italic">Please go back and select a technology first</div>
                )}
              </div>
            </div>

            <div className="bg-dark rounded-lg border border-gray-800 p-6 col-span-2">
              <h3 className="text-xl font-bold mb-4">Connection String</h3>
              <input
                type="text"
                className="w-full p-3 bg-[#1e1e1e] border border-gray-700 rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Enter your database connection string"
                value={projectConfig.connectionString}
                onChange={(e) => setProjectConfig(prev => ({ ...prev, connectionString: e.target.value }))}
              />
              
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Project Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Project Name</label>
                    <input
                      type="text"
                      className="w-full p-3 bg-[#1e1e1e] border border-gray-700 rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="e.g., EcommerceApp"
                      value={projectConfig.projectName}
                      onChange={(e) => setProjectConfig(prev => ({ ...prev, projectName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Project Description</label>
                    <textarea
                      className="w-full p-3 bg-[#1e1e1e] border border-gray-700 rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="Brief description of your project"
                      rows={3}
                      value={projectConfig.projectDescription}
                      onChange={(e) => setProjectConfig(prev => ({ ...prev, projectDescription: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <button 
                  className="btn-primary w-full py-3"
                  disabled={isLoading || !projectConfig.technology || !projectConfig.database}
                  onClick={handleGenerateProject}
                >
                  {isLoading ? 'Generating Project...' : 'Generate Project'}
                </button>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-darkGray">
      <div className="container-fluid py-8">
        <div className="pt-16 pb-8">
          <div className="flex items-center justify-between mb-12">
            <button 
              className="p-2 rounded-full border border-gray-700 text-gray-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={goToPreviousTab}
              disabled={activeTab === 'technology'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex space-x-4">
              <div 
                className={`w-4 h-4 rounded-full cursor-pointer transition-all ${activeTab === 'technology' ? 'bg-primary scale-110' : 'bg-gray-600'}`}
                onClick={() => setActiveTab('technology')}
              ></div>
              <div 
                className={`w-4 h-4 rounded-full cursor-pointer transition-all ${activeTab === 'entity' ? 'bg-primary scale-110' : 'bg-gray-600'}`}
                onClick={() => setActiveTab('entity')}
              ></div>
              <div 
                className={`w-4 h-4 rounded-full cursor-pointer transition-all ${activeTab === 'database' ? 'bg-primary scale-110' : 'bg-gray-600'}`}
                onClick={() => setActiveTab('database')}
              ></div>
            </div>
            
            <button 
              className="p-2 rounded-full border border-gray-700 text-gray-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={goToNextTab}
              disabled={activeTab === 'database'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <h2 className="text-3xl font-bold mb-10 text-center">
            {activeTab === 'technology' && 'Select Technology Stack'}
            {activeTab === 'entity' && 'Define Your Entities'}
            {activeTab === 'database' && 'Configure Database'}
          </h2>
        </div>
        
        <div className="mb-12">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default GeneratePage; 