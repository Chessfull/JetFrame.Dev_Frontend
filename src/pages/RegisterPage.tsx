import RegisterForm from '../components/auth/RegisterForm';
import logoOnly from '../assets/images/Logo-Only-removebg.png';

const RegisterPage = () => {
  return (
    <div className="container-fluid py-24">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <img 
              src={logoOnly} 
              alt="JetFrame Wings" 
              className="w-48 h-auto"
            />
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Join JetFrame.Dev to start building amazing projects faster than ever
          </p>
        </div>
        
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage; 