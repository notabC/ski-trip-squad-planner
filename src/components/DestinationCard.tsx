import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Destination, Vote } from "@/types";
import { CalendarIcon, MapPinIcon, DollarSignIcon, ThumbsUpIcon, UsersIcon, BedDoubleIcon, SnowflakeIcon, HomeIcon } from "lucide-react";
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
  
  const getDifficultyColor = (difficulty: Destination["resort"]["difficulty"]) => {
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
          src={destination.resort.image}
          alt={destination.resort.name}
          className="w-full h-full object-cover"
        />
        {isSelected && (
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 rounded-bl-md font-medium">
            Selected!
          </div>
        )}
        <Badge 
          className={`absolute bottom-2 right-2 ${getDifficultyColor(destination.resort.difficulty)}`}
        >
          {destination.resort.difficulty.charAt(0).toUpperCase() + destination.resort.difficulty.slice(1)}
        </Badge>
        
        {/* Vote count badge */}
        <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-1 rounded-md flex items-center gap-1.5 text-xs font-medium shadow-md">
          <UsersIcon size={14} />
          <span>{votesForDestination} {votesForDestination === 1 ? "vote" : "votes"}</span>
        </div>
      </div>
      <CardHeader className="p-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold line-clamp-1">
              {destination.resort.name}
            </CardTitle>
            <span className="text-sm font-semibold text-primary">
              {formatCurrency(destination.price)}
            </span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPinIcon size={14} className="mr-1" />
            <span className="line-clamp-1">{destination.resort.location}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-secondary/30 p-2 rounded-md flex flex-col items-center">
            <SnowflakeIcon size={16} className="mb-1 text-blue-500" />
            <span className="text-xs font-medium">Resort</span>
            <span className="text-xs line-clamp-1">{destination.resort.name}</span>
          </div>
          <div className="bg-secondary/30 p-2 rounded-md flex flex-col items-center">
            <HomeIcon size={16} className="mb-1 text-orange-500" />
            <span className="text-xs font-medium">Accommodation</span>
            <span className="text-xs line-clamp-1">{destination.accommodation.name}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="text-xs">
            <div className="font-medium mb-1">Accommodation Details:</div>
            <p className="line-clamp-2 text-muted-foreground">{destination.accommodation.description}</p>
          </div>
          
          {/* Amenities display */}
          <div className="space-y-1">
            <div className="text-xs font-medium">Amenities:</div>
            <div className="flex flex-wrap gap-1">
              {destination.accommodation.amenities.slice(0, 3).map((amenity, index) => (
                <Badge key={index} variant="outline" className="text-xs px-1.5 py-0.5">
                  {amenity}
                </Badge>
              ))}
              {destination.accommodation.amenities.length > 3 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                  +{destination.accommodation.amenities.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <div className="flex items-center">
            <CalendarIcon size={14} className="mr-1" />
            <span>
              {new Date(destination.dates.start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(destination.dates.end).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
        
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
