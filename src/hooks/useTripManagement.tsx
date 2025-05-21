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
  
  const isParticipantStatusUpdatingRef = useRef(false);
  const lastUpdatedUserIdRef = useRef<string | null>(null);
  const lastUpdatedStatusRef = useRef<Participant["status"] | null>(null);

  const isVotingInProgressRef = useRef(false);
  const lastOptimisticUserVoteRef = useRef<Vote | null>(null);
  
  // Load all necessary data
  useEffect(() => {
    const loadData = async () => {
      if (isParticipantStatusUpdatingRef.current || isVotingInProgressRef.current) {
        console.log("Skipping data load during active mutation (participant status or vote)");
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
          console.error("Group not found:", groupId); setLoading(false); return;
        }
        setGroup(fetchedGroup);
        
        const fetchedMembers = await getGroupMembers(groupId);
        if (!fetchedMembers || fetchedMembers.length === 0) {
          setMembers(currentUser ? [currentUser] : []);
        } else {
          const memberIds = fetchedMembers.map(m => m.id);
          if (currentUser && !memberIds.includes(currentUser.id)) {
            setMembers([...fetchedMembers, currentUser]);
          } else {
            setMembers(fetchedMembers);
          }
        }
        
        let fetchedDestinations = await getAllDestinations();
        if (!fetchedDestinations || fetchedDestinations.length === 0) {
          fetchedDestinations = await fetchSkiDestinations();
        }
        
        // Add logs to debug destination data
        console.log("Loaded destinations from database or API:", fetchedDestinations);
        console.log("Sample destination data:", fetchedDestinations[0]);
        
        setDestinations(fetchedDestinations);
        
        // Handle User Vote
        if (currentUser) {
          const serverUserVote = await getUserVote(currentUser.id);
          let finalUserVote = serverUserVote;
          if (lastOptimisticUserVoteRef.current && lastOptimisticUserVoteRef.current.userId === currentUser.id) {
            if (!serverUserVote || lastOptimisticUserVoteRef.current.timestamp > serverUserVote.timestamp) {
              finalUserVote = lastOptimisticUserVoteRef.current;
              console.log("Preserving optimistic user vote for setUserVote:", finalUserVote);
            }
          }
          setUserVote(finalUserVote);
        }

        // Handle All Votes
        const serverAllVotes = await getVotesByGroupId(groupId);
        let finalAllVotes = [...serverAllVotes];
        if (lastOptimisticUserVoteRef.current && currentUser && lastOptimisticUserVoteRef.current.userId === currentUser.id) {
          const optimisticVote = lastOptimisticUserVoteRef.current;
          const existingVoteIndex = finalAllVotes.findIndex(v => v.userId === optimisticVote.userId);
          if (existingVoteIndex !== -1) {
            if (finalAllVotes[existingVoteIndex].destinationId !== optimisticVote.destinationId ||
                (finalAllVotes[existingVoteIndex].timestamp || 0) < optimisticVote.timestamp) {
              finalAllVotes[existingVoteIndex] = optimisticVote;
              console.log("Merged optimistic vote into allVotes (replacement)");
            }
          } else {
            finalAllVotes.push(optimisticVote);
            console.log("Merged optimistic vote into allVotes (addition)");
          }
        }
        setAllVotes(finalAllVotes);
        
        // Clear optimistic vote ref after it has been merged/considered for both userVote and allVotes
        if (currentUser && lastOptimisticUserVoteRef.current && lastOptimisticUserVoteRef.current.userId === currentUser.id) {
            lastOptimisticUserVoteRef.current = null;
        }

        let fetchedTrip = await getGroupTrip(groupId);
        if (!fetchedTrip) {
          fetchedTrip = await createTrip(groupId);
        }
        
        if (fetchedTrip) {
          let updatedParticipants = [...(fetchedTrip.participants || [])];
          const currentMemberIds = fetchedMembers.map(m => m.id);

          if (lastUpdatedUserIdRef.current && lastUpdatedStatusRef.current) {
            const userId = lastUpdatedUserIdRef.current;
            const status = lastUpdatedStatusRef.current;
            updatedParticipants = updatedParticipants.map(p => 
              p.userId === userId ? { ...p, status } : p
            );
            lastUpdatedUserIdRef.current = null;
            lastUpdatedStatusRef.current = null;
          }
          
          const participantUserIds = updatedParticipants.map(p => p.userId);
          const missingMembers = currentMemberIds.filter(id => !participantUserIds.includes(id));
          if (missingMembers.length > 0) {
            missingMembers.forEach(memberId => {
              updatedParticipants.push({
                userId: memberId, 
                status: "pending" as Participant["status"], 
                paymentStatus: "not_paid" as Participant["paymentStatus"]
              });
            });
          }
          fetchedTrip = { ...fetchedTrip, participants: updatedParticipants };
          setTrip(fetchedTrip);
          
          if (fetchedTrip.selectedDestinationId) {
            const fetchedDestination = await getDestinationById(fetchedTrip.selectedDestinationId);
            setSelectedDestination(fetchedDestination);
          }
        }
      } catch (error) {
        console.error("Error loading trip data:", error);
        toast({ title: "Error", description: "Failed to load trip information.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [groupId, currentUser?.id, toast]); // currentUser.id ensures re-run if user changes
  
  const handleVote = async (destinationId: string) => {
    if (!currentUser || !groupId) {
      toast({ title: "Error", description: "User or group not available for voting.", variant: "destructive" });
      return;
    }
    
    isVotingInProgressRef.current = true;
    const previousUserVote = userVote ? { ...userVote } : null;

    const optimisticVote: Vote = {
      userId: currentUser.id,
      destinationId,
      timestamp: Date.now(),
    };

    setUserVote(optimisticVote);
    setAllVotes(prevAllVotes => 
      prevAllVotes
        .filter(vote => vote.userId !== currentUser.id)
        .concat(optimisticVote)
    );
    lastOptimisticUserVoteRef.current = optimisticVote;

    try {
      console.log("Casting vote for destination:", destinationId);
      await castVote(currentUser.id, destinationId);
      toast({ title: "Vote cast", description: "Your vote has been recorded" });
    } catch (error: any) {
      console.error("Error casting vote in useTripManagement:", JSON.stringify(error, null, 2));
      // Rollback optimistic updates
      setUserVote(previousUserVote);
      setAllVotes(prevAllVotes => {
        let rolledBack = prevAllVotes.filter(vote => vote.userId !== currentUser.id);
        if (previousUserVote) {
          rolledBack.push(previousUserVote);
        }
        return rolledBack;
      });
      lastOptimisticUserVoteRef.current = previousUserVote; // Or null if it was null
      toast({ title: "Error", description: (error.message || "Failed to cast vote. Please try again."), variant: "destructive" });
    } finally {
      isVotingInProgressRef.current = false;
      // No immediate re-fetch here; rely on loadData to eventually pick up server state
      // and merge with optimistic if necessary
    }
  };
  
  const handleFinalizeVoting = async () => {
    if (!groupId) { toast({ title: "Error", description: "Group ID missing.", variant: "destructive" }); return; }
    isVotingInProgressRef.current = true; 
    try {
      const updatedTrip = await finalizeVoting(groupId);
      if (!updatedTrip) { toast({ title: "Error finalizing voting"}); return; }
      setTrip(updatedTrip);
      if (updatedTrip.selectedDestinationId) {
        const selDest = await getDestinationById(updatedTrip.selectedDestinationId);
        setSelectedDestination(selDest);
      }
      toast({ title: "Voting finalized" });
    } catch (error) { 
      console.error("Error finalizing voting:", error);
      toast({ title: "Error", description: "Failed to finalize voting.", variant: "destructive" });
    }
    finally { isVotingInProgressRef.current = false; }
  };
  
  const handleUpdateStatus = async (userId: string, status: Participant["status"]) => {
    if (!trip) { console.error("No trip found"); return; }
    
    const originalParticipants = trip.participants; // Capture for rollback

    isParticipantStatusUpdatingRef.current = true;
    lastUpdatedUserIdRef.current = userId;
    lastUpdatedStatusRef.current = status;
    
    const optimisticParticipants = trip.participants.map(p => 
      p.userId === userId ? { ...p, status } : p
    );
    setTrip({ ...trip, participants: optimisticParticipants }); // Optimistic update
      
    try {
      const updatedTripFromServer = await updateParticipantStatus(trip.id, userId, status);
      if (!updatedTripFromServer) {
        throw new Error("Failed to update status on server");
      }

      setTrip(currentClientTrip => {
        if (!currentClientTrip) {
          // Fallback, though currentClientTrip should exist due to optimistic update
          return updatedTripFromServer; 
        }

        const serverParticipants = updatedTripFromServer.participants || [];
        const clientParticipants = currentClientTrip.participants || [];

        let finalMergedParticipants = [...serverParticipants];
        const finalMergedUserIds = new Set(serverParticipants.map(p => p.userId));

        clientParticipants.forEach(clientP => {
          if (!finalMergedUserIds.has(clientP.userId)) {
            finalMergedParticipants.push(clientP);
          }
        });

        return {
          ...updatedTripFromServer,
          participants: finalMergedParticipants
        };
      });
      
      lastUpdatedUserIdRef.current = null;
      lastUpdatedStatusRef.current = null;

      toast({ title: "Status updated" });
    } catch (error) {
      console.error("Error updating participant status:", error);
      setTrip({ ...trip, participants: originalParticipants }); // Rollback
      lastUpdatedUserIdRef.current = null; 
      lastUpdatedStatusRef.current = null;
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    } finally {
      isParticipantStatusUpdatingRef.current = false;
    }
  };
  
  const handleUpdatePayment = async (userId: string) => {
    if (!trip) { console.error("No trip found"); return; }
    const participant = trip.participants.find(p => p.userId === userId);
    if (!participant) { console.error("Participant not found"); return; }

    isParticipantStatusUpdatingRef.current = true; 
    const originalPaymentStatus = participant.paymentStatus; 
    const originalParticipantsForPaymentRollback = trip.participants;


    let newStatus: Participant["paymentStatus"];
    if (participant.paymentStatus === "not_paid") newStatus = "partially_paid"; else newStatus = "paid";

    const optimisticParticipants = trip.participants.map(p =>
        p.userId === userId ? { ...p, paymentStatus: newStatus } : p
    );
    setTrip({ ...trip, participants: optimisticParticipants});
    
    try {
        const updatedTripFromServer = await updateParticipantPaymentStatus(trip.id, userId, newStatus);
        if (!updatedTripFromServer) throw new Error("Failed to update payment status on server");
        
        setTrip(currentClientTrip => {
          if (!currentClientTrip) {
            return updatedTripFromServer;
          }

          const serverParticipants = updatedTripFromServer.participants || [];
          const clientParticipants = currentClientTrip.participants || [];

          let finalMergedParticipants = [...serverParticipants];
          const finalMergedUserIds = new Set(serverParticipants.map(p => p.userId));

          clientParticipants.forEach(clientP => {
            if (!finalMergedUserIds.has(clientP.userId)) {
              finalMergedParticipants.push(clientP);
            }
          });
          
          return { ...updatedTripFromServer, participants: finalMergedParticipants };
        });
        toast({ title: "Payment updated" });
    } catch (error) {
        console.error("Error updating payment status:", error);
        // Rollback to the state before optimistic update for payment
        setTrip(prevTrip => {
          if (!prevTrip) return null; // Or handle appropriately
          return { ...prevTrip, participants: originalParticipantsForPaymentRollback };
        });
        toast({ title: "Error", description: "Failed to update payment.", variant: "destructive" });
    } finally {
        isParticipantStatusUpdatingRef.current = false;
    }
  };

  const formattedParticipants = useMemo(() => {
    if (!trip?.participants) return [];
    if (trip.participants.length === 0 && members.length > 0) {
      return members.map(member => ({
        user: member,
        participant: { 
            userId: member.id, 
            status: "pending" as Participant["status"], 
            paymentStatus: "not_paid" as Participant["paymentStatus"] 
        }
      }));
    }
    return trip.participants.map(participant => {
      const user = members.find(m => m.id === participant.userId);
      return {
        user: user || { id: participant.userId, name: "Loading...", email: "" },
        participant,
      };
    });
  }, [trip?.participants, members]);
  
  const confirmedCount = trip?.participants.filter(p => p.status === "confirmed").length || 0;

  useEffect(() => {
    if (isParticipantStatusUpdatingRef.current || isVotingInProgressRef.current) {
      console.log("Skipping participant sync due to ongoing mutation.");
      return;
    }
    
    if (trip && members.length > 0) {
      const participantUserIds = trip.participants.map(p => p.userId);
      const memberIds = members.map(m => m.id);
      const missingMembers = memberIds.filter(id => !participantUserIds.includes(id));
      
      if (missingMembers.length > 0) {
        const newParticipants: Participant[] = missingMembers.map(memberId => ({
          userId: memberId, 
          status: "pending" as Participant["status"], 
          paymentStatus: "not_paid" as Participant["paymentStatus"]
        }));
        setTrip(prevTrip => {
          if (!prevTrip) return null; // Should not happen if trip is defined
          return {
            ...prevTrip,
            participants: [...prevTrip.participants, ...newParticipants]
          }
        });
      }
    }
  }, [members, trip]);

  return {
    group, members, destinations, userVote, allVotes, trip, selectedDestination,
    loading, formattedParticipants, confirmedCount,
    handleVote, handleFinalizeVoting, handleUpdateStatus, handleUpdatePayment
  };
};
