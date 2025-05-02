import LoginForm from '../components/auth/LoginForm';
import logoOnly from '../assets/images/Logo-Only-removebg.png';

const LoginPage = () => {
  return (
    <div className="container-fluid py-24">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-auto">
            <img 
              src={logoOnly} 
              alt="JetFrame Wings" 
              className="w-48 h-auto"
            />
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Sign in to access your account and continue your journey with JetFrame.Dev
          </p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage; 