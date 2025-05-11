import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logoOnly from '../assets/images/Logo-Only-removebg.png';

// Documentation sections and content
const docsSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: '🚀',
    subsections: [
      {
        id: 'introduction',
        title: 'Introduction',
        content: `
# Welcome to JetFrame.Dev

JetFrame.Dev is a powerful project generator designed to accelerate your development process by automating the creation of ready-to-use projects based on your specific requirements. Whether you're building a .NET application, a Java system, or another technology, JetFrame.Dev helps you bypass the tedious setup phase and jump straight into the creative development process.

## Core Features

- Technology Selection: Choose from multiple technology stacks
- Architecture Selection: Select the architecture pattern that best fits your project
- Database Integration: Easily connect to your preferred database technology
- Frontend Options: Add frontend frameworks to create full-stack applications
- Customization: Configure project specifics to match your exact needs
        `
      },
      {
        id: 'quick-start',
        title: 'Quick Start',
        content: `
# Quick Start Guide

Getting your first project generated with JetFrame.Dev is simple:

1. Navigate to Generate: Click the "Generate" button in the navigation bar
2. Select Technology: Choose your preferred backend technology (e.g., .NET, Java)
3. Select Architecture: Pick an architectural pattern (e.g., Clean Architecture, Layered)
4. Configure Database: Select and configure your database
5. Add Frontend (Optional): Include a frontend framework if desired
6. Generate and Download: Click "Generate" to create your project and download it

That's it! You now have a complete, production-ready project structure that follows best practices.
        `
      }
    ]
  },
  {
    id: 'technologies',
    title: 'Supported Technologies',
    icon: '⚙️',
    subsections: [
      {
        id: 'dotnet',
        title: '.NET',
        content: `
# .NET Integration

JetFrame.Dev offers comprehensive support for .NET-based projects, allowing you to quickly generate applications that follow best practices.

## Features

- NET 9+ Support: Leverage the latest features of .NET
- API Templates: Create REST APIs with proper structure and documentation
- Clean Architecture: Generate projects with Clean Architecture pattern
- Entity Framework Core: Integrated database access with EF Core
- Identity Integration: Ready-to-use authentication and authorization

## Generated Project Structure

Your generated .NET project will include:

\`\`\`
YourProject/
├── src/
│   ├── YourProject.Domain/            # Domain entities and logic
│   ├── YourProject.Application/       # Application services and DTOs
│   ├── YourProject.Infrastructure/    # Infrastructure concerns (DB, external services)
│   └── YourProject.API/               # API controllers and entry point
└── tests/
    ├── YourProject.UnitTests/         # Unit test projects
    └── YourProject.IntegrationTests/  # Integration test projects
\`\`\`
        `
      },
      {
        id: 'java',
        title: 'Java',
        content: `
# Java Integration

JetFrame.Dev provides robust support for Java-based project generation, making it easy to start with a well-structured project.

## Features

- Spring Boot Support: Generate Spring Boot applications with proper configuration
- Maven/Gradle Integration: Choose your preferred build system
- Hibernate ORM: Database access with the powerful Hibernate ORM
- Spring Security: Integrated authentication and authorization
- RESTful APIs: Create API endpoints following best practices

## Generated Project Structure

Your generated Java project will include:

\`\`\`
YourProject/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/yourcompany/yourproject/
│   │   │       ├── domain/          # Domain entities
│   │   │       ├── repository/      # Data access repositories
│   │   │       ├── service/         # Business logic services
│   │   │       ├── controller/      # API endpoints
│   │   │       └── config/          # Application configuration
│   │   └── resources/               # Application resources
│   └── test/                        # Test files
└── pom.xml or build.gradle          # Build configuration
\`\`\`
        `
      },
      {
        id: 'nodejs',
        title: 'Node.js',
        content: `
# Node.js Integration

JetFrame.Dev delivers powerful support for Node.js-based project generation, helping you create well-structured and maintainable applications.

## Features

- Express Framework: Generate Express-based applications with proper structure
- TypeScript Support: Built with TypeScript for strong typing and better developer experience
- MongoDB/PostgreSQL Integration: Easy database connectivity with popular databases
- Authentication System: JWT and OAuth 2.0 authentication options built-in
- API Documentation: Swagger/OpenAPI documentation generation

## Generated Project Structure

Your generated Node.js project will include:

\`\`\`
YourProject/
├── src/
│   ├── controllers/           # Route controllers for application logic
│   ├── models/                # Database models and business data
│   ├── services/              # Business logic services
│   ├── middleware/            # Express middleware functions
│   ├── routes/                # Route definitions
│   ├── utils/                 # Utility functions
│   ├── types/                 # TypeScript type definitions
│   ├── config/                # Configuration files
│   └── app.ts                 # Express app setup
├── tests/                     # Test files
├── package.json               # Project dependencies 
├── tsconfig.json              # TypeScript configuration
└── .env.example               # Environment variables example
\`\`\`

## Architecture Options

The Node.js projects can be generated with various architectural patterns:

- MVC Pattern: Traditional Model-View-Controller separation for web applications
- Clean Architecture: Domain-centric approach with separated concerns
- Layered Architecture: Separation into distinct horizontal layers
        `
      },
      {
        id: 'frontend',
        title: 'Frontend Options',
        content: `
# Frontend Frameworks

JetFrame.Dev allows you to include frontend frameworks in your project generation, creating a complete full-stack application.

## Supported Frameworks

- React: Generate projects with React for dynamic UIs
- Angular: Create Angular-based frontends with TypeScript
- Vue.js: Build projects using the progressive Vue.js framework

## Features

- TypeScript Support: All frontend projects use TypeScript for type safety
- Routing Configuration: Pre-configured routing for multi-page applications
- State Management: Integrated state management appropriate for each framework
- API Integration: Ready-to-use services for communicating with your backend
- Authentication UI: Login, registration, and auth-protected routes
        `
      }
    ]
  },
  {
    id: 'architectures',
    title: 'Architectures',
    icon: '🏛️',
    subsections: [
      {
        id: 'clean-architecture',
        title: 'Clean Architecture',
        content: `
# Clean Architecture

JetFrame.Dev can generate projects following the Clean Architecture pattern, a software design approach that separates concerns and emphasizes dependency rules.

## Core Principles

1. Independence of Frameworks: The architecture doesn't depend on external libraries
2. Testability: Business rules can be tested without UI, database, or external elements
3. Independence of UI: The UI can change without affecting the business rules
4. Independence of Database: The database can be swapped without changing business rules
5. Independence of External Agencies: Business rules don't know about external interfaces

## Architecture Layers

- Domain Layer: Contains enterprise-wide business rules and entities
- Application Layer: Contains application-specific business rules
- Infrastructure Layer: Contains adapters to external systems and frameworks
- Presentation Layer: Contains UI components and controllers

## Supported Patterns Within Clean Architecture

- Repository Pattern: Abstracts data access logic
- CQRS: Separates read and write operations
- Mediator Pattern: Using MediatR for handling commands and queries
- Unit of Work: Managing transactions across multiple repositories

## Benefits

- Maintainable: Easier to maintain as the project grows
- Testable: Facilitates testing at all levels
- Flexible: Allows changing external dependencies with minimal impact
        `
      },
      {
        id: 'hexagonal',
        title: 'Hexagonal Architecture',
        content: `
# Hexagonal Architecture (Ports and Adapters)

JetFrame.Dev supports the Hexagonal Architecture pattern, which isolates the core business logic from external concerns through ports and adapters.

## Core Concepts

- Domain Core: Contains the business logic isolated from external dependencies
- Ports: Define interfaces for communication with the domain
- Adapters: Implement the ports for specific technologies

## Architecture Components

- Primary/Driving Adapters: Components that drive the application (e.g., API controllers, UI)
- Secondary/Driven Adapters: Components that the application drives (e.g., database, external services)
- Ports: Interfaces that define how the domain interacts with the outside world

## Implementation Details

JetFrame.Dev generates a clear separation of concerns:

\`\`\`
YourProject/
├── Domain/                  # Business logic and domain entities
├── Application/             # Application services and ports definitions
├── Adapters/
│   ├── Primary/             # Input adapters (Web API, CLI, etc.)
│   └── Secondary/           # Output adapters (DB, External Services)
└── Infrastructure/          # Cross-cutting concerns
\`\`\`

## Benefits

- Technology Independence: Business logic is independent of delivery mechanisms
- Testability: Easy to test the core logic in isolation
- Flexibility: External components can be replaced with minimal impact
- Focus on Domain: Places the focus on the business domain rather than technical details
        `
      },
      {
        id: 'layered',
        title: 'Layered Architecture',
        content: `
# Layered Architecture

JetFrame.Dev can generate projects with a traditional Layered Architecture, organizing code into distinct horizontal layers with specific responsibilities.

## Key Layers

- Presentation Layer: Handles user interactions and display
- Business Logic Layer: Contains application's business rules
- Data Access Layer: Manages data persistence and retrieval
- Infrastructure Layer: Provides cross-cutting functionality

## Implementation 

The generated layered architecture includes:

\`\`\`
YourProject/
├── Presentation/           # Controllers, Views, ViewModels
├── Business/               # Services, Business Logic
├── DataAccess/             # Repositories, Data Context
└── Infrastructure/         # Logging, Authentication, etc.
\`\`\`

## Patterns Within Layered Architecture

- Repository Pattern: For data access abstraction
- Service Layer Pattern: Defining service interfaces for business operations
- DTO Pattern: For data transfer between layers
- Facade Pattern: Simplifying complex subsystems

## Benefits

- Separation of Concerns: Each layer has a specific responsibility
- Easy to Understand: Straightforward organization that's familiar to many developers
- Maintainability: Changes to one layer have minimal impact on others
- Testability: Each layer can be tested independently
        `
      }
    ]
  },
  {
    id: 'databases',
    title: 'Database Integration',
    icon: '💾',
    subsections: [
      {
        id: 'sql-server',
        title: 'SQL Server',
        content: `
# SQL Server Integration

JetFrame.Dev provides seamless integration with Microsoft SQL Server for your generated projects.

## Features

- Entity Framework Core Configuration: Pre-configured EF Core for SQL Server
- Migration Setup: Ready-to-use migration configuration
- Connection String Management: Secure management of connection strings
- Repository Pattern: Implemented repositories for data access
- Seeding Data: Option to include seed data for development

## Configuration

The generated project includes:

- DbContext: Properly configured DbContext classes
- Migrations: Initial migration to set up your database schema
- Repository Classes: Data access through the repository pattern
- Unit of Work: Transaction management with Unit of Work pattern
        `
      },
      {
        id: 'postgresql',
        title: 'PostgreSQL',
        content: `
# PostgreSQL Integration

JetFrame.Dev supports PostgreSQL integration for projects requiring an open-source relational database solution.

## Features

- Npgsql Provider: Configured with the Npgsql provider for .NET
- Repository Implementation: Data access through repositories
- Migration Support: Database migration configuration
- JSON Data Type Support: Utilize PostgreSQL's JSON capabilities
- Full-Text Search: Configuration for PostgreSQL's full-text search

## .NET Integration

For .NET projects, the PostgreSQL integration includes:

\`\`\`csharp
// Generated DbContext configuration
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
{
    optionsBuilder.UseNpgsql(
        Configuration.GetConnectionString("DefaultConnection"),
        npgsqlOptions => npgsqlOptions.EnableRetryOnFailure()
    );
}
\`\`\`
        `
      },
      {
        id: 'mongodb',
        title: 'MongoDB',
        content: `
# MongoDB Integration

JetFrame.Dev provides support for MongoDB integration when you need a NoSQL document database solution.

## Features

- MongoDB Driver Configuration: Pre-configured MongoDB driver
- Repository Pattern: MongoDB-specific repository implementations
- Document Mapping: Entity to document mapping setup
- Indexing: Configuration for MongoDB indexes
- Connection Management: Secure connection handling

## Implementation Details

The generated project includes:

- MongoDB Context: A service to manage MongoDB connections
- Document Classes: POCO classes representing MongoDB documents
- Repository Classes: MongoDB-specific repository implementations
- Configuration: MongoDB connection string and options management

## Sample Usage

\`\`\`csharp
// Generated repository method
public async Task<TDocument> GetByIdAsync(string id)
{
    var filter = Builders<TDocument>.Filter.Eq(doc => doc.Id, id);
    return await _collection.Find(filter).FirstOrDefaultAsync();
}
\`\`\`
        `
      }
    ]
  },
  {
    id: 'deployment',
    title: 'Deployment',
    icon: '🚢',
    subsections: [
      {
        id: 'docker',
        title: 'Docker Support',
        content: `
# Docker Support

JetFrame.Dev generated projects include Docker support for containerized deployment.

## Features

- Dockerfile: Properly configured Dockerfile for your application
- Docker Compose: Docker Compose configuration for multi-container setup
- Environment Variables: Configuration through environment variables
- Volume Mapping: Proper volume configuration for persistent data
- Network Configuration: Inter-container communication setup

## Docker Compose Configuration

The generated \`docker-compose.yml\` includes:

\`\`\`yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "5000:80"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Server=db;Database=YourDb;...
    depends_on:
      - db
    networks:
      - app-network

  db:
    image: mcr.microsoft.com/mssql/server:2019-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourSecurePassword!
    ports:
      - "1433:1433"
    volumes:
      - sql-data:/var/opt/mssql
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  sql-data:
\`\`\`
        `
      },
      {
        id: 'ci-cd',
        title: 'CI/CD Pipeline',
        content: `
# CI/CD Pipeline Configuration

JetFrame.Dev generated projects include configuration files for Continuous Integration and Continuous Deployment.

## Supported Platforms

- GitHub Actions: Workflow files for GitHub CI/CD
- Azure DevOps: Pipeline configuration for Azure DevOps
- GitLab CI: Configuration for GitLab CI/CD

## Pipeline Features

- Build Automation: Automatic builds on code changes
- Testing: Automated test execution
- Code Quality: Integration with code quality tools
- Containerization: Docker image building and pushing
- Deployment: Automated deployment to hosting environments

## GitHub Actions Example

The generated \`.github/workflows/build-and-deploy.yml\` includes:

\`\`\`yaml
name: Build and Deploy

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup .NET
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: 9.0.x
        
    - name: Restore dependencies
      run: dotnet restore
      
    - name: Build
      run: dotnet build --no-restore --configuration Release
      
    - name: Test
      run: dotnet test --no-build --configuration Release
      
    - name: Publish
      run: dotnet publish --configuration Release --output ./publish
      
    # ... Deployment steps ...
\`\`\`
        `
      }
    ]
  }
];

