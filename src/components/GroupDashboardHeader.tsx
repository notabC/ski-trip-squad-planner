
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";
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
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">{displayName}</h1>
        </div>
        {currentUser && onLogout && (
          <div className="flex items-center gap-4">
            <div className="text-right text-sm hidden sm:block">
              <p className="font-medium">{currentUser.name}</p>
              <p className="text-muted-foreground">{currentUser.email}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default GroupDashboardHeader;
