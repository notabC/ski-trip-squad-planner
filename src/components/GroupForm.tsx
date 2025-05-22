import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createGroup, joinGroup } from "@/services/supabaseService";
import { User } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { Users, PlusCircle, LogIn, ArrowLeft, Mountain, Snowflake } from "lucide-react";

interface GroupFormProps {
  currentUser: User;
  onGroupCreated: (groupId: string) => void;
  onCancel: () => void; 
}

const GroupForm: React.FC<GroupFormProps> = ({ currentUser, onGroupCreated, onCancel }) => {
  const [groupName, setGroupName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!groupName) {
      toast({
        title: "Missing information",
        description: "Please provide a group name",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Creating group with user ID:', currentUser.id);
      const newGroup = await createGroup(groupName, currentUser.id);
      
      if (!newGroup) {
        throw new Error("Failed to create group");
      }
      
      toast({
        title: "Group created!",
        description: `Your join code is: ${newGroup.joinCode}`,
      });
      onGroupCreated(newGroup.id);
    } catch (error) {
      console.error("Group creation error:", error);
      toast({
        title: "Error",
        description: "Failed to create group. Please try refreshing the page and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!joinCode) {
      toast({
        title: "Missing information",
        description: "Please provide a join code",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Joining group with user ID:', currentUser.id);
      const group = await joinGroup(joinCode, currentUser.id);
      
      if (!group) {
        toast({
          title: "Invalid code",
          description: "The join code is invalid or the group doesn't exist",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      toast({
        title: "Group joined!",
        description: `You've joined ${group.name}`,
      });
      onGroupCreated(group.id);
    } catch (error) {
      console.error("Group join error:", error);
      toast({
        title: "Error",
        description: "Failed to join group. Please try refreshing the page and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/90 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-4 space-y-4">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent text-center">
            Get Started with Your Ski Trip
          </CardTitle>
          <CardDescription className="text-center text-slate-600">
            Create a new group or join an existing one to plan your next adventure
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-2">
          <Tabs defaultValue="create">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-slate-100 rounded-xl">
              <TabsTrigger 
                value="create" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all duration-200"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Group
              </TabsTrigger>
              <TabsTrigger 
                value="join"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all duration-200"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Join Group
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="create">
              <form onSubmit={handleCreateGroup} className="space-y-5 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="groupName" className="text-slate-700 font-medium">Group Name</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-sky-500">
                      <Users className="h-5 w-5" />
                    </div>
                    <Input
                      id="groupName"
                      placeholder="Ski Squad 2026"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="pl-10 h-12 border-slate-200 focus:border-sky-400 focus:ring-sky-400/20 rounded-xl"
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating group...</span>
                    </div>
                  ) : (
                    <>
                      <PlusCircle className="h-5 w-5 mr-2" />
                      Create New Group
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="join">
              <form onSubmit={handleJoinGroup} className="space-y-5 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="joinCode" className="text-slate-700 font-medium">Join Code</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-sky-500">
                      <Snowflake className="h-5 w-5" />
                    </div>
                    <Input
                      id="joinCode"
                      placeholder="ABC123"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      className="pl-10 h-12 border-slate-200 focus:border-sky-400 focus:ring-sky-400/20 rounded-xl font-mono font-medium text-center"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500 text-center">Enter the 6-character code shared by your friend</p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Joining group...</span>
                    </div>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5 mr-2" />
                      Join Existing Group
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="pb-6">
          <Button 
            variant="outline" 
            className="w-full h-12 border-slate-200 hover:bg-slate-50 rounded-xl font-medium transition-colors duration-200"
            onClick={onCancel}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Groups
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GroupForm;
