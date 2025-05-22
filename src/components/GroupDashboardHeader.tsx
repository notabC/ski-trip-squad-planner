import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut, Mountain, Snowflake } from "lucide-react";
import { User, Group } from "@/types";

interface GroupDashboardHeaderProps {
  group?: Group;
  groupName?: string; // Added this as an alternative
  currentUser?: User;
  onBackClick?: () => void;
  onBack?: () => void; // Added this as an alternative
  onLogout?: () => void;
}

const GroupDashboardHeader: React.FC<GroupDashboardHeaderProps> = ({
  group,
  groupName,
  currentUser,
  onBackClick,
  onBack,
  onLogout,
}) => {
  const displayName = group?.name || groupName || "Group Dashboard";
  const handleBack = onBackClick || onBack || (() => {});
  
  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10 border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-3 md:px-4 py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleBack}
            className="rounded-full hover:bg-sky-50 hover:text-sky-600 transition-all duration-200 h-8 w-8 md:h-10 md:w-10 flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          
          <div className="flex items-center gap-1.5 md:gap-2 min-w-0 flex-1">
            <div className="p-1 md:p-1.5 rounded-md md:rounded-lg bg-gradient-to-br from-sky-400/20 to-blue-600/20 flex-shrink-0">
              <Mountain className="h-3 w-3 md:h-4 md:w-4 text-sky-600" />
            </div>
            <h1 className="text-base md:text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent truncate">
              {displayName}
            </h1>
          </div>
        </div>
        
        {currentUser && onLogout && (
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <div className="text-right text-sm hidden lg:block">
              <p className="font-medium text-slate-800">{currentUser.name}</p>
              <p className="text-slate-500 text-xs">{currentUser.email}</p>
            </div>
            
            {/* Mobile: Show just name, no email */}
            <div className="text-right text-xs hidden sm:block lg:hidden">
              <p className="font-medium text-slate-800 truncate max-w-24">{currentUser.name}</p>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onLogout}
              className="rounded-full hover:bg-red-50 hover:text-red-600 transition-all duration-200 h-8 w-8 md:h-10 md:w-10 flex-shrink-0"
            >
              <LogOut className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        )}
      </div>
      
      {group && group.joinCode && (
        <div className="max-w-6xl mx-auto px-3 md:px-4 pb-2 md:pb-3">
          <div className="flex items-center justify-center sm:justify-start">
            <div className="flex items-center text-xs md:text-sm text-slate-500 bg-gradient-to-br from-sky-50 to-blue-50/50 px-2 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg">
              <Snowflake className="h-3 w-3 mr-1 md:mr-1.5 text-sky-500 flex-shrink-0" />
              <span className="flex items-center gap-1">
                <span className="hidden sm:inline">Join Code:</span>
                <span className="sm:hidden">Code:</span>
                <span className="font-mono font-medium text-sky-700">{group.joinCode}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default GroupDashboardHeader;