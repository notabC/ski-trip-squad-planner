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
import { LogOut, PlusCircle, Snowflake, Users } from "lucide-react";
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background snow-bg">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Snowflake className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold gradient-text">Ski Trip Planner</h1>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <div className="text-right text-sm hidden sm:block">
                <p className="font-medium">{user.name}</p>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
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
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold gradient-text">
                  Plan Your Perfect Ski Trip Together
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Make planning your next ski adventure with friends easy and fun.
                  Vote on destinations, track who's joining, and manage payments all in one place.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Collaborative Decision Making</h3>
                    <p className="text-muted-foreground">
                      Everyone gets a vote on the destination
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Snowflake className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Curated Ski Destinations</h3>
                    <p className="text-muted-foreground">
                      Beautiful resorts with pricing and amenities
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <PlusCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Simple Payment Tracking</h3>
                    <p className="text-muted-foreground">
                      Keep track of who has paid for the trip
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
              <h2 className="text-2xl font-bold">Your Trip Groups</h2>
              <Button 
                onClick={handleCreateNewGroup}
                variant="outline"
              >
                Create or Join New Group
              </Button>
            </div>
            
            {userGroups.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userGroups.map((group) => (
                  <Card key={group.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle>{group.name}</CardTitle>
                      <CardDescription>
                        Join Code: {group.joinCode}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {group.members.length} {group.members.length === 1 ? "member" : "members"}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        onClick={() => handleGroupSelected(group.id)}
                      >
                        View Group
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 border rounded-lg border-dashed">
                <p className="text-muted-foreground mb-4">You don't have any groups yet.</p>
                <Button onClick={handleCreateNewGroup}>
                  Create Your First Group
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
      
      <footer className="bg-white border-t mt-12 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Ski Trip Planner. All rights reserved.</p>
          <p className="mt-1">Made with ❄️ for ski enthusiasts everywhere</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
