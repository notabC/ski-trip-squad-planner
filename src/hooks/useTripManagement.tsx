import { useState, useEffect, useMemo } from "react";
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
  getDestinationById,
  getUserById
} from "@/services/supabaseService";
import { fetchSkiDestinations } from "@/services/apiService";
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
      
      try {
        console.log("Loading trip management data for groupId:", groupId, "and userId:", currentUser.id);
        
        const fetchedGroup = await getGroupById(groupId);
        if (!fetchedGroup) {
          console.error("Group not found:", groupId);
          setLoading(false);
          return;
        }
        setGroup(fetchedGroup);
        console.log("Fetched group:", fetchedGroup);
        
        // Get group members
        const fetchedMembers = await getGroupMembers(groupId);
        console.log("Fetched members:", fetchedMembers);
        
        if (!fetchedMembers || fetchedMembers.length === 0) {
          console.warn("No members found for group, adding current user as fallback");
          setMembers([currentUser]);
        } else {
          // Ensure the current user is in the members list
          const memberIds = fetchedMembers.map(m => m.id);
          if (!memberIds.includes(currentUser.id)) {
            console.warn("Current user not in members list, adding");
            setMembers([...fetchedMembers, currentUser]);
          } else {
            setMembers(fetchedMembers);
          }
        }
        
        // Get all destinations - first try from database, then API with mock data fallback
        let fetchedDestinations = await getAllDestinations();
        console.log("Database destinations:", fetchedDestinations);
        
        if (!fetchedDestinations || fetchedDestinations.length === 0) {
          console.log("No destinations in database, fetching from API/mock...");
          fetchedDestinations = await fetchSkiDestinations();
          console.log("API/Mock destinations:", fetchedDestinations);
        }
        
        setDestinations(fetchedDestinations);
        console.log("Final destinations set:", fetchedDestinations);
        
        // Get user's vote
        if (currentUser) {
          const fetchedUserVote = await getUserVote(currentUser.id);
          setUserVote(fetchedUserVote);
          console.log("Fetched user vote:", fetchedUserVote);
        }
        
        // Get all votes for this group
        const fetchedVotes = await getVotesByGroupId(groupId);
        setAllVotes(fetchedVotes);
        console.log("Fetched all votes:", fetchedVotes);
        
        // Get or create the trip for this group
        let fetchedTrip = await getGroupTrip(groupId);
        
        if (!fetchedTrip) {
          console.log("No trip found, creating new trip");
          fetchedTrip = await createTrip(groupId);
        }
        
        if (fetchedTrip) {
          // Ensure all members are included as participants
          if (fetchedTrip.participants) {
            const memberIds = members.map(m => m.id);
            const participantUserIds = fetchedTrip.participants.map(p => p.userId);
            
            // Find members who are not yet participants
            const missingMembers = memberIds.filter(id => !participantUserIds.includes(id));
            
            if (missingMembers.length > 0) {
              console.log("Some members are not yet participants, they will be added:", missingMembers);
              // In a real application, you would update the participants here
              // For now, we'll just make sure they're included in the UI
              const newParticipants = [...fetchedTrip.participants];
              
              for (const memberId of missingMembers) {
                newParticipants.push({
                  userId: memberId,
                  status: "pending",
                  paymentStatus: "not_paid"
                });
              }
              
              fetchedTrip = {
                ...fetchedTrip,
                participants: newParticipants
              };
            }
          }
          
          setTrip(fetchedTrip);
          console.log("Trip data:", fetchedTrip);
          
          // If the trip has a selected destination, load it
          if (fetchedTrip.selectedDestinationId) {
            const fetchedDestination = await getDestinationById(fetchedTrip.selectedDestinationId);
            setSelectedDestination(fetchedDestination);
            console.log("Selected destination:", fetchedDestination);
          }
        }
      } catch (error) {
        console.error("Error loading trip data:", error);
        toast({
          title: "Error",
          description: "Failed to load trip information. Using fallback data.",
          variant: "destructive",
        });
        
        // Ensure we have destinations even if there's an error
        const fallbackDestinations = await fetchSkiDestinations();
        setDestinations(fallbackDestinations);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [groupId, currentUser, toast]);
  
  // Handle voting
  const handleVote = async (destinationId: string) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to vote.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log("Casting vote for destination:", destinationId);
      await castVote(currentUser.id, destinationId);
      setUserVote({
        userId: currentUser.id,
        destinationId,
        timestamp: Date.now(),
      });
      
      // Update all votes
      if (groupId) {
        const updatedVotes = await getVotesByGroupId(groupId);
        setAllVotes(updatedVotes);
        console.log("Updated votes after casting vote:", updatedVotes);
      }
      
      toast({
        title: "Vote cast",
        description: "Your vote has been recorded",
      });
    } catch (error) {
      console.error("Error casting vote:", error);
      toast({
        title: "Error",
        description: "Failed to cast vote. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle finalizing the voting
  const handleFinalizeVoting = async () => {
    if (!groupId) {
      toast({
        title: "Error",
        description: "Group ID is missing.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log("Finalizing voting for group:", groupId);
      const updatedTrip = await finalizeVoting(groupId);
      if (!updatedTrip) {
        toast({
          title: "Error",
          description: "Failed to finalize voting. Make sure there are votes.",
          variant: "destructive",
        });
        return;
      }
      
      setTrip(updatedTrip);
      console.log("Trip updated after finalizing voting:", updatedTrip);
      
      // Load the selected destination
      if (updatedTrip.selectedDestinationId) {
        const selectedDest = await getDestinationById(updatedTrip.selectedDestinationId);
        setSelectedDestination(selectedDest);
        console.log("Selected destination after finalizing:", selectedDest);
        
        toast({
          title: "Voting finalized",
          description: "The trip destination has been selected",
        });
      }
    } catch (error) {
      console.error("Error finalizing voting:", error);
      toast({
        title: "Error",
        description: "Failed to finalize voting.",
        variant: "destructive",
      });
    }
  };
  
  // Handle updating participant status
  const handleUpdateStatus = async (userId: string, status: "confirmed" | "declined") => {
    if (!trip) return;
    
    try {
      const updatedTrip = await updateParticipantStatus(trip.id, userId, status);
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
    } catch (error) {
      console.error("Error updating participant status:", error);
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    }
  };
  
  // Handle updating payment status
  const handleUpdatePayment = async (userId: string) => {
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
    
    try {
      const updatedTrip = await updateParticipantPaymentStatus(
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
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast({
        title: "Error",
        description: "Failed to update payment status.",
        variant: "destructive",
      });
    }
  };

  // Format participants data
  const formattedParticipants = useMemo(() => {
    if (!trip?.participants || !members || members.length === 0) {
      console.warn("No participants or members available to format");
      return [];
    }

    const result = trip.participants.map(participant => {
      // Find the user for this participant
      const user = members.find(m => m.id === participant.userId);
      
      // If user not found in members, try to load it
      if (!user) {
        console.warn(`User ${participant.userId} not found in members list`);
        return {
          user: { 
            id: participant.userId, 
            name: "Loading...", 
            email: "" 
          },
          participant,
        };
      }
      
      return {
        user,
        participant,
      };
    });
    
    console.log("Formatted participants:", result);
    return result;
  }, [trip?.participants, members]);
  
  // Count confirmed participants
  const confirmedCount = trip?.participants.filter(p => p.status === "confirmed").length || 0;

  // This will force-update the participants list when members or trip changes
  useEffect(() => {
    // Just a placeholder to ensure the dependency array includes members and trip
    console.log("Members or trip data changed, updating formatted participants");
  }, [members, trip]);

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
