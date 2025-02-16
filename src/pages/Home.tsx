import { Authenticator } from "@aws-amplify/ui-react";
import SideBar from "./SideBar";
import { useState, useEffect } from "react";
import { getCurrentUser } from "aws-amplify/auth";

interface UserInfo {
  id: string;
  email: string;
  role: string;
}

const Home: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    return savedState === 'true'; 
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setError(null);
        const currentUser = await getCurrentUser();
        setUserInfo({
          id: currentUser.userId,
          email: currentUser.signInDetails?.loginId || "",
          role: "User",
        });
      } catch (error) {
        console.error("Error:", error);
        setError("Failed to fetch user information");
        setUserInfo(null);
      }
    };

    fetchUserInfo();
  }, []);

  const getTitle = () => {
    if (error) return "Dashboard";
    return userInfo?.role ? `${userInfo.role} Dashboard` : "Dashboard";
  };

  const handleSidebarCollapse = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-100">
      <SideBar onCollapse={handleSidebarCollapse} />
      <div
        className={`flex-1 transition-margin duration-300 ease-in-out ${
          sidebarCollapsed ? "ml-20" : "ml-64"
        } bg-gray-100 min-h-screen`}
      >
        <Authenticator>
          <div className="p-8 h-full">
            <main className="h-full">
              <div className="mb-8 p-10 bg-white rounded-lg shadow-md relative overflow-hidden">
                <h1 className="text-2xl font-semibold text-gray-800 mb-2">{getTitle()}</h1>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Welcome to Assets Finance Platform
                  {userInfo ? `, ${userInfo.email}` : ""}
                </p>
              </div>
            </main>
          </div>
        </Authenticator>
      </div>
    </div>
  );
};

export default Home;
