import React from "react";
import { Trip, Group } from "@/types";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Share2, Users, Map, Snowflake, Check } from "lucide-react";

interface TripStatusHeaderProps {
  trip?: Trip;
  tripStatus?: "voting" | "confirmed" | "completed"; // Added this as an alternative
  group?: Group;
  membersCount?: number;
  onFinalizeVoting?: () => void;
}

const TripStatusHeader: React.FC<TripStatusHeaderProps> = ({ 
  trip, 
  tripStatus, 
  group, 
  membersCount, 
  onFinalizeVoting 
}) => {
  const status = trip?.status || tripStatus || "voting";
  
  return (
    <div className="bg-white/90 backdrop-blur-sm shadow-xl shadow-slate-200/50 rounded-xl p-6 border-0 overflow-hidden">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-gradient-to-br from-sky-400/20 to-blue-600/20">
          {status === "voting" ? (
            <Map className="h-6 w-6 text-sky-600" />
          ) : (
            <CalendarCheck className="h-6 w-6 text-sky-600" />
          )}
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
          {status === "voting" ? "Choose a Destination" : "Trip Details"}
        </h2>
      </div>
      
      {status === "voting" ? (
        <p className="text-slate-600 pl-1">
          Vote for your preferred destination. The group's choice will be finalized when voting is complete.
        </p>
      ) : (
        <p className="text-slate-600 pl-1">
          The destination has been selected! Confirm your participation and complete payment.
        </p>
      )}
      
      {/* Join code information */}
      {group && (
        <div className="mt-6 p-5 bg-gradient-to-br from-sky-400/10 to-blue-600/10 rounded-xl shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-sky-600" />
                <p className="font-medium text-slate-800">Group Join Code:</p> 
                <span className="font-mono bg-blue-50 px-3 py-0.5 rounded text-sky-700 font-bold text-sm shadow-sm">{group.joinCode}</span>
              </div>
              <p className="text-slate-500 text-xs">Share this code with friends to invite them to your ski trip planning</p>
            </div>
            <div className="flex items-center gap-2 mt-3 sm:mt-0 bg-white/80 px-3 py-1.5 rounded-lg shadow-sm">
              <Users className="h-4 w-4 text-sky-600" />
              <p className="text-slate-700 font-medium">
                {membersCount} {membersCount === 1 ? "member" : "members"}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {status === "voting" && onFinalizeVoting && (
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={onFinalizeVoting}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200"
          >
            <Check className="h-4 w-4 mr-2" />
            Finalize Voting
          </Button>
        </div>
      )}
      
      <div className="mt-4 flex justify-center">
        <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
          <Snowflake className="h-3 w-3 text-sky-500 animate-pulse" />
          <span>{status === "voting" ? "Voting in progress" : "Trip destination confirmed"}</span>
        </div>
      </div>
    </div>
  );
};

export default TripStatusHeader;
