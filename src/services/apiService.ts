
import { mockDestinations } from "@/models/mockData";
import type { Destination } from "@/types";

// LiteAPI endpoint and key
const LITE_API_BASE_URL = "https://api.liteapi.travel/hotels/v2";
const LITE_API_KEY = ""; // In a production app, this would be stored in env variables

/**
 * Transforms hotel data from LiteAPI to our Destination format
 */
const transformHotelToDestination = (hotel: any): Destination => {
  // Extract the first image URL or use a placeholder
  const imageUrl = hotel.images && hotel.images.length > 0 
    ? hotel.images[0].url 
    : "/images/ski-resort-1.jpg";
  
  // Extract price information
  let price = 1299; // Default fallback price
  if (hotel.price && hotel.price.lead && hotel.price.lead.amount) {
    price = hotel.price.lead.amount;
  }
  
  // Generate a random difficulty level
  const difficulties = ["beginner", "intermediate", "advanced"];
  const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)] as Destination["difficulty"];
  
  // Generate random start and end dates for the ski trip (1-2 months in the future)
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + Math.floor(Math.random() * 30) + 30); // 30-60 days from now
  
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 7); // 7 day trip
  
  // Extract amenities
  const amenities = hotel.facilities 
    ? hotel.facilities.slice(0, 6).map((facility: any) => facility.name) 
    : ["Ski-in/Ski-out Access", "Hot Tub", "Free WiFi", "Restaurant", "Spa Services", "Equipment Rental"];
  
  return {
    id: `dest-api-${hotel.id || Math.random().toString(36).substr(2, 9)}`,
    name: hotel.name || "Mountain Resort",
    location: `${hotel.location?.address?.city || "Unknown"}, ${hotel.location?.address?.country || "Unknown"}`,
    description: hotel.description || "Experience the majesty of this premium resort featuring stunning mountain views, world-class slopes for all skill levels, and luxurious accommodations.",
    image: imageUrl,
    price: price,
    dates: {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    },
    amenities: amenities,
    difficulty: randomDifficulty
  };
};

/**
 * Fetch ski destinations from LiteAPI
 */
export const fetchSkiDestinations = async (): Promise<Destination[]> => {
  if (!LITE_API_KEY) {
    console.log("No API key provided, using mock data");
    return mockDestinations;
  }
  
  try {
    // Search for ski hotels
    const params = new URLSearchParams({
      adults: "2",
      children: "0",
      checkIn: "2024-12-15", // Winter dates for ski season
      checkOut: "2024-12-22",
      currency: "USD",
      cityId: "3000040033", // Aspen, a popular ski destination
      limit: "5" // Limit to 5 results
    });
    
    const response = await fetch(`${LITE_API_BASE_URL}/search?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "liteapi-key": LITE_API_KEY
      }
    });
    
    if (!response.ok) {
      console.error("API response error:", response.status);
      throw new Error("Failed to fetch from LiteAPI");
    }
    
    const data = await response.json();
    
    if (!data.hotels || !Array.isArray(data.hotels) || data.hotels.length === 0) {
      console.log("No hotels found in API response, using mock data");
      return mockDestinations;
    }
    
    // Transform hotel data to our Destination format
    const destinations: Destination[] = data.hotels
      .filter((hotel: any) => hotel.name && hotel.id)
      .map(transformHotelToDestination);
    
    // If we didn't get enough results, supplement with mock data
    if (destinations.length < 3) {
      const remainingCount = 3 - destinations.length;
      return [...destinations, ...mockDestinations.slice(0, remainingCount)];
    }
    
    return destinations;
    
  } catch (error) {
    console.error("Error fetching ski destinations:", error);
    console.log("Using mock data as fallback");
    return mockDestinations;
  }
};
