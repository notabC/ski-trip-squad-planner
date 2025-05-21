import { mockDestinations, mockSkiResorts, mockAccommodations } from "@/models/mockData";
import type { Destination, SkiResort, HotelAccommodation } from "@/types";

// LiteAPI endpoint and key
const LITE_API_BASE_URL = "https://api.liteapi.travel/hotels/v2";
// In a real app, this would be stored in environment variables
const LITE_API_KEY = import.meta.env.VITE_LITE_API_KEY || "";

// Ski resort city IDs for LiteAPI (approximate city IDs)
const SKI_RESORT_CITY_IDS = {
  "Chamonix": "3000040033", // Chamonix (using Aspen ID as placeholder)
  "Whistler": "3000040033", // Whistler (using Aspen ID as placeholder)
  "Zermatt": "3000040033", // Zermatt (using Aspen ID as placeholder)
};

/**
 * Transforms hotel data from LiteAPI to our HotelAccommodation format
 */
const transformHotelToAccommodation = (hotel: any): HotelAccommodation => {
  // Extract the first image URL or use a placeholder
  const imageUrl = hotel.images && hotel.images.length > 0 
    ? hotel.images[0].url 
    : "/images/hotel-placeholder.jpg";
  
  // Extract price information
  let price = 899; // Default fallback price
  if (hotel.price && hotel.price.lead && hotel.price.lead.amount) {
    price = hotel.price.lead.amount;
  }
  
  // Extract amenities
  const amenities = hotel.facilities 
    ? hotel.facilities.slice(0, 6).map((facility: any) => facility.name) 
    : ["Free WiFi", "Restaurant", "Spa Services", "Parking", "Fitness Center", "Breakfast"];
  
  return {
    id: `acc-api-${hotel.id || Math.random().toString(36).substr(2, 9)}`,
    name: hotel.name || "Mountain View Hotel",
    description: hotel.description || "Comfortable accommodations with convenient access to nearby slopes.",
    image: imageUrl,
    price: price,
    amenities: amenities,
    hotelId: hotel.id
  };
};

/**
 * Create a destination package combining a ski resort with a hotel accommodation
 */
const createDestinationPackage = (
  resort: SkiResort, 
  accommodation: HotelAccommodation, 
  startDate: string, 
  endDate: string
): Destination => {
  // Add lift ticket prices to the base hotel price
  const liftTicketPrices = {
    "beginner": 250,
    "intermediate": 300,
    "advanced": 400
  };
  
  const liftTicketPrice = liftTicketPrices[resort.difficulty] || 300;
  const totalPrice = accommodation.price + liftTicketPrice;
  
  return {
    id: `pkg-${resort.id}-${accommodation.id}`,
    resort,
    accommodation,
    price: totalPrice,
    dates: {
      start: startDate,
      end: endDate
    }
  };
};

/**
 * Fetch hotels near a ski resort from LiteAPI
 */
const fetchHotelsForResort = async (
  resort: SkiResort, 
  checkIn: string, 
  checkOut: string, 
  limit: number = 2
): Promise<HotelAccommodation[]> => {
  if (!LITE_API_KEY) {
    console.log(`No API key, using mock data for ${resort.name}`);
    return mockAccommodations.filter(acc => 
      acc.id.startsWith(`acc-${resort.id.split('-')[1]}`));
  }
  
  try {
    const cityId = SKI_RESORT_CITY_IDS[resort.location.split(',')[0].trim()] || "3000040033";
    
    const params = new URLSearchParams({
      adults: "2",
      children: "0",
      checkIn,
      checkOut,
      currency: "USD",
      cityId,
      limit: limit.toString()
    });
    
    console.log(`Fetching hotels near ${resort.name} for dates ${checkIn} to ${checkOut}`);
    
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
      console.log(`No hotels found for ${resort.name}, using mock data`);
      return mockAccommodations.filter(acc => 
        acc.id.startsWith(`acc-${resort.id.split('-')[1]}`));
    }
    
    // Transform hotel data to our HotelAccommodation format
    return data.hotels
      .filter((hotel: any) => hotel.name && hotel.id)
      .map(transformHotelToAccommodation);
    
  } catch (error) {
    console.error(`Error fetching hotels for ${resort.name}:`, error);
    console.log("Using mock accommodations as fallback");
    return mockAccommodations.filter(acc => 
      acc.id.startsWith(`acc-${resort.id.split('-')[1]}`));
  }
};

/**
 * Fetch all ski destinations with accommodation options
 */
export const fetchSkiDestinations = async (): Promise<Destination[]> => {
  console.log("Fetching ski destinations with accommodations...");
  
  // Use mock resorts
  const skiResorts = mockSkiResorts;
  
  // Set dates for the packages (next winter season)
  const today = new Date();
  const winterYear = today.getMonth() >= 8 ? today.getFullYear() + 1 : today.getFullYear();
  const startDate = `${winterYear}-01-15`;
  const endDate = `${winterYear}-01-22`;
  
  try {
    // For each resort, fetch hotels and create packages
    const destinationPromises = skiResorts.map(async (resort) => {
      // Fetch hotels for this resort
      const hotels = await fetchHotelsForResort(resort, startDate, endDate);
      
      // Create destination packages for each hotel
      return hotels.map(hotel => 
        createDestinationPackage(resort, hotel, startDate, endDate)
      );
    });
    
    // Wait for all promises to resolve
    const destinationsNested = await Promise.all(destinationPromises);
    
    // Flatten the array of arrays
    const destinations = destinationsNested.flat();
    
    if (destinations.length === 0) {
      console.log("No destinations found, using mock data");
      return mockDestinations;
    }
    
    return destinations;
    
  } catch (error) {
    console.error("Error fetching ski destinations:", error);
    console.log("Using mock destinations as fallback");
    return mockDestinations;
  }
};
