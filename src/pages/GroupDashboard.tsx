
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
    handleUpdatePayment,
    loading: tripLoading
  } = useTripManagement(groupId, currentUser);
  
  // Debug logs to help identify issues
  console.log("GroupDashboard - destinations:", destinations);
  console.log("GroupDashboard - userVote:", userVote);
  console.log("GroupDashboard - allVotes:", allVotes);
  console.log("GroupDashboard - trip status:", trip?.status);
  console.log("GroupDashboard - group:", group);
  
  if (loading || tripLoading) {
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
  
  const totalPrice = selectedDestination?.price || 0;
  
  return (
    <div className="min-h-screen bg-background">
      {/* Group Dashboard Header */}
      <GroupDashboardHeader 
        groupName={group?.name || "Loading..."}
        onBack={() => navigate("/")} 
        currentUser={currentUser}
      />
      
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Trip Status Header */}
        <TripStatusHeader 
          tripStatus={trip?.status || "voting"}
          onFinalizeVoting={handleFinalizeVoting}
          group={group}
          membersCount={members?.length || 0}
        />
        
        <Separator />
        
        {/* Destination Voting - ensure all props are passed correctly */}
        {(!trip || trip.status === "voting") && (
          <DestinationVoting
            destinations={destinations || []}
            selectedDestination={selectedDestination}
            userVote={userVote}
            allVotes={allVotes || []}
            members={members}
            onVote={handleVote}
            isVotingClosed={false}
          />
        )}
        
        {/* Trip Summary */}
        {trip && trip.status !== "voting" && selectedDestination && (
          <TripSummary
            destination={selectedDestination}
            confirmedCount={confirmedCount}
            trip={trip}
            group={group}
            members={members}
          />
        )}
        
        <Separator />
        
        {/* Participants List */}
        <ParticipantsList
          participants={formattedParticipants}
          onUpdateStatus={handleUpdateStatus}
          onUpdatePayment={handleUpdatePayment}
          currentUserId={currentUser.id}
          trip={trip}
          totalPrice={totalPrice}
        />
      </main>
    </div>
  );
};

export default GroupDashboard;
