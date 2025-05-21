import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import DestinationCard from "@/components/DestinationCard";
import ParticipantsList from "@/components/ParticipantsList";
import TripSummary from "@/components/TripSummary";
import { 
  getGroupById, 
  getGroupMembers, 
  getAllDestinations, 
  castVote, 
  getUserVote, 
  getVotesByGroupId,
  getGroupTrip,
  createTrip,
  finalizeVoting,
  updateParticipantStatus,
  updateParticipantPaymentStatus,
  getCurrentUser,
  getDestinationById
} from "@/services/localStorageService";
import { ArrowLeft, LogOut } from "lucide-react";
import type { Group, User, Destination, Trip, Participant, Vote } from "@/types";

const GroupDashboard = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [userVote, setUserVote] = useState<Vote | null>(null);
  const [allVotes, setAllVotes] = useState<Vote[]>([]);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Load all necessary data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
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
        return;
      }
      
      const fetchedGroup = getGroupById(groupId);
      if (!fetchedGroup) {
        toast({
          title: "Group not found",
          description: "The group does not exist or you don't have access",
          variant: "destructive",
        });
        navigate("/");
        return;
      }
      setGroup(fetchedGroup);
      
      // Get group members
      const fetchedMembers = getGroupMembers(groupId);
      setMembers(fetchedMembers);
      
      // Get all destinations
      try {
        const fetchedDestinations = await getAllDestinations();
        setDestinations(fetchedDestinations);
      } catch (error) {
        console.error("Error fetching destinations:", error);
        toast({
          title: "Error",
          description: "Failed to load destinations. Using fallback data.",
          variant: "destructive",
        });
      }
      
      // Get user's vote
      const fetchedUserVote = getUserVote(user.id);
      setUserVote(fetchedUserVote);
      
      // Get all votes for this group
      const fetchedVotes = getVotesByGroupId(groupId);
      setAllVotes(fetchedVotes);
      
      // Get or create the trip for this group
      let fetchedTrip = getGroupTrip(groupId);
      if (!fetchedTrip) {
        fetchedTrip = createTrip(groupId);
      }
      setTrip(fetchedTrip);
      
      // If the trip has a selected destination, load it
      if (fetchedTrip.selectedDestinationId) {
        try {
          const fetchedDestination = await getDestinationById(fetchedTrip.selectedDestinationId);
          setSelectedDestination(fetchedDestination);
        } catch (error) {
          console.error("Error fetching selected destination:", error);
        }
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [groupId, navigate, toast]);
  
  // Handle voting
  const handleVote = (destinationId: string) => {
    if (!currentUser) return;
    
    castVote(currentUser.id, destinationId);
    setUserVote({
      userId: currentUser.id,
      destinationId,
      timestamp: Date.now(),
    });
    
    // Update all votes
    const updatedVotes = getVotesByGroupId(groupId || "");
    setAllVotes(updatedVotes);
    
    toast({
      title: "Vote cast",
      description: "Your vote has been recorded",
    });
  };
  
  // Handle finalizing the voting
  const handleFinalizeVoting = async () => {
    if (!groupId) return;
    
    const updatedTrip = finalizeVoting(groupId);
    if (!updatedTrip) {
      toast({
        title: "Error",
        description: "Failed to finalize voting. Make sure there are votes.",
        variant: "destructive",
      });
      return;
    }
    
    setTrip(updatedTrip);
    
    // Load the selected destination
    if (updatedTrip.selectedDestinationId) {
      try {
        const selectedDest = await getDestinationById(updatedTrip.selectedDestinationId);
        setSelectedDestination(selectedDest);
        
        toast({
          title: "Voting finalized",
          description: "The trip destination has been selected",
        });
      } catch (error) {
        console.error("Error fetching selected destination:", error);
        toast({
          title: "Error",
          description: "Failed to load selected destination details",
          variant: "destructive",
        });
      }
    }
  };
  
  // Handle updating participant status
  const handleUpdateStatus = (userId: string, status: "confirmed" | "declined") => {
    if (!trip) return;
    
    const updatedTrip = updateParticipantStatus(trip.id, userId, status);
    if (!updatedTrip) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
      return;
    }
    
    setTrip(updatedTrip);
    
    toast({
      title: "Status updated",
      description: `You've ${status === "confirmed" ? "joined" : "declined"} the trip`,
    });
  };
  
  // Handle updating payment status (simulation)
  const handleUpdatePayment = (userId: string) => {
    if (!trip) return;
    
    const participant = trip.participants.find(p => p.userId === userId);
    if (!participant) return;
    
    let newStatus: Participant["paymentStatus"];
    let toastMessage: string;
    
    if (participant.paymentStatus === "not_paid") {
      newStatus = "partially_paid";
      toastMessage = "You've made a partial payment";
    } else {
      newStatus = "paid";
      toastMessage = "Payment completed. Thank you!";
    }
    
    const updatedTrip = updateParticipantPaymentStatus(
      trip.id,
      userId,
      newStatus
    );
    
    if (!updatedTrip) {
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
      return;
    }
    
    setTrip(updatedTrip);
    
    toast({
      title: "Payment updated",
      description: toastMessage,
    });
  };
  
  // Get counts of votes for each destination
  const getVotesForDestination = (destinationId: string) => {
    return allVotes.filter(vote => vote.destinationId === destinationId).length;
  };
  
  // Format participants data
  const formattedParticipants = trip?.participants.map(participant => {
    const user = members.find(m => m.id === participant.userId);
    return {
      user: user || { id: participant.userId, name: "Unknown", email: "" },
      participant,
    };
  }) || [];
  
  // Count confirmed participants
  const confirmedCount = trip?.participants.filter(p => p.status === "confirmed").length || 0;
  
  // Handle logout
  const handleLogout = () => {
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
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">{group.name}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm hidden sm:block">
              <p className="font-medium">{currentUser.name}</p>
              <p className="text-muted-foreground">{currentUser.email}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 space-y-8">
            {/* Trip status section */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 gradient-text">
                {trip.status === "voting" ? "Choose a Destination" : "Trip Details"}
              </h2>
              
              {trip.status === "voting" ? (
                <p className="text-muted-foreground">
                  Vote for your preferred destination. The group's choice will be finalized when voting is complete.
                </p>
              ) : (
                <p className="text-muted-foreground">
                  The destination has been selected! Confirm your participation and complete payment.
                </p>
              )}
              
              {/* Join code information */}
              <div className="mt-4 p-4 bg-secondary/30 rounded-md text-sm flex flex-col sm:flex-row sm:items-center justify-between">
                <div>
                  <p className="font-medium">Group Join Code: <span className="text-primary">{group.joinCode}</span></p>
                  <p className="text-muted-foreground text-xs mt-1">Share this code with friends to invite them</p>
                </div>
                <p className="text-muted-foreground mt-2 sm:mt-0">
                  {members.length} {members.length === 1 ? "member" : "members"}
                </p>
              </div>
            </div>
            
            {/* Destinations section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                {trip.status === "voting" ? "Vote for a Destination" : "Selected Destination"}
              </h2>
              
              {trip.status === "voting" ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {destinations.map((destination) => (
                    <DestinationCard
                      key={destination.id}
                      destination={destination}
                      onVote={handleVote}
                      userVote={userVote}
                      totalVotes={allVotes.length}
                      votesForDestination={getVotesForDestination(destination.id)}
                      isVotingClosed={trip.status !== "voting"}
                    />
                  ))}
                </div>
              ) : selectedDestination ? (
                <DestinationCard
                  key={selectedDestination.id}
                  destination={selectedDestination}
                  onVote={handleVote}
                  userVote={userVote}
                  totalVotes={allVotes.length}
                  votesForDestination={getVotesForDestination(selectedDestination.id)}
                  isVotingClosed={true}
                  isSelected={true}
                />
              ) : (
                <p>No destination selected yet.</p>
              )}
            </div>
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
