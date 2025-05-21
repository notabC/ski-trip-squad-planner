import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Destination, Vote } from "@/types";
import { CalendarIcon, MapPinIcon, DollarSignIcon, ThumbsUpIcon, UsersIcon } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

interface DestinationCardProps {
  destination: Destination;
  onVote: (destinationId: string) => void;
  userVote: Vote | null;
  totalVotes: number;
  votesForDestination: number;
  isVotingClosed: boolean;
  isSelected?: boolean;
}

const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  onVote,
  userVote,
  totalVotes,
  votesForDestination,
  isVotingClosed,
  isSelected = false,
}) => {
  const isVoted = userVote?.destinationId === destination.id;
  const votePercentage = totalVotes > 0 ? Math.round((votesForDestination / totalVotes) * 100) : 0;
  
  const getDifficultyColor = (difficulty: Destination["difficulty"]) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500";
      case "intermediate":
        return "bg-blue-500";
      case "advanced":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${isSelected ? 'ring-2 ring-primary shadow-lg' : ''}`}>
      <div className="relative h-48 overflow-hidden">
        <img
          src={destination.image}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        {isSelected && (
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 rounded-bl-md font-medium">
            Selected!
          </div>
        )}
        <Badge 
          className={`absolute bottom-2 right-2 ${getDifficultyColor(destination.difficulty)}`}
        >
          {destination.difficulty.charAt(0).toUpperCase() + destination.difficulty.slice(1)}
        </Badge>
        
        {/* Vote count badge */}
        <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-1 rounded-md flex items-center gap-1.5 text-xs font-medium shadow-md">
          <UsersIcon size={14} />
          <span>{votesForDestination} {votesForDestination === 1 ? "vote" : "votes"}</span>
        </div>
      </div>
      
      <CardHeader>
        <CardTitle>{destination.name}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <MapPinIcon size={14} />
          {destination.location}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{destination.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <CalendarIcon size={14} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {new Date(destination.dates.start).toLocaleDateString()} - 
              {new Date(destination.dates.end).toLocaleDateString()}
            </span>
          </div>
          <div className="font-semibold flex items-center">
            <DollarSignIcon size={14} className="mr-1" />
            {formatCurrency(destination.price)}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {destination.amenities.slice(0, 3).map((amenity, index) => (
            <Badge key={index} variant="outline" className="bg-secondary/30">
              {amenity}
            </Badge>
          ))}
          {destination.amenities.length > 3 && (
            <Badge variant="outline" className="bg-secondary/30">
              +{destination.amenities.length - 3} more
            </Badge>
          )}
        </div>
        
        {!isVotingClosed && (
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-primary"
              style={{ width: `${votePercentage}%` }}
            />
          </div>
        )}
        
        {totalVotes > 0 && (
          <div className="text-sm text-center font-medium flex items-center justify-center gap-1">
            <div className="w-full bg-secondary/30 p-2 rounded-md">
              {votesForDestination} {votesForDestination === 1 ? "vote" : "votes"} ({votePercentage}%)
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        {!isVotingClosed ? (
          <Button
            onClick={() => onVote(destination.id)}
            disabled={isVoted}
            className={`w-full ${isVoted ? "bg-primary" : "bg-secondary hover:bg-secondary/80"}`}
            variant={isVoted ? "default" : "outline"}
          >
            {isVoted ? (
              <div className="flex items-center gap-1.5">
                <ThumbsUpIcon size={16} />
                <span>Voted</span>
              </div>
            ) : "Vote"}
          </Button>
        ) : (
          <Button
            disabled
            className="w-full"
            variant="ghost"
          >
            Voting closed
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default DestinationCard;
