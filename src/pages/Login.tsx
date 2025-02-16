import { Authenticator } from "@aws-amplify/ui-react";
import { Image } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

const Login: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex-1 flex flex-col justify-center items-center bg-gray-100 p-8">
        <h2 className="mb-12 text-2xl font-bold">
          Welcome to Assets Finance Platform
        </h2>
        <Image src="/banner1.png" alt="login banner" className="max-w-80 h-auto object-contain" />
        <p className="mt-4">
          &copy; {new Date().getFullYear()} Developed and Supported by
          Yanjie(Jason) Wu. All rights reserved.
        </p>
      </div>
      <div className="flex-1 flex flex-col justify-center items-center p-8">
        <Authenticator>
          {() => {
            window.location.href = "/home";
            return <div />;
          }}
        </Authenticator>
      </div>
    </div>
  );
};

export default Login;
