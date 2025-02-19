import { Authenticator } from '@aws-amplify/ui-react';
import SideBar from './SideBar';
import { useState, useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';

// Define interface for user information
interface UserInfo {
  id: string;
  email: string;
  role: string;
}

const Home: React.FC = () => {
  // State management for user information, error handling, and sidebar state
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize sidebar state from localStorage or default to false
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    return savedState === 'true';
  });

  // Fetch user information when component mounts
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setError(null);
        const currentUser = await getCurrentUser();
        setUserInfo({
          id: currentUser.userId,
          email: currentUser.signInDetails?.loginId || '',
          role: 'User',
        });
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to fetch user information');
        setUserInfo(null);
      }
    };

    fetchUserInfo();
  }, []);

  // Generate page title based on user role or error state
  const getTitle = () => {
    if (error) return 'Dashboard';
    return userInfo?.role ? `${userInfo.role} Dashboard` : 'Dashboard';
  };

  // Handle sidebar collapse state and persist to localStorage
  const handleSidebarCollapse = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-100">
      {/* Sidebar component with collapse handler */}
      <SideBar onCollapse={handleSidebarCollapse} />

      {/* Main content area with dynamic margin based on sidebar state */}
      <div
        className={`flex-1 transition-margin duration-300 ease-in-out ml-20 md:${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        } bg-gray-50 min-h-screen`}
      >
        {/* AWS Amplify Authenticator for authentication */}
        <Authenticator>
          <div className="p-4 md:p-8 h-full">
            <main className="h-full">
              {/* Main content container */}
              <div className="mb-8 p-4 md:p-10 bg-white rounded-lg shadow-md relative overflow-hidden">
                {/* Header section with title and task breakdown link */}
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-2xl font-semibold text-gray-800">{getTitle()}</h1>
                  <a
                    href="https://docs.google.com/document/d/1Fhqj3rYH0xFZDrn77a9zdAPv6eyQ8uw8/edit?usp=sharing&ouid=110668639377071033626&rtpof=true&sd=true"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    {/* Task Breakdown button with icon */}
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      ></path>
                    </svg>
                    Task Breakdown
                  </a>
                </div>

                {/* Welcome message with conditional user email display */}
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  Welcome to Assets Finance Platform
                  {userInfo ? `, ${userInfo.email}` : ''}
                </p>

                {/* Statistics grid with different status cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                  {/* Total Applications card */}
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                    <h3 className="text-blue-600 text-lg font-medium mb-2">Total Applications</h3>
                    <p className="text-3xl font-bold text-blue-700">24</p>
                  </div>
                  {/* Approved Applications card */}
                  <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                    <h3 className="text-green-600 text-lg font-medium mb-2">Approved</h3>
                    <p className="text-3xl font-bold text-green-700">16</p>
                  </div>
                  {/* Pending Applications card */}
                  <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-100">
                    <h3 className="text-yellow-600 text-lg font-medium mb-2">Pending</h3>
                    <p className="text-3xl font-bold text-yellow-700">5</p>
                  </div>
                  {/* Rejected Applications card */}
                  <div className="bg-red-50 p-6 rounded-lg border border-red-100">
                    <h3 className="text-red-600 text-lg font-medium mb-2">Rejected</h3>
                    <p className="text-3xl font-bold text-red-700">3</p>
                  </div>
                </div>

                {/* Recent Activities section */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Recent Activities</h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {/* Individual activity items */}
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
