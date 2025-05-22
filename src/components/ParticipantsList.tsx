import React from "react";
import { User, Participant, Trip } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertCircle, DollarSign, Users, CreditCard, Snowflake } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ParticipantsListProps {
  trip?: Trip;
  participants: Array<{ user: User; participant: Participant }>;
  currentUserId?: string;
  onUpdateStatus: (userId: string, status: "confirmed" | "declined") => void;
  onUpdatePayment: (userId: string) => void;
  totalPrice?: number;
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({
  trip,
  participants,
  currentUserId = "",
  onUpdateStatus,
  onUpdatePayment,
  totalPrice = 0,
}) => {
  const getStatusBadge = (status: Participant["status"]) => {
    switch (status) {
      case "confirmed":
        return (
          <div className="flex items-center gap-1 md:gap-1.5 text-green-600 bg-gradient-to-r from-green-50 to-green-100 px-2 md:px-3 py-1 rounded-md md:rounded-lg font-medium shadow-sm transition-all duration-200 hover:shadow-md">
            <CheckCircle className="h-3 w-3 md:h-4 md:w-4" />
            <span className="text-xs md:text-sm">In</span>
          </div>
        );
      case "declined":
        return (
          <div className="flex items-center gap-1 md:gap-1.5 text-red-600 bg-gradient-to-r from-red-50 to-red-100 px-2 md:px-3 py-1 rounded-md md:rounded-lg font-medium shadow-sm transition-all duration-200 hover:shadow-md">
            <XCircle className="h-3 w-3 md:h-4 md:w-4" />
            <span className="text-xs md:text-sm">Out</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 md:gap-1.5 text-amber-600 bg-gradient-to-r from-amber-50 to-amber-100 px-2 md:px-3 py-1 rounded-md md:rounded-lg font-medium shadow-sm transition-all duration-200 hover:shadow-md">
            <AlertCircle className="h-3 w-3 md:h-4 md:w-4" />
            <span className="text-xs md:text-sm">Pending</span>
          </div>
        );
    }
  };
  
  const getPaymentStatusBadge = (status: Participant["paymentStatus"]) => {
    switch (status) {
      case "paid":
        return <Badge className="px-2 md:px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 border-0 shadow-sm text-white font-medium rounded-md md:rounded-lg hover:shadow-md transition-all duration-200 text-xs md:text-sm">Paid</Badge>;
      case "partially_paid":
        return <Badge className="px-2 md:px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 border-0 shadow-sm text-white font-medium rounded-md md:rounded-lg hover:shadow-md transition-all duration-200 text-xs md:text-sm">Partial</Badge>;
      case "not_paid":
        return <Badge className="px-2 md:px-3 py-1 bg-gradient-to-r from-red-500 to-rose-500 border-0 shadow-sm text-white font-medium rounded-md md:rounded-lg hover:shadow-md transition-all duration-200 text-xs md:text-sm">Not Paid</Badge>;
    }
  };

  // Debug participants data
  console.log("ParticipantsList rendered with:", {
    participants,
    currentUserId,
    totalParticipants: participants.length
  });

  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.user.id === currentUserId) return -1;
    if (b.user.id === currentUserId) return 1;
    return 0;
  });

  return (
    <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/90 backdrop-blur-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-br from-sky-50 to-blue-50/50 border-b border-slate-100 pb-3 md:pb-4">
        <div className="flex items-center gap-2">
          <div className="p-1 md:p-1.5 rounded-md md:rounded-lg bg-gradient-to-br from-sky-400/20 to-blue-600/20">
            <Users className="h-4 w-4 md:h-5 md:w-5 text-sky-600" />
          </div>
          <CardTitle className="text-lg md:text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
            Participants ({participants.length})
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-3 md:p-4 space-y-4 md:space-y-5">
        {participants.length === 0 ? (
          <div className="p-8 md:p-12 border-2 border-dashed border-slate-200 bg-white/50 backdrop-blur-sm rounded-xl text-center">
            <div className="flex flex-col items-center gap-3 md:gap-4">
              <div className="p-3 md:p-4 rounded-full bg-gradient-to-br from-sky-400/20 to-blue-600/20">
                <Users className="h-8 w-8 md:h-10 md:w-10 text-sky-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-slate-800">No Participants</h3>
              <p className="text-sm md:text-base text-slate-600 max-w-md mx-auto">
                No participants found. This might be a bug or no one has joined yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 md:divide-y md:divide-slate-100 md:space-y-0">
            {sortedParticipants.map(({ user, participant }) => (
              <div
                key={user.id}
                className={cn(
                  "bg-white md:bg-transparent rounded-lg md:rounded-none p-3 md:p-2 md:py-4 border md:border-0 border-slate-100 shadow-sm md:shadow-none transition-all duration-200 hover:bg-slate-50 space-y-3 md:space-y-0",
                  user.id === currentUserId ? "md:bg-gradient-to-r md:from-sky-50 md:to-blue-50 border-sky-200 md:border-0" : ""
                )}
              >
                {/* Mobile: Stack everything vertically */}
                <div className="md:flex md:flex-wrap md:items-center md:justify-between">
                  {/* User info and status */}
                  <div className="flex items-center justify-between md:justify-start space-x-3 mb-3 md:mb-0">
                    <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        {getStatusBadge(participant.status)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-800 text-sm md:text-base truncate">
                          {user.name} {user.id === currentUserId && <span className="text-sky-600 font-semibold">(You)</span>}
                        </p>
                        <p className="text-xs md:text-sm text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    {/* Payment status - show on mobile next to user info */}
                    <div className="flex-shrink-0 md:hidden">
                      {getPaymentStatusBadge(participant.paymentStatus)}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
                    {/* Payment status - show on desktop */}
                    <div className="hidden md:block">
                      {getPaymentStatusBadge(participant.paymentStatus)}
                    </div>
                    
                    {user.id === currentUserId && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex gap-2">
                          {/* Show "I'm In" button if not already confirmed */}
                          {participant.status !== "confirmed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onUpdateStatus(user.id, "confirmed")}
                              className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 focus:ring-2 focus:ring-green-500/20 active:bg-green-100 font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200 flex-1 sm:flex-none text-xs md:text-sm h-8 md:h-9"
                            >
                              <CheckCircle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                              I'm In
                            </Button>
                          )}
                          
                          {/* Show "I'm Out" button if not already declined */}
                          {participant.status !== "declined" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onUpdateStatus(user.id, "declined")}
                              className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 focus:ring-2 focus:ring-red-500/20 active:bg-red-100 font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200 flex-1 sm:flex-none text-xs md:text-sm h-8 md:h-9"
                            >
                              <XCircle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                              I'm Out
                            </Button>
                          )}
                        </div>
                        
                        {participant.status === "confirmed" && participant.paymentStatus !== "paid" && (
                          <Button
                            size="sm"
                            onClick={() => onUpdatePayment(user.id)}
                            className="gap-1 focus:ring-2 focus:ring-primary/20 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium rounded-lg shadow-lg shadow-blue-500/25 transition-all duration-200 w-full sm:w-auto text-xs md:text-sm h-8 md:h-9"
                          >
                            <DollarSign className="h-3 w-3 md:h-4 md:w-4" />
                            {participant.paymentStatus === "not_paid" ? 
                              "Pay Now" : "Complete Payment"}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="rounded-xl bg-gradient-to-br from-sky-400/10 to-blue-600/10 p-4 md:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-slate-800 font-medium text-sm md:text-base">
                <CreditCard className="h-3 w-3 md:h-4 md:w-4 text-sky-600" />
                <span>Total price per person:</span>
              </div>
              <div className="text-xs md:text-sm text-slate-600">
                Price includes accommodation, ski pass, and equipment rental
              </div>
            </div>
            <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent text-center sm:text-right">
              ${totalPrice}
            </div>
          </div>
        </div>
        
        <div className="text-center text-xs md:text-sm text-slate-500 pt-2 flex items-center justify-center gap-1">
          <Snowflake className="h-3 w-3 text-sky-500 animate-pulse" />
          <span>Please confirm your participation to proceed with payment</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ParticipantsList;