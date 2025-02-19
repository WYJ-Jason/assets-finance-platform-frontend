import { Authenticator, Image } from '@aws-amplify/ui-react';
import { useNavigate, Link } from 'react-router-dom';
import { signOut, getCurrentUser } from 'aws-amplify/auth';
import { useState, useEffect } from 'react';
import { FaHome, FaSignOutAlt, FaBars, FaChevronLeft, FaChartBar, FaTimes } from 'react-icons/fa';

// Interface defining the props for the Sidebar component
interface SidebarProps {
  onCollapse?: (collapsed: boolean) => void;
}

// Interface defining the structure of user information
interface UserInfo {
  id: string;
  email: string;
  role: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onCollapse }) => {
  const navigate = useNavigate();
  // State for storing user information
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  // Loading state for user data fetch
  const [isLoading, setIsLoading] = useState(true);
  // Error state for user data fetch
  const [error, setError] = useState<string | null>(null);
  // State for collapsed/expanded sidebar
  const [isCollapsed, setIsCollapsed] = useState(true);
  // State for mobile menu visibility
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Effect to fetch user information when component mounts
  useEffect(() => {
    const fetchUserInfo = async () => {
      setIsLoading(true);
      setError(null);

      try {
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  // Function to handle sidebar collapse/expand
  const handleCollapse = () => {
    if (window.innerWidth < 768) return;

    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapse?.(newCollapsed);
    localStorage.setItem('sidebarCollapsed', newCollapsed.toString());
  };

  // Function to handle user sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Function to handle mobile menu toggle
  const handleMobileToggle = () => {
    setIsMobileOpen(!isMobileOpen);
    if (window.innerWidth < 768) {
      setIsCollapsed(true);
    }
  };

  // Function to render user information
  const renderUserInfo = () => {
    if (isLoading) return <span className="text-gray-400">Loading...</span>;
    if (error) return <span className="text-red-500">{error}</span>;
    return <span>{userInfo?.email || 'User'}</span>;
  };

  return (
    <Authenticator>
      {() => (
        <>
          {/* Mobile toggle button */}
          <button
            onClick={handleMobileToggle}
            className="fixed md:hidden z-[1001] top-4 left-4 p-2 bg-[#1a1a1a] rounded-lg text-white"
          >
            <FaBars className="text-xl" />
          </button>

          {/* Main sidebar container */}
          <div
            className={`fixed left-0 top-0 h-screen ${
              isCollapsed ? '50px' : 'w-[250px]'
            } bg-[#1a1a1a] transition-[transform,width] duration-300 p-4 text-[#e0e0e0] flex flex-col z-[1000] shadow-[2px_0_8px_rgba(0,0,0,0.2)] border-r border-[var(--border-color)] ${
              isMobileOpen ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0`}
          >
            {/* Close button for mobile */}
            <button
              onClick={handleMobileToggle}
              className="md:hidden absolute top-4 right-4 p-2 text-white hover:text-gray-300"
            >
              <FaTimes className="text-xl" />
            </button>

            {/* Sidebar header section */}
            <div
              className="p-5 hidden md:flex items-center justify-between border-b border-white/10 h-[70px] cursor-pointer transition-colors bg-transparent mb-8 hover:bg-white/10"
              onClick={handleCollapse}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <FaBars className="text-[1.5rem] text-gray-400 transition-colors hover:text-white" />
              ) : (
                <div className="flex items-center justify-center w-full gap-2.5 px-1">
                  <h2 className="m-0 text-[1.2rem] text-white text-center break-words max-w-[200px]">
                    Assets Finance Platform
                  </h2>
                  <FaChevronLeft
                    className={`text-[1rem] text-gray-400 transition-transform ${isCollapsed ? '-rotate-180' : ''}`}
                  />
                </div>
              )}
            </div>

            {/* User information section */}
            <div
              className={`p-5 border-b border-white/10 transition-all ${
                isCollapsed ? 'p-2.5 flex justify-center' : ''
              }`}
            >
              <div className="flex flex-col gap-1 items-center text-center">
                {!isCollapsed && (
                  <>
                    <span className="font-bold text-[0.9rem] text-white">{renderUserInfo()}</span>
                    <span className="text-[0.8rem] text-[#b0b0b0]">{userInfo?.role || 'User'}</span>
                  </>
                )}
              </div>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 py-5">
              <Link
                to="/home"
                className={`group flex items-center gap-4 p-2 no-underline text-[#e0e0e0] hover:bg-white/10 hover:text-white relative ${isCollapsed ? 'justify-center' : ''}`}
                title="Home"
              >
                <FaHome className="text-[1.2rem] text-[#b0b0b0] translate-y-3 mb-6" />
                {!isCollapsed && <span>Home</span>}
                {isCollapsed && (
                  <span className="absolute left-full top-1/2 -translate-y-1/2 bg-gray-800 text-white text-sm px-2 py-1 rounded ml-2 opacity-0 invisible transition-all duration-300 group-hover:opacity-100 group-hover:visible">
                    Home
                  </span>
                )}
              </Link>
              <Link
                to="/applications"
                className={`group flex items-center gap-4 p-2 no-underline text-[#e0e0e0] hover:bg-white/10 hover:text-white relative ${isCollapsed ? 'justify-center' : ''}`}
                title="Applications"
              >
                <FaChartBar className="text-[1.2rem] text-[#b0b0b0] translate-y-3 mb-6" />
                {!isCollapsed && <span>Applications</span>}
                {isCollapsed && (
                  <span className="absolute left-full top-1/2 -translate-y-1/2 bg-gray-800 text-white text-sm px-2 py-1 rounded ml-2 opacity-0 invisible transition-all duration-300 group-hover:opacity-100 group-hover:visible">
                    Applications
                  </span>
                )}
              </Link>
            </nav>

            {/* Footer section */}
            {!isCollapsed && (
              <div className="mt-auto p-5 border-t border-black/10 bg-white/5">
                <div className="mb-4 flex flex-col items-center gap-4 p-2 bg-black/5 rounded-lg">
                  <div className="flex justify-center w-full p-2 bg-white rounded-md">
                    <Image
                      src="/Logo-wyj.png"
                      alt="Jason Logo"
                      className="h-[35px] w-auto max-w-[100px] object-contain"
                    />
                  </div>
                  <p className="text-[0.8rem] text-[#b0b0b0] text-center m-0 font-medium">
                    &copy; {new Date().getFullYear()} Jason
                  </p>
                </div>
              </div>
            )}

            {/* Sign out button */}
            <button
              className="w-full flex items-center justify-center gap-2 bg-red-600 p-2 !rounded-md cursor-pointer transition-all duration-300 mt-auto text-white hover:bg-red-500"
              onClick={handleSignOut}
              title="Sign Out"
            >
              <FaSignOutAlt className="text-[1.2rem] text-white" />
              {!isCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </>
      )}
    </Authenticator>
  );
};

export default Sidebar;
