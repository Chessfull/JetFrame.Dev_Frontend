import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

// Define the UserProjectHistory type
interface UserProjectHistory {
  id: string;
  projectConfigId: string;
  projectName: string;
  projectDescription: string;
  technology: string;
  architecture: string;
  designPattern: string;
  database: string;
  includedFrontend: boolean;
  frontendTechnology: string;
  entityCount: number;
  downloadedAt: string;
}

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [projectHistory, setProjectHistory] = useState<UserProjectHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || ''
  });

  // Fetch project history when component mounts
  useEffect(() => {
    const fetchProjectHistory = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const history = await apiService.getUserProjectHistory();
          setProjectHistory(history);
        } catch (error) {
          // Error handling
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProjectHistory();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update functionality
    setIsEditing(false);
  };

  const handleDeleteHistory = async (historyId: string) => {
    if (confirm('Are you sure you want to delete this project from your history?')) {
      try {
        await apiService.deleteProjectHistory(historyId);
        setProjectHistory(prevHistory => 
          prevHistory.filter(item => item.id !== historyId)
        );
      } catch (error) {
        // Error handling
      }
    }
  };

  const handleDownloadAgain = (configId: string, projectName: string) => {
    // Create a temporary anchor element to trigger the download
    const link = document.createElement('a');
    link.href = apiService.downloadProject(configId);
    link.download = `${projectName}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="bg-dark-secondary rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Your Profile</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Avatar */}
          <div className="flex flex-col items-center mb-6 md:mb-0">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary mb-4">
              {user?.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null; // Prevent infinite loop
                    e.currentTarget.style.display = 'none'; // Hide the img element
                    e.currentTarget.parentElement.classList.add('flex', 'items-center', 'justify-center', 'bg-primary');
                    const initialElement = document.createElement('div');
                    initialElement.className = "text-4xl font-bold";
                    initialElement.textContent = user?.firstName?.charAt(0)?.toUpperCase() || 'U';
                    e.currentTarget.parentElement.appendChild(initialElement);
                  }}
                />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center text-4xl font-bold">
                  {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Joined via</p>
              <p className="font-semibold text-primary">{user?.authProvider || 'Email'}</p>
            </div>
          </div>
          
          {/* Profile Info */}
          <div className="flex-1">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded bg-dark border border-gray-700 text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded bg-dark border border-gray-700 text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled
                    className="w-full px-4 py-2 rounded bg-dark border border-gray-700 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-primary hover:bg-secondary text-white transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Account Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm">Full Name</label>
                      <p className="text-lg">{`${user?.firstName || ''} ${user?.lastName || ''}`}</p>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm">Email</label>
                      <p className="text-lg">{user?.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded bg-primary hover:bg-secondary text-white transition-colors"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project History Section */}
      <div className="bg-dark-secondary rounded-lg shadow-lg p-6 mt-8">
        <h2 className="text-2xl font-bold mb-6">Your Project History</h2>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading your project history...</p>
          </div>
        ) : projectHistory.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-gray-700 rounded-lg">
            <svg className="w-16 h-16 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="mt-4 text-lg text-gray-400">No projects found in your history</p>
            <p className="text-sm text-gray-500">Generate a project to see it here</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Project</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Technology</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Architecture</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {projectHistory.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-800/50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-white">{project.projectName}</div>
                            <div className="text-xs text-gray-400">{project.entityCount} entities</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{project.technology}</div>
                        <div className="text-xs text-gray-500">{project.database}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{project.architecture}</div>
                        <div className="text-xs text-gray-500">{project.designPattern}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(project.downloadedAt)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleDownloadAgain(project.projectConfigId, project.projectName)}
                            className="text-primary hover:text-secondary"
                            title="Download project again"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteHistory(project.id)}
                            className="text-red-500 hover:text-red-400"
                            title="Remove from history"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* Account Settings Section */}
      <div className="bg-dark-secondary rounded-lg shadow-lg p-6 mt-8">
        <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
        
        <div className="space-y-6">
          <div className="border-b border-gray-700 pb-6">
            <h3 className="text-xl font-semibold mb-2">Password</h3>
            <p className="text-gray-400 mb-4">Change your password or reset it if you've forgotten it</p>
            <button className="px-4 py-2 rounded border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors">
              Change Password
            </button>
          </div>
          
          <div className="border-b border-gray-700 pb-6">
            <h3 className="text-xl font-semibold mb-2">Linked Accounts</h3>
            <p className="text-gray-400 mb-4">Connect your account with these services</p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="px-4 py-2 rounded flex items-center justify-center gap-2 bg-gray-800 text-white hover:bg-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                </svg>
                <span>Google</span>
              </button>
              
              <button className="px-4 py-2 rounded flex items-center justify-center gap-2 bg-gray-800 text-white hover:bg-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
                <span>GitHub</span>
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2 text-red-500">Danger Zone</h3>
            <p className="text-gray-400 mb-4">Delete your account and all your data</p>
            <button className="px-4 py-2 rounded bg-red-800 text-white hover:bg-red-700 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 