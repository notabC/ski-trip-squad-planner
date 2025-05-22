import React from "react";
import { Destination, Trip, Group, User } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/formatters";
import { CalendarIcon, MapPinIcon, Snowflake, BedDouble, UsersIcon, CreditCard } from "lucide-react";

interface TripSummaryProps {
  destination: Destination;
  confirmedCount: number;
  trip: Trip;
  group: Group | null;
  members: User[];
}

const TripSummary: React.FC<TripSummaryProps> = ({
  destination,
  confirmedCount,
  trip,
  group,
  members,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDifficultyColor = (difficulty: Destination["resort"]["difficulty"]) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500 text-white";
      case "intermediate": return "bg-blue-500 text-white";
      case "advanced": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Trip Summary</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Resort & Accommodation Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selected Package</CardTitle>
            <CardDescription>Resort and accommodation details</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Resort Section */}
            <div className="border rounded-md overflow-hidden">
              <div className="relative h-44">
                <img 
                  src={destination.resort.image} 
                  alt={destination.resort.name}
                  className="w-full h-full object-cover" 
                />
                <Badge 
                  className={`absolute bottom-2 right-2 ${getDifficultyColor(destination.resort.difficulty)}`}
                >
                  {destination.resort.difficulty.charAt(0).toUpperCase() + destination.resort.difficulty.slice(1)}
                </Badge>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{destination.resort.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPinIcon size={14} className="mr-1" />
                      {destination.resort.location}
                    </div>
                  </div>
                  <div className="flex items-center text-sm font-semibold">
                    <Snowflake size={16} className="mr-1 text-blue-500" />
                    Ski Resort
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {destination.resort.description}
                </p>
              </div>
            </div>
            
            {/* Accommodation Section */}
            <div className="border rounded-md overflow-hidden">
              <div className="relative h-44">
                <img 
                  src={destination.accommodation.image} 
                  alt={destination.accommodation.name}
                  className="w-full h-full object-cover" 
                />
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{destination.accommodation.name}</h3>
                  </div>
                  <div className="flex items-center text-sm font-semibold">
                    <BedDouble size={16} className="mr-1 text-orange-500" />
                    Accommodation
                  </div>
                </div>
                <p className="text-sm text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: destination.accommodation.description }}
                >
                </p>
                
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold">Amenities:</h4>
                  <div className="flex flex-wrap gap-1">
                    {destination.accommodation.amenities.map((amenity, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Trip Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trip Details</CardTitle>
            <CardDescription>Dates, participants, and payment</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-md">
              <h3 className="font-semibold mb-2">Group Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Group Name:</span>
                  <span className="text-sm font-medium">{group?.name || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Members:</span>
                  <span className="text-sm font-medium">{members.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Confirmed:</span>
                  <span className="text-sm font-medium">{confirmedCount} of {members.length}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-md">
              <h3 className="font-semibold mb-2">Dates</h3>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Check-in: </span>
                    <span className="font-medium">{formatDate(destination.dates.start)}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Check-out: </span>
                    <span className="font-medium">{formatDate(destination.dates.end)}</span>
                  </div>
                </div>
                <CalendarIcon className="text-muted-foreground" size={24} />
              </div>
            </div>
            
            <div className="p-4 border rounded-md">
              <h3 className="font-semibold mb-2">Price Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Accommodation:</span>
                  <span className="text-sm font-medium">{formatCurrency(destination.accommodation.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Lift Tickets:</span>
                  <span className="text-sm font-medium">{formatCurrency(destination.price - destination.accommodation.price)}</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between">
                  <span className="text-sm font-semibold">Total per person:</span>
                  <span className="text-sm font-bold">{formatCurrency(destination.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-semibold">Group total:</span>
                  <span className="text-sm font-bold">{formatCurrency(destination.price * members.length)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-primary/10 p-4 rounded-md flex items-center justify-between">
              <div className="flex items-center">
                <UsersIcon size={20} className="text-primary mr-2" />
                <span className="font-medium">{confirmedCount} of {members.length} Confirmed</span>
              </div>
              <CreditCard size={20} className="text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TripSummary;
