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
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-2 md:gap-3 mb-2">
        <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-gradient-to-br from-sky-400/20 to-blue-600/20">
          <Mountain className="h-4 w-4 md:h-5 md:w-5 text-sky-600" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
          Trip Summary
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Resort & Accommodation Details */}
        <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/90 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-sky-50 to-blue-50/50 border-b border-slate-100 pb-3 md:pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1 md:p-1.5 rounded-md md:rounded-lg bg-gradient-to-br from-sky-400/20 to-blue-600/20">
                <Snowflake className="h-3 w-3 md:h-4 md:w-4 text-sky-600" />
              </div>
              <CardTitle className="text-base md:text-lg font-bold text-slate-800">Selected Package</CardTitle>
            </div>
            <CardDescription className="text-slate-600 ml-6 md:ml-8 text-sm md:text-base">Resort and accommodation details</CardDescription>
          </CardHeader>
          
          <CardContent className="p-3 md:p-4 space-y-4 md:space-y-5">
            {/* Resort Section */}
            <div className="rounded-lg md:rounded-xl overflow-hidden shadow-md border-0 bg-white/80">
              <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden group">
                <img 
                  src={destination.resort.image} 
                  alt={destination.resort.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <Badge 
                  className={`absolute bottom-1 md:bottom-2 right-1 md:right-2 bg-gradient-to-r ${getDifficultyColor(destination.resort.difficulty)} text-white border-0 shadow-md rounded-md md:rounded-lg px-2 md:px-3 py-0.5 md:py-1 text-xs md:text-sm`}
                >
                  {destination.resort.difficulty.charAt(0).toUpperCase() + destination.resort.difficulty.slice(1)}
                </Badge>
              </div>
              
              <div className="p-3 md:p-4 space-y-2 md:space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-800 text-sm md:text-base truncate">{destination.resort.name}</h3>
                    <div className="flex items-center text-xs md:text-sm text-slate-600">
                      <MapPinIcon size={12} className="mr-1 text-sky-500 flex-shrink-0" />
                      <span className="truncate">{destination.resort.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-xs md:text-sm font-semibold bg-gradient-to-br from-sky-400/10 to-blue-600/10 px-2 md:px-3 py-1 rounded-md md:rounded-lg shadow-sm flex-shrink-0">
                    <Snowflake size={12} className="mr-1 md:mr-1.5 text-sky-600" />
                    <span className="hidden sm:inline">Ski Resort</span>
                    <span className="sm:hidden">Resort</span>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-slate-600 line-clamp-3">
                  {destination.resort.description}
                </p>
              </div>
            </div>
            
            {/* Accommodation Section */}
            <div className="rounded-lg md:rounded-xl overflow-hidden shadow-md border-0 bg-white/80">
              <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden group">
                <img 
                  src={destination.accommodation.image} 
                  alt={destination.accommodation.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
              </div>
              
              <div className="p-3 md:p-4 space-y-2 md:space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-800 text-sm md:text-base truncate">{destination.accommodation.name}</h3>
                  </div>
                  <div className="flex items-center text-xs md:text-sm font-semibold bg-gradient-to-br from-orange-400/10 to-amber-600/10 px-2 md:px-3 py-1 rounded-md md:rounded-lg shadow-sm flex-shrink-0">
                    <BedDouble size={12} className="mr-1 md:mr-1.5 text-amber-600" />
                    <span className="hidden sm:inline">Accommodation</span>
                    <span className="sm:hidden">Hotel</span>
                  </div>
                </div>
                <div className="text-xs md:text-sm text-slate-600 line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: destination.accommodation.description }}
                >
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-700">Amenities:</h4>
                  <div className="flex flex-wrap gap-1 md:gap-1.5">
                    {destination.accommodation.amenities.map((amenity, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-gradient-to-br from-slate-50 to-slate-100 text-slate-700 hover:bg-slate-200 transition-colors duration-200 border-slate-200 px-1.5 py-0.5">
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
          <CardHeader className="bg-gradient-to-br from-sky-50 to-blue-50/50 border-b border-slate-100 pb-3 md:pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1 md:p-1.5 rounded-md md:rounded-lg bg-gradient-to-br from-sky-400/20 to-blue-600/20">
                <CalendarIcon className="h-3 w-3 md:h-4 md:w-4 text-sky-600" />
              </div>
              <CardTitle className="text-base md:text-lg font-bold text-slate-800">Trip Details</CardTitle>
            </div>
            <CardDescription className="text-slate-600 ml-6 md:ml-8 text-sm md:text-base">Dates, participants, and payment</CardDescription>
          </CardHeader>
          
          <CardContent className="p-3 md:p-4 space-y-4 md:space-y-5">
            <div className="p-3 md:p-4 bg-gradient-to-br from-sky-400/5 to-blue-600/5 rounded-lg md:rounded-xl shadow-sm border-0">
              <h3 className="font-semibold text-slate-800 mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                <UsersIcon className="h-3 w-3 md:h-4 md:w-4 text-sky-600" />
                Group Information
              </h3>
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                  <span className="text-xs md:text-sm text-slate-600">Group Name:</span>
                  <span className="text-xs md:text-sm font-medium text-slate-800 bg-white/80 px-2 md:px-3 py-0.5 rounded-md md:rounded-lg shadow-sm w-fit">
                    {group?.name || "Unknown"}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                  <span className="text-xs md:text-sm text-slate-600">Total Members:</span>
                  <span className="text-xs md:text-sm font-medium text-slate-800 bg-white/80 px-2 md:px-3 py-0.5 rounded-md md:rounded-lg shadow-sm w-fit">
                    {members.length}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                  <span className="text-xs md:text-sm text-slate-600">Confirmed:</span>
                  <span className="text-xs md:text-sm font-medium text-slate-800 bg-white/80 px-2 md:px-3 py-0.5 rounded-md md:rounded-lg shadow-sm w-fit">
                    {confirmedCount} of {members.length}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-3 md:p-4 bg-gradient-to-br from-sky-400/5 to-blue-600/5 rounded-lg md:rounded-xl shadow-sm border-0">
              <h3 className="font-semibold text-slate-800 mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                <Clock className="h-3 w-3 md:h-4 md:w-4 text-sky-600" />
                Dates
              </h3>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="text-xs md:text-sm text-slate-600">Check-in:</span>
                    <span className="text-xs md:text-sm font-medium text-slate-800 bg-white/80 px-2 md:px-3 py-0.5 rounded-md md:rounded-lg shadow-sm w-fit">
                      {formatDate(destination.dates.start)}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="text-xs md:text-sm text-slate-600">Check-out:</span>
                    <span className="text-xs md:text-sm font-medium text-slate-800 bg-white/80 px-2 md:px-3 py-0.5 rounded-md md:rounded-lg shadow-sm w-fit">
                      {formatDate(destination.dates.end)}
                    </span>
                  </div>
                </div>
                <CalendarIcon className="text-sky-500 hidden sm:block" size={32} />
              </div>
            </div>
            
            <div className="p-3 md:p-4 bg-gradient-to-br from-sky-400/5 to-blue-600/5 rounded-lg md:rounded-xl shadow-sm border-0">
              <h3 className="font-semibold text-slate-800 mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                <CreditCard className="h-3 w-3 md:h-4 md:w-4 text-sky-600" />
                Price Breakdown
              </h3>
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                  <span className="text-xs md:text-sm text-slate-600">Accommodation:</span>
                  <span className="text-xs md:text-sm font-medium text-slate-800 bg-white/80 px-2 md:px-3 py-0.5 rounded-md md:rounded-lg shadow-sm w-fit">
                    {formatCurrency(destination.accommodation.price)}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                  <span className="text-xs md:text-sm text-slate-600">Lift Tickets:</span>
                  <span className="text-xs md:text-sm font-medium text-slate-800 bg-white/80 px-2 md:px-3 py-0.5 rounded-md md:rounded-lg shadow-sm w-fit">
                    {formatCurrency(destination.price - destination.accommodation.price)}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2 md:pt-3 mt-2 md:mt-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                    <span className="text-xs md:text-sm font-semibold text-slate-800">Total per person:</span>
                    <span className="text-xs md:text-sm font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent w-fit">
                      {formatCurrency(destination.price)}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 mt-1">
                    <span className="text-xs md:text-sm font-semibold text-slate-800">Group total:</span>
                    <span className="text-base md:text-lg font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent w-fit">
                      {formatCurrency(destination.price * members.length)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-3 md:p-4 rounded-lg md:rounded-xl shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between text-white gap-2 sm:gap-0">
              <div className="flex items-center">
                <UsersIcon size={16} className="mr-2" />
                <span className="font-medium text-sm md:text-base">{confirmedCount} of {members.length} Confirmed</span>
              </div>
              <div className="bg-white/20 rounded-md md:rounded-lg px-2 md:px-3 py-1 md:py-1.5 backdrop-blur-sm flex items-center gap-1 md:gap-1.5 w-fit">
                <CreditCard size={14} />
                <span className="font-semibold text-sm md:text-base">Ready to Pay</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TripSummary;