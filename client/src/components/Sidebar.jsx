import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  FaHome, 
  FaBriefcase, 
  FaUsers, 
  FaClipboardList, 
  FaFileAlt, 
  FaCalendarCheck, 
  FaChartBar, 
  FaUserShield,
  FaFileSignature,
  FaLaptopCode
} from "react-icons/fa";

const Sidebar = () => {
  const location = useLocation();
  const { currentUser, isAuthenticated } = useSelector((state) => state.user);

  if (!isAuthenticated || !currentUser) return null;

  const role = currentUser.role?.toUpperCase() || "VIEWER";

  const menuItems = {
    ADMIN: [
      { name: "Dashboard", path: "/admin/dashboard", icon: <FaHome /> },
      { name: "Positions", path: "/positions", icon: <FaBriefcase /> },
      { name: "Candidates", path: "/candidates", icon: <FaUsers /> },
      { name: "Users", path: "/admin/users", icon: <FaUserShield /> },
      { name: "Reports", path: "/reports", icon: <FaChartBar /> },
    ],
    SUPER_ADMIN: [
      { name: "Dashboard", path: "/admin/dashboard", icon: <FaHome /> },
      { name: "Positions", path: "/positions", icon: <FaBriefcase /> },
      { name: "Candidates", path: "/candidates", icon: <FaUsers /> },
      { name: "Users", path: "/admin/users", icon: <FaUserShield /> },
      { name: "Reports", path: "/reports", icon: <FaChartBar /> },
    ],
    RECRUITER: [
      { name: "Dashboard", path: "/recruiter/dashboard", icon: <FaHome /> },
      { name: "Positions", path: "/positions", icon: <FaBriefcase /> },
      { name: "Candidates", path: "/candidates", icon: <FaUsers /> },
      { name: "Applications", path: "/applications", icon: <FaClipboardList /> },
      { name: "Assessments", path: "/interviews/assessments", icon: <FaLaptopCode /> },
    ],
    HR: [
      { name: "Dashboard", path: "/hr/dashboard", icon: <FaHome /> },
      { name: "Positions", path: "/positions", icon: <FaBriefcase /> },
      { name: "Candidates", path: "/candidates", icon: <FaUsers /> },
      { name: "Interviews", path: "/interviews/manage", icon: <FaCalendarCheck /> },
      { name: "Assessments", path: "/interviews/assessments", icon: <FaLaptopCode /> },
      { name: "Documents", path: "/documents/verify", icon: <FaFileAlt /> },
      { name: "Offers", path: "/offers", icon: <FaFileSignature /> },
      { name: "Reports", path: "/reports", icon: <FaChartBar /> },
    ],
    INTERVIEWER: [
      { name: "Dashboard", path: "/interviewer/dashboard", icon: <FaHome /> },
      { name: "My Interviews", path: "/interviews/my", icon: <FaCalendarCheck /> },
    ],
    REVIEWER: [
      { name: "Dashboard", path: "/reviewer/dashboard", icon: <FaHome /> },
      { name: "Screening", path: "/review/screening", icon: <FaClipboardList /> },
      { name: "Applications", path: "/applications", icon: <FaFileAlt /> },
    ],
    CANDIDATE: [
      { name: "Dashboard", path: "/candidate/dashboard", icon: <FaHome /> },
      { name: "Jobs", path: "/positions", icon: <FaBriefcase /> },
    ],
    VIEWER: [
      { name: "Dashboard", path: "/viewer/dashboard", icon: <FaHome /> },
      { name: "Positions", path: "/positions", icon: <FaBriefcase /> },
      { name: "Candidates", path: "/candidates", icon: <FaUsers /> },
    ],
  };

  const navItems = menuItems[role] || menuItems.VIEWER;

  return (
    <aside className="w-64 bg-white border-r shadow-sm overflow-y-auto hidden md:block pt-4">
      <div className="flex flex-col h-full">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path) && !item.path.includes('dashboard'));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors group ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <div className={`mr-3 text-lg ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"}`}>
                  {item.icon}
                </div>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
