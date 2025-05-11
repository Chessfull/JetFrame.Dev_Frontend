// API Base URL - değiştirilmesi gereken tek yer
const API_BASE_URL = 'https://localhost:6790'; // Gerçek backend URL'nizi buraya yazın

// API endpoint'leri
const ENDPOINTS = {
  technologies: '/api/project/technologies',
  architectures: '/api/project/architectures',
  patterns: '/api/project/patterns',
  databases: '/api/project/databases',
  generate: '/api/project/generate',
  status: '/api/project/status',
  download: '/api/project/download',
  frontendTechnologies: '/api/project/frontend-technologies',
  projectHistory: '/api/userproject/history',
  deleteHistory: '/api/userproject/history'
};

// Check if user is authenticated by verifying cookies
const isAuthenticated = () => {
  // First check for auth cookie
  const hasAuthCookie = document.cookie.split(';').some(item => item.trim().startsWith('auth_token='));
  
  if (hasAuthCookie) {
    return true;
  }
  
  // As a fallback, the user might be logged in but cookie might not be accessible from JS
  // We'll proceed with the request and let the backend validate
  // This allows the credentials to still work via CORS
  return true;
};

// Fetch options for API calls
const getFetchOptions = (method = 'GET', body = null) => {
  const options = {
    method,
    mode: 'cors' as RequestMode,
    credentials: 'include' as RequestCredentials,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  };
  
  return options;
};

// API isteklerini kolaylaştıracak yardımcı fonksiyonlar
export const apiService = {
  // Teknolojileri getir
  getTechnologies: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.technologies}`, getFetchOptions());
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  },
  
  // Mimarileri getir
  getArchitectures: async (technology: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.architectures}?technology=${technology}`, getFetchOptions());
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  },
  
  // Tasarım desenlerini getir
  getPatterns: async (technology: string, architecture: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.patterns}?technology=${technology}&architecture=${architecture}`, getFetchOptions());
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  },
  
  // Veritabanlarını getir
  getDatabases: async (technology: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.databases}?technology=${technology}`, getFetchOptions());
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  },
  
  // Proje oluştur
  generateProject: async (projectConfig: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.generate}`, getFetchOptions('POST', projectConfig));
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  },
  
  // Proje durumunu kontrol et
  getProjectStatus: async (projectId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.status}/${projectId}`, getFetchOptions());
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  },
  
  // Projeyi indir
  downloadProject: (projectId: string) => {
    // This function returns a URL rather than making a fetch call
    return `${API_BASE_URL}${ENDPOINTS.download}/${projectId}`;
  },

  // Frontend teknolojilerini getir
  getFrontendTechnologies: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.frontendTechnologies}`, getFetchOptions());
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  },
  
  // Get user's project history
  getUserProjectHistory: async (limit: number = 50) => {
    if (!isAuthenticated()) {
      return [];
    }

    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.projectHistory}?limit=${limit}`, getFetchOptions());
      
      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated - return empty array
          return [];
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return [];
    }
  },
  
  // Delete a project history entry
  deleteProjectHistory: async (historyId: string) => {
    if (!isAuthenticated()) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.deleteHistory}/${historyId}`, 
        getFetchOptions('DELETE'));
        
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return true;
    } catch (error) {
      throw error;
    }
  }
}; 