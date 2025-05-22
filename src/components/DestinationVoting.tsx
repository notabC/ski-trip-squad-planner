import React, { useEffect, useMemo } from "react";
import DestinationCard from "@/components/DestinationCard";
import { Destination, Vote, User } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon } from "lucide-react";

interface DestinationVotingProps {
  destinations: Destination[];
  selectedDestination?: Destination | null;
  userVote: Vote | null;
  allVotes: Vote[];
  members?: User[]; // Added this to make it optional
  onVote: (destinationId: string) => void;
  isVotingClosed?: boolean;
}

const DestinationVoting: React.FC<DestinationVotingProps> = ({
  destinations,
  selectedDestination,
  userVote,
  allVotes,
  members,
  onVote,
  isVotingClosed = false,
}) => {
  // Map to track the relationship between client-side ID formats
  const idMappings = useMemo(() => {
    // Create a map to track ID relationships based on the position in the array
    const mappings: Record<string, string[]> = {};
    
    // For each destination, create entries only for alternative formats of its own ID
    // NOT for other accommodations at the same resort
    destinations.forEach((dest) => {
      // Extract the resort and accommodation numbers
      const id = dest.id;
      
      // Create an array with only this specific destination's possible ID formats
      const possibleIds = [id];
      
      // Register this destination's possible ID formats
      possibleIds.forEach(possibleId => {
        if (!mappings[possibleId]) {
          mappings[possibleId] = [];
        }
        // Only add IDs for this specific destination
        mappings[possibleId] = [...new Set([...mappings[possibleId], ...possibleIds])];
      });
    });
    
    return mappings;
  }, [destinations]);
  
  // Calculate vote counts once using useMemo to improve performance
  const voteCounts = useMemo(() => {
    // Create a map of destination IDs to vote counts
    const counts: Record<string, number> = {};
    
    // Initialize with zero for all destinations
    destinations.forEach(dest => {
      counts[dest.id] = 0;
    });
    
    // Count votes for each specific destination ID only
    allVotes.forEach(vote => {
      // Exact ID match only - no mapping between different accommodations
      if (counts.hasOwnProperty(vote.destinationId)) {
        counts[vote.destinationId]++;
      }
    });
    
    console.log("Calculated vote counts:", counts);
    return counts;
  }, [destinations, allVotes]);
  
  // Get counts of votes for each destination
  const getVotesForDestination = (destinationId: string) => {
    return voteCounts[destinationId] || 0;
  };
  
  // Check if a user's vote is for a specific destination
  const isVoteForDestination = (voteDestId: string, destId: string) => {
    // Only count exact matches or known alternative formats of the same ID
    return voteDestId === destId || 
           (idMappings[voteDestId] && idMappings[voteDestId].includes(destId));
  };
  
  // Debug logs to help identify issues
  useEffect(() => {
    console.log("DestinationVoting - destinations:", destinations);
    console.log("DestinationVoting - userVote:", userVote);
    console.log("DestinationVoting - allVotes:", allVotes);
    console.log("DestinationVoting - members:", members);
    console.log("DestinationVoting - isVotingClosed:", isVotingClosed);
    console.log("DestinationVoting - vote counts:", voteCounts);
    console.log("DestinationVoting - ID mappings:", idMappings);
  }, [destinations, userVote, allVotes, members, isVotingClosed, voteCounts, idMappings]);

  // If destinations is loading, show a loading skeleton
  if (!destinations) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {isVotingClosed ? "Selected Destination" : "Vote for a Destination"}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[400px] w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // If no destinations are available, show a message
  if (destinations.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {isVotingClosed ? "Selected Destination" : "Vote for a Destination"}
        </h2>
        <div className="p-6 bg-muted rounded-lg text-center">
          <p>No destinations available for voting. Please check back later.</p>
        </div>
      </div>
    );
  }

  // Calculate total votes for percentage calculation
  const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);
  
  // Extract dates from the first destination (they should all be the same)
  const tripDates = destinations.length > 0 ? {
    start: new Date(destinations[0].dates.start).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    end: new Date(destinations[0].dates.end).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  } : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <h2 className="text-xl font-semibold">
          {isVotingClosed ? "Selected Destination" : "Vote for a Destination"}
        </h2>
        
        {tripDates && (
          <div className="flex items-center text-sm text-muted-foreground mt-1 md:mt-0 bg-secondary/30 px-3 py-1 rounded-md">
            <CalendarIcon size={16} className="mr-2" />
            <span>Trip dates: {tripDates.start} - {tripDates.end}</span>
          </div>
        )}
      </div>
      
      {isVotingClosed ? (
        selectedDestination ? (
          <DestinationCard
            key={selectedDestination.id}
            destination={selectedDestination}
            onVote={onVote}
            userVote={userVote}
            totalVotes={totalVotes}
            votesForDestination={getVotesForDestination(selectedDestination.id)}
            isVotingClosed={true}
            isSelected={true}
          />
        ) : (
          <p>No destination selected yet.</p>
        )
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {destinations.map((destination) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
              onVote={onVote}
              userVote={userVote}
              totalVotes={totalVotes}
              votesForDestination={getVotesForDestination(destination.id)}
              isVotingClosed={false}
              isSelected={userVote ? isVoteForDestination(userVote.destinationId, destination.id) : false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DestinationVoting;
