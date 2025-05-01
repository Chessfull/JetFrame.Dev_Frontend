import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoOnly from '../assets/images/Logo-Only-removebg.png';
import { apiService } from '../services/api';

// Type definitions for API responses
interface Technology {
  id: number;
  name: string;
  isAvailable: boolean;
  icon?: string;
  description?: string;
  popularity?: number;
  previewImage?: string;
}

interface Architecture {
  id: number;
  name: string;
  description?: string;
}

interface Pattern {
  name: string;
  description?: string;
}

interface Database {
  id: number;
  name: string;
  description?: string;
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

// Mock entity templates
const entityTemplates = [
  {
    name: 'User',
    properties: [
      { name: 'Id', type: 'int', isPrimaryKey: true },
      { name: 'Username', type: 'string', isRequired: true },
      { name: 'Email', type: 'string', isRequired: true },
      { name: 'Password', type: 'string', isRequired: true },
      { name: 'CreatedAt', type: 'DateTime', isRequired: true }
    ]
  },
  {
    name: 'Product',
    properties: [
      { name: 'Id', type: 'int', isPrimaryKey: true },
      { name: 'Name', type: 'string', isRequired: true },
      { name: 'Description', type: 'string' },
      { name: 'Price', type: 'decimal', isRequired: true },
      { name: 'StockQuantity', type: 'int', isRequired: true }
    ]
  },
  {
    name: 'Order',
    properties: [
      { name: 'Id', type: 'int', isPrimaryKey: true },
      { name: 'UserId', type: 'int', isRequired: true, isForeignKey: true },
      { name: 'OrderDate', type: 'DateTime', isRequired: true },
      { name: 'TotalAmount', type: 'decimal', isRequired: true },
      { name: 'Status', type: 'string', isRequired: true }
    ]
  }
];

const GeneratePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'technology' | 'entity' | 'database'>('technology');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [progress, setProgress] = useState(0);

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

  // Mock technology icons and descriptions
  const technologyDetails: Record<string, { icon: string, description: string, popularity: number }> = {
    'DotNet': {
      icon: '🟣',
      description: 'A free, cross-platform, open-source framework for building modern cloud-based applications.',
      popularity: 85
    },
    'Java': {
      icon: '☕',
      description: 'A platform-independent, object-oriented programming language and runtime environment.',
      popularity: 80
    },
    'NodeJs': {
      icon: '🟢',
      description: 'A JavaScript runtime built on Chrome\'s V8 JavaScript engine for building scalable network applications.',
      popularity: 78
    }
  };

  // Architecture tooltips
  const architectureTooltips: Record<string, { description: string, structure: string }> = {
    'Clean': {
      description: 'Clean Architecture emphasizes separation of concerns and dependency rules, making systems more testable and maintainable.',
      structure: 'Domain/\n  - Entities\n  - Use Cases\nInfrastructure/\n  - Data\n  - External Services\nPresentation/\n  - Controllers\n  - Views'
    },
    'Hexagonal': {
      description: 'Hexagonal Architecture (Ports & Adapters) isolates the core logic from external concerns like UI, database, and external services.',
      structure: 'Core/\n  - Domain\n  - Application\nAdapters/\n  - Driving (UI)\n  - Driven (Infrastructure)'
    },
    'Layered': {
      description: 'Layered Architecture organizes code into horizontal layers, each with a specific responsibility in the application.',
      structure: 'Presentation/\nApplication/\nDomain/\nInfrastructure/'
    }
  };

  // Pattern tooltips
  const patternTooltips: Record<string, { description: string, example: string }> = {
    'CQRS': {
      description: 'Command Query Responsibility Segregation separates read and write operations for better performance and scalability.',
      example: 'Commands/\n  - CreateUserCommand\nQueries/\n  - GetUserByIdQuery'
    },
    'DomainEvents': {
      description: 'Domain Events represent something significant that happened in the domain, allowing for loose coupling between components.',
      example: 'Events/\n  - UserCreatedEvent\nHandlers/\n  - EmailNotificationHandler'
    },
    'ServiceRepository': {
      description: 'Service Repository pattern separates business logic from data access through service and repository layers.',
      example: 'Services/\n  - UserService\nRepositories/\n  - UserRepository'
    }
  };

