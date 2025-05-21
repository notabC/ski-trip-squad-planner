
import React from "react";
import DestinationCard from "@/components/DestinationCard";
import { Destination, Vote, User } from "@/types";

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
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DestinationVoting;