const DocumentationPage = () => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [activeSubsection, setActiveSubsection] = useState('introduction');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Set initial section and subsection
  useEffect(() => {
    // Get hash from URL if exists
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      // Check if hash matches a section or subsection
      docsSections.forEach(section => {
        if (section.id === hash) {
          setActiveSection(hash);
          setActiveSubsection(section.subsections[0].id);
        } else {
          section.subsections.forEach(subsection => {
            if (subsection.id === hash) {
              setActiveSection(section.id);
              setActiveSubsection(hash);
            }
          });
        }
      });
    }
  }, []);

  // Update hash when section or subsection changes
  useEffect(() => {
    window.location.hash = activeSubsection;
  }, [activeSubsection]);

  // Find current content to display
  const getActiveContent = () => {
    const section = docsSections.find(s => s.id === activeSection);
    if (!section) return '';
    
    const subsection = section.subsections.find(s => s.id === activeSubsection);
    return subsection ? subsection.content : '';
  };

  // Format markdown content
  const formatContent = (content) => {
    // Split content by lines
    const lines = content.split('\n');
    
    // Process line by line
    let inCodeBlock = false;
    let formattedContent = [];
    
    lines.forEach((line, index) => {
      // Handle code blocks
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        if (inCodeBlock) {
          // Start of code block
          const language = line.trim().replace('```', '');
          formattedContent.push(<div key={`code-start-${index}`} className="bg-dark rounded-t-md pt-2 px-4 mt-4 border-t border-x border-gray-700">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-xs text-gray-400">{language || 'code'}</div>
            </div>
          </div>);
          formattedContent.push(<pre key={`code-block-${index}`} className="bg-dark rounded-b-md p-4 overflow-x-auto border-b border-x border-gray-700 text-sm font-mono text-gray-300 whitespace-pre-wrap break-words md:whitespace-pre">
            <code></code>
          </pre>);
        }
        return;
      }
      
      // Inside code block
      if (inCodeBlock) {
        const lastElement = formattedContent[formattedContent.length - 1];
        const codeContent = lastElement.props.children.props.children || '';
        formattedContent[formattedContent.length - 1] = (
          <pre key={`code-block-${lastElement.key}`} className="bg-dark rounded-b-md p-4 overflow-x-auto border-b border-x border-gray-700 text-sm font-mono text-gray-300 whitespace-pre-wrap break-words md:whitespace-pre">
            <code>{codeContent + line + '\n'}</code>
          </pre>
        );
        return;
      }
      
      // Headers
      if (line.startsWith('# ')) {
        formattedContent.push(<h1 key={`h1-${index}`} className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-white">{line.replace('# ', '')}</h1>);
        return;
      }
      if (line.startsWith('## ')) {
        formattedContent.push(<h2 key={`h2-${index}`} className="text-xl md:text-2xl font-bold mt-6 md:mt-8 mb-3 md:mb-4 text-white">{line.replace('## ', '')}</h2>);
        return;
      }
      if (line.startsWith('### ')) {
        formattedContent.push(<h3 key={`h3-${index}`} className="text-lg md:text-xl font-bold mt-5 md:mt-6 mb-2 md:mb-3 text-white">{line.replace('### ', '')}</h3>);
        return;
      }
      
      // Lists
      if (line.trim().startsWith('- ')) {
        // Process the list item to make the first part bold
        const content = line.replace('- ', '');
        const colonIndex = content.indexOf(':');
        
        if (colonIndex > 0) {
          const term = content.substring(0, colonIndex);
          const description = content.substring(colonIndex + 1);
          
          formattedContent.push(
            <li key={`li-${index}`} className="ml-4 md:ml-6 text-gray-300 mb-2 list-disc">
              <span className="font-bold">{term}</span>:{description}
            </li>
          );
        } else {
          formattedContent.push(<li key={`li-${index}`} className="ml-4 md:ml-6 text-gray-300 mb-2 list-disc">{content}</li>);
        }
        return;
      }
      
      // Numbered lists
      if (line.trim().match(/^\d+\. /)) {
        // Process the list item to make the first part bold
        const content = line.replace(/^\d+\. /, '');
        const colonIndex = content.indexOf(':');
        
        if (colonIndex > 0) {
          const term = content.substring(0, colonIndex);
          const description = content.substring(colonIndex + 1);
          
          formattedContent.push(
            <li key={`li-${index}`} className="ml-4 md:ml-6 text-gray-300 mb-2 list-decimal">
              <span className="font-bold">{term}</span>:{description}
            </li>
          );
        } else {
          formattedContent.push(<li key={`li-${index}`} className="ml-4 md:ml-6 text-gray-300 mb-2 list-decimal">{content}</li>);
        }
        return;
      }
      
      // Empty lines
      if (line.trim() === '') {
        formattedContent.push(<div key={`empty-${index}`} className="h-3 md:h-4"></div>);
        return;
      }
      
      // Regular paragraph
      formattedContent.push(<p key={`p-${index}`} className="text-gray-300 mb-3 md:mb-4 text-sm md:text-base">{line}</p>);
    });
    
    return formattedContent;
  };

  return (
    <div className="min-h-screen bg-dark text-white relative">
      {/* Background effect */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px]">
          <img 
            src={logoOnly} 
            alt="JetFrame Wings" 
            className="w-full h-full opacity-20 animate-wing-flow" 
          />
        </div>
        <div className="absolute bottom-[20%] left-[10%] w-[200px] h-[200px]">
          <img 
            src={logoOnly} 
            alt="JetFrame Wings" 
            className="w-full h-full opacity-20 animate-wing-flow" 
            style={{ animationDelay: '2s' }}
          />
        </div>
      </div>
      
      <div className="container-fluid max-w-7xl mx-auto px-4 py-6 md:py-12 relative z-10">
        {/* Header */}
        <div className="mb-6 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-white">Documentation</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300">
            Everything you need to know about using JetFrame.Dev
          </p>
        </div>
        
        {/* Mobile menu button - improved styling */}
        <div className="block md:hidden mb-6">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex w-full items-center justify-between px-4 py-3 rounded bg-dark-secondary border border-gray-700 text-white"
            aria-expanded={isMobileMenuOpen ? "true" : "false"}
          >
            <span className="font-medium">{isMobileMenuOpen ? 'Hide Menu' : 'Documentation Menu'}</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`ml-2 h-5 w-5 transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-180' : ''}`} 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row">
          {/* Sidebar - improved mobile sidebar */}
          <div className={`w-full md:w-64 flex-shrink-0 md:pr-8 ${isMobileMenuOpen ? 'block' : 'hidden'} md:block mb-8 md:mb-0`}>
            <div className="md:sticky md:top-24 overflow-y-auto custom-scrollbar max-h-[calc(100vh-120px)]">
              <nav>
                {docsSections.map(section => (
                  <div key={section.id} className="mb-4 md:mb-6">
                    <button
                      onClick={() => {
                        setActiveSection(section.id);
                        setActiveSubsection(section.subsections[0].id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center w-full text-left font-medium mb-2 px-3 py-2 rounded transition-colors ${
                        activeSection === section.id 
                          ? 'bg-primary bg-opacity-20 text-primary' 
                          : 'hover:bg-dark-secondary text-gray-300'
                      }`}
                    >
                      <span className="mr-2">{section.icon}</span>
                      {section.title}
                    </button>
                    
                    {/* Subsections */}
                    {activeSection === section.id && (
                      <div className="ml-4 space-y-2 border-l border-gray-700 pl-4">
                        {section.subsections.map(subsection => (
                          <button
                            key={subsection.id}
                            onClick={() => {
                              setActiveSubsection(subsection.id);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`block w-full text-left text-sm py-1.5 px-2 transition-colors ${
                              activeSubsection === subsection.id 
                                ? 'text-primary font-medium' 
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            {subsection.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
              
              {/* Back to Generate button */}
              <div className="mt-6 md:mt-10 border-t border-gray-800 pt-6">
                <Link 
                  to="/generate" 
                  className="flex items-center justify-center w-full py-3 md:py-2 px-4 border border-primary text-primary rounded-md hover:bg-primary hover:bg-opacity-10 transition duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                  Back to Generate
                </Link>
              </div>
            </div>
          </div>
          
          {/* Main content - improved mobile styling */}
          <div className="flex-grow">
            <div className="bg-dark-secondary rounded-lg border border-gray-800 p-4 md:p-8">
              {/* Breadcrumb - hidden on smallest screens */}
              <div className="hidden sm:flex items-center text-sm text-gray-400 mb-6">
                <span>Documentation</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span>{docsSections.find(s => s.id === activeSection)?.title}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-primary">{docsSections.find(s => s.id === activeSection)?.subsections.find(s => s.id === activeSubsection)?.title}</span>
              </div>
              
              {/* Mobile section title - only shows on mobile */}
              <div className="block sm:hidden mb-6">
                <h2 className="text-xl font-medium text-primary">
                  {docsSections.find(s => s.id === activeSection)?.subsections.find(s => s.id === activeSubsection)?.title}
                </h2>
              </div>
              
              {/* Content - improved code block display on mobile */}
              <div className="docs-content">
                {formatContent(getActiveContent())}
              </div>
              
              {/* Bottom navigation - improved for touch */}
              <div className="flex justify-between items-center mt-10 md:mt-16 pt-6 md:pt-8 border-t border-gray-800">
                <div>
                  {getPreviousLink()}
                </div>
                <div>
                  {getNextLink()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Helper functions for navigation
  function getPreviousLink() {
    // Find current section and subsection index
    const sectionIndex = docsSections.findIndex(s => s.id === activeSection);
    const section = docsSections[sectionIndex];
    const subsectionIndex = section.subsections.findIndex(s => s.id === activeSubsection);
    
    // Previous subsection in same section
    if (subsectionIndex > 0) {
      const prevSubsection = section.subsections[subsectionIndex - 1];
      return (
        <button
          onClick={() => setActiveSubsection(prevSubsection.id)}
          className="flex items-center text-sm text-gray-300 hover:text-primary transition-colors py-2 px-3"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">{prevSubsection.title}</span>
          <span className="inline sm:hidden">Previous</span>
        </button>
      );
    }
    
    // Previous section's last subsection
    if (sectionIndex > 0) {
      const prevSection = docsSections[sectionIndex - 1];
      const prevSubsection = prevSection.subsections[prevSection.subsections.length - 1];
      return (
        <button
          onClick={() => {
            setActiveSection(prevSection.id);
            setActiveSubsection(prevSubsection.id);
          }}
          className="flex items-center text-sm text-gray-300 hover:text-primary transition-colors py-2 px-3"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">{prevSubsection.title}</span>
          <span className="inline sm:hidden">Previous</span>
        </button>
      );
    }
    
    // No previous link
    return null;
  }
  
  function getNextLink() {
    // Find current section and subsection index
    const sectionIndex = docsSections.findIndex(s => s.id === activeSection);
    const section = docsSections[sectionIndex];
    const subsectionIndex = section.subsections.findIndex(s => s.id === activeSubsection);
    
    // Next subsection in same section
    if (subsectionIndex < section.subsections.length - 1) {
      const nextSubsection = section.subsections[subsectionIndex + 1];
      return (
        <button
          onClick={() => setActiveSubsection(nextSubsection.id)}
          className="flex items-center text-sm text-gray-300 hover:text-primary transition-colors py-2 px-3"
        >
          <span className="hidden sm:inline">{nextSubsection.title}</span>
          <span className="inline sm:hidden">Next</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      );
    }
    
    // Next section's first subsection
    if (sectionIndex < docsSections.length - 1) {
      const nextSection = docsSections[sectionIndex + 1];
      const nextSubsection = nextSection.subsections[0];
      return (
        <button
          onClick={() => {
            setActiveSection(nextSection.id);
            setActiveSubsection(nextSubsection.id);
          }}
          className="flex items-center text-sm text-gray-300 hover:text-primary transition-colors py-2 px-3"
        >
          <span className="hidden sm:inline">{nextSubsection.title}</span>
          <span className="inline sm:hidden">Next</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      );
    }
    
    // No next link
    return null;
  }
};

export default DocumentationPage; 