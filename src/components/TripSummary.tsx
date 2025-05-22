import React from "react";
import { Destination, Trip, Group, User } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/formatters";
import { CalendarIcon, MapPinIcon, Snowflake, BedDouble, UsersIcon, CreditCard, Mountain, Clock } from "lucide-react";

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
      case "beginner": return "from-green-400 to-green-600";
      case "intermediate": return "from-blue-400 to-blue-600";
      case "advanced": return "from-red-400 to-red-600";
      default: return "from-gray-400 to-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-xl bg-gradient-to-br from-sky-400/20 to-blue-600/20">
          <Mountain className="h-5 w-5 text-sky-600" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
          Trip Summary
        </h2>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Resort & Accommodation Details */}
        <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/90 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-sky-50 to-blue-50/50 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-sky-400/20 to-blue-600/20">
                <Snowflake className="h-4 w-4 text-sky-600" />
              </div>
              <CardTitle className="text-lg font-bold text-slate-800">Selected Package</CardTitle>
            </div>
            <CardDescription className="text-slate-600 ml-8">Resort and accommodation details</CardDescription>
          </CardHeader>
          
          <CardContent className="p-4 space-y-5">
            {/* Resort Section */}
            <div className="rounded-xl overflow-hidden shadow-md border-0 bg-white/80">
              <div className="relative h-48 overflow-hidden group">
                <img 
                  src={destination.resort.image} 
                  alt={destination.resort.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <Badge 
                  className={`absolute bottom-2 right-2 bg-gradient-to-r ${getDifficultyColor(destination.resort.difficulty)} text-white border-0 shadow-md rounded-lg px-3 py-1`}
                >
                  {destination.resort.difficulty.charAt(0).toUpperCase() + destination.resort.difficulty.slice(1)}
                </Badge>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800">{destination.resort.name}</h3>
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPinIcon size={14} className="mr-1 text-sky-500" />
                      {destination.resort.location}
                    </div>
                  </div>
                  <div className="flex items-center text-sm font-semibold bg-gradient-to-br from-sky-400/10 to-blue-600/10 px-3 py-1 rounded-lg shadow-sm">
                    <Snowflake size={16} className="mr-1.5 text-sky-600" />
                    Ski Resort
                  </div>
                </div>
                <p className="text-sm text-slate-600">
                  {destination.resort.description}
                </p>
              </div>
            </div>
            
            {/* Accommodation Section */}
            <div className="rounded-xl overflow-hidden shadow-md border-0 bg-white/80">
              <div className="relative h-48 overflow-hidden group">
                <img 
                  src={destination.accommodation.image} 
                  alt={destination.accommodation.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800">{destination.accommodation.name}</h3>
                  </div>
                  <div className="flex items-center text-sm font-semibold bg-gradient-to-br from-orange-400/10 to-amber-600/10 px-3 py-1 rounded-lg shadow-sm">
                    <BedDouble size={16} className="mr-1.5 text-amber-600" />
                    Accommodation
                  </div>
                </div>
                <div className="text-sm text-slate-600"
                  dangerouslySetInnerHTML={{ __html: destination.accommodation.description }}
                >
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-700">Amenities:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {destination.accommodation.amenities.map((amenity, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-gradient-to-br from-slate-50 to-slate-100 text-slate-700 hover:bg-slate-200 transition-colors duration-200 border-slate-200">
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
        <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/90 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-sky-50 to-blue-50/50 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-sky-400/20 to-blue-600/20">
                <CalendarIcon className="h-4 w-4 text-sky-600" />
              </div>
              <CardTitle className="text-lg font-bold text-slate-800">Trip Details</CardTitle>
            </div>
            <CardDescription className="text-slate-600 ml-8">Dates, participants, and payment</CardDescription>
          </CardHeader>
          
          <CardContent className="p-4 space-y-5">
            <div className="p-4 bg-gradient-to-br from-sky-400/5 to-blue-600/5 rounded-xl shadow-sm border-0">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-sky-600" />
                Group Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Group Name:</span>
                  <span className="text-sm font-medium text-slate-800 bg-white/80 px-3 py-0.5 rounded-lg shadow-sm">
                    {group?.name || "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Total Members:</span>
                  <span className="text-sm font-medium text-slate-800 bg-white/80 px-3 py-0.5 rounded-lg shadow-sm">
                    {members.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Confirmed:</span>
                  <span className="text-sm font-medium text-slate-800 bg-white/80 px-3 py-0.5 rounded-lg shadow-sm">
                    {confirmedCount} of {members.length}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-sky-400/5 to-blue-600/5 rounded-xl shadow-sm border-0">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-sky-600" />
                Dates
              </h3>
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">Check-in:</span>
                    <span className="text-sm font-medium text-slate-800 bg-white/80 px-3 py-0.5 rounded-lg shadow-sm">
                      {formatDate(destination.dates.start)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">Check-out:</span>
                    <span className="text-sm font-medium text-slate-800 bg-white/80 px-3 py-0.5 rounded-lg shadow-sm">
                      {formatDate(destination.dates.end)}
                    </span>
                  </div>
                </div>
                <CalendarIcon className="text-sky-500" size={32} />
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-sky-400/5 to-blue-600/5 rounded-xl shadow-sm border-0">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-sky-600" />
                Price Breakdown
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Accommodation:</span>
                  <span className="text-sm font-medium text-slate-800 bg-white/80 px-3 py-0.5 rounded-lg shadow-sm">
                    {formatCurrency(destination.accommodation.price)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Lift Tickets:</span>
                  <span className="text-sm font-medium text-slate-800 bg-white/80 px-3 py-0.5 rounded-lg shadow-sm">
                    {formatCurrency(destination.price - destination.accommodation.price)}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-800">Total per person:</span>
                    <span className="text-sm font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
                      {formatCurrency(destination.price)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm font-semibold text-slate-800">Group total:</span>
                    <span className="text-lg font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
                      {formatCurrency(destination.price * members.length)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-4 rounded-xl shadow-md flex items-center justify-between text-white">
              <div className="flex items-center">
                <UsersIcon size={20} className="mr-2" />
                <span className="font-medium">{confirmedCount} of {members.length} Confirmed</span>
              </div>
              <div className="bg-white/20 rounded-lg px-3 py-1.5 backdrop-blur-sm flex items-center gap-1.5">
                <CreditCard size={16} />
                <span className="font-semibold">Ready to Pay</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TripSummary;
