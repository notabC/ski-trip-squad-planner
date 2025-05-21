
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createGroup, joinGroup } from "@/services/supabaseService";
import { User } from "@/types";
import { toast } from "@/components/ui/use-toast";

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
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl gradient-text">Get Started</CardTitle>
          <CardDescription>
            Create a new group or join an existing one
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-2">
          <Tabs defaultValue="create">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create Group</TabsTrigger>
              <TabsTrigger value="join">Join Group</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create">
              <form onSubmit={handleCreateGroup} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="groupName">Group Name</Label>
                  <Input
                    id="groupName"
                    placeholder="Ski Squad 2026"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Group"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="join">
              <form onSubmit={handleJoinGroup} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="joinCode">Join Code</Label>
                  <Input
                    id="joinCode"
                    placeholder="ABC123"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Joining..." : "Join Group"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={onCancel}
          >
            Back to Groups
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GroupForm;
