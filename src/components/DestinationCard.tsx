import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Destination, Vote } from "@/types";
import { MapPinIcon, ThumbsUpIcon, UsersIcon, BedDoubleIcon, SnowflakeIcon, ChevronDownIcon, ChevronUpIcon, CalendarIcon, DollarSignIcon } from "lucide-react";
import { formatCurrency, parseHtml } from "@/utils/formatters";

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
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const isVoted = userVote?.destinationId === destination.id;
  const votePercentage = totalVotes > 0 ? Math.round((votesForDestination / totalVotes) * 100) : 0;
  
  const getDifficultyColor = (difficulty: Destination["resort"]["difficulty"]) => {
    switch (difficulty) {
      case "beginner":
        return "from-green-400 to-green-600";
      case "intermediate":
        return "from-blue-400 to-blue-600";
      case "advanced":
        return "from-red-400 to-red-600";
      default:
        return "from-gray-400 to-gray-600";
    }
  };

  return (
    <Card className={`border-0 overflow-hidden shadow-xl shadow-slate-200/50 bg-white/90 backdrop-blur-sm hover:shadow-blue-100/50 hover:translate-y-[-2px] transition-all duration-200 ${isSelected ? 'ring-2 ring-sky-400 shadow-lg shadow-sky-100/50' : ''}`}>
      <div className="relative h-36 sm:h-40 md:h-48 overflow-hidden group">
        <img
          src={destination.accommodation.image || destination.resort.image}
          alt={destination.accommodation.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {isSelected && (
          <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-2 md:px-3 py-1 rounded-bl-md font-medium shadow-md text-xs md:text-sm">
            Selected!
          </div>
        )}
        <Badge 
          className={`absolute bottom-1 md:bottom-2 right-1 md:right-2 bg-gradient-to-r ${getDifficultyColor(destination.resort.difficulty)} text-white border-0 shadow-md text-xs px-2 py-0.5 md:px-3 md:py-1`}
        >
          {destination.resort.difficulty.charAt(0).toUpperCase() + destination.resort.difficulty.slice(1)}
        </Badge>
        
        {/* Vote count badge */}
        <div className="absolute top-1 md:top-2 left-1 md:left-2 bg-black/60 backdrop-blur-sm text-white px-2 md:px-3 py-0.5 md:py-1 rounded-md flex items-center gap-1 md:gap-1.5 text-xs font-medium shadow-md">
          <UsersIcon size={12} className="md:hidden" />
          <UsersIcon size={14} className="hidden md:block" />
          <span>{votesForDestination} {votesForDestination === 1 ? "vote" : "votes"}</span>
        </div>
      </div>
      <CardHeader className="p-3 md:p-4 bg-gradient-to-br from-sky-50 to-blue-50/50">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm md:text-base font-semibold line-clamp-2 text-slate-800 min-w-0 flex-1">
              {destination.accommodation.name}
            </CardTitle>
            <span className="text-sm md:text-base font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent flex-shrink-0">
              {formatCurrency(destination.price)}
            </span>
          </div>
          <div className="flex items-center text-xs md:text-sm text-slate-600">
            <MapPinIcon size={12} className="mr-1 text-sky-500 flex-shrink-0" />
            <span className="line-clamp-1 min-w-0">{destination.resort.location}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 md:p-4 pt-2 md:pt-3 space-y-3 md:space-y-4">
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <div className="bg-gradient-to-br from-sky-400/10 to-blue-600/10 p-2 md:p-3 rounded-lg md:rounded-xl flex flex-col items-center shadow-sm">
            <BedDoubleIcon size={14} className="mb-0.5 md:mb-1 text-sky-600" />
            <span className="text-xs font-medium text-slate-800">Accommodation</span>
            <span className="text-xs text-slate-600 line-clamp-1 text-center">{destination.accommodation.name}</span>
          </div>
          <div className="bg-gradient-to-br from-sky-400/10 to-blue-600/10 p-2 md:p-3 rounded-lg md:rounded-xl flex flex-col items-center shadow-sm">
            <SnowflakeIcon size={14} className="mb-0.5 md:mb-1 text-sky-600" />
            <span className="text-xs font-medium text-slate-800">Resort</span>
            <span className="text-xs text-slate-600 line-clamp-1 text-center">{destination.resort.name}</span>
          </div>
        </div>
        
        <div className="space-y-2 md:space-y-3">
          <div className="text-xs">
            <div className="font-medium mb-1 text-slate-800">Accommodation Details:</div>
            <div 
              className={`${isDescriptionExpanded ? '' : 'line-clamp-3'} text-slate-600 text-xs md:text-sm`}
              {...parseHtml(destination.accommodation.description)}
            ></div>
            <button 
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="text-sky-600 hover:text-sky-700 text-xs flex items-center mt-1 font-medium transition-colors duration-200"
            >
              {isDescriptionExpanded ? (
                <>
                  <span>Show less</span>
                  <ChevronUpIcon size={12} className="ml-0.5" />
                </>
              ) : (
                <>
                  <span>Show more</span>
                  <ChevronDownIcon size={12} className="ml-0.5" />
                </>
              )}
            </button>
          </div>
        </div>
        
        {totalVotes > 0 && (
          <div className="relative pt-2">
            <div className="h-1.5 md:h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${votePercentage}%` }}
              ></div>
            </div>
            <div className="mt-1 text-xs font-medium text-center text-slate-600">
              {votesForDestination} {votesForDestination === 1 ? "vote" : "votes"} ({votePercentage}%)
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-3 md:p-4 pt-0">
        {!isVotingClosed ? (
          <Button
            onClick={() => onVote(destination.id)}
            disabled={isVoted}
            className={`w-full rounded-xl shadow-lg transition-all duration-200 h-10 md:h-11 text-sm md:text-base ${
              isVoted 
                ? "bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-medium shadow-green-500/25" 
                : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium shadow-blue-500/25"
            }`}
          >
            {isVoted ? (
              <div className="flex items-center gap-1 md:gap-1.5">
                <ThumbsUpIcon size={14} className="md:hidden" />
                <ThumbsUpIcon size={16} className="hidden md:block" />
                <span>Voted</span>
              </div>
            ) : (
              <>
                <span className="hidden sm:inline">Vote for this destination</span>
                <span className="sm:hidden">Vote</span>
              </>
            )}
          </Button>
        ) : (
          <div className="w-full rounded-xl bg-slate-100 p-2 text-center text-slate-500 text-sm font-medium">
            Voting closed
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default DestinationCard;