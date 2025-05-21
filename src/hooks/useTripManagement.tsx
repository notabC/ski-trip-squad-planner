import { useState, useEffect, useMemo, useRef } from "react";
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
  
  // Use a ref to track when we're updating a participant's status
  // This prevents the secondary useEffect from overriding our changes
  const updatingParticipantRef = useRef(false);
  const lastUpdatedUserIdRef = useRef<string | null>(null);
  const lastUpdatedStatusRef = useRef<"confirmed" | "declined" | null>(null);
  
  // Load all necessary data
  useEffect(() => {
    const loadData = async () => {
      // Skip data loading if we're currently updating a participant
      if (updatingParticipantRef.current) {
        console.log("Skipping data load during participant update");
        return;
      }
      
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
          const memberIds = members.map(m => m.id);
          let participantUserIds: string[] = [];
          let updatedParticipants = [...(fetchedTrip.participants || [])];
          
          if (fetchedTrip.participants) {
            participantUserIds = fetchedTrip.participants.map(p => p.userId);
            
            // Special handling for recently updated participant status
            if (lastUpdatedUserIdRef.current && lastUpdatedStatusRef.current) {
              // If we recently updated a participant status, make sure it's preserved
              const userId = lastUpdatedUserIdRef.current;
              const status = lastUpdatedStatusRef.current;
              
              updatedParticipants = updatedParticipants.map(p => 
                p.userId === userId ? { ...p, status } : p
              );
              
              console.log(`Preserving status update for user ${userId} as ${status}`);
              
              // Reset refs once we've preserved the status
              lastUpdatedUserIdRef.current = null;
              lastUpdatedStatusRef.current = null;
            }
            
            // Find members who are not yet participants
            const missingMembers = memberIds.filter(id => !participantUserIds.includes(id));
            
            if (missingMembers.length > 0) {
              console.log("Some members are not yet participants, they will be added:", missingMembers);
              
              for (const memberId of missingMembers) {
                updatedParticipants.push({
                  userId: memberId,
                  status: "pending",
                  paymentStatus: "not_paid"
                });
              }
              
              fetchedTrip = {
                ...fetchedTrip,
                participants: updatedParticipants
              };
            }
          } else {
            // If no participants exist, add all members as participants
            console.log("No participants found, adding all members");
            updatedParticipants = memberIds.map(id => ({
              userId: id,
              status: "pending",
              paymentStatus: "not_paid"
            }));
            
            fetchedTrip = {
              ...fetchedTrip,
              participants: updatedParticipants
            };
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
      
      // Set a flag to prevent concurrent effects from running
      updatingParticipantRef.current = true;
      
      // Get the previous vote if it exists
      const previousVote = userVote;
      
      // Optimistically update local state for immediate UI feedback
      const newVote = {
        userId: currentUser.id,
        destinationId,
        timestamp: Date.now(),
      };
      
      // Update the user's vote immediately
      setUserVote(newVote);
      
      // Update the all votes array optimistically
      let newAllVotes = [...allVotes];
      
      // If there was a previous vote, remove it from the local state
      if (previousVote) {
        newAllVotes = newAllVotes.filter(
          vote => !(vote.userId === currentUser.id)
        );
      }
      
      // Add the new vote to the local state
      newAllVotes.push(newVote);
      setAllVotes(newAllVotes);
      
      console.log("Optimistically updated votes:", newAllVotes);
      
      // Actually save to database
      await castVote(currentUser.id, destinationId);
      
      // Fetch updated votes from server to ensure consistency
      if (groupId) {
        const updatedVotes = await getVotesByGroupId(groupId);
        setAllVotes(updatedVotes);
        console.log("Updated votes from server after casting vote:", updatedVotes);
      }
      
      // Clear the flag
      updatingParticipantRef.current = false;
      
      toast({
        title: "Vote cast",
        description: "Your vote has been recorded",
      });
    } catch (error) {
      // Clear the flag on error
      updatingParticipantRef.current = false;
      
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
    if (!trip) {
      console.error("Can't update status: No trip found");
      return;
    }
    
    try {
      console.log(`Updating status for userId: ${userId} to ${status}`);
      
      // Set the flag to indicate we're updating a participant's status
      updatingParticipantRef.current = true;
      
      // Store the updated values for reference
      lastUpdatedUserIdRef.current = userId;
      lastUpdatedStatusRef.current = status;
      
      // Immediately update the UI for better responsiveness
      const updatedParticipants = trip.participants.map(p => 
        p.userId === userId 
          ? { ...p, status } 
          : p
      );
      
      setTrip({
        ...trip,
        participants: updatedParticipants
      });
      
      // Then update in database
      const updatedTrip = await updateParticipantStatus(trip.id, userId, status);
      
      // Clear updating flag
      updatingParticipantRef.current = false;
      
      if (!updatedTrip) {
        toast({
          title: "Error",
          description: "Failed to update status on server",
          variant: "destructive",
        });
        return;
      }
      
      // We don't need to immediately update with server data as our optimistic update should be correct
      // We'll just keep our optimistic update to prevent any flicker
      // setTrip(updatedTrip);
      
      toast({
        title: "Status updated",
        description: `You've ${status === "confirmed" ? "joined" : "declined"} the trip`,
      });
    } catch (error) {
      // Clear updating flag on error too
      updatingParticipantRef.current = false;
      
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
      // Set updating flag
      updatingParticipantRef.current = true;
      
      // Optimistic update
      const updatedParticipants = trip.participants.map(p => 
        p.userId === userId 
          ? { ...p, paymentStatus: newStatus } 
          : p
      );
      
      setTrip({
        ...trip,
        participants: updatedParticipants
      });
      
      const updatedTrip = await updateParticipantPaymentStatus(
        trip.id,
        userId,
        newStatus
      );
      
      // Clear updating flag
      updatingParticipantRef.current = false;
      
      if (!updatedTrip) {
        toast({
          title: "Error",
          description: "Failed to update payment status",
          variant: "destructive",
        });
        return;
      }
      
      // We'll keep our optimistic update to prevent flicker
      // setTrip(updatedTrip);
      
      toast({
        title: "Payment updated",
        description: toastMessage,
      });
    } catch (error) {
      // Clear updating flag on error
      updatingParticipantRef.current = false;
      
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
    if (!trip?.participants) {
      console.warn("No participants available to format");
      return [];
    }

    // If we have members but no participants, create participants for all members
    if (trip.participants.length === 0 && members.length > 0) {
      console.log("No participants but members exist, creating participants for all members");
      return members.map(member => ({
        user: member,
        participant: {
          userId: member.id,
          status: "pending",
          paymentStatus: "not_paid"
        }
      }));
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
    // Skip if we're updating a participant to avoid race condition
    if (updatingParticipantRef.current) {
      console.log("Skipping participant sync during update");
      return;
    }
    
    // If we have members but they're not all in the trip participants, update the trip
    if (trip && members.length > 0) {
      const participantUserIds = trip.participants.map(p => p.userId);
      const memberIds = members.map(m => m.id);
      
      const missingMembers = memberIds.filter(id => !participantUserIds.includes(id));
      
      if (missingMembers.length > 0) {
        console.log("Found members not in participants list, updating trip:", missingMembers);
        
        const updatedParticipants = [...trip.participants];
        
        for (const memberId of missingMembers) {
          updatedParticipants.push({
            userId: memberId,
            status: "pending",
            paymentStatus: "not_paid"
          });
        }
        
        setTrip({
          ...trip,
          participants: updatedParticipants
        });
      }
    }
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
