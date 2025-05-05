// API Base URL - değiştirilmesi gereken tek yer
const API_BASE_URL = 'https://jetframedev-production.up.railway.app/api'; // Gerçek backend URL'nizi buraya yazın

// API endpoint'leri
const ENDPOINTS = {
  technologies: '/project/technologies',
  architectures: '/project/architectures',
  patterns: '/project/patterns',
  databases: '/project/databases',
  generate: '/project/generate',
  status: '/project/status',
  download: '/project/download'
};

// Fetch options for API calls
const fetchOptions = {
  mode: 'cors' as RequestMode,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// API isteklerini kolaylaştıracak yardımcı fonksiyonlar
export const apiService = {
  // Teknolojileri getir
  getTechnologies: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.technologies}`, fetchOptions);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching technologies:', error);
      throw error;
    }
  },
  
  // Mimarileri getir
  getArchitectures: async (technology: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.architectures}?technology=${technology}`, fetchOptions);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching architectures:', error);
      throw error;
    }
  },
  
  // Tasarım desenlerini getir
  getPatterns: async (technology: string, architecture: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.patterns}?technology=${technology}&architecture=${architecture}`, fetchOptions);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching patterns:', error);
      throw error;
    }
  },
  
  // Veritabanlarını getir
  getDatabases: async (technology: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.databases}?technology=${technology}`, fetchOptions);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching databases:', error);
      throw error;
    }
  },
  
  // Proje oluştur
  generateProject: async (projectConfig: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.generate}`, {
        ...fetchOptions,
        method: 'POST',
        body: JSON.stringify(projectConfig)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error generating project:', error);
      throw error;
    }
  },
  
  // Proje durumunu kontrol et
  getProjectStatus: async (projectId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.status}/${projectId}`, fetchOptions);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error checking project status:', error);
      throw error;
    }
  },
  
  // Projeyi indir
  downloadProject: (projectId: string) => {
    // Bu fonksiyon doğrudan bir URL döndürür, fetch kullanmaz
    return `${API_BASE_URL}${ENDPOINTS.download}/${projectId}`;
  }
}; 