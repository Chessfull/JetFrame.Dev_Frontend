import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || ''
  });

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
                    <div>
                      <label className="block text-gray-400 text-sm">User ID</label>
                      <p className="text-sm text-gray-500 truncate">{user?.id || 'N/A'}</p>
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