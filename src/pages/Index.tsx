import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  getCurrentUser, 
  logoutUser, 
  getUserGroups, 
  saveCurrentUser 
} from "@/services/supabaseService";
import AuthForm from "@/components/AuthForm";
import GroupForm from "@/components/GroupForm";
import { User, Group } from "@/types";
import { LogOut, PlusCircle, Snowflake, Users, Mountain, Calendar, CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGroupForm, setShowGroupForm] = useState(false);
  
  const loadUserGroups = async (userId: string) => {
    try {
      console.log('Loading groups for user:', userId);
      const groups = await getUserGroups(userId);
      console.log('Loaded groups:', groups);
      setUserGroups(groups);
      setShowGroupForm(groups.length === 0); // Only show form if no groups exist
    } catch (error) {
      console.error("Error loading user groups:", error);
      toast({
        title: "Error loading groups",
        description: "There was a problem loading your groups. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Check if user is already logged in
        const currentUser = await getCurrentUser();
        
        if (currentUser) {
          console.log('Current user loaded:', currentUser);
          setUser(currentUser);
          await loadUserGroups(currentUser.id);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        toast({
          title: "Error loading data",
          description: "There was a problem loading your user data. Please try refreshing the page.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, []);
  
  const handleAuthenticated = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        await loadUserGroups(currentUser.id);
      }
    } catch (error) {
      console.error("Error after authentication:", error);
      toast({
        title: "Authentication error",
        description: "There was a problem with authentication. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setUserGroups([]);
  };
  
  const handleGroupCreated = async (groupId: string) => {
    // Reload groups before redirecting
    if (user) {
      console.log('Group created, reloading user groups');
      await loadUserGroups(user.id);
    }
    
    toast({
      title: "Group created!",
      description: "Your group has been created successfully.",
    });
    
    // Redirect to the group dashboard
    navigate(`/group/${groupId}`);
  };
  
  const handleGroupSelected = (groupId: string) => {
    navigate(`/group/${groupId}`);
  };

  const handleCreateNewGroup = () => {
    setShowGroupForm(true);
  };
  
  const handleCancelGroupCreation = async () => {
    setShowGroupForm(false);
    // Reload groups when coming back from the form
    if (user) {
      await loadUserGroups(user.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex items-center justify-center px-4">
        <div className="flex flex-col items-center space-y-3 md:space-y-4">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 opacity-30 blur-md animate-pulse"></div>
            <div className="relative p-4 md:p-6 bg-white rounded-full shadow-xl">
              <Snowflake className="h-8 w-8 md:h-10 md:w-10 text-sky-600 animate-pulse" />
            </div>
          </div>
          <p className="text-slate-600 font-medium animate-pulse text-sm md:text-base text-center">Loading your ski adventures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 snow-bg">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-3 md:px-4 py-3 md:py-4 flex justify-between items-center">
          <div className="flex items-center gap-1.5 md:gap-2 min-w-0 flex-1">
            <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-gradient-to-br from-sky-400/20 to-blue-600/20">
              <Mountain className="h-5 w-5 md:h-6 md:w-6 text-sky-600" />
            </div>
            <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent truncate">
              Ski Trip Planner
            </h1>
          </div>
          
          {user && (
            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
              <div className="text-right text-sm hidden lg:block">
                <p className="font-medium text-slate-800">{user.name}</p>
                <p className="text-slate-500 text-xs">{user.email}</p>
              </div>
              
              {/* Mobile: Show just name, no email */}
              <div className="text-right text-xs hidden sm:block lg:hidden">
                <p className="font-medium text-slate-800 truncate max-w-24">{user.name}</p>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
                className="rounded-full hover:bg-red-50 hover:text-red-600 transition-all duration-200 h-8 w-8 md:h-10 md:w-10"
              >
                <LogOut className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          )}
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-3 md:px-4 py-4 md:py-8">
        {!user ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-4 md:mt-8">
            <div className="space-y-6 md:space-y-8 order-2 md:order-1">
              <div>
                <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent leading-tight">
                  Plan Your Perfect Ski Trip Together
                </h2>
                <p className="mt-3 md:mt-4 text-base md:text-lg text-slate-600">
                  Make planning your next ski adventure with friends easy and fun.
                  Vote on destinations, track who's joining, and manage payments all in one place.
                </p>
              </div>
              
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="bg-gradient-to-br from-sky-400/20 to-blue-600/20 p-2 md:p-3 rounded-lg md:rounded-xl shadow-sm flex-shrink-0">
                    <Users className="h-5 w-5 md:h-6 md:w-6 text-sky-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-800 text-base md:text-lg">Collaborative Decision Making</h3>
                    <p className="text-slate-600 text-sm md:text-base mt-1">
                      Everyone gets a vote on the destination, ensuring the perfect group experience.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="bg-gradient-to-br from-sky-400/20 to-blue-600/20 p-2 md:p-3 rounded-lg md:rounded-xl shadow-sm flex-shrink-0">
                    <Snowflake className="h-5 w-5 md:h-6 md:w-6 text-sky-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-800 text-base md:text-lg">Curated Ski Destinations</h3>
                    <p className="text-slate-600 text-sm md:text-base mt-1">
                      Beautiful resorts with detailed pricing and amenities information.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="bg-gradient-to-br from-sky-400/20 to-blue-600/20 p-2 md:p-3 rounded-lg md:rounded-xl shadow-sm flex-shrink-0">
                    <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-sky-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-800 text-base md:text-lg">Simple Payment Tracking</h3>
                    <p className="text-slate-600 text-sm md:text-base mt-1">
                      Keep track of who has paid for the trip with easy payment management.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="order-1 md:order-2">
              <AuthForm onAuthenticated={handleAuthenticated} />
            </div>
          </div>
        ) : showGroupForm ? (
          <GroupForm 
            currentUser={user} 
            onGroupCreated={handleGroupCreated} 
            onCancel={handleCancelGroupCreation} 
          />
        ) : (
          <div className="space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
              <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">Your Trip Groups</h2>
              <Button 
                onClick={handleCreateNewGroup}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 h-10 md:h-11 text-sm md:text-base w-full sm:w-auto"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Create or Join Group</span>
                <span className="sm:hidden">Create/Join Group</span>
              </Button>
            </div>
            
            {userGroups.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {userGroups.map((group) => (
                  <Card 
                    key={group.id} 
                    className="border-0 overflow-hidden shadow-xl shadow-slate-200/50 bg-white/90 backdrop-blur-sm hover:shadow-blue-100/50 hover:translate-y-[-2px] transition-all duration-200"
                  >
                    <CardHeader className="pb-2 bg-gradient-to-br from-sky-50 to-blue-50/50 p-3 md:p-6 md:pb-2">
                      <CardTitle className="text-lg md:text-xl font-semibold text-slate-800 line-clamp-2">
                        {group.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 text-slate-500 mt-1">
                        <span className="font-mono bg-blue-50 px-2 py-0.5 rounded text-xs text-blue-700">
                          {group.joinCode}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3 md:pt-4 p-3 md:p-6 md:pt-4">
                      <div className="flex items-center space-x-2 text-slate-600">
                        <Users className="h-3 w-3 md:h-4 md:w-4 text-sky-500" />
                        <p className="text-sm md:text-base">
                          {group.members.length} {group.members.length === 1 ? "member" : "members"}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="p-3 md:p-6">
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 h-9 md:h-10 text-sm md:text-base" 
                        onClick={() => handleGroupSelected(group.id)}
                      >
                        View Group
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-8 md:p-12 border-2 border-dashed border-slate-200 bg-white/50 backdrop-blur-sm rounded-xl text-center">
                <div className="flex flex-col items-center gap-3 md:gap-4">
                  <div className="p-3 md:p-4 rounded-full bg-gradient-to-br from-sky-400/20 to-blue-600/20">
                    <Users className="h-8 w-8 md:h-10 md:w-10 text-sky-600" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-slate-800">No Groups Yet</h3>
                  <p className="text-slate-600 max-w-md mx-auto mb-2 md:mb-4 text-sm md:text-base">
                    Create your first group to start planning your ski trip with friends.
                  </p>
                  <Button
                    onClick={handleCreateNewGroup}
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 h-10 md:h-11 text-sm md:text-base w-full sm:w-auto"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Create Your First Group</span>
                    <span className="sm:hidden">Create First Group</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      
      <footer className="bg-white/80 backdrop-blur-sm border-t mt-8 md:mt-12 py-6 md:py-8">
        <div className="max-w-6xl mx-auto px-3 md:px-4 text-center text-sm">
          <p className="text-slate-600">&copy; {new Date().getFullYear()} Ski Trip Planner. All rights reserved.</p>
          <p className="mt-1 text-slate-500 flex items-center justify-center gap-1 text-xs md:text-sm">
            Made with <Snowflake className="h-3 w-3 text-sky-500 animate-pulse" /> for ski enthusiasts everywhere
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;