  const [animateContent, setAnimateContent] = useState(false);
  const [selectedEntityTemplate, setSelectedEntityTemplate] = useState<string | null>(null);
  const [codePreview, setCodePreview] = useState<string | null>(null);

  // Section header tooltips
  const sectionTooltips = {
    technology: "Select the backend technology for your project. This determines the programming language and framework that will be used.",
    architecture: "Choose the architectural pattern that organizes your codebase. Hover over each option to see detailed information about the architecture and its structure.",
    pattern: "Select a design pattern for your project. This affects how components interact. Hover over each option to see detailed explanations and examples."
  };

  // Validate if a tab is complete
  const isTabComplete = (tab: 'technology' | 'entity' | 'database'): boolean => {
    switch (tab) {
      case 'technology':
        return Boolean(projectConfig.technology && projectConfig.architecture && projectConfig.designPattern);
      case 'entity':
        return true; // For now, entity tab is always considered complete
      case 'database':
        return Boolean(projectConfig.database && projectConfig.connectionString && projectConfig.projectName);
      default:
        return false;
    }
  };

  // Update progress based on completed steps
  useEffect(() => {
    let completedSteps = 0;
    let totalSteps = 5; // Technology, architecture, pattern, database, project details
    
    if (projectConfig.technology) completedSteps++;
    if (projectConfig.architecture) completedSteps++;
    if (projectConfig.designPattern) completedSteps++;
    if (projectConfig.database) completedSteps++;
    if (projectConfig.projectName && projectConfig.connectionString) completedSteps++;
    
    setProgress((completedSteps / totalSteps) * 100);
  }, [projectConfig]);

  // Handle tab navigation with animation and validation
  const goToNextTab = () => {
    if (!isTabComplete(activeTab)) return;

    setAnimateContent(true);
    setTimeout(() => {
      if (activeTab === 'technology') setActiveTab('entity');
      else if (activeTab === 'entity') setActiveTab('database');
      setAnimateContent(false);
    }, 300);
  };

  // Auto-navigate after completing technology tab
  useEffect(() => {
    if (activeTab === 'technology' && isTabComplete('technology')) {
      goToNextTab();
    }
  }, [projectConfig.designPattern]);

  const goToPreviousTab = () => {
    setAnimateContent(true);
    setTimeout(() => {
      if (activeTab === 'database') setActiveTab('entity');
      else if (activeTab === 'entity') setActiveTab('technology');
      setAnimateContent(false);
    }, 300);
  };

