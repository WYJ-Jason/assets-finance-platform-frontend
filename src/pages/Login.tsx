import { Authenticator } from '@aws-amplify/ui-react';
import { Image } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

const Login: React.FC = () => {
  return (
    // Main container with responsive flex layout
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      {/* Left section with banner and copyright information */}
      <div className="flex-1 flex flex-col justify-center items-center bg-gray-100 p-8">
        {/* Application title */}
        <h2 className="mb-12 text-2xl font-bold text-center">Welcome to Assets Finance Platform</h2>
        {/* Login banner image */}
        <Image src="/banner1.png" alt="login banner" className="max-w-80 h-auto object-contain" />
        {/* Copyright notice with dynamic year */}
        <p className="mt-4 text-center text-sm">
          &copy; {new Date().getFullYear()} Developed and Supported by Yanjie(Jason) Wu. All rights
          reserved.
        </p>
      </div>

      {/* Right section with AWS Amplify Authenticator */}
      <div className="flex-1 flex flex-col justify-center items-center p-8">
        {/* AWS Amplify authentication component */}
        <Authenticator>
          {() => {
            // Redirect to home page after successful authentication
            window.location.href = '/home';
            // Return empty div as placeholder
            return <div />;
          }}
        </Authenticator>
      </div>
    </div>
  );
};

export default Login;
