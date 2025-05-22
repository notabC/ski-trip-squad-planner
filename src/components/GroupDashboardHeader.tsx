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
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleBack}
            className="rounded-full hover:bg-sky-50 hover:text-sky-600 transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-sky-400/20 to-blue-600/20">
              <Mountain className="h-4 w-4 text-sky-600" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
              {displayName}
            </h1>
          </div>
        </div>
        
        {currentUser && onLogout && (
          <div className="flex items-center gap-4">
            <div className="text-right text-sm hidden sm:block">
              <p className="font-medium text-slate-800">{currentUser.name}</p>
              <p className="text-slate-500 text-xs">{currentUser.email}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onLogout}
              className="rounded-full hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
      
      {group && group.joinCode && (
        <div className="max-w-6xl mx-auto px-4 pb-3 flex items-center">
          <div className="flex items-center text-xs text-slate-500 bg-gradient-to-br from-sky-50 to-blue-50/50 px-3 py-1 rounded-lg">
            <Snowflake className="h-3 w-3 mr-1.5 text-sky-500" />
            <span>Join Code: <span className="font-mono font-medium text-sky-700">{group.joinCode}</span></span>
          </div>
        </div>
      )}
    </header>
  );
};

export default GroupDashboardHeader;
