
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Destination, Trip, Group, User } from "@/types";
import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/formatters";

interface TripSummaryProps {
  destination?: Destination;
  trip?: Trip;
  group?: Group;
  members?: User[];
  confirmedCount?: number;
  onFinalizeVoting?: () => void;
}

const TripSummary: React.FC<TripSummaryProps> = ({
  destination,
  trip,
  group,
  members,
  confirmedCount = 0,
  onFinalizeVoting,
}) => {
  if (!destination) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Trip Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No destination information available yet. Vote to select a destination!
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const startDate = new Date(destination.dates?.start || "").toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  
  const endDate = new Date(destination.dates?.end || "").toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  
  const totalNights = Math.round(
    (new Date(destination.dates?.end || "").getTime() - 
     new Date(destination.dates?.start || "").getTime()) / 
    (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Trip Summary</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{destination.name}</h3>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPinIcon className="h-4 w-4 mr-1" />
            {destination.location}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>{startDate} - {endDate}</span>
          </div>
          <Badge variant="outline" className="sm:ml-auto w-fit">
            {totalNights} nights
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <UsersIcon className="h-4 w-4 mr-1" />
            <span>
              {confirmedCount} of {members?.length || 0} confirmed
            </span>
          </div>
          {group && (
            <Badge variant="outline" className="bg-secondary">
              {group.name}
            </Badge>
          )}
        </div>
        
        <div className="pt-2 border-t">
          <div className="flex justify-between font-medium">
            <span>Price per person:</span>
            <span>{formatCurrency(destination.price)}</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Includes accommodation and ski pass
          </div>
        </div>
        
        {trip?.status === "voting" && onFinalizeVoting && (
          <div className="flex items-center justify-between rounded-md bg-secondary/30 p-3">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium">Voting in progress</p>
                <p className="text-xs text-muted-foreground">
                  Finalize when everyone has voted
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={onFinalizeVoting}
            >
              Finalize
            </Button>
          </div>
        )}
      </CardContent>
      
      {trip?.status === "confirmed" && (
        <CardFooter className="bg-primary/10 flex justify-center p-4">
          <div className="text-center">
            <p className="text-sm font-medium">This trip has been confirmed!</p>
            <p className="text-xs text-muted-foreground">
              Confirm your participation and complete payment
            </p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default TripSummary;
