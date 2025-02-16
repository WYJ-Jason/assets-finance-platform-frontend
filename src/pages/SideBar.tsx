import { Authenticator, Image } from "@aws-amplify/ui-react";
import { useNavigate, Link } from "react-router-dom";
import { signOut, getCurrentUser } from "aws-amplify/auth";
import { useState, useEffect } from "react";
import {
  FaHome,
  FaSignOutAlt,
  FaBars,
  FaChevronLeft,
  FaChartBar,
} from "react-icons/fa";

interface SidebarProps {
  onCollapse?: (collapsed: boolean) => void;
}

interface UserInfo {
  id: string;
  email: string;
  role: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onCollapse }) => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    return savedState === 'true';
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      setIsLoading(true);
      setError(null);

      try {
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapse?.(newCollapsed);
    localStorage.setItem('sidebarCollapsed', newCollapsed.toString());
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const renderUserInfo = () => {
    if (isLoading) return <span className="text-gray-400">Loading...</span>;
    if (error) return <span className="text-red-500">{error}</span>;
    return <span>{userInfo?.email || "User"}</span>;
  };

  return (
    <Authenticator>
      {() => (
        <div
          className={`fixed left-0 top-0 h-screen ${isCollapsed ? "50px" : "w-[250px]"} bg-[#1a1a1a] transition-[width] duration-300 p-4 text-[#e0e0e0] flex flex-col z-[1000] shadow-[2px_0_8px_rgba(0,0,0,0.2)] border-r border-[var(--border-color)] max-md:-translate-x-full max-md:show:translate-x-0`}
        >
          <div
            className="p-5 flex items-center justify-between border-b border-white/10 h-[70px] cursor-pointer transition-colors bg-transparent mb-8 hover:bg-white/10"
            onClick={handleCollapse}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <FaBars className="text-[1.5rem] text-gray-400 transition-colors hover:text-white" />
            ) : (
              <div className="flex items-center justify-center w-full gap-2.5 px-1">
                <h2 className="m-0 text-[1.2rem] text-white text-center break-words max-w-[200px]">
                  Assets Finance Platform
                </h2>
                <FaChevronLeft className={`text-[1rem] text-gray-400 transition-transform ${isCollapsed ? "-rotate-180" : ""}`} />
              </div>
            )}
          </div>

          <div
            className={`p-5 border-b border-white/10 transition-all ${
              isCollapsed ? "p-2.5 flex justify-center" : ""
            }`}
          >
            <div className="flex flex-col gap-1 items-center text-center">
              {!isCollapsed && (
                <>
                  <span className="font-bold text-[0.9rem] text-white">
                    {renderUserInfo()}
                  </span>
                  <span className="text-[0.8rem] text-[#b0b0b0]">
                    {userInfo?.role || "User"}
                  </span>
                </>
              )}
            </div>
          </div>

          <nav className="flex-1 py-5">
            <Link
              to="/home"
              className={`group flex items-center gap-4 p-2 no-underline text-[#e0e0e0] hover:bg-white/10 hover:text-white relative ${isCollapsed ? "justify-center" : ""}`}
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
              to="/assets"
              className={`group flex items-center gap-4 p-2 no-underline text-[#e0e0e0] hover:bg-white/10 hover:text-white relative ${isCollapsed ? "justify-center" : ""}`}
              title="Assets"
            >
              <FaChartBar className="text-[1.2rem] text-[#b0b0b0] translate-y-3 mb-6" />
              {!isCollapsed && <span>Assets</span>}
              {isCollapsed && (
                <span className="absolute left-full top-1/2 -translate-y-1/2 bg-gray-800 text-white text-sm px-2 py-1 rounded ml-2 opacity-0 invisible transition-all duration-300 group-hover:opacity-100 group-hover:visible">
                  Assets
                </span>
              )}
            </Link>
          </nav>

          {!isCollapsed && (
            <div className="mt-auto p-5 border-t border-black/10 bg-white/5">
              <div className="mb-4 flex flex-col items-center gap-4 p-2 bg-black/5 rounded-lg">
                <div className="flex justify-center w-full p-2 bg-white rounded-md">
                  <Image
                    src="/Logo-wyj.png"
                    alt="Daimlinc Logo"
                    className="h-[35px] w-auto max-w-[100px] object-contain"
                  />
                </div>
                <p className="text-[0.8rem] text-[#b0b0b0] text-center m-0 font-medium">
                  &copy; {new Date().getFullYear()} Jason
                </p>
              </div>
            </div>
          )}

          <button
            className="w-full flex items-center justify-center gap-2 bg-red-600 p-2 !rounded-md cursor-pointer transition-all duration-300 mt-auto text-white hover:bg-red-500"
            onClick={handleSignOut}
            title="Sign Out"
          >
            <FaSignOutAlt className="text-[1.2rem] text-white" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      )}
    </Authenticator>
  );
};

export default Sidebar;