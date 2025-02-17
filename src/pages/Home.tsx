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
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  Welcome to Assets Finance Platform
                  {userInfo ? `, ${userInfo.email}` : ""}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                    <h3 className="text-blue-600 text-lg font-medium mb-2">Total Applications</h3>
                    <p className="text-3xl font-bold text-blue-700">24</p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                    <h3 className="text-green-600 text-lg font-medium mb-2">Approved</h3>
                    <p className="text-3xl font-bold text-green-700">16</p>
                  </div>
                  <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-100">
                    <h3 className="text-yellow-600 text-lg font-medium mb-2">Pending</h3>
                    <p className="text-3xl font-bold text-yellow-700">5</p>
                  </div>
                  <div className="bg-red-50 p-6 rounded-lg border border-red-100">
                    <h3 className="text-red-600 text-lg font-medium mb-2">Rejected</h3>
                    <p className="text-3xl font-bold text-red-700">3</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Recent Activities</h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    <div className="p-4 hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <div>
                          <p className="text-gray-800">Application #1234 was approved</p>
                          <p className="text-sm text-gray-500">2 hours ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <div>
                          <p className="text-gray-800">New application submitted</p>
                          <p className="text-sm text-gray-500">5 hours ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                        <div>
                          <p className="text-gray-800">Application #1233 is under review</p>
                          <p className="text-sm text-gray-500">1 day ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </Authenticator>
      </div>
    </div>
  );
};

export default Home;
