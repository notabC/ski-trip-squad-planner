import React, { useEffect, useMemo } from "react";
import DestinationCard from "@/components/DestinationCard";
import { Destination, Vote, User } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, MapPinIcon, SnowflakeIcon, UsersIcon } from "lucide-react";

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
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
            {isVotingClosed ? "Selected Destination" : "Vote for a Destination"}
          </h2>
          
          <div className="flex items-center text-sm text-slate-500 mt-2 md:mt-0">
            <div className="animate-pulse bg-slate-200 h-6 w-36 rounded-md"></div>
          </div>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl overflow-hidden shadow-lg bg-white/80 backdrop-blur-sm">
              <div className="animate-pulse">
                <div className="h-48 bg-gradient-to-r from-slate-200 to-slate-300"></div>
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-20 bg-slate-200 rounded"></div>
                  <div className="h-8 bg-slate-200 rounded-xl w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If no destinations are available, show a message
  if (destinations.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
          {isVotingClosed ? "Selected Destination" : "Vote for a Destination"}
        </h2>
        <div className="p-12 border-2 border-dashed border-slate-200 bg-white/50 backdrop-blur-sm rounded-xl text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-sky-400/20 to-blue-600/20">
              <MapPinIcon className="h-10 w-10 text-sky-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800">No Destinations Available</h3>
            <p className="text-slate-600 max-w-md mx-auto">
              No destinations are currently available for voting. Please check back later or contact your group organizer.
            </p>
          </div>
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
          {isVotingClosed ? "Selected Destination" : "Vote for a Destination"}
        </h2>
        
        {tripDates && (
          <div className="flex items-center text-sm text-slate-600 mt-2 md:mt-0 bg-gradient-to-br from-sky-400/10 to-blue-600/10 px-4 py-2 rounded-xl shadow-sm">
            <CalendarIcon size={16} className="mr-2 text-sky-600" />
            <span>Trip dates: <span className="font-medium">{tripDates.start} - {tripDates.end}</span></span>
          </div>
        )}
      </div>
      
      {isVotingClosed ? (
        selectedDestination ? (
          <div className="max-w-xl mx-auto">
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
          </div>
        ) : (
          <div className="p-12 border-2 border-dashed border-slate-200 bg-white/50 backdrop-blur-sm rounded-xl text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-gradient-to-br from-sky-400/20 to-blue-600/20">
                <SnowflakeIcon className="h-10 w-10 text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800">No Destination Selected</h3>
              <p className="text-slate-600 max-w-md mx-auto">
                Your group hasn't selected a final destination yet. Once voting is complete, the selected destination will appear here.
              </p>
            </div>
          </div>
        )
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
      
      {members && members.length > 0 && !isVotingClosed && (
        <div className="mt-8 p-4 bg-gradient-to-br from-sky-50 to-blue-50/50 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <UsersIcon className="h-5 w-5 text-sky-600" />
            <h3 className="font-semibold text-slate-800">Group Voting Status</h3>
          </div>
          <div className="text-sm text-slate-600">
            <p>{allVotes.length} of {members.length} members have voted</p>
            <div className="mt-2 h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${(allVotes.length / members.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DestinationVoting;
