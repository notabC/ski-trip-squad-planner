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
    <div className="bg-white/90 backdrop-blur-sm shadow-xl shadow-slate-200/50 rounded-xl p-4 md:p-6 border-0 overflow-hidden">
      <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
        <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-gradient-to-br from-sky-400/20 to-blue-600/20">
          {status === "voting" ? (
            <Map className="h-5 w-5 md:h-6 md:w-6 text-sky-600" />
          ) : (
            <CalendarCheck className="h-5 w-5 md:h-6 md:w-6 text-sky-600" />
          )}
        </div>
        <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
          {status === "voting" ? "Choose a Destination" : "Trip Details"}
        </h2>
      </div>
      
      {status === "voting" ? (
        <p className="text-slate-600 pl-1 text-sm md:text-base">
          Vote for your preferred destination. The group's choice will be finalised when voting is complete.
        </p>
      ) : (
        <p className="text-slate-600 pl-1 text-sm md:text-base">
          The destination has been selected! Confirm your participation and complete payment.
        </p>
      )}
      
      {/* Join code information */}
      {group && (
        <div className="mt-4 md:mt-6 p-4 md:p-5 bg-gradient-to-br from-sky-400/10 to-blue-600/10 rounded-xl shadow-sm">
          <div className="space-y-3 md:space-y-0 md:flex md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <Share2 className="h-3 w-3 md:h-4 md:w-4 text-sky-600" />
                  <p className="font-medium text-slate-800 text-sm md:text-base">Group Join Code:</p>
                </div>
                <span className="font-mono bg-blue-50 px-2 md:px-3 py-1 md:py-0.5 rounded text-sky-700 font-bold text-sm shadow-sm inline-block">
                  {group.joinCode}
                </span>
              </div>
              <p className="text-slate-500 text-xs md:text-sm">Share this code with friends to invite them to your ski trip planning</p>
            </div>
            <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-lg shadow-sm w-fit">
              <Users className="h-3 w-3 md:h-4 md:w-4 text-sky-600" />
              <p className="text-slate-700 font-medium text-sm md:text-base">
                {membersCount} {membersCount === 1 ? "member" : "members"}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {status === "voting" && onFinalizeVoting && (
        <div className="mt-4 md:mt-6 flex justify-center md:justify-end">
          <Button 
            onClick={onFinalizeVoting}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 w-full sm:w-auto text-sm md:text-base h-10 md:h-11"
          >
            <Check className="h-3 w-3 md:h-4 md:w-4 mr-2" />
            Finalise Voting
          </Button>
        </div>
      )}
      
      <div className="mt-3 md:mt-4 flex justify-center">
        <div className="flex items-center justify-center gap-1 text-xs md:text-sm text-slate-500">
          <Snowflake className="h-3 w-3 text-sky-500 animate-pulse" />
          <span>{status === "voting" ? "Voting in progress" : "Trip destination confirmed"}</span>
        </div>
      </div>
    </div>
  );
};

export default TripStatusHeader;