  // Load technologies when component mounts
  useEffect(() => {
    const fetchTechnologies = async () => {
      try {
        const data = await apiService.getTechnologies();
        
        // Enrich technology data with details
        const enrichedData = data.map((tech: Technology) => ({
          ...tech,
          icon: technologyDetails[tech.name]?.icon || '🔧',
          description: technologyDetails[tech.name]?.description || 'A powerful development technology.',
          popularity: technologyDetails[tech.name]?.popularity || 70
        }));
        
        setAvailableTechnologies(enrichedData);
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

  // Handle entity template selection
  const handleEntityTemplateSelect = (templateName: string) => {
    setSelectedEntityTemplate(templateName);
    
    // Generate code preview
    const template = entityTemplates.find(t => t.name === templateName);
    if (template) {
      const codeSnippet = generateEntityCodePreview(template, projectConfig.technology);
      setCodePreview(codeSnippet);
    }
  };

  // Generate model code preview based on selected technology
  const generateEntityCodePreview = (template: any, technology: string) => {
    if (!technology) return "// Select a technology first to see code preview";
    
    if (technology === 'DotNet') {
      return `using System;
using System.ComponentModel.DataAnnotations;

namespace ${projectConfig.projectName || 'YourProject'}.Models
{
    public class ${template.name}
    {
${template.properties.map((prop: any) => {
  let attributes = [];
  if (prop.isPrimaryKey) attributes.push('[Key]');
  if (prop.isRequired) attributes.push('[Required]');
  if (prop.type === 'string') attributes.push(`[StringLength(100)]`);
  
  return `        ${attributes.join('\n        ')}
        public ${prop.type} ${prop.name} { get; set; }${prop.isRequired && prop.type !== 'string' ? ' // Required' : ''}`;
}).join('\n\n')}
    }
}`;
    } else if (technology === 'Java') {
      return `package com.${projectConfig.projectName?.toLowerCase() || 'yourproject'}.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "${template.name.toLowerCase()}s")
public class ${template.name} {
${template.properties.map((prop: any) => {
  let annotations = [];
  if (prop.isPrimaryKey) annotations.push('@Id\n    @GeneratedValue(strategy = GenerationType.IDENTITY)');
  if (prop.isRequired) annotations.push('@Column(nullable = false)');
  if (prop.isForeignKey) annotations.push('@ManyToOne\n    @JoinColumn(name = "user_id")');
  
  return `    ${annotations.join('\n    ')}
    private ${prop.type.toLowerCase() === 'datetime' ? 'LocalDateTime' : prop.type} ${prop.name.charAt(0).toLowerCase() + prop.name.slice(1)};`;
}).join('\n\n')}

    // Getters and Setters omitted for brevity
}`;
    } else if (technology === 'NodeJs') {
      return `const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ${template.name.charAt(0).toLowerCase() + template.name.slice(1)}Schema = new Schema({
${template.properties.map((prop: any) => {
  let options = [];
  if (prop.isRequired) options.push('required: true');
  
  return `  ${prop.name.charAt(0).toLowerCase() + prop.name.slice(1)}: {
    type: ${prop.type === 'string' ? 'String' : prop.type === 'int' ? 'Number' : prop.type === 'decimal' ? 'Number' : 'Date'},
    ${options.join(',\n    ')}
  }`;
}).join(',\n')}
}, { timestamps: true });

module.exports = mongoose.model('${template.name}', ${template.name.charAt(0).toLowerCase() + template.name.slice(1)}Schema);`;
    }
    
    return "// Code preview for selected technology will appear here";
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
            <div className={`${isDarkTheme ? 'bg-dark' : 'bg-white'} rounded-lg border ${isDarkTheme ? 'border-gray-800' : 'border-gray-300'} p-6`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Technology</h3>
                {/* Section header tooltip */}
                <div className="relative group">
                  <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-xs ${
                    isDarkTheme ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  } hover:bg-primary hover:text-white transition-colors cursor-help`}>?</span>
                  
                  <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 right-0 mt-2 w-72 bg-gray-900 rounded-lg shadow-xl p-3">
                    <p className="text-sm text-gray-300">
                      {sectionTooltips.technology}
                    </p>
                    <div className="absolute top-[-6px] right-[8px] transform rotate-45 w-3 h-3 bg-gray-900"></div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {availableTechnologies.map((tech) => (
                  <div 
                    key={tech.id}
                    className={`p-4 border rounded-md transition-all relative ${
                      tech.isAvailable ? 'cursor-pointer hover:shadow-lg hover:translate-y-[-2px]' : 'cursor-not-allowed opacity-60'
                    } ${
                      projectConfig.technology === tech.name 
                        ? 'border-primary bg-primary bg-opacity-10' 
                        : isDarkTheme ? 'border-gray-700 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => handleTechnologyChange(tech.name, tech.isAvailable)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{tech.icon}</span>
                        <span>{tech.name}</span>
                      </div>
                      {!tech.isAvailable && (
                        <span className={`text-xs ${isDarkTheme ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'} py-1 px-2 rounded-full`}>Coming Soon</span>
                      )}
                      {projectConfig.technology === tech.name && (
                        <span className="text-green-500 ml-2">✓</span>
                      )}
                    </div>
                    
                    <div className={`mt-3 text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>{tech.description}</div>
                    
                    <div className="mt-3">
                      <div className={`text-xs ${isDarkTheme ? 'text-gray-500' : 'text-gray-600'} mb-1`}>Community Popularity</div>
                      <div className={`w-full ${isDarkTheme ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                        <div 
                          className="bg-primary rounded-full h-2" 
                          style={{ width: `${tech.popularity}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${isDarkTheme ? 'bg-dark' : 'bg-white'} rounded-lg border ${isDarkTheme ? 'border-gray-800' : 'border-gray-300'} p-6`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Architecture</h3>
                {/* Section header tooltip */}
                <div className="relative group">
                  <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-xs ${
                    isDarkTheme ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  } hover:bg-primary hover:text-white transition-colors cursor-help`}>?</span>
                  
                  <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 right-0 mt-2 w-72 bg-gray-900 rounded-lg shadow-xl p-3">
                    <p className="text-sm text-gray-300">
                      {sectionTooltips.architecture}
                    </p>
                    <div className="absolute top-[-6px] right-[8px] transform rotate-45 w-3 h-3 bg-gray-900"></div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {projectConfig.technology ? (
                  availableArchitectures.map((arch) => (
                    <div 
                      key={arch.id}
                      className={`p-4 border rounded-md cursor-pointer transition-all relative group ${
                        projectConfig.architecture === arch.name 
                          ? 'border-primary bg-primary bg-opacity-10' 
                          : isDarkTheme ? 'border-gray-700 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => handleArchitectureChange(arch.name)}
                    >
                      <div className="flex justify-between items-center">
                        <span>{arch.name}</span>
                        {projectConfig.architecture === arch.name && (
                          <span className="text-green-500 ml-2">✓</span>
                        )}
                      </div>
                      
                      {/* Architecture tooltip */}
                      <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 bottom-full left-0 mb-2 w-80 bg-gray-900 rounded-lg shadow-xl p-4">
                        <h4 className="font-medium text-primary mb-2">{arch.name} Architecture</h4>
                        <p className="text-sm text-gray-300 mb-2">
                          {architectureTooltips[arch.name]?.description || 'An architecture pattern that organizes your codebase.'}
                        </p>
                        <div className="mt-2 p-2 bg-gray-800 rounded font-mono text-xs text-gray-300 whitespace-pre">
                          {architectureTooltips[arch.name]?.structure || 'Project structure information not available.'}
                        </div>
                        <div className="absolute bottom-[-6px] left-4 transform rotate-45 w-3 h-3 bg-gray-900"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`text-${isDarkTheme ? 'gray-500' : 'gray-600'} italic`}>Please select a technology first</div>
                )}
              </div>
            </div>

            <div className={`${isDarkTheme ? 'bg-dark' : 'bg-white'} rounded-lg border ${isDarkTheme ? 'border-gray-800' : 'border-gray-300'} p-6`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Pattern</h3>
                {/* Section header tooltip */}
                <div className="relative group">
                  <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-xs ${
                    isDarkTheme ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  } hover:bg-primary hover:text-white transition-colors cursor-help`}>?</span>
                  
                  <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 right-0 mt-2 w-72 bg-gray-900 rounded-lg shadow-xl p-3">
                    <p className="text-sm text-gray-300">
                      {sectionTooltips.pattern}
                    </p>
                    <div className="absolute top-[-6px] right-[8px] transform rotate-45 w-3 h-3 bg-gray-900"></div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {projectConfig.technology && projectConfig.architecture ? (
                  availablePatterns.map((pattern, index) => (
                    <div 
                      key={index}
                      className={`p-4 border rounded-md cursor-pointer transition-all relative group ${
                        projectConfig.designPattern === pattern.name 
                          ? 'border-primary bg-primary bg-opacity-10' 
                          : isDarkTheme ? 'border-gray-700 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => handlePatternChange(pattern.name)}
                    >
                      <div className="flex justify-between items-center">
                        <span>{pattern.name}</span>
                        {projectConfig.designPattern === pattern.name && (
                          <span className="text-green-500 ml-2">✓</span>
                        )}
                      </div>
                      
                      {/* Pattern tooltip */}
                      <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 bottom-full left-0 mb-2 w-80 bg-gray-900 rounded-lg shadow-xl p-4">
                        <h4 className="font-medium text-primary mb-2">{pattern.name} Pattern</h4>
                        <p className="text-sm text-gray-300 mb-2">
                          {patternTooltips[pattern.name]?.description || 'A design pattern that helps structure your code.'}
                        </p>
                        <div className="mt-2 p-2 bg-gray-800 rounded font-mono text-xs text-gray-300 whitespace-pre">
                          {patternTooltips[pattern.name]?.example || 'Pattern example not available.'}
                        </div>
                        <div className="absolute bottom-[-6px] left-4 transform rotate-45 w-3 h-3 bg-gray-900"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`text-${isDarkTheme ? 'gray-500' : 'gray-600'} italic`}>Please select technology and architecture first</div>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'entity':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-dark rounded-lg border border-gray-800 p-6">
              <h3 className="text-xl font-bold mb-4">Entity Templates</h3>
              <p className="text-gray-400 mb-4">Select a template to start building your data model.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {entityTemplates.map((template, index) => (
                  <div 
                    key={index}
                    className={`p-4 border rounded-md cursor-pointer transition-all hover:shadow-lg hover:translate-y-[-2px] ${
                      selectedEntityTemplate === template.name 
                        ? 'border-primary bg-primary bg-opacity-10' 
                        : 'border-gray-700 hover:border-gray-500'
                    }`}
                    onClick={() => handleEntityTemplateSelect(template.name)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{template.name}</span>
                      {selectedEntityTemplate === template.name && (
                        <span className="text-green-500 ml-2">✓</span>
                      )}
                    </div>
                    <div className="mt-2 text-sm text-gray-400">
                      {template.properties.length} properties
                    </div>
                  </div>
                ))}
              </div>
              
              <h3 className="text-xl font-bold mb-4">Entity Diagram</h3>
              {/* Placeholder for entity diagram editor */}
              <div className="mt-4 p-10 border border-dashed border-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-300">Entity Diagram Editor</h4>
                  <p className="text-gray-500 mt-2">Drag and drop entities to create relationships</p>
                  
                  {selectedEntityTemplate && (
                    <div className="mt-4 p-3 bg-gray-800 rounded-lg inline-block">
                      <div className="text-primary font-medium">{selectedEntityTemplate}</div>
                      <div className="mt-2 border-t border-gray-700 pt-2">
                        <div className="flex items-center text-sm text-gray-400">
                          <span className="w-1/2 text-left">ID</span>
                          <span className="w-1/2 text-right">int</span>
                        </div>
                        {entityTemplates.find(t => t.name === selectedEntityTemplate)?.properties.slice(1, 4).map((prop, i) => (
                          <div key={i} className="flex items-center text-sm text-gray-400 mt-1">
                            <span className="w-1/2 text-left">{prop.name}</span>
                            <span className="w-1/2 text-right">{prop.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-dark rounded-lg border border-gray-800 p-6">
              <h3 className="text-xl font-bold mb-4">Code Preview</h3>
              <div className="bg-[#1e1e1e] rounded-lg p-4 font-mono text-sm overflow-auto h-[500px] transition-opacity duration-300" style={{ opacity: codePreview ? 1 : 0.5 }}>
                <pre className="text-gray-300 whitespace-pre-wrap">
                  {codePreview || "// Select an entity template and technology to see code preview"}
                </pre>
              </div>
              
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Project Structure</h3>
                <div className="bg-[#1e1e1e] rounded-lg p-4 font-mono text-sm">
                  {projectConfig.technology ? (
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-2">📁</span>
                        <span>{projectConfig.projectName || 'YourProject'}</span>
                      </div>
                      {projectConfig.technology === 'DotNet' && (
                        <>
                          <div className="flex items-center ml-5">
                            <span className="text-blue-500 mr-2">📁</span>
                            <span>Models</span>
                          </div>
                          {selectedEntityTemplate && (
                            <div className="flex items-center ml-10">
                              <span className="text-green-500 mr-2">📄</span>
                              <span>{selectedEntityTemplate}.cs</span>
                            </div>
                          )}
                          <div className="flex items-center ml-5">
                            <span className="text-blue-500 mr-2">📁</span>
                            <span>Controllers</span>
                          </div>
                          <div className="flex items-center ml-5">
                            <span className="text-blue-500 mr-2">📁</span>
                            <span>Data</span>
                          </div>
                        </>
                      )}
                      {projectConfig.technology === 'Java' && (
                        <>
                          <div className="flex items-center ml-5">
                            <span className="text-blue-500 mr-2">📁</span>
                            <span>src/main/java</span>
                          </div>
                          <div className="flex items-center ml-10">
                            <span className="text-blue-500 mr-2">📁</span>
                            <span>model</span>
                          </div>
                          {selectedEntityTemplate && (
                            <div className="flex items-center ml-15">
                              <span className="text-green-500 mr-2">📄</span>
                              <span>{selectedEntityTemplate}.java</span>
                            </div>
                          )}
                        </>
                      )}
                      {projectConfig.technology === 'NodeJs' && (
                        <>
                          <div className="flex items-center ml-5">
                            <span className="text-blue-500 mr-2">📁</span>
                            <span>models</span>
                          </div>
                          {selectedEntityTemplate && (
                            <div className="flex items-center ml-10">
                              <span className="text-green-500 mr-2">📄</span>
                              <span>{selectedEntityTemplate.toLowerCase()}.js</span>
                            </div>
                          )}
                          <div className="flex items-center ml-5">
                            <span className="text-blue-500 mr-2">📁</span>
                            <span>routes</span>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">Select a technology to see project structure</div>
                  )}
                </div>
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
                      className={`p-4 border rounded-md cursor-pointer transition-all hover:shadow-lg hover:translate-y-[-2px] ${
                        projectConfig.database === db.name 
                          ? 'border-primary bg-primary bg-opacity-10' 
                          : 'border-gray-700 hover:border-gray-500'
                      }`}
                      onClick={() => setProjectConfig(prev => ({ ...prev, database: db.name }))}
                    >
                      <div className="flex justify-between items-center">
                        <span>{db.name}</span>
                        {projectConfig.database === db.name && (
                          <span className="text-green-500 ml-2">✓</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 italic">Please go back and select a technology first</div>
                )}
              </div>
              
              {projectConfig.database && (
                <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Database Schema Preview</h4>
                  <div className="p-3 border border-gray-700 rounded-lg">
                    {selectedEntityTemplate && (
                      <div className="flex items-center justify-center">
                        <div className="w-32 p-2 border border-primary border-opacity-50 rounded bg-primary bg-opacity-10 text-center">
                          <div className="font-medium">{selectedEntityTemplate}</div>
                          <div className="mt-1 border-t border-gray-700 pt-1 text-xs text-gray-400">
                            {entityTemplates.find(t => t.name === selectedEntityTemplate)?.properties.slice(0, 2).map((prop: any, i) => (
                              <div key={i} className="text-xs">{prop.name}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-4">Project Summary</h3>
                  <div className="bg-[#1e1e1e] rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-400">Technology</div>
                        <div className="font-medium">{projectConfig.technology || '-'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Architecture</div>
                        <div className="font-medium">{projectConfig.architecture || '-'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Pattern</div>
                        <div className="font-medium">{projectConfig.designPattern || '-'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Database</div>
                        <div className="font-medium">{projectConfig.database || '-'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Entities</div>
                        <div className="font-medium">{selectedEntityTemplate ? '1' : '0'}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button 
                  className="btn-primary w-full py-3 transition-all duration-300 hover:scale-105"
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
    <div className={`min-h-screen transition-colors duration-300 ${isDarkTheme ? 'bg-darkGray text-white' : 'bg-gray-100 text-gray-800'}`}>
      {/* Make sure navbar text is visible in light theme - more comprehensive selectors */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Target all possible navbar text elements */
        header a, 
        header span, 
        header div, 
        .navbar a, 
        .navbar span, 
        .navbar-text,
        nav a,
        nav span,
        .nav-link,
        .nav-item,
        .nav-text,
        [class*="nav"] a,
        [class*="navbar"] a,
        [class*="header"] a,
        [class*="nav"] span,
        [class*="navbar"] span,
        [class*="header"] span {
          color: ${isDarkTheme ? 'white' : '#333'} !important;
          opacity: 1 !important;
          visibility: visible !important;
        }
        
        /* Ensure buttons remain visible */
        header button,
        .navbar button,
        nav button,
        [class*="nav"] button,
        [class*="navbar"] button,
        [class*="header"] button {
          color: inherit !important;
          opacity: 1 !important;
          visibility: visible !important;
        }
      `}} />

      {/* New theme toggle at the top right */}
      <div className="fixed top-4 right-4 z-50">
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={!isDarkTheme}
              onChange={() => setIsDarkTheme(!isDarkTheme)}
            />
            <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
            <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ${!isDarkTheme ? 'transform translate-x-6' : ''}`}>
            </div>
          </div>
          <div className={`ml-3 text-sm font-medium ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>
            {isDarkTheme ? '🌙' : '☀️'}
          </div>
        </label>
      </div>

      <div className="container-fluid py-8 relative z-10">
        <div className="pt-16 pb-8">
          {/* Progress bar */}
          <div className="mb-8 px-4">
            <div className={`flex justify-between text-sm mb-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className={`w-full ${isDarkTheme ? 'bg-gray-700' : 'bg-gray-300'} rounded-full h-2`}>
              <div 
                className="bg-primary rounded-full h-2 transition-all duration-500 ease-in-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          
          {/* Tab navigation with improved spacing and styling */}
          <div className="flex items-center justify-between mb-12">
            <button 
              className={`p-2 rounded-full border ${isDarkTheme ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'} hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              onClick={goToPreviousTab}
              disabled={activeTab === 'technology'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex space-x-4">
              {/* Increased dot size and spacing */}
              <div 
                className={`w-4 h-4 rounded-full cursor-pointer transition-all ${activeTab === 'technology' ? 'bg-primary scale-110' : isDarkTheme ? 'bg-gray-600' : 'bg-gray-400'}`}
                onClick={() => setActiveTab('technology')}
              ></div>
              <div 
                className={`w-4 h-4 rounded-full cursor-pointer transition-all ${activeTab === 'entity' ? 'bg-primary scale-110' : isDarkTheme ? 'bg-gray-600' : 'bg-gray-400'}`}
                onClick={() => setActiveTab('entity')}
              ></div>
              <div 
                className={`w-4 h-4 rounded-full cursor-pointer transition-all ${activeTab === 'database' ? 'bg-primary scale-110' : isDarkTheme ? 'bg-gray-600' : 'bg-gray-400'}`}
                onClick={() => setActiveTab('database')}
              ></div>
            </div>
            
            <button 
              className={`p-2 rounded-full border text-gray-400 transition-colors ${
                isTabComplete(activeTab) 
                  ? 'border-primary text-primary hover:bg-primary hover:bg-opacity-10' 
                  : isDarkTheme ? 'border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed' : 'border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
              onClick={goToNextTab}
              disabled={activeTab === 'database' || !isTabComplete(activeTab)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* Tab title */}
          <h2 className="text-3xl font-bold mb-10 text-center">
            {activeTab === 'technology' && 'Select Technology Stack'}
            {activeTab === 'entity' && 'Define Your Entities'}
            {activeTab === 'database' && 'Configure Database'}
          </h2>
        </div>
        
        {/* Tab content with animation */}
        <div className={`mb-12 transition-all duration-300 ${animateContent ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default GeneratePage; 