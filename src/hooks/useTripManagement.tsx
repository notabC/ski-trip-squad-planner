
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
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
  getDestinationById
} from "@/services/localStorageService";
import type { Group, User, Destination, Trip, Participant, Vote } from "@/types";

export const useTripManagement = (groupId: string | undefined, currentUser: User | null) => {
  const { toast } = useToast();
  
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
      
      if (!groupId || !currentUser) {
        setLoading(false);
        return;
      }
      
      const fetchedGroup = getGroupById(groupId);
      if (!fetchedGroup) {
        setLoading(false);
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
      const fetchedUserVote = getUserVote(currentUser.id);
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
  }, [groupId, currentUser, toast]);
  
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
  
  // Handle updating payment status
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

  return {
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
  };
};
