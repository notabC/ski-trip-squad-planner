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
        
        // Handle User Vote - make multiple attempts if needed
        if (currentUser) {
          let serverUserVote = await getUserVote(currentUser.id);
          
          // If no vote is found but we think there should be one, retry
          if (!serverUserVote && lastOptimisticUserVoteRef.current) {
            console.log("No vote found on first attempt but optimistic vote exists, retrying...");
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
            serverUserVote = await getUserVote(currentUser.id);
          }
          
          let finalUserVote = serverUserVote;
          if (lastOptimisticUserVoteRef.current && lastOptimisticUserVoteRef.current.userId === currentUser.id) {
            if (!serverUserVote || lastOptimisticUserVoteRef.current.timestamp > serverUserVote.timestamp) {
              finalUserVote = lastOptimisticUserVoteRef.current;
              console.log("Preserving optimistic user vote for setUserVote:", finalUserVote);
            }
          }
          
          if (finalUserVote) {
            console.log("Setting user vote:", finalUserVote);
            setUserVote(finalUserVote);
          } else {
            console.log("No user vote found for userId:", currentUser.id);
          }
        }

        // Handle All Votes - with retry logic
        let serverAllVotes = await getVotesByGroupId(groupId);
        
        // If we expect votes but none are found, retry
        if ((serverAllVotes.length === 0) && userVote) {
          console.log("No group votes found on first attempt but user vote exists, retrying...");
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
          serverAllVotes = await getVotesByGroupId(groupId);
        }
        
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
        
        console.log(`Setting all votes: ${finalAllVotes.length} votes`);
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

    // Create an optimistic vote to immediately update the UI
    const optimisticVote: Vote = {
      userId: currentUser.id,
      destinationId,
      timestamp: Date.now(),
    };

    // Apply optimistic update
    console.log("Applying optimistic vote update:", optimisticVote);
    setUserVote(optimisticVote);
    setAllVotes(prevAllVotes => 
      prevAllVotes
        .filter(vote => vote.userId !== currentUser.id)
        .concat(optimisticVote)
    );
    lastOptimisticUserVoteRef.current = optimisticVote;

    try {
      console.log("Casting vote for destination:", destinationId);
      // castVote now returns the actual saved vote
      const savedVote = await castVote(currentUser.id, destinationId);
      console.log("Vote successfully cast and returned:", savedVote);
      
      // Use the actual saved vote from the server
      setUserVote(savedVote);
      setAllVotes(prevAllVotes => {
        const newVotes = prevAllVotes.filter(vote => vote.userId !== currentUser.id);
        newVotes.push(savedVote);
        return newVotes;
      });
      
      // Clear the optimistic vote ref as we now have the real server data
      lastOptimisticUserVoteRef.current = null;
      
      toast({ title: "Vote cast", description: "Your vote has been recorded" });
      
      // Get all votes to ensure UI is consistent with server state
      console.log("Refreshing all votes after successful vote");
      const freshAllVotes = await getVotesByGroupId(groupId);
      if (freshAllVotes && freshAllVotes.length > 0) {
        console.log(`Retrieved ${freshAllVotes.length} votes from server:`, freshAllVotes);
        setAllVotes(freshAllVotes);
      } else {
        console.warn("No votes returned from getVotesByGroupId after successful vote");
      }
    } catch (error: any) {
      console.error("Error casting vote in useTripManagement:", error instanceof Error ? error.message : JSON.stringify(error, null, 2));
      
      // Rollback optimistic updates
      setUserVote(previousUserVote);
      setAllVotes(prevAllVotes => {
        let rolledBack = prevAllVotes.filter(vote => vote.userId !== currentUser.id);
        if (previousUserVote) {
          rolledBack.push(previousUserVote);
        }
        return rolledBack;
      });
      lastOptimisticUserVoteRef.current = previousUserVote;
      
      toast({ 
        title: "Error", 
        description: (error instanceof Error ? error.message : "Failed to cast vote. Please try again."), 
        variant: "destructive" 
      });
    } finally {
      isVotingInProgressRef.current = false;
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

  // Effect for periodic vote data refreshing
  useEffect(() => {
    if (!groupId || !currentUser) return;

    // Function to refresh votes only
    const refreshVotes = async () => {
      if (isVotingInProgressRef.current) {
        console.log("Skipping vote refresh due to active voting operation");
        return;
      }

      try {
        // Fetch latest votes from server without affecting other state
        console.log("Periodically refreshing vote data");
        const freshUserVote = await getUserVote(currentUser.id);
        const freshAllVotes = await getVotesByGroupId(groupId);

        if (freshUserVote) {
          setUserVote(prev => {
            // Only update if the server data is different
            if (!prev || prev.destinationId !== freshUserVote.destinationId) {
              console.log("Updating user vote from refresh:", freshUserVote);
              return freshUserVote;
            }
            return prev;
          });
        }

        if (freshAllVotes && freshAllVotes.length > 0) {
          setAllVotes(prev => {
            // Only update if there's a difference in votes
            const hasChanges = freshAllVotes.length !== prev.length || 
              freshAllVotes.some(newVote => {
                const existingVote = prev.find(v => v.userId === newVote.userId);
                return !existingVote || existingVote.destinationId !== newVote.destinationId;
              });
              
            if (hasChanges) {
              console.log(`Refreshed ${freshAllVotes.length} votes from server`);
              return freshAllVotes;
            }
            return prev;
          });
        }
      } catch (error) {
        console.error("Error refreshing vote data:", error);
        // Don't show toast for background refresh errors to avoid annoying users
      }
    };

    // Perform initial refresh
    refreshVotes();

    // Set up periodic refresh (every 30 seconds)
    const intervalId = setInterval(refreshVotes, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [groupId, currentUser?.id]);

  return {
    group, members, destinations, userVote, allVotes, trip, selectedDestination,
    loading, formattedParticipants, confirmedCount,
    handleVote, handleFinalizeVoting, handleUpdateStatus, handleUpdatePayment
  };
};
