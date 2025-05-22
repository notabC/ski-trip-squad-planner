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
    <div className="w-full max-w-md mx-auto mt-4 md:mt-8 px-4 md:px-0">
      <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/90 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-3 md:pb-4 space-y-3 md:space-y-4 px-4 md:px-6 pt-4 md:pt-6">
          <CardTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent text-center leading-tight">
            Get Started with Your Ski Trip
          </CardTitle>
          <CardDescription className="text-center text-slate-600 text-sm md:text-base px-2 md:px-0">
            Create a new group or join an existing one to plan your next adventure
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-2 px-4 md:px-6">
          <Tabs defaultValue="create">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-slate-100 rounded-xl h-12 md:h-auto">
              <TabsTrigger 
                value="create" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all duration-200 text-xs md:text-sm h-10 md:h-auto"
              >
                <PlusCircle className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Create Group</span>
                <span className="sm:hidden">Create</span>
              </TabsTrigger>
              <TabsTrigger 
                value="join"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all duration-200 text-xs md:text-sm h-10 md:h-auto"
              >
                <LogIn className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Join Group</span>
                <span className="sm:hidden">Join</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="create">
              <form onSubmit={handleCreateGroup} className="space-y-4 md:space-y-5 mt-4 md:mt-6">
                <div className="space-y-2">
                  <Label htmlFor="groupName" className="text-slate-700 font-medium text-sm md:text-base">Group Name</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500">
                      <Users className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <Input
                      id="groupName"
                      placeholder="Ski Squad 2026"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="pl-10 md:pl-12 h-11 md:h-12 border-slate-200 focus:border-sky-400 focus:ring-sky-400/20 rounded-xl text-sm md:text-base"
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 md:h-12 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 text-sm md:text-base"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-sm md:text-base">Creating group...</span>
                    </div>
                  ) : (
                    <>
                      <PlusCircle className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      <span className="hidden sm:inline">Create New Group</span>
                      <span className="sm:hidden">Create Group</span>
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="join">
              <form onSubmit={handleJoinGroup} className="space-y-4 md:space-y-5 mt-4 md:mt-6">
                <div className="space-y-2">
                  <Label htmlFor="joinCode" className="text-slate-700 font-medium text-sm md:text-base">Join Code</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500">
                      <Snowflake className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <Input
                      id="joinCode"
                      placeholder="ABC123"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      className="pl-10 md:pl-12 h-11 md:h-12 border-slate-200 focus:border-sky-400 focus:ring-sky-400/20 rounded-xl font-mono font-medium text-center text-sm md:text-base"
                      required
                    />
                  </div>
                  <p className="text-xs md:text-sm text-slate-500 text-center px-2 md:px-0">Enter the 6-character code shared by your friend</p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 md:h-12 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 text-sm md:text-base"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-sm md:text-base">Joining group...</span>
                    </div>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      <span className="hidden sm:inline">Join Existing Group</span>
                      <span className="sm:hidden">Join Group</span>
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="pb-4 md:pb-6 px-4 md:px-6">
          <Button 
            variant="outline" 
            className="w-full h-11 md:h-12 border-slate-200 hover:bg-slate-50 rounded-xl font-medium transition-colors duration-200 text-sm md:text-base"
            onClick={onCancel}
          >
            <ArrowLeft className="h-3 w-3 md:h-4 md:w-4 mr-2" />
            Back to Groups
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GroupForm;