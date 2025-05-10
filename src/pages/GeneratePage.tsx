// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  includeFrontend: boolean;
  frontendTechnology: string;
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

// Add new interfaces for the entity editor
interface EntityColumn {
  name: string;
  type: string;
  isRequired: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  referencedEntity?: string;
}

interface Entity {
  id: string;
  name: string;
  columns: EntityColumn[];
  relationships: EntityRelationship[];
}

interface EntityRelationship {
  type: 'one-to-many' | 'many-to-one' | 'many-to-many' | 'one-to-one';
  fromEntity: string;
  toEntity: string;
  fromColumn: string;
  toColumn: string;
}

const GeneratePage = () => {
  // Commented out but keeping for reference since it's used in function signatures
  // const navigate = useNavigate(); 
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
    entities: [],
    includeFrontend: false,
    frontendTechnology: ''
  });

  // Available options (will be fetched from API)
  const [availableTechnologies, setAvailableTechnologies] = useState<Technology[]>([]);
  const [availableArchitectures, setAvailableArchitectures] = useState<Architecture[]>([]);
  const [availablePatterns, setAvailablePatterns] = useState<Pattern[]>([]);
  const [availableDatabases, setAvailableDatabases] = useState<Database[]>([]);
  const [availableFrontendTechnologies, setAvailableFrontendTechnologies] = useState<{id: number, name: string}[]>([]);

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
        return entities.length > 0; // Changed to require at least one entity
      case 'database':
        const baseRequirements = Boolean(projectConfig.database && projectConfig.connectionString && projectConfig.projectName);
        // If frontend is included, require a frontend technology
        if (projectConfig.includeFrontend) {
          return baseRequirements && Boolean(projectConfig.frontendTechnology);
        }
        return baseRequirements;
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
    if (!isTabComplete(activeTab)) {
      // Show error message if trying to navigate without completing requirements
      if (activeTab === 'entity' && entities.length === 0) {
        alert("Please add at least one entity before proceeding to the database configuration.");
        return;
      }
      return;
    }

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
    // Immediately fetch technologies
    fetchTechnologies();
    
    // Start with dark theme
    setIsDarkTheme(true);
    
    // Fetch frontend technologies
    fetchFrontendTechnologies();

    // Initialize entities list
    setEntities([]);
  }, []);

  // Define the missing fetchTechnologies function
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
      // Set default values if API fails
      setAvailableTechnologies([
        { 
          id: 1, 
          name: 'DotNet', 
          isAvailable: true,
          icon: '🟣',
          description: 'A free, cross-platform, open-source framework for building modern cloud-based applications.',
          popularity: 85
        }
      ]);
    }
  };

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

  // Keeping function signatures but removing references to unused variables
  const handleEntityTemplateSelect = (templateName: string) => {
    // Implementation removed as the function is not used
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

  // Add entity editor state
  const [entities, setEntities] = useState<Entity[]>([]);
  const [showEntityModal, setShowEntityModal] = useState(false);
  const [currentEntity, setCurrentEntity] = useState<Entity | null>(null);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [newColumn, setNewColumn] = useState<Partial<EntityColumn>>({
    name: '',
    type: 'string',
    isRequired: false,
    isPrimaryKey: false,
    isForeignKey: false
  });
  const [newRelationship, setNewRelationship] = useState<Partial<EntityRelationship>>({
    type: 'one-to-many',
    fromEntity: '',
    toEntity: '',
    fromColumn: '',
    toColumn: ''
  });
  
  const diagramRef = useRef<HTMLDivElement>(null);
  
  // Column type options
  const columnTypes = [
    { value: 'string', label: 'String' },
    { value: 'int', label: 'Integer' },
    { value: 'decimal', label: 'Decimal' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'datetime', label: 'DateTime' },
    { value: 'guid', label: 'GUID' }
  ];
  
  // Relationship types
  const relationshipTypes = [
    { value: 'one-to-many', label: 'One to Many' },
    { value: 'many-to-one', label: 'Many to One' },
    { value: 'many-to-many', label: 'Many to Many' },
    { value: 'one-to-one', label: 'One to One' }
  ];
  
  // Generate entity code preview
  const generateEntityCode = (entity: Entity | null) => {
    if (!entity) return "// Select an entity to see code preview";
    if (!projectConfig.technology) return "// Select a technology first";
    
    if (projectConfig.technology === 'DotNet') {
      return `using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace ${projectConfig.projectName || 'YourProject'}.Models
{
    public class ${entity.name}
    {
${entity.columns.map(col => {
  const attributes = [];
  if (col.isPrimaryKey) attributes.push('[Key]');
  if (col.isRequired) attributes.push('[Required]');
  if (col.type === 'string') attributes.push('[StringLength(100)]');
  if (col.isForeignKey) attributes.push(`[ForeignKey("${col.referencedEntity}")]`);
  
  return `        ${attributes.length ? attributes.join('\n        ') + '\n        ' : ''}public ${col.type.charAt(0).toUpperCase() + col.type.slice(1)}${col.type === 'string' ? '' : '?'} ${col.name} { get; set; }`;
}).join('\n\n')}

${entity.relationships.filter(rel => rel.fromEntity === entity.id).map(rel => {
  const relatedEntity = entities.find(e => e.id === rel.toEntity);
  if (!relatedEntity) return '';
  
  if (rel.type === 'one-to-many') {
    return `        public virtual ICollection<${relatedEntity.name}> ${relatedEntity.name}s { get; set; } = new List<${relatedEntity.name}>();`;
  } else if (rel.type === 'many-to-one') {
    return `        public virtual ${relatedEntity.name} ${relatedEntity.name} { get; set; }`;
  } else if (rel.type === 'one-to-one') {
    return `        public virtual ${relatedEntity.name} ${relatedEntity.name} { get; set; }`;
  }
  return '';
}).join('\n\n')}
    }
}`;
    } else if (projectConfig.technology === 'Java') {
      return `package com.${(projectConfig.projectName || 'yourproject').toLowerCase()}.model;

import javax.persistence.*;
import java.util.*;
import lombok.Data;

@Data
@Entity
@Table(name = "${entity.name.toLowerCase()}")
public class ${entity.name} {
${entity.columns.map(col => {
  const annotations = [];
  if (col.isPrimaryKey) annotations.push('@Id\n    @GeneratedValue(strategy = GenerationType.IDENTITY)');
  if (col.isRequired) annotations.push('@Column(nullable = false)');
  if (col.isForeignKey) annotations.push(`@ManyToOne\n    @JoinColumn(name = "${col.name.toLowerCase()}_id")`);
  
  return `    ${annotations.length ? annotations.join('\n    ') + '\n    ' : ''}private ${col.type.toLowerCase() === 'datetime' ? 'Date' : col.type} ${col.name.charAt(0).toLowerCase() + col.name.slice(1)};`;
}).join('\n\n')}

${entity.relationships.filter(rel => rel.fromEntity === entity.id).map(rel => {
  const relatedEntity = entities.find(e => e.id === rel.toEntity);
  if (!relatedEntity) return '';
  
  if (rel.type === 'one-to-many') {
    return `    @OneToMany(mappedBy = "${entity.name.charAt(0).toLowerCase() + entity.name.slice(1)}")
    private List<${relatedEntity.name}> ${relatedEntity.name.charAt(0).toLowerCase() + relatedEntity.name.slice(1)}s = new ArrayList<>();`;
  } else if (rel.type === 'many-to-one') {
    return `    @ManyToOne
    @JoinColumn(name = "${relatedEntity.name.toLowerCase()}_id")
    private ${relatedEntity.name} ${relatedEntity.name.charAt(0).toLowerCase() + relatedEntity.name.slice(1)};`;
  } else if (rel.type === 'one-to-one') {
    return `    @OneToOne
    @JoinColumn(name = "${relatedEntity.name.toLowerCase()}_id")
    private ${relatedEntity.name} ${relatedEntity.name.charAt(0).toLowerCase() + relatedEntity.name.slice(1)};`;
  }
  return '';
}).join('\n\n')}
}`;
    } else if (projectConfig.technology === 'NodeJs') {
      return `const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ${entity.name.charAt(0).toLowerCase() + entity.name.slice(1)}Schema = new Schema({
${entity.columns.map(col => {
  const options = [];
  if (col.isRequired) options.push('required: true');
  if (col.isPrimaryKey) options.push('unique: true');
  if (col.isForeignKey) options.push(`ref: '${col.referencedEntity}'`);
  
  return `  ${col.name}: {
    type: ${col.type === 'string' ? 'String' : col.type === 'int' ? 'Number' : col.type === 'decimal' ? 'Number' : col.type === 'boolean' ? 'Boolean' : col.type === 'datetime' ? 'Date' : 'Schema.Types.ObjectId'},
    ${options.join(',\n    ')}
  }`;
}).join(',\n')}
}, { timestamps: true });

module.exports = mongoose.model('${entity.name}', ${entity.name.charAt(0).toLowerCase() + entity.name.slice(1)}Schema);`;
    }
    
    return "// Code preview for selected technology will appear here";
  };
  
  // Entity functions
  const addEntity = () => {
    const newEntityId = Date.now().toString();
    const newEntity: Entity = {
      id: newEntityId,
      name: 'NewEntity',
      columns: [
        {
          name: 'Id',
          type: 'int',
          isRequired: true,
          isPrimaryKey: true,
          isForeignKey: false
        },
        {
          name: 'Name',
          type: 'string',
          isRequired: true,
          isPrimaryKey: false,
          isForeignKey: false
        }
      ],
      relationships: []
    };
    
    setCurrentEntity(newEntity);
    setShowEntityModal(true);
  };
  
  const saveEntity = () => {
    if (!currentEntity) return;
    
    if (entities.some(e => e.id === currentEntity.id)) {
      // Update existing entity
      setEntities(entities.map(e => e.id === currentEntity.id ? currentEntity : e));
    } else {
      // Add new entity
      setEntities([...entities, currentEntity]);
    }
    
    setSelectedEntityId(currentEntity.id);
    setShowEntityModal(false);
  };
  
  const addColumn = () => {
    if (!currentEntity || !newColumn.name || !newColumn.type) return;
    
    setCurrentEntity({
      ...currentEntity,
      columns: [
        ...currentEntity.columns,
        {
          name: newColumn.name,
          type: newColumn.type || 'string',
          isRequired: newColumn.isRequired || false,
          isPrimaryKey: newColumn.isPrimaryKey || false,
          isForeignKey: newColumn.isForeignKey || false,
          referencedEntity: newColumn.referencedEntity
        }
      ]
    });
    
    // Reset new column form
    setNewColumn({
      name: '',
      type: 'string',
      isRequired: false,
      isPrimaryKey: false,
      isForeignKey: false
    });
  };
  
  const addRelationship = () => {
    if (!currentEntity || !newRelationship.type || !newRelationship.toEntity) return;
    
    // Check if relationship already exists between these entities
    const relationshipExists = currentEntity.relationships.some(rel => 
      rel.toEntity === newRelationship.toEntity
    );
    
    if (relationshipExists) {
      alert("A relationship already exists between these entities");
      return;
    }
    
    setCurrentEntity({
      ...currentEntity,
      relationships: [
        ...currentEntity.relationships,
        {
          type: newRelationship.type as 'one-to-many' | 'many-to-one' | 'many-to-many' | 'one-to-one',
          fromEntity: currentEntity.id,
          toEntity: newRelationship.toEntity as string,
          fromColumn: newRelationship.fromColumn || 'Id',
          toColumn: newRelationship.toColumn || 'Id'
        }
      ]
    });
    
    // Reset new relationship form
    setNewRelationship({
      type: 'one-to-many',
      fromEntity: '',
      toEntity: '',
      fromColumn: '',
      toColumn: ''
    });
  };
  
  const editEntity = (entityId: string) => {
    const entity = entities.find(e => e.id === entityId);
    if (entity) {
      setCurrentEntity({ ...entity });
      setShowEntityModal(true);
    }
  };
  
  const deleteEntity = (entityId: string) => {
    // Remove relationships involving this entity
    const updatedEntities = entities.map(entity => {
      if (entity.id !== entityId) {
        return {
          ...entity,
          relationships: entity.relationships.filter(
            rel => rel.fromEntity !== entityId && rel.toEntity !== entityId
          )
        };
      }
      return entity;
    });
    
    setEntities(updatedEntities.filter(e => e.id !== entityId));
    if (selectedEntityId === entityId) {
      setSelectedEntityId(null);
    }
  };
  
  // Select entity for code preview
  const selectEntity = (entityId: string) => {
    setSelectedEntityId(entityId);
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
            <div className={`${isDarkTheme ? 'bg-dark' : 'bg-white'} rounded-lg border ${isDarkTheme ? 'border-gray-800' : 'border-gray-300'} p-6`}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <h3 className="text-xl font-bold">Entity Diagram</h3>
                  <div className="ml-2 text-gray-400 relative group">
                    <span className="cursor-help">
                      <InfoCircleIcon />
                    </span>
                    <div className="absolute left-0 w-64 invisible group-hover:visible bg-black bg-opacity-80 text-white text-xs rounded p-2 -bottom-20 z-10">
                      <div className="font-bold mb-1">Relationship Guide:</div>
                      <p>Entities with relationships share the same colored border. Hover over an entity to see its relationships.</p>
                      <p className="mt-1">Full details are shown in the expanded view.</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={addEntity}
                  className="bg-primary hover:bg-primary-dark text-white py-1 px-3 rounded-md flex items-center"
                >
                  <span className="mr-1 text-lg">+</span> Add Entity
                </button>
              </div>
              
              {/* New consolidated diagram area */}
              <div className="relative">
                {/* Magnifying glass button - moved to top-left */}
                <button
                  onClick={() => setShowFullDiagram(true)}
                  className="absolute top-2 left-2 z-10 p-2 bg-primary bg-opacity-80 text-white rounded-full hover:bg-opacity-100 transition-all"
                  title="Expand diagram"
                >
                  <MagnifyingGlassIcon />
                </button>
                
                {/* Diagram container */}
                <div 
                  ref={diagramRef}
                  className={`p-6 border border-dashed rounded-lg ${isDarkTheme ? 'border-gray-700' : 'border-gray-300'} h-[600px] diagram-container custom-scrollbar relative mb-0`}
                >
                  {entities.length > 0 ? (
                    <div className="relative w-full h-full mx-auto" style={{ minWidth: entities.length > 0 ? '600px' : 'auto' }}>
                      {/* Entity cards */}
                      {entities.map(entity => {
                        const positions = calculateEntityPositions(entities);
                        const position = positions[entity.id];
                        
                        if (!position) return null;
                        
                        return (
                          <div 
                            key={entity.id}
                            className="absolute"
                            style={{
                              top: `${position.y}px`,
                              left: `${position.x}px`,
                              width: '160px',
                            }}
                          >
                            <EntityCard 
                              entity={entity}
                              isSelected={selectedEntityId === entity.id}
                              onSelect={selectEntity}
                              onEdit={editEntity}
                              onDelete={deleteEntity}
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full w-full">
                      <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium text-gray-300">No Entities Yet</h4>
                      <p className="text-gray-500 mt-2 mb-4">Start by adding your first entity</p>
                      <button 
                        onClick={addEntity}
                        className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md"
                      >
                        Add Entity
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className={`${isDarkTheme ? 'bg-dark' : 'bg-white'} rounded-lg border ${isDarkTheme ? 'border-gray-800' : 'border-gray-300'} p-6`}>
              <h3 className="text-xl font-bold mb-4">Code Preview</h3>
              <div className={`${isDarkTheme ? 'bg-[#1e1e1e]' : 'bg-gray-900'} rounded-lg p-4 font-mono text-sm custom-scrollbar h-[600px] overflow-hidden transition-opacity duration-300`}>
                <div className="h-full overflow-auto custom-scrollbar">
                  <pre className="text-gray-300 whitespace-pre-wrap">
                    {selectedEntityId 
                      ? generateEntityCode(entities.find(e => e.id === selectedEntityId) || null) 
                      : "// Select an entity to see code preview"}
                  </pre>
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
                  // Manually sort to put SqlServer first and add console log for database names
                  [...availableDatabases]
                    .sort((a, b) => {
                      // Put SqlServer first
                      if (a.name === 'SqlServer') return -1;
                      if (b.name === 'SqlServer') return 1;
                      // Then sort alphabetically
                      return a.name.localeCompare(b.name);
                    })
                    .map((db) => {
                      // Remove log statement
                      return (
                        <div 
                          key={db.id}
                          className={`p-4 border rounded-md cursor-pointer transition-all hover:shadow-lg hover:translate-y-[-2px] ${
                            projectConfig.database === db.name 
                              ? 'border-primary bg-primary bg-opacity-10' 
                              : 'border-gray-700 hover:border-gray-500'
                            }`}
                          onClick={() => handleDatabaseSelection(db.name)}
                        >
                          <div className="flex justify-between items-center">
                            <span>{db.name}</span>
                            {projectConfig.database === db.name && (
                              <span className="text-green-500 ml-2">✓</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="text-gray-500 italic">Please go back and select a technology first</div>
                )}
              </div>
              
              {projectConfig.database && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold mb-2">Connection String <span className="text-xs text-gray-500 font-normal">(optional)</span></h3>
                  <input
                    type="text"
                    className="w-full p-3 bg-[#1e1e1e] border border-gray-700 rounded-md focus:border-primary focus:ring-1 focus:ring-primary custom-scrollbar"
                    placeholder="Enter your database connection string"
                    value={projectConfig.connectionString}
                    onChange={(e) => setProjectConfig(prev => ({ ...prev, connectionString: e.target.value }))}
                  />
                </div>
              )}

              {/* Frontend Options */}
              <div className="mt-8 border-t border-gray-700 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Include Frontend</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={projectConfig.includeFrontend}
                      onChange={(e) => handleFrontendToggle(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {projectConfig.includeFrontend && (
                  <div className="mt-4">
                    <h3 className="text-lg font-bold mb-2">Frontend Technology</h3>
                    <div className="space-y-3">
                      {availableFrontendTechnologies.map(tech => (
                        <div 
                          key={tech.id}
                          className={`p-4 border rounded-md transition-all ${
                            tech.isAvailable ? 'cursor-pointer hover:shadow-lg hover:translate-y-[-2px]' : 'cursor-not-allowed opacity-60'
                          } ${
                            projectConfig.frontendTechnology === tech.name 
                              ? 'border-primary bg-primary bg-opacity-10' 
                              : 'border-gray-700 hover:border-gray-500'
                            }`}
                          onClick={() => tech.isAvailable && handleFrontendTechnologyChange(tech.name)}
                        >
                          <div className="flex justify-between items-center">
                            <span>{tech.name}</span>
                            {!tech.isAvailable && (
                              <span className="text-xs bg-gray-800 text-gray-400 py-1 px-2 rounded-full">Coming Soon</span>
                            )}
                            {projectConfig.frontendTechnology === tech.name && (
                              <span className="text-green-500 ml-2">✓</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-dark rounded-lg border border-gray-800 p-6 col-span-2">
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
                  <label className="block text-sm font-medium text-gray-400 mb-1">Project Description <span className="text-xs text-gray-500 font-normal">(optional)</span></label>
                  <textarea
                    className="w-full p-3 bg-[#1e1e1e] border border-gray-700 rounded-md focus:border-primary focus:ring-1 focus:ring-primary custom-scrollbar"
                    placeholder="Brief description of your project"
                    rows={3}
                    value={projectConfig.projectDescription}
                    onChange={(e) => setProjectConfig(prev => ({ ...prev, projectDescription: e.target.value }))}
                  />
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
                      {projectConfig.includeFrontend && (
                        <div>
                          <div className="text-sm text-gray-400">Frontend</div>
                          <div className="font-medium">{projectConfig.frontendTechnology || '-'}</div>
                        </div>
                      )}
                      <div className="relative group">
                        <div className="text-sm text-gray-400">Entities</div>
                        <div className="font-medium">{entities.length}</div>
                        
                        {/* Entity names hover panel */}
                        {entities.length > 0 && (
                          <div className="absolute left-0 invisible group-hover:visible bg-black bg-opacity-80 text-white text-xs rounded p-2 -bottom-[calc(2rem+8px*min(10,entities.length))] z-10 w-48">
                            <div className="font-bold mb-1">Entity List:</div>
                            <div className="max-h-40 overflow-y-auto">
                              {entities.map((entity, index) => (
                                <div key={index} className="py-1 border-b border-gray-700 last:border-b-0">
                                  {entity.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <button 
                  className="btn-primary w-full py-3 transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                  onClick={handleGenerateProject}
                >
                  <WingIcon />
                  <span>{isLoading ? 'Generating Project...' : 'Generate Project'}</span>
                </button>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Layout calculations for entities on the designer canvas
  const calculateEntityPositions = (entityList: Entity[]) => {
    const positions: Record<string, { x: number, y: number, height: number }> = {};
    const columnCount = 3; // Fixed 3-column layout
    const columnWidth = 160; // Width of each column
    const padding = 20; // Padding between entities
    const baseRowHeight = 150; // Base height for entities
    
    // Calculate column heights and positions
    const columnHeights = Array(columnCount).fill(padding);
    
    entityList.forEach((entity, index) => {
      // Determine which column to place this entity in (always try to balance heights)
      const columnIndex = index % columnCount;
      
      // Calculate entity height based on number of columns (min 150px)
      const entityHeight = Math.max(baseRowHeight, 100 + (entity.columns.length * 20));
      
      // Position the entity
      positions[entity.id] = {
        x: padding + (columnIndex * (columnWidth + padding)),
        y: columnHeights[columnIndex],
        height: entityHeight
      };
      
      // Update column height
      columnHeights[columnIndex] += entityHeight + padding;
    });
    
    return positions;
  };

  // Helper for rendering EntityCards in a grid or column layout
  const renderEntities = () => {
    // Fixed width for better layout
    // ... existing code ...
  };

  // Function kept for reference but commented out since it's unused
  const calculateRelationshipPath = (fromEntity: Entity, toEntity: Entity, positions: Record<string, { x: number, y: number, height: number }>) => {
    // Implementation commented out as the function is not used
  };

  // Add a function to get default connection string based on selected database
  const getDefaultConnectionString = (dbName: string, projectName: string = 'mydb'): string => {
    // Sanitize project name for use in connection string (remove spaces, special chars)
    const sanitizedName = projectName ? projectName.replace(/[^a-zA-Z0-9]/g, '') : 'mydb';
    
    let connectionString = '';
    
    switch (dbName) {
      case 'PostgreSQL':
        connectionString = `Host=localhost;Port=5432;Database=${sanitizedName};Username=postgres;Password=password;`;
        break;
      case 'MySQL':
        connectionString = `Server=localhost;Port=3306;Database=${sanitizedName};Uid=root;Pwd=password;`;
        break;
      case 'SqlServer':
        connectionString = `Server=localhost;Database=${sanitizedName};Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;`;
        break;
      case 'MongoDB':
        connectionString = `mongodb://localhost:27017/${sanitizedName}`;
        break;
      case 'Oracle':
        connectionString = `Data Source=localhost:1521/ORCLPDB1;User Id=system;Password=password;`;
        break;
      case 'SQLite':
        connectionString = `Data Source=${sanitizedName}.db;Version=3;`;
        break;
      default:
        connectionString = '';
    }
    
    return connectionString;
  };

  // Add effect to set default connection string when database is selected or project name changes
  useEffect(() => {
    // Initialize the connection string based on the selected database
    if (projectConfig.database) {
      const defaultConnectionString = getDefaultConnectionString(
        projectConfig.database, 
        projectConfig.projectName || 'mydb'
      );
      
      // Force the connection string update
      setProjectConfig(prev => ({
        ...prev,
        connectionString: defaultConnectionString
      }));
    }
  }, [projectConfig.database]);

  // Update connection string when project name changes
  useEffect(() => {
    if (projectConfig.database && projectConfig.projectName) {
      // Only update if it seems like we're using the default pattern (contains localhost)
      if (projectConfig.connectionString.includes('localhost')) {
        const updatedConnectionString = getDefaultConnectionString(
          projectConfig.database, 
          projectConfig.projectName
        );
        
        setProjectConfig(prev => ({
          ...prev,
          connectionString: updatedConnectionString
        }));
      }
    }
  }, [projectConfig.projectName]);

  // Define a wing icon component for the Generate Project button
  const WingIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-50">
      <path d="M12 4C7 4 2.73 7.11 1 11.5C2.73 15.89 7 19 12 19C17 19 21.27 15.89 23 11.5C21.27 7.11 17 4 12 4ZM12 16.5C9.24 16.5 7 14.26 7 11.5C7 8.74 9.24 6.5 12 6.5C14.76 6.5 17 8.74 17 11.5C17 14.26 14.76 16.5 12 16.5ZM12 8.5C10.34 8.5 9 9.84 9 11.5C9 13.16 10.34 14.5 12 14.5C13.66 14.5 15 13.16 15 11.5C15 9.84 13.66 8.5 12 8.5Z" fill="currentColor"/>
    </svg>
  );

  // Add state for generation status modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [generationMessage, setGenerationMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  // Replace toast notification with centered notification
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    show: false,
    message: '',
    type: 'info'
  });

  // Show notification helper function
  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setNotification({
      show: true,
      message,
      type
    });
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Add a central Notification component
  const Notification = () => {
    if (!notification.show) return null;
    
    const bgColors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    };
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className={`${bgColors[notification.type]} text-white px-8 py-6 rounded-lg shadow-xl max-w-md mx-4 relative`}>
          <div className="flex items-start">
            <div className="flex-1">
              <p className="text-lg font-medium whitespace-pre-line">{notification.message}</p>
            </div>
            <button 
              onClick={() => setNotification(prev => ({ ...prev, show: false }))}
              className="ml-4 text-white hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Update handleGenerateProject to include validation
  const handleGenerateProject = async () => {
    // Collect all validation errors
    const errors = [];
    
    if (!projectConfig.technology) {
      errors.push("Please select a technology");
    }
    
    if (!projectConfig.database) {
      errors.push("Please select a database");
    }
    
    if (!projectConfig.projectName || projectConfig.projectName.trim() === '') {
      errors.push("Please enter a project name");
    }
    
    // If there are validation errors, show them
    if (errors.length > 0) {
      // Join all errors with line breaks
      const errorMessage = errors.map(e => `• ${e}`).join('\n');
      showNotification(errorMessage, "error");
      return;
    }
    
    // If description is empty, set default
    if (!projectConfig.projectDescription || projectConfig.projectDescription.trim() === '') {
      setProjectConfig(prev => ({ ...prev, projectDescription: 'Description' }));
    }

    // Reset status
    setGenerationStatus('generating');
    setGenerationMessage('Initializing project generation...');
    setShowStatusModal(true);
    setIsLoading(true);
    
    try {
      // Map our entity structure to the API expected format
      const apiEntities = entities.map(entity => {
        // Map columns to properties
        const properties = entity.columns.map(column => ({
          name: column.name,
          type: column.type,
          isPrimaryKey: column.isPrimaryKey,
          isRequired: column.isRequired
        }));
        
        // Map relationships
        const relationships = entity.relationships.map(rel => {
          const targetEntity = entities.find(e => e.id === rel.toEntity);
          if (!targetEntity) return null;
          
          // Map relationship types to API format (CamelCase instead of kebab-case)
          let mappedType = '';
          switch (rel.type) {
            case 'one-to-many': mappedType = 'OneToMany'; break;
            case 'many-to-one': mappedType = 'ManyToOne'; break;
            case 'many-to-many': mappedType = 'ManyToMany'; break;
            case 'one-to-one': mappedType = 'OneToOne'; break;
            default: mappedType = 'OneToMany';
          }
          
          // Find foreign key if it's a ManyToOne relationship
          let foreignKeyProperty = undefined;
          if (mappedType === 'ManyToOne') {
            // Look for a column that might be a foreign key to this relation
            const possibleFkColumn = entity.columns.find(col => 
              col.isForeignKey && col.referencedEntity === targetEntity.id
            );
            
            if (possibleFkColumn) {
              foreignKeyProperty = possibleFkColumn.name;
            }
          }
          
          return {
            targetEntity: targetEntity.name,
            type: mappedType,
            ...(foreignKeyProperty && { foreignKeyProperty })
          };
        }).filter(Boolean); // Remove null entries
        
        return {
          name: entity.name,
          properties,
          relationships
        };
      });
      
      // Update status
      setGenerationMessage('Sending project configuration to server...');
      
      // Send to API
      const response = await apiService.generateProject({
        projectName: projectConfig.projectName,
        projectDescription: projectConfig.projectDescription || 'No description provided',
        technology: projectConfig.technology,
        architecture: projectConfig.architecture,
        designPattern: projectConfig.designPattern,
        database: projectConfig.database,
        connectionString: projectConfig.connectionString,
        includeFrontend: projectConfig.includeFrontend,
        ...(projectConfig.includeFrontend && { frontendTechnology: projectConfig.frontendTechnology }),
        entities: apiEntities
      });
      
      // Check for successful response
      if (response.id) {
        setGenerationMessage('Project generation in progress. This may take a few minutes...');
        
        // Start a timer to check project generation status
        const checkStatusInterval = setInterval(async () => {
          try {
            const statusResponse = await apiService.getProjectStatus(response.id);
            
            // Update progress percentage if available
            if (statusResponse.progress) {
              setGenerationMessage(`Generating project: ${statusResponse.progress}% complete`);
            }
            
            if (statusResponse.status === 'Completed') {
              clearInterval(checkStatusInterval);
              setIsLoading(false);
              
              // Set success state
              setGenerationStatus('success');
              setGenerationMessage('Project generated successfully!');
              
              // Set download URL
              const downloadUrl = apiService.downloadProject(response.id);
              setDownloadUrl(downloadUrl);
              
              // Don't automatically open download - let user click the button in modal
            } else if (statusResponse.status === 'Failed') {
              clearInterval(checkStatusInterval);
              setIsLoading(false);
              
              // Set error state
              setGenerationStatus('error');
              setGenerationMessage(statusResponse.error || 'Project generation failed. Please try again.');
            }
            // Wait for 'Queued' or 'InProgress' status
          } catch (error) {
            clearInterval(checkStatusInterval);
            setIsLoading(false);
            setGenerationStatus('error');
            setGenerationMessage('Error checking generation status. Please try again.');
          }
        }, 2000); // Check every 2 seconds
      }
    } catch (error) {
      console.error('Error generating project:', error);
      setIsLoading(false);
      setGenerationStatus('error');
      setGenerationMessage('An error occurred while generating the project. Please try again.');
    }
  };

  // Add state for diagram positioning
  const [showFullDiagram, setShowFullDiagram] = useState(false);

  // Add a magnifying glass icon component
  const MagnifyingGlassIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
  );

  // Define the constant for column width
  const columnWidth = 160;

  // Updated Entity Card Component with edit and delete buttons and proper types
  interface EntityCardProps {
    entity: Entity;
    isSelected: boolean;
    onSelect: (entityId: string) => void;
    onEdit: (entityId: string) => void;
    onDelete: (entityId: string) => void;
  }

  const EntityCard = ({ entity, isSelected, onSelect, onEdit, onDelete }: EntityCardProps) => {
    // Get relationships for this entity
    const relationships = getEntityRelationships(entity.id);
    
    // Get connected entity groups
    const entityGroups = getConnectedEntities();
    const entityGroup = entityGroups.get(entity.id) ?? -1;
    
    // Generate color based on the entity's group
    const groupColor = entityGroup !== -1 ? getRelationshipColor(`group-${entityGroup}`) : '';
    
    // Use group color if the entity has relationships
    const borderColor = relationships.length > 0 ? groupColor : '';
    
    // Create relationship border style
    const relationshipBorder = relationships.length > 0 ? {
      boxShadow: `0 0 0 2px ${borderColor}`,
      transition: 'box-shadow 0.3s ease'
    } : {};
    
    const tooltipContent = relationships.length > 0 ?
      relationships.map(rel => 
        `${rel.isSource ? `${rel.entity.name} → ${entity.name}` : `${entity.name} → ${rel.entity.name}`}: ${rel.relation.type}`
      ).join("\n") :
      "No relationships";
    
    return (
      <div className="relative group">
        {/* Outer div for the border */}
        <div 
          className="p-0 rounded-lg w-full h-full absolute"
          style={relationshipBorder}
        ></div>
        
        {/* Inner div for the content and selection highlighting */}
        <div 
          className={`p-3 rounded-lg ${
            isSelected ? 'bg-primary bg-opacity-10' : isDarkTheme ? 'bg-gray-800' : 'bg-white'
          } border ${isDarkTheme ? 'border-gray-700' : 'border-gray-300'} shadow-sm relative`}
          onClick={() => onSelect(entity.id)}
          title={tooltipContent}
        >
          {/* Edit and Delete buttons in top right */}
          <div className="absolute top-1 right-1 flex space-x-1">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(entity.id); }}
              className="text-gray-400 hover:text-primary p-1"
              title="Edit Entity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(entity.id); }}
              className="text-gray-400 hover:text-red-500 p-1"
              title="Delete Entity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Tooltip that appears on hover */}
          {relationships.length > 0 && (
            <div className="absolute left-0 w-full invisible group-hover:visible bg-black bg-opacity-80 text-white text-xs rounded p-2 -bottom-16 z-10">
              <div className="font-bold mb-1">Relationships:</div>
              {relationships.map((rel, idx) => (
                <div key={idx}>
                  {rel.isSource 
                    ? `${rel.entity.name} → ${entity.name}` 
                    : `${entity.name} → ${rel.entity.name}`}: {rel.relation.type}
                </div>
              ))}
            </div>
          )}
          
          <div className="font-medium border-b pb-2 mb-2 border-gray-700">{entity.name}</div>
          <div className="text-xs max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
            {entity.columns.map((col: EntityColumn, colIndex) => (
              <div key={`${entity.id}-col-${colIndex}`} className="flex justify-between py-1">
                <span className="truncate mr-1">{col.name}</span>
                <span className="text-gray-500 flex-shrink-0">{col.type}</span>
              </div>
            ))}
          </div>
          <div className="text-xs mt-2 text-gray-500">
            {entity.columns.length} columns
          </div>
        </div>
      </div>
    );
  };

  // Entity Modal - to add/edit entities
  {showEntityModal && currentEntity && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`${isDarkTheme ? 'bg-dark' : 'bg-white'} rounded-lg border ${isDarkTheme ? 'border-gray-800' : 'border-gray-300'} p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">
            {entities.some(e => e.id === currentEntity.id) ? `Edit ${currentEntity.name}` : 'Create New Entity'}
          </h3>
          <button 
            onClick={() => setShowEntityModal(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Entity Name</label>
          <input
            type="text"
            className={`w-full p-2 rounded-md ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} border focus:border-primary focus:ring-1 focus:ring-primary`}
            value={currentEntity.name}
            onChange={(e) => setCurrentEntity({ ...currentEntity, name: e.target.value })}
            placeholder="EntityName"
          />
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">Columns</label>
          </div>
          
          <div className={`p-4 mb-4 rounded-md ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${isDarkTheme ? 'border-gray-700' : 'border-gray-300'}`}>
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-left py-2">Required</th>
                  <th className="text-left py-2">Primary Key</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentEntity.columns.map((column, index) => (
                  <tr key={index} className={`border-b ${isDarkTheme ? 'border-gray-700' : 'border-gray-300'}`}>
                    <td className="py-2">{column.name}</td>
                    <td className="py-2">{column.type}</td>
                    <td className="py-2">{column.isRequired ? '✓' : '✗'}</td>
                    <td className="py-2">{column.isPrimaryKey ? '✓' : '✗'}</td>
                    <td className="py-2">
                      <button 
                        onClick={() => {
                          setCurrentEntity({
                            ...currentEntity,
                            columns: currentEntity.columns.filter((_, i) => i !== index)
                          });
                        }}
                        className="text-red-500 hover:text-red-600"
                        disabled={column.isPrimaryKey} // Prevent deleting primary key
                        title={column.isPrimaryKey ? "Can't delete primary key" : "Delete column"}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="grid grid-cols-5 gap-2 mb-2">
            <div className="col-span-2">
              <input
                type="text"
                className={`w-full p-2 rounded-md ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} border focus:border-primary focus:ring-1 focus:ring-primary`}
                value={newColumn.name || ''}
                onChange={(e) => setNewColumn({ ...newColumn, name: e.target.value })}
                placeholder="Column Name"
              />
            </div>
            <div>
              <select
                className={`w-full p-2 rounded-md ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} border focus:border-primary focus:ring-1 focus:ring-primary`}
                value={newColumn.type}
                onChange={(e) => setNewColumn({ ...newColumn, type: e.target.value })}
              >
                {columnTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="columnRequired"
                className="mr-2"
                checked={newColumn.isRequired || false}
                onChange={(e) => setNewColumn({ ...newColumn, isRequired: e.target.checked })}
              />
              <label htmlFor="columnRequired" className="text-sm">Required</label>
            </div>
            <div>
              <button 
                onClick={addColumn}
                className="w-full bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md"
                disabled={!newColumn.name}
              >
                Add Column
              </button>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">Relationships</label>
          </div>
          
          {currentEntity.relationships.length > 0 && (
            <div className={`p-4 mb-4 rounded-md ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${isDarkTheme ? 'border-gray-700' : 'border-gray-300'}`}>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Target Entity</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntity.relationships.map((rel, index) => {
                    const targetEntity = entities.find(e => e.id === rel.toEntity);
                    return (
                      <tr key={index} className={`border-b ${isDarkTheme ? 'border-gray-700' : 'border-gray-300'}`}>
                        <td className="py-2">{rel.type}</td>
                        <td className="py-2">{targetEntity?.name || 'Unknown'}</td>
                        <td className="py-2">
                          <button 
                            onClick={() => {
                              setCurrentEntity({
                                ...currentEntity,
                                relationships: currentEntity.relationships.filter((_, i) => i !== index)
                              });
                            }}
                            className="text-red-500 hover:text-red-600"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          
          {entities.length > 1 && (
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div>
                <select
                  className={`w-full p-2 rounded-md ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} border focus:border-primary focus:ring-1 focus:ring-primary`}
                  value={newRelationship.type as string}
                  onChange={(e) => setNewRelationship({ ...newRelationship, type: e.target.value as 'one-to-many' | 'many-to-one' | 'many-to-many' | 'one-to-one' })}
                >
                  {relationshipTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  className={`w-full p-2 rounded-md ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} border focus:border-primary focus:ring-1 focus:ring-primary`}
                  value={newRelationship.toEntity || ''}
                  onChange={(e) => setNewRelationship({ ...newRelationship, toEntity: e.target.value })}
                >
                  <option value="">Select Target Entity</option>
                  {entities.filter(e => e.id !== currentEntity.id).map(entity => (
                    <option key={entity.id} value={entity.id}>{entity.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <button 
                  onClick={addRelationship}
                  className="w-full bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md"
                  disabled={!newRelationship.toEntity}
                >
                  Add Relationship
                </button>
              </div>
            </div>
          )}
          
          {entities.length <= 1 && (
            <div className={`p-4 rounded-md text-center ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <p className="text-gray-500">You need at least two entities to create relationships</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 mt-8">
          <button 
            onClick={() => setShowEntityModal(false)}
            className={`py-2 px-4 rounded-md ${isDarkTheme ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Cancel
          </button>
          <button 
            onClick={saveEntity}
            className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md"
          >
            {entities.some(e => e.id === currentEntity.id) ? 'Update Entity' : 'Create Entity'}
          </button>
        </div>
      </div>
    </div>
  )}

  // Add the InfoCircleIcon component for the tooltip
  const InfoCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  );

  // Add a relationship color generator function that returns consistent colors
  const getRelationshipColor = (relationshipId: string) => {
    // Define a set of visually distinct colors that work in both light and dark themes
    const colors = [
      "rgb(239, 68, 68)",   // red-500
      "rgb(59, 130, 246)",  // blue-500
      "rgb(16, 185, 129)",  // green-500
      "rgb(217, 70, 239)",  // purple-500
      "rgb(245, 158, 11)",  // amber-500
      "rgb(14, 165, 233)",  // sky-500
      "rgb(168, 85, 247)",  // violet-500
      "rgb(251, 146, 60)",  // orange-400
      "rgb(236, 72, 153)",  // pink-500
      "rgb(20, 184, 166)",  // teal-500
    ];
    
    // Generate a consistent index based on the relationship ID
    const hashCode = relationshipId.split('').reduce((acc, char) => 
      acc + char.charCodeAt(0), 0);
    
    // Pick a color based on the hash
    return colors[hashCode % colors.length];
  };

  // Add a function to get connected component of entities (entities that are connected through relationships)
  const getConnectedEntities = () => {
    // Map to track which connected component each entity belongs to
    const entityGroups = new Map<string, number>();
    let groupCount = 0;
    
    // Find connected components using a simple algorithm
    const findGroup = (entityId: string): number => {
      if (entityGroups.has(entityId)) {
        return entityGroups.get(entityId)!;
      }
      
      // Create a new group for this entity
      const group = groupCount++;
      entityGroups.set(entityId, group);
      
      // Find all directly connected entities and assign them to the same group
      entities.forEach(entity => {
        if (entity.id === entityId) {
          // Check outgoing relationships
          entity.relationships.forEach(rel => {
            if (!entityGroups.has(rel.toEntity)) {
              entityGroups.set(rel.toEntity, group);
              // Recursively group connected entities
              findGroup(rel.toEntity);
            }
          });
        } else {
          // Check incoming relationships
          entity.relationships.forEach(rel => {
            if (rel.toEntity === entityId && !entityGroups.has(entity.id)) {
              entityGroups.set(entity.id, group);
              // Recursively group connected entities
              findGroup(entity.id);
            }
          });
        }
      });
      
      return group;
    };
    
    // Ensure all entities are assigned to a group
    entities.forEach(entity => {
      if (!entityGroups.has(entity.id)) {
        findGroup(entity.id);
      }
    });
    
    return entityGroups;
  };

  // Update the getEntityRelationships function to use the connected components
  const getEntityRelationships = (entityId: string) => {
    // Find all relationships where this entity is either source or target
    const allRelationships: Array<{relation: EntityRelationship, entity: Entity, isSource: boolean}> = [];
    
    entities.forEach(entity => {
      // Check if entity has relationships with the given entityId
      entity.relationships.forEach(rel => {
        if (rel.fromEntity === entityId) {
          const targetEntity = entities.find(e => e.id === rel.toEntity);
          if (targetEntity) {
            allRelationships.push({
              relation: rel,
              entity: targetEntity,
              isSource: false,
            });
          }
        } else if (rel.toEntity === entityId) {
          allRelationships.push({
            relation: rel,
            entity: entity,
            isSource: true,
          });
        }
      });
    });
    
    return allRelationships;
  };

  // Update StatusModal component for UI improvements
  const StatusModal = () => {
    if (!showStatusModal) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className={`${isDarkTheme ? 'bg-dark' : 'bg-white'} rounded-lg border ${isDarkTheme ? 'border-gray-800' : 'border-gray-300'} p-8 w-full max-w-md`}>
          <div className="text-center">
            {/* Different content based on status */}
            {generationStatus === 'generating' && (
              <>
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                <h3 className="text-xl font-bold mb-2">Generating Project</h3>
                <p className="text-gray-400 mb-4">{generationMessage}</p>
                {/* Removed the orange progress bar */}
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md"
                >
                  Hide (Continue in Background)
                </button>
              </>
            )}
            
            {generationStatus === 'success' && (
              <>
                <div className="bg-green-900 bg-opacity-20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Success!</h3>
                <p className="text-gray-400 mb-6">{generationMessage}</p>
                <div className="flex justify-center space-x-3">
                  <a
                    href={downloadUrl}
                    download
                    className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md w-32 flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Project
                  </a>
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md w-32"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
            
            {generationStatus === 'error' && (
              <>
                <div className="bg-red-900 bg-opacity-20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Error</h3>
                <p className="text-gray-400 mb-6">{generationMessage}</p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => {
                      setShowStatusModal(false);
                      setGenerationStatus('idle');
                    }}
                    className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md w-32"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setGenerationStatus('idle');
                      handleGenerateProject();
                    }}
                    className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md w-32"
                  >
                    Try Again
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Completely rewrite the database selection handler to fix the connection string issue
  const handleDatabaseSelection = (dbName: string) => {
    // Generate appropriate connection string based on exact database name
    let connectionString = '';
    const projectNameForDb = projectConfig.projectName || 'mydb';
    
    // Check the exact database name from the UI
    if (dbName === 'SqlServer') {
      connectionString = `Server=localhost;Database=${projectNameForDb};User Id=sa;Password=password;TrustServerCertificate=True;`;
    } 
    else if (dbName === 'MySQL') {
      connectionString = `Server=localhost;Port=3306;Database=${projectNameForDb};Uid=root;Pwd=password;`;
    } 
    else if (dbName === 'PostgreSQL') {
      connectionString = `Host=localhost;Port=5432;Database=${projectNameForDb};Username=postgres;Password=password;`;
    }
    else {
      // Fallback for any other database
      connectionString = `Server=localhost;Database=${projectNameForDb};`;
    }
    
    // Set state with the new connection string - use function form to ensure we get the latest state
    setProjectConfig(prev => {
      const newState = {
        ...prev,
        database: dbName,
        connectionString: connectionString
      };
      
      return newState;
    });
    
    // Force the connection string to update in the UI by setting it directly
    setTimeout(() => {
      const connectionInput = document.querySelector('input[placeholder="Enter your database connection string"]') as HTMLInputElement;
      if (connectionInput) {
        connectionInput.value = connectionString;
      }
    }, 100);
  };

  // Update useEffect to also handle connection string properly
  useEffect(() => {
    if (projectConfig.database && projectConfig.projectName) {
      // Generate a new connection string based on current database and new project name
      let connectionString = '';
      
      // Make sure database names match exactly
      switch (projectConfig.database) {
        case 'MySQL':
          connectionString = `Server=localhost;Port=3306;Database=${projectConfig.projectName};Uid=root;Pwd=password;`;
          break;
        case 'PostgreSQL':
          connectionString = `Host=localhost;Port=5432;Database=${projectConfig.projectName};Username=postgres;Password=password;`;
          break;
        case 'SqlServer':
          connectionString = `Server=localhost;Database=${projectConfig.projectName};User Id=sa;Password=password;TrustServerCertificate=True;`;
          break;
        default:
          connectionString = `Server=localhost;Database=${projectConfig.projectName};`;
      }
      
      // Only update if we're using the default pattern (contains localhost)
      if (projectConfig.connectionString.includes('localhost')) {
        setProjectConfig(prev => ({
          ...prev,
          connectionString: connectionString
        }));
      }
    }
  }, [projectConfig.projectName, projectConfig.database]);

  // Fetch frontend technologies
  const fetchFrontendTechnologies = async () => {
    try {
      const data = await apiService.getFrontendTechnologies();
      setAvailableFrontendTechnologies(data);
    } catch (error) {
      console.error('Error fetching frontend technologies:', error);
      // Fallback to some defaults if API fails
      setAvailableFrontendTechnologies([
        { id: 1, name: 'React', isAvailable: true },
        { id: 2, name: 'Angular', isAvailable: false }
      ]);
    }
  };

  useEffect(() => {
    // Immediately fetch technologies
    fetchTechnologies();
    
    // Start with dark theme
    setIsDarkTheme(true);
    
    // Fetch frontend technologies
    fetchFrontendTechnologies();

    // Initialize entities list
    setEntities([]);
  }, []);

  // Handle frontend toggle
  const handleFrontendToggle = (enabled: boolean) => {
    setProjectConfig(prev => ({ 
      ...prev, 
      includeFrontend: enabled,
      // Reset frontend technology if disabling
      frontendTechnology: enabled ? prev.frontendTechnology : ''
    }));
  };

  // Handle frontend technology selection
  const handleFrontendTechnologyChange = (technology: string) => {
    setProjectConfig(prev => ({ ...prev, frontendTechnology: technology }));
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
                className="bg-primary rounded-full h-2" 
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

      {/* Fullscreen diagram modal */}
      {showFullDiagram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className={`${isDarkTheme ? 'bg-dark' : 'bg-white'} rounded-lg border ${isDarkTheme ? 'border-gray-800' : 'border-gray-300'} w-[90vw] h-[90vh] overflow-hidden flex flex-col`}>
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">Entity Relationship Diagram</h3>
              <button 
                onClick={() => setShowFullDiagram(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex flex-grow overflow-hidden">
              {/* Left panel for relationship legend */}
              <div className="w-64 border-r border-gray-700 p-4 overflow-y-auto custom-scrollbar">
                <h4 className="font-bold mb-3">Relationships</h4>
                
                {entities.flatMap(entity => 
                  entity.relationships.map((rel, idx) => {
                    const targetEntity = entities.find(e => e.id === rel.toEntity);
                    if (!targetEntity) return null;
                    
                    const relationId = `${entity.id}-${rel.toEntity}`;
                    const color = getRelationshipColor(relationId);
                    
                    return (
                      <div 
                        key={`rel-${relationId}-${idx}`} 
                        className="mb-2 p-2 rounded"
                        style={{backgroundColor: `${color}20`, borderLeft: `3px solid ${color}`}}
                      >
                        <div className="font-medium text-sm">{rel.type}</div>
                        <div className="text-xs flex justify-between mt-1">
                          <div className="flex items-center">
                            <span className="font-medium">{entity.name} → {targetEntity.name}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ).filter(Boolean)}
                
                {!entities.some(entity => entity.relationships.length > 0) && (
                  <div className="text-gray-500 italic text-sm">No relationships defined</div>
                )}
              </div>
              
              {/* Main diagram area */}
              <div className="flex-grow overflow-auto p-6 relative custom-scrollbar">
                <div className="relative w-full h-full min-w-[1200px] min-h-[800px]">
                  {entities.map(entity => {
                    // Adjust position calculations for fullscreen view - more spread out
                    const index = entities.indexOf(entity);
                    const row = Math.floor(index / 3);
                    const col = index % 3;
                    const x = col * 350 + 50; // Increase column spacing
                    const y = row * 250 + 50;
                    
                    // Get relationships for this entity
                    const relationships = getEntityRelationships(entity.id);
                    
                    // Create relationship border style 
                    const relationshipBorders = relationships.map(rel => {
                      const relationId = rel.isSource ? 
                        `${rel.entity.id}-${entity.id}` : 
                        `${entity.id}-${rel.entity.id}`;
                      
                      const color = getRelationshipColor(relationId);
                      return {
                        relationId,
                        color,
                        entity: rel.entity,
                        relationType: rel.relation.type,
                        isSource: rel.isSource
                      };
                    });
                    
                    const relationshipBorder = relationshipBorders.length > 0 ? {
                      boxShadow: relationshipBorders.map(rb => `0 0 0 3px ${rb.color}`).join(', '),
                      transition: 'box-shadow 0.3s ease'
                    } : {};
                    
                    return (
                      <div 
                        key={entity.id}
                        className={`absolute p-4 rounded-lg ${
                          selectedEntityId === entity.id ? 'bg-primary bg-opacity-10 border-primary' : isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                        } border shadow-md group`}
                        style={{
                          top: `${y}px`,
                          left: `${x}px`,
                          width: '250px',
                          ...relationshipBorder
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="font-medium text-lg">{entity.name}</div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => editEntity(entity.id)}
                              className="text-gray-400 hover:text-primary"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => deleteEntity(entity.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="border-t border-gray-700 my-2"></div>
                        <div className="max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                          {entity.columns.map((col, colIndex) => (
                            <div key={`${entity.id}-col-${colIndex}`} className="flex justify-between py-1 text-sm">
                              <span className="truncate mr-2">{col.name}</span>
                              <span className="text-gray-500 flex-shrink-0">{col.type}</span>
                            </div>
                          ))}
                        </div>
                        
                        {/* Tooltip that appears on hover */}
                        {relationships.length > 0 && (
                          <div className="absolute left-0 w-full invisible group-hover:visible bg-black bg-opacity-80 text-white text-xs rounded p-2 -bottom-20 z-10">
                            <div className="font-bold mb-1">Relationships:</div>
                            {relationships.map((rel, idx) => (
                              <div key={idx}>
                                {rel.isSource 
                                  ? `${rel.entity.name} → ${entity.name}` 
                                  : `${entity.name} → ${rel.entity.name}`}: {rel.relation.type}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Entity Modal */}
      {showEntityModal && currentEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`${isDarkTheme ? 'bg-dark' : 'bg-white'} rounded-lg border ${isDarkTheme ? 'border-gray-800' : 'border-gray-300'} p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">
                {entities.some(e => e.id === currentEntity.id) ? `Edit ${currentEntity.name}` : 'Create New Entity'}
              </h3>
              <button 
                onClick={() => setShowEntityModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Entity Name</label>
              <input
                type="text"
                className={`w-full p-2 rounded-md ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} border focus:border-primary focus:ring-1 focus:ring-primary`}
                value={currentEntity.name}
                onChange={(e) => setCurrentEntity({ ...currentEntity, name: e.target.value })}
                placeholder="EntityName"
              />
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Columns</label>
              </div>
              
              <div className={`p-4 mb-4 rounded-md ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b ${isDarkTheme ? 'border-gray-700' : 'border-gray-300'}`}>
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Type</th>
                      <th className="text-left py-2">Required</th>
                      <th className="text-left py-2">Primary Key</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentEntity.columns.map((column, index) => (
                      <tr key={index} className={`border-b ${isDarkTheme ? 'border-gray-700' : 'border-gray-300'}`}>
                        <td className="py-2">{column.name}</td>
                        <td className="py-2">{column.type}</td>
                        <td className="py-2">{column.isRequired ? '✓' : '✗'}</td>
                        <td className="py-2">{column.isPrimaryKey ? '✓' : '✗'}</td>
                        <td className="py-2">
                          <button 
                            onClick={() => {
                              setCurrentEntity({
                                ...currentEntity,
                                columns: currentEntity.columns.filter((_, i) => i !== index)
                              });
                            }}
                            className="text-red-500 hover:text-red-600"
                            disabled={column.isPrimaryKey} // Prevent deleting primary key
                            title={column.isPrimaryKey ? "Can't delete primary key" : "Delete column"}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="grid grid-cols-5 gap-2 mb-2">
                <div className="col-span-2">
                  <input
                    type="text"
                    className={`w-full p-2 rounded-md ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} border focus:border-primary focus:ring-1 focus:ring-primary`}
                    value={newColumn.name || ''}
                    onChange={(e) => setNewColumn({ ...newColumn, name: e.target.value })}
                    placeholder="Column Name"
                  />
                </div>
                <div>
                  <select
                    className={`w-full p-2 rounded-md ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} border focus:border-primary focus:ring-1 focus:ring-primary`}
                    value={newColumn.type}
                    onChange={(e) => setNewColumn({ ...newColumn, type: e.target.value })}
                  >
                    {columnTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="columnRequired"
                    className="mr-2"
                    checked={newColumn.isRequired || false}
                    onChange={(e) => setNewColumn({ ...newColumn, isRequired: e.target.checked })}
                  />
                  <label htmlFor="columnRequired" className="text-sm">Required</label>
                </div>
                <div>
                  <button 
                    onClick={addColumn}
                    className="w-full bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md"
                    disabled={!newColumn.name}
                  >
                    Add Column
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Relationships</label>
              </div>
              
              {currentEntity.relationships.length > 0 && (
                <div className={`p-4 mb-4 rounded-md ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={`border-b ${isDarkTheme ? 'border-gray-700' : 'border-gray-300'}`}>
                        <th className="text-left py-2">Type</th>
                        <th className="text-left py-2">Target Entity</th>
                        <th className="text-left py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentEntity.relationships.map((rel, index) => {
                        const targetEntity = entities.find(e => e.id === rel.toEntity);
                        return (
                          <tr key={index} className={`border-b ${isDarkTheme ? 'border-gray-700' : 'border-gray-300'}`}>
                            <td className="py-2">{rel.type}</td>
                            <td className="py-2">{targetEntity?.name || 'Unknown'}</td>
                            <td className="py-2">
                              <button 
                                onClick={() => {
                                  setCurrentEntity({
                                    ...currentEntity,
                                    relationships: currentEntity.relationships.filter((_, i) => i !== index)
                                  });
                                }}
                                className="text-red-500 hover:text-red-600"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              
              {entities.length > 1 && (
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div>
                    <select
                      className={`w-full p-2 rounded-md ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} border focus:border-primary focus:ring-1 focus:ring-primary`}
                      value={newRelationship.type as string}
                      onChange={(e) => setNewRelationship({ ...newRelationship, type: e.target.value as 'one-to-many' | 'many-to-one' | 'many-to-many' | 'one-to-one' })}
                    >
                      {relationshipTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      className={`w-full p-2 rounded-md ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} border focus:border-primary focus:ring-1 focus:ring-primary`}
                      value={newRelationship.toEntity || ''}
                      onChange={(e) => setNewRelationship({ ...newRelationship, toEntity: e.target.value })}
                    >
                      <option value="">Select Target Entity</option>
                      {entities.filter(e => e.id !== currentEntity.id).map(entity => (
                        <option key={entity.id} value={entity.id}>{entity.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <button 
                      onClick={addRelationship}
                      className="w-full bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md"
                      disabled={!newRelationship.toEntity}
                    >
                      Add Relationship
                    </button>
                  </div>
                </div>
              )}
              
              {entities.length <= 1 && (
                <div className={`p-4 rounded-md text-center ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <p className="text-gray-500">You need at least two entities to create relationships</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-8">
              <button 
                onClick={() => setShowEntityModal(false)}
                className={`py-2 px-4 rounded-md ${isDarkTheme ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                Cancel
              </button>
              <button 
                onClick={saveEntity}
                className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md"
              >
                {entities.some(e => e.id === currentEntity.id) ? 'Update Entity' : 'Create Entity'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Status Modal */}
      <StatusModal />
      
      {/* Centered Notification */}
      <Notification />
    </div>
  );
};

export default GeneratePage; 