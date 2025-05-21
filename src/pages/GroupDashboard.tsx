
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { getCurrentUser } from "@/services/localStorageService";
import { User } from "@/types";
import GroupDashboardHeader from "@/components/GroupDashboardHeader";
import TripStatusHeader from "@/components/TripStatusHeader";
import DestinationVoting from "@/components/DestinationVoting";
import ParticipantsList from "@/components/ParticipantsList";
import TripSummary from "@/components/TripSummary";
import { useTripManagement } from "@/hooks/useTripManagement";

const GroupDashboard = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Check if user is authenticated
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      toast({
        title: "Not signed in",
        description: "Please sign in to access this page",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    setCurrentUser(user);

    if (!groupId) {
      toast({
        title: "Group not found",
        description: "Invalid group ID",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [groupId, navigate, toast]);

  // Use our custom hook to manage trip state and logic
  const {
    group,
    members,
    destinations,
    userVote,
    allVotes,
    trip,
    selectedDestination,
    loading,
    formattedParticipants,
    confirmedCount,
    handleVote,
    handleFinalizeVoting,
    handleUpdateStatus,
    handleUpdatePayment
  } = useTripManagement(groupId, currentUser);

  // Handle logout
  const handleLogout = () => {
    navigate("/");
  };
  
  // Handle navigation back to home
  const handleBackClick = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p>Loading destinations...</p>
      </div>
    );
  }

  if (!currentUser || !group || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <GroupDashboardHeader
        group={group}
        currentUser={currentUser}
        onBackClick={handleBackClick}
        onLogout={handleLogout}
      />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 space-y-8">
            {/* Trip status section */}
            <TripStatusHeader
              trip={trip}
              group={group}
              membersCount={members.length}
            />
            
            {/* Destinations section */}
            <DestinationVoting
              destinations={destinations}
              selectedDestination={selectedDestination}
              userVote={userVote}
              allVotes={allVotes}
              onVote={handleVote}
              isVotingClosed={trip.status !== "voting"}
            />
          </div>
          
          <div className="lg:w-1/3 space-y-6">
            {/* Trip summary */}
            {(trip.status !== "voting" && selectedDestination) && (
              <TripSummary
                destination={selectedDestination}
                trip={trip}
                group={group}
                members={members}
                confirmedCount={confirmedCount}
              />
            )}
            
            {/* Participant list */}
            <ParticipantsList
              trip={trip}
              participants={formattedParticipants}
              currentUserId={currentUser.id}
              onUpdateStatus={handleUpdateStatus}
              onUpdatePayment={handleUpdatePayment}
              totalPrice={selectedDestination?.price || 0}
            />
            
            {/* Voting summary for voting phase */}
            {trip.status === "voting" && (
              <TripSummary
                destination={destinations.length > 0 ? destinations[0] : undefined}
                trip={trip}
                group={group}
                members={members}
                confirmedCount={confirmedCount}
                onFinalizeVoting={handleFinalizeVoting}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GroupDashboard;
