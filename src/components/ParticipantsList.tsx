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
          <div className="flex items-center gap-1.5 text-green-600 bg-gradient-to-r from-green-50 to-green-100 px-3 py-1 rounded-lg font-medium shadow-sm transition-all duration-200 hover:shadow-md">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">In</span>
          </div>
        );
      case "declined":
        return (
          <div className="flex items-center gap-1.5 text-red-600 bg-gradient-to-r from-red-50 to-red-100 px-3 py-1 rounded-lg font-medium shadow-sm transition-all duration-200 hover:shadow-md">
            <XCircle className="h-4 w-4" />
            <span className="text-sm">Out</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 text-amber-600 bg-gradient-to-r from-amber-50 to-amber-100 px-3 py-1 rounded-lg font-medium shadow-sm transition-all duration-200 hover:shadow-md">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Pending</span>
          </div>
        );
    }
  };
  
  const getPaymentStatusBadge = (status: Participant["paymentStatus"]) => {
    switch (status) {
      case "paid":
        return <Badge className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 border-0 shadow-sm text-white font-medium rounded-lg hover:shadow-md transition-all duration-200">Paid</Badge>;
      case "partially_paid":
        return <Badge className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 border-0 shadow-sm text-white font-medium rounded-lg hover:shadow-md transition-all duration-200">Partial</Badge>;
      case "not_paid":
        return <Badge className="px-3 py-1 bg-gradient-to-r from-red-500 to-rose-500 border-0 shadow-sm text-white font-medium rounded-lg hover:shadow-md transition-all duration-200">Not Paid</Badge>;
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
      <CardHeader className="bg-gradient-to-br from-sky-50 to-blue-50/50 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-sky-400/20 to-blue-600/20">
            <Users className="h-5 w-5 text-sky-600" />
          </div>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
            Participants ({participants.length})
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-5">
        {participants.length === 0 ? (
          <div className="p-12 border-2 border-dashed border-slate-200 bg-white/50 backdrop-blur-sm rounded-xl text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-gradient-to-br from-sky-400/20 to-blue-600/20">
                <Users className="h-10 w-10 text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800">No Participants</h3>
              <p className="text-slate-600 max-w-md mx-auto">
                No participants found. This might be a bug or no one has joined yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedParticipants.map(({ user, participant }) => (
              <div
                key={user.id}
                className={cn(
                  "py-4 flex flex-wrap items-center justify-between transition-all duration-200 hover:bg-slate-50 rounded-lg px-2",
                  user.id === currentUserId ? "bg-gradient-to-r from-sky-50 to-blue-50" : ""
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getStatusBadge(participant.status)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">
                      {user.name} {user.id === currentUserId && <span className="text-sky-600 font-semibold">(You)</span>}
                    </p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  {getPaymentStatusBadge(participant.paymentStatus)}
                  
                  {user.id === currentUserId && (
                    <>
                      {/* Show "I'm In" button if not already confirmed */}
                      {participant.status !== "confirmed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateStatus(user.id, "confirmed")}
                          className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 focus:ring-2 focus:ring-green-500/20 active:bg-green-100 font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          I'm In
                        </Button>
                      )}
                      
                      {/* Show "I'm Out" button if not already declined */}
                      {participant.status !== "declined" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateStatus(user.id, "declined")}
                          className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 focus:ring-2 focus:ring-red-500/20 active:bg-red-100 font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          I'm Out
                        </Button>
                      )}
                      
                      {participant.status === "confirmed" && participant.paymentStatus !== "paid" && (
                        <Button
                          size="sm"
                          onClick={() => onUpdatePayment(user.id)}
                          className="gap-1 focus:ring-2 focus:ring-primary/20 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium rounded-lg shadow-lg shadow-blue-500/25 transition-all duration-200"
                        >
                          <DollarSign className="h-4 w-4" />
                          {participant.paymentStatus === "not_paid" ? 
                            "Pay Now" : "Complete Payment"}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="rounded-xl bg-gradient-to-br from-sky-400/10 to-blue-600/10 p-5 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                <CreditCard className="h-4 w-4 text-sky-600" />
                <span>Total price per person:</span>
              </div>
              <div className="text-xs text-slate-600">
                Price includes accommodation, ski pass, and equipment rental
              </div>
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
              ${totalPrice}
            </div>
          </div>
        </div>
        
        <div className="text-center text-xs text-slate-500 pt-2 flex items-center justify-center gap-1">
          <Snowflake className="h-3 w-3 text-sky-500 animate-pulse" />
          <span>Please confirm your participation to proceed with payment</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ParticipantsList;
