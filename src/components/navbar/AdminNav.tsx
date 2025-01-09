import { useNavigate, useLocation } from "react-router-dom";
import { Users, UserPlus, Vote } from "lucide-react";
import { useTranslation } from 'react-i18next';

export const AdminNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="hidden md:flex space-x-4">
      <button 
        onClick={() => handleNavigation("/admin/voters")}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
          ${isActive("/admin/voters") 
            ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" 
            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`}
      >
        <Users className="w-4 h-4" />
        <span>{t('nav.voters')}</span>
      </button>
      <button 
        onClick={() => handleNavigation("/admin/candidates")}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
          ${isActive("/admin/candidates") 
            ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" 
            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`}
      >
        <UserPlus className="w-4 h-4" />
        <span>{t('nav.candidates')}</span>
      </button>
      <button 
        onClick={() => handleNavigation("/admin/election")}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
          ${isActive("/admin/election") 
            ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" 
            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`}
      >
        <Vote className="w-4 h-4" />
        <span>{t('nav.election')}</span>
      </button>
    </div>
  );
};