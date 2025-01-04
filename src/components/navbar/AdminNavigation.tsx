import { Users, UserPlus, Vote } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';

interface AdminNavigationProps {
  onNavigate: (path: string) => void;
}

export const AdminNavigation = ({ onNavigate }: AdminNavigationProps) => {
  const location = useLocation();
  const { t } = useTranslation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="ml-8 hidden md:flex space-x-4">
      <button 
        onClick={() => onNavigate("/admin/voters")}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
          ${isActive("/admin/voters") 
            ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" 
            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`}
      >
        <Users className="w-4 h-4" />
        <span>{t('nav.voters')}</span>
      </button>
      <button 
        onClick={() => onNavigate("/admin/candidates")}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
          ${isActive("/admin/candidates") 
            ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" 
            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`}
      >
        <UserPlus className="w-4 h-4" />
        <span>{t('nav.candidates')}</span>
      </button>
      <button 
        onClick={() => onNavigate("/admin/election")}
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