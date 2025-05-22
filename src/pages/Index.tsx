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
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 opacity-30 blur-md animate-pulse"></div>
            <div className="relative p-6 bg-white rounded-full shadow-xl">
              <Snowflake className="h-10 w-10 text-sky-600 animate-pulse" />
            </div>
          </div>
          <p className="text-slate-600 font-medium animate-pulse">Loading your ski adventures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 snow-bg">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-sky-400/20 to-blue-600/20">
              <Mountain className="h-6 w-6 text-sky-600" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
              Ski Trip Planner
            </h1>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <div className="text-right text-sm hidden sm:block">
                <p className="font-medium text-slate-800">{user.name}</p>
                <p className="text-slate-500 text-xs">{user.email}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
                className="rounded-full hover:bg-red-50 hover:text-red-600 transition-all duration-200"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {!user ? (
          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent leading-tight">
                  Plan Your Perfect Ski Trip Together
                </h2>
                <p className="mt-4 text-lg text-slate-600">
                  Make planning your next ski adventure with friends easy and fun.
                  Vote on destinations, track who's joining, and manage payments all in one place.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-sky-400/20 to-blue-600/20 p-3 rounded-xl shadow-sm">
                    <Users className="h-6 w-6 text-sky-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-lg">Collaborative Decision Making</h3>
                    <p className="text-slate-600">
                      Everyone gets a vote on the destination, ensuring the perfect group experience.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-sky-400/20 to-blue-600/20 p-3 rounded-xl shadow-sm">
                    <Snowflake className="h-6 w-6 text-sky-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-lg">Curated Ski Destinations</h3>
                    <p className="text-slate-600">
                      Beautiful resorts with detailed pricing and amenities information.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-sky-400/20 to-blue-600/20 p-3 rounded-xl shadow-sm">
                    <CreditCard className="h-6 w-6 text-sky-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-lg">Simple Payment Tracking</h3>
                    <p className="text-slate-600">
                      Keep track of who has paid for the trip with easy payment management.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
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
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">Your Trip Groups</h2>
              <Button 
                onClick={handleCreateNewGroup}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Create or Join Group
              </Button>
            </div>
            
            {userGroups.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {userGroups.map((group) => (
                  <Card 
                    key={group.id} 
                    className="border-0 overflow-hidden shadow-xl shadow-slate-200/50 bg-white/90 backdrop-blur-sm hover:shadow-blue-100/50 hover:translate-y-[-2px] transition-all duration-200"
                  >
                    <CardHeader className="pb-2 bg-gradient-to-br from-sky-50 to-blue-50/50">
                      <CardTitle className="text-xl font-semibold text-slate-800">
                        {group.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 text-slate-500">
                        <span className="font-mono bg-blue-50 px-2 py-0.5 rounded text-xs text-blue-700">
                          {group.joinCode}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="flex items-center space-x-2 text-slate-600">
                        <Users className="h-4 w-4 text-sky-500" />
                        <p>
                          {group.members.length} {group.members.length === 1 ? "member" : "members"}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200" 
                        onClick={() => handleGroupSelected(group.id)}
                      >
                        View Group
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-12 border-2 border-dashed border-slate-200 bg-white/50 backdrop-blur-sm rounded-xl text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-gradient-to-br from-sky-400/20 to-blue-600/20">
                    <Users className="h-10 w-10 text-sky-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800">No Groups Yet</h3>
                  <p className="text-slate-600 max-w-md mx-auto mb-4">
                    Create your first group to start planning your ski trip with friends.
                  </p>
                  <Button
                    onClick={handleCreateNewGroup}
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Your First Group
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      
      <footer className="bg-white/80 backdrop-blur-sm border-t mt-12 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm">
          <p className="text-slate-600">&copy; {new Date().getFullYear()} Ski Trip Planner. All rights reserved.</p>
          <p className="mt-1 text-slate-500 flex items-center justify-center gap-1">
            Made with <Snowflake className="h-3 w-3 text-sky-500 animate-pulse" /> for ski enthusiasts everywhere
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
