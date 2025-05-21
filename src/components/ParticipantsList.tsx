import React from "react";
import { User, Participant, Trip } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertCircle, DollarSign } from "lucide-react";
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
          <div className="flex items-center gap-1.5 text-green-600 bg-green-100 px-3 py-1 rounded font-medium shadow-sm">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">In</span>
          </div>
        );
      case "declined":
        return (
          <div className="flex items-center gap-1.5 text-red-600 bg-red-100 px-3 py-1 rounded font-medium shadow-sm">
            <XCircle className="h-4 w-4" />
            <span className="text-sm">Out</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 text-amber-600 bg-amber-100 px-3 py-1 rounded font-medium shadow-sm">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Pending</span>
          </div>
        );
    }
  };
  
  const getPaymentStatusBadge = (status: Participant["paymentStatus"]) => {
    switch (status) {
      case "paid":
        return <Badge className="px-3 py-1 bg-green-500 hover:bg-green-600">Paid</Badge>;
      case "partially_paid":
        return <Badge className="px-3 py-1 bg-amber-500 hover:bg-amber-600">Partial</Badge>;
      case "not_paid":
        return <Badge className="px-3 py-1 bg-red-500 hover:bg-red-600">Not Paid</Badge>;
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
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Participants ({participants.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {participants.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No participants found. This might be a bug.
          </div>
        ) : (
          <div className="divide-y">
            {sortedParticipants.map(({ user, participant }) => (
              <div
                key={user.id}
                className={cn(
                  "py-3 flex flex-wrap items-center justify-between",
                  user.id === currentUserId ? "bg-secondary/20" : ""
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getStatusBadge(participant.status)}
                  </div>
                  <div>
                    <p className="font-medium">
                      {user.name} {user.id === currentUserId && "(You)"}
                    </p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
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
                          className="border-green-500 text-green-500 hover:bg-green-50 focus:ring-2 focus:ring-green-500/20 active:bg-green-100"
                        >
                          I'm In
                        </Button>
                      )}
                      
                      {/* Show "I'm Out" button if not already declined */}
                      {participant.status !== "declined" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateStatus(user.id, "declined")}
                          className="border-red-500 text-red-500 hover:bg-red-50 focus:ring-2 focus:ring-red-500/20 active:bg-red-100"
                        >
                          I'm Out
                        </Button>
                      )}
                      
                      {participant.status === "confirmed" && participant.paymentStatus !== "paid" && (
                        <Button
                          size="sm"
                          onClick={() => onUpdatePayment(user.id)}
                          className="gap-1 focus:ring-2 focus:ring-primary/20"
                        >
                          <DollarSign className="h-4 w-4" />
                          {participant.paymentStatus === "not_paid" ? 
                            "Pay" : "Complete Payment"}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="rounded-md bg-secondary/30 p-4">
          <div className="flex justify-between text-sm font-medium">
            <span>Total price per person:</span>
            <span>${totalPrice}</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Price includes accommodation, ski pass, and equipment rental
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ParticipantsList;
