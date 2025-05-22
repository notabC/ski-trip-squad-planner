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
import { AlertTriangle, Snowflake, Mountain } from "lucide-react";

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
          console.log("Current user loaded:", user);
        } else {
          console.error("No user found, redirecting to home");
          toast({
            title: "Not logged in",
            description: "You must be logged in to view this group.",
            variant: "destructive",
          });
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
  console.log("GroupDashboard - currentUser:", currentUser);
  console.log("GroupDashboard - members:", members);
  console.log("GroupDashboard - trip participants:", trip?.participants);
  console.log("GroupDashboard - formattedParticipants:", formattedParticipants);
  
  if (loading || tripLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 opacity-30 blur-md animate-pulse"></div>
            <div className="relative p-6 bg-white rounded-full shadow-xl">
              <Snowflake className="h-10 w-10 text-sky-600 animate-pulse" />
            </div>
          </div>
          <p className="text-slate-600 font-medium animate-pulse">Loading your ski trip...</p>
        </div>
      </div>
    );
  }
  
  if (!groupId || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex items-center justify-center p-4">
        <div className="p-12 border-2 border-dashed border-slate-200 bg-white/80 backdrop-blur-sm rounded-xl text-center max-w-md">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-amber-400/20 to-red-600/20">
              <AlertTriangle className="h-10 w-10 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800">Invalid Group</h3>
            <p className="text-slate-600 mb-4">
              We couldn't find the group you're looking for. This might be due to an invalid link or you may not have permission to view this group.
            </p>
            <Button 
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200"
            >
              Return Home
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  const totalPrice = selectedDestination?.price || 0;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Group Dashboard Header */}
      <GroupDashboardHeader 
        groupName={group?.name || "Loading..."}
        onBack={() => navigate("/")} 
        currentUser={currentUser}
        group={group}
      />
      
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Trip Status Header */}
        <TripStatusHeader 
          tripStatus={trip?.status || "voting"}
          onFinalizeVoting={handleFinalizeVoting}
          group={group}
          membersCount={members?.length || 0}
        />
        
        <Separator className="border-slate-200" />
        
        {/* Destination Voting - ensure all props are passed correctly */}
        {(!trip || trip.status === "voting") && (
          <div className="mt-8">
            <DestinationVoting
              destinations={destinations || []}
              selectedDestination={selectedDestination}
              userVote={userVote}
              allVotes={allVotes || []}
              members={members}
              onVote={handleVote}
              isVotingClosed={false}
            />
          </div>
        )}
        
        {/* Trip Summary */}
        {trip && trip.status !== "voting" && selectedDestination && (
          <div className="mt-8">
            <TripSummary
              destination={selectedDestination}
              confirmedCount={confirmedCount}
              trip={trip}
              group={group}
              members={members}
            />
          </div>
        )}
        
        <Separator className="border-slate-200" />
        
        {/* Participants List */}
        <div className="mt-8">
          <ParticipantsList
            participants={formattedParticipants}
            onUpdateStatus={handleUpdateStatus}
            onUpdatePayment={handleUpdatePayment}
            currentUserId={currentUser.id}
            trip={trip}
            totalPrice={totalPrice}
          />
        </div>
        
        <div className="mt-12 text-center text-sm text-slate-500 flex items-center justify-center gap-1">
          <Snowflake className="h-3 w-3 text-sky-500 animate-pulse" />
          <span>Plan your perfect ski trip with friends</span>
          <Snowflake className="h-3 w-3 text-sky-500 animate-pulse" />
        </div>
      </main>
    </div>
  );
};

export default GroupDashboard;
