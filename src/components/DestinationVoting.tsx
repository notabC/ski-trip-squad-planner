
import React, { useEffect } from "react";
import DestinationCard from "@/components/DestinationCard";
import { Destination, Vote, User } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

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
  // Get counts of votes for each destination
  const getVotesForDestination = (destinationId: string) => {
    return allVotes.filter(vote => vote.destinationId === destinationId).length;
  };
  
  // Debug logs to help identify issues
  useEffect(() => {
    console.log("DestinationVoting - destinations:", destinations);
    console.log("DestinationVoting - userVote:", userVote);
    console.log("DestinationVoting - allVotes:", allVotes);
    console.log("DestinationVoting - members:", members);
    console.log("DestinationVoting - isVotingClosed:", isVotingClosed);
  }, [destinations, userVote, allVotes, members, isVotingClosed]);

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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        {isVotingClosed ? "Selected Destination" : "Vote for a Destination"}
      </h2>
      
      {isVotingClosed ? (
        selectedDestination ? (
          <DestinationCard
            key={selectedDestination.id}
            destination={selectedDestination}
            onVote={onVote}
            userVote={userVote}
            totalVotes={allVotes.length}
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
              totalVotes={allVotes.length}
              votesForDestination={getVotesForDestination(destination.id)}
              isVotingClosed={false}
              isSelected={userVote?.destinationId === destination.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DestinationVoting;
