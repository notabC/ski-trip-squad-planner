import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { getCurrentUser, getGroupById, getGroupMembers } from "@/services/supabaseService";
import GroupDashboardHeader from "@/components/GroupDashboardHeader";
import TripStatusHeader from "@/components/TripStatusHeader";
import DestinationVoting from "@/components/DestinationVoting";
import TripSummary from "@/components/TripSummary";
import ParticipantsList from "@/components/ParticipantsList";
import { useTripManagement } from "@/hooks/useTripManagement";
import type { User } from "@/types";

const GroupDashboard = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      try {
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        toast({
          title: "Error",
          description: "Failed to load user information.",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [navigate, toast]);
  
  const {
    group,
    members,
    destinations,
    userVote,
    allVotes,
    trip,
    selectedDestination,
    formattedParticipants,
    confirmedCount,
    handleVote,
    handleFinalizeVoting,
    handleUpdateStatus,
    handleUpdatePayment
  } = useTripManagement(groupId, currentUser);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!groupId || !currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Invalid group or user state.</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Group Dashboard Header */}
      <GroupDashboardHeader 
        groupName={group?.name || "Loading..."} 
        onBack={() => navigate("/")} 
      />
      
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Trip Status Header */}
        <TripStatusHeader 
          tripStatus={trip?.status || "voting"} 
          onFinalizeVoting={handleFinalizeVoting}
        />
        
        <Separator />
        
        {/* Destination Voting */}
        {trip?.status === "voting" && (
          <DestinationVoting
            destinations={destinations}
            userVote={userVote}
            allVotes={allVotes}
            members={members}
            onVote={handleVote}
          />
        )}
        
        {/* Trip Summary */}
        {trip?.status !== "voting" && selectedDestination && (
          <TripSummary
            destination={selectedDestination}
            confirmedCount={confirmedCount}
          />
        )}
        
        <Separator />
        
        {/* Participants List */}
        <ParticipantsList
          participants={formattedParticipants}
          onUpdateStatus={handleUpdateStatus}
          onUpdatePayment={handleUpdatePayment}
        />
      </main>
    </div>
  );
};

export default GroupDashboard;
