
import React from "react";
import { Trip, Group } from "@/types";

interface TripStatusHeaderProps {
  trip: Trip;
  group: Group;
  membersCount: number;
}

const TripStatusHeader: React.FC<TripStatusHeaderProps> = ({ trip, group, membersCount }) => {
  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4 gradient-text">
        {trip.status === "voting" ? "Choose a Destination" : "Trip Details"}
      </h2>
      
      {trip.status === "voting" ? (
        <p className="text-muted-foreground">
          Vote for your preferred destination. The group's choice will be finalized when voting is complete.
        </p>
      ) : (
        <p className="text-muted-foreground">
          The destination has been selected! Confirm your participation and complete payment.
        </p>
      )}
      
      {/* Join code information */}
      <div className="mt-4 p-4 bg-secondary/30 rounded-md text-sm flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <p className="font-medium">Group Join Code: <span className="text-primary">{group.joinCode}</span></p>
          <p className="text-muted-foreground text-xs mt-1">Share this code with friends to invite them</p>
        </div>
        <p className="text-muted-foreground mt-2 sm:mt-0">
          {membersCount} {membersCount === 1 ? "member" : "members"}
        </p>
      </div>
    </div>
  );
};

export default TripStatusHeader;
