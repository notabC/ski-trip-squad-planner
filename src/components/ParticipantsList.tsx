
import React from "react";
import { User, Participant, Trip } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertCircle, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ParticipantsListProps {
  trip: Trip;
  participants: Array<{ user: User; participant: Participant }>;
  currentUserId: string;
  onUpdateStatus: (userId: string, status: "confirmed" | "declined") => void;
  onUpdatePayment: (userId: string) => void;
  totalPrice: number;
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({
  trip,
  participants,
  currentUserId,
  onUpdateStatus,
  onUpdatePayment,
  totalPrice,
}) => {
  const getStatusIcon = (status: Participant["status"]) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "declined":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
    }
  };
  
  const getPaymentStatusBadge = (status: Participant["paymentStatus"]) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>;
      case "partially_paid":
        return <Badge className="bg-amber-500">Partial</Badge>;
      case "not_paid":
        return <Badge className="bg-red-500/70">Not Paid</Badge>;
    }
  };

  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.user.id === currentUserId) return -1;
    if (b.user.id === currentUserId) return 1;
    return 0;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Participants</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="divide-y">
          {sortedParticipants.map(({ user, participant }) => (
            <div
              key={user.id}
              className={cn(
                "py-3 flex items-center justify-between",
                user.id === currentUserId ? "bg-secondary/20" : ""
              )}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {getStatusIcon(participant.status)}
                </div>
                <div>
                  <p className="font-medium">
                    {user.name} {user.id === currentUserId && "(You)"}
                  </p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {getPaymentStatusBadge(participant.paymentStatus)}
                
                {user.id === currentUserId && (
                  <>
                    {participant.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateStatus(user.id, "confirmed")}
                          className="border-green-500 text-green-500 hover:bg-green-50"
                        >
                          I'm In
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateStatus(user.id, "declined")}
                          className="border-red-500 text-red-500 hover:bg-red-50"
                        >
                          I'm Out
                        </Button>
                      </div>
                    )}
                    
                    {participant.status === "confirmed" && participant.paymentStatus !== "paid" && (
                      <Button
                        size="sm"
                        onClick={() => onUpdatePayment(user.id)}
                        className="gap-1"
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
