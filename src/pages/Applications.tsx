import { Authenticator } from '@aws-amplify/ui-react';
import SideBar from './SideBar';
import { useState, useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Interface definitions for data structures
interface PersonalDetails {
  _id: string;
  name: string;
  age: number;
  email: string;
}

interface Income {
  _id: string;
  source: string;
  amount: number;
  date: string;
}

interface Expense {
  _id: string;
  description: string;
  amount: number;
  date: string;
}

interface Asset {
  _id: string;
  description: string;
  value: number;
}

interface Liability {
  _id: string;
  description: string;
  amount: number;
}

interface ApplicationData {
  _id: string;
  personalDetails: PersonalDetails;
  income: Income[];
  expenses: Expense[];
  assets: Asset[];
  liabilities: Liability[];
}

const Applications: React.FC = () => {
  // State management for sidebar collapse status with localStorage persistence
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    return savedState === 'true';
  });

  // State management for applications data and UI states
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Function to fetch user's applications from the API
  const fetchUserInfo = async () => {
    try {
      const currentUser = await getCurrentUser();
      const userEmail = currentUser.signInDetails?.loginId || '';

      if (userEmail) {
        setLoading(true);
        // API call to get applications for the current user
        const response = await axios.get(
          `${import.meta.env.VITE_API_ENDPOINT}read-apps?email=${userEmail}`
        );

        setApplications(response.data);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to fetch data');
      setLoading(false);
    }
  };

  // Effect hook to fetch applications when component mounts
  useEffect(() => {
    fetchUserInfo();
  }, []);

  // Handler for sidebar collapse state
  const handleSidebarCollapsed = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
  };

  // Navigation handler for viewing application details
  const navigateToApplication = (applicationId: string) => {
    navigate(`/application?id=${applicationId}`);
  };

  // Handler for deleting an application
  const handleDelete = async (applicationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        // API call to delete application
        await axios.delete(`${import.meta.env.VITE_API_ENDPOINT}delete-apps?id=${applicationId}`, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        });
        // Update state to remove deleted application
        setApplications(applications.filter(app => app._id !== applicationId));
        setSuccessMessage('Application deleted successfully');
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } catch (error) {
        console.error('Error deleting application:', error);
        setError('Failed to delete application');
      }
    }
  };

  // Main component render
  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <SideBar onCollapse={handleSidebarCollapsed} />
      
      {/* Success message notification */}
      {successMessage && (
        <div className="fixed top-1 right-4 z-50 animate-fade-in-down">
          <div className="bg-green-50 border-l-4 border-green-500 p-2 rounded-lg shadow-lg">
            <div className="flex items-center">
              <svg
                className="h-4 w-4 text-green-500 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-green-700 text-sm">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

<div
        className={`flex-1 transition-margin duration-300 ease-in-out ml-20 ${
          sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        } bg-gray-100 min-h-screen pt-16 md:pt-0`}
      >
        <Authenticator>
          <div className="p-4 md:p-8 h-full max-md:flex max-md:flex-col max-md:justify-center max-md:items-center">
            <main className="h-full space-y-4 md:space-y-6">
              {/* Header section with title and create button */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-8">
                <div className="mb-4 md:mb-0">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                    Financial Applications
                  </h1>
                  <p className="text-sm md:text-base text-gray-600">
                    Manage and review your financial applications
                  </p>
                </div>
                <button
                  onClick={() => navigate('/create-application')}
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 md:px-6 rounded-lg flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer text-sm md:text-base"
                >
                  <span className="mr-2">Create</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 md:h-5 md:w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {/* Loading spinner */}
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
                </div>
              )}

              {/* Error message display */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <div className="flex items-center">
                    <svg
                      className="h-6 w-6 text-red-500 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Applications list grid */}
              <div className="grid gap-4 md:gap-6">
                {applications.map(app => (
                  <div
                    key={app._id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:p-6">
                      <div
                        className="flex-1 cursor-pointer w-full"
                        onClick={() => navigateToApplication(app._id)}
                      >
                        <div className="space-y-2 md:space-y-3">
                          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 flex items-center">
                            {app.personalDetails.name}
                          </h2>
                          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 text-gray-600 text-sm md:text-base">
                            <div className="flex items-center">
                              <svg
                                className="h-4 w-4 md:h-5 md:w-5 mr-2 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                              <span>Age: {app.personalDetails.age}</span>
                            </div>
                            <div className="flex items-center">
                              <svg
                                className="h-4 w-4 md:h-5 md:w-5 mr-2 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                              <span>{app.personalDetails.email}</span>
                            </div>
                          </div>
                          <div className="text-xs md:text-sm text-gray-500 flex items-center">
                            <svg
                              className="h-3 w-3 md:h-4 md:w-4 mr-1 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                              />
                            </svg>
                            ID: {app._id}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 mt-4 md:mt-0">
                        <button
                          onClick={e => handleDelete(app._id, e)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 cursor-pointer"
                          title="Delete application"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        <div className="text-gray-300">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </main>
          </div>
        </Authenticator>
      </div>
    </div>
  );
};

export default Applications;
