import { mockDestinations, mockSkiResorts, mockAccommodations } from "@/models/mockData";
import type { Destination, SkiResort, HotelAccommodation } from "@/types";

// Update API base URLs to handle both development and production environments
const isProduction = import.meta.env.PROD;
const LITE_API_BASE_URL = isProduction 
  ? "https://api.liteapi.travel/v3.0" // Use direct URL in production
  : "/api/liteapi/v3.0";  // Use proxy in development

// API key handling
const LITE_API_KEY = import.meta.env.VITE_LITE_API_KEY || "";

/**
 * Debug utility to safely check response content before parsing
 */
const debugResponse = async (response: Response, actionDescription: string): Promise<any> => {
  const responseText = await response.text();
  
  console.log(`API Response for ${actionDescription} - Status: ${response.status}`);
  console.log(`Response Headers:`, Object.fromEntries([...response.headers.entries()]));
  
  // Add more detailed debugging for the response content
  if (!responseText || responseText.trim() === '') {
    console.error('Empty response received');
    console.log('Response URL:', response.url);
    
    // Instead of throwing an error, return an empty object with a data property
    // This will prevent the app from crashing and allow fallback to mock data
    return { data: [] };
  }
  
  try {
    // Check if response starts with HTML - this indicates an error or redirect
    if (responseText.trim().startsWith('<!DOCTYPE html>') || 
        responseText.trim().startsWith('<html>')) {
      console.error('Received HTML response instead of JSON');
      // Return empty data to trigger fallback
      return { data: [] };
    }
    
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Failed to parse response:', responseText.substring(0, 200) + '...');
    console.log('Full response text:', responseText);
    // Return empty data instead of throwing
    return { data: [] };
  }
};

/**
 * Transforms hotel data from LiteAPI to our HotelAccommodation format
 */
const transformHotelToAccommodation = (hotel: any): HotelAccommodation => {
  // Extract the first image URL or use a placeholder
  const imageUrl = hotel.hotelImages && hotel.hotelImages.length > 0 
    ? hotel.hotelImages[0] 
    : "/images/hotel-placeholder.jpg";
  
  // Extract price information - using average price if available
  let price = 899; // Default fallback price
  
  // Extract amenities
  const amenities = hotel.hotelFacilities 
    ? hotel.hotelFacilities.slice(0, 6) 
    : ["Free WiFi", "Restaurant", "Spa Services", "Parking", "Fitness Center", "Breakfast"];
  
  return {
    id: `acc-api-${hotel.id || Math.random().toString(36).substr(2, 9)}`,
    name: hotel.name || "Mountain View Hotel",
    description: hotel.hotelDescription || "Comfortable accommodations with convenient access to nearby slopes.",
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
 * Extract country code from location string
 */
const getCountryCode = (location: string): string => {
  const countries: Record<string, string> = {
    "France": "FR",
    "Canada": "CA",
    "Switzerland": "CH",
    "United States": "US",
    "USA": "US"
  };
  
  // Check if any country name is in the location string
  for (const [country, code] of Object.entries(countries)) {
    if (location.includes(country)) {
      return code;
    }
  }
  
  return "US"; // Default fallback
};

/**
 * Extract city name from location string
 */
const getCityName = (location: string): string => {
  // Extract the city part (typically before the comma)
  const cityPart = location.split(',')[0].trim();
  return cityPart;
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
    // Extract city and country code from resort location
    const cityName = getCityName(resort.location);
    const countryCode = getCountryCode(resort.location);
    
    console.log(`Searching for hotels in ${cityName}, ${countryCode} for resort ${resort.name}`);
    
    // Try fetching hotels using the hotels endpoint
    try {
      console.log(`API Key detected: ${LITE_API_KEY ? "Yes" : "No"}`);
      
      // Use the correct endpoint path that matches the working curl example
      const hotelsEndpoint = `${LITE_API_BASE_URL}/data/hotels`;
      
      // Build search params
      const hotelSearchParams = new URLSearchParams({
        countryCode: countryCode,
        cityName
      });
      
      const requestUrl = `${hotelsEndpoint}?${hotelSearchParams.toString()}`;
      console.log(`Making API call to: ${requestUrl}`);
      
      // Prepare headers - include API key directly in headers if in production
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "accept": "application/json"
      };
      
      // In production, we need to add the API key to the headers directly
      if (isProduction && LITE_API_KEY) {
        headers["X-API-Key"] = LITE_API_KEY;
      }
      
      // Make the API call to get hotel list
      const hotelResponse = await fetch(requestUrl, {
        method: "GET",
        headers
      });
      
      console.log(`API Response status: ${hotelResponse.status}`);
      console.log(`API Response headers:`, Object.fromEntries([...hotelResponse.headers.entries()]));
      
      if (!hotelResponse.ok) {
        console.error(`Hotel search API response error: ${hotelResponse.status} - ${hotelResponse.statusText}`);
        throw new Error(`Failed to fetch hotels: ${hotelResponse.statusText}`);
      }
      
      const hotelData = await debugResponse(hotelResponse, `hotel search for ${resort.name}`);
      
      if (!hotelData.data || !Array.isArray(hotelData.data) || hotelData.data.length === 0) {
        console.log(`No hotels found in API response for ${resort.name} in ${cityName}`);
        throw new Error('No hotels found in API response');
      }
      
      // We got hotels! Transform them to our format
      console.log(`Successfully found ${hotelData.data.length} hotels for ${resort.name}`);
      
      // Take a subset of the hotels
      const hotelsToTransform = hotelData.data.slice(0, limit);
      
      // Transform API hotel format to our format
      const accommodations = hotelsToTransform.map((hotel: any): HotelAccommodation => {
        return {
          id: `acc-api-${hotel.id}`,
          name: hotel.name || "Mountain Hotel",
          description: hotel.hotelDescription || "Comfortable accommodations near slopes.",
          image: hotel.main_photo || "/images/hotel-placeholder.jpg",
          price: 899, // Default price
          amenities: hotel.facilityIds 
            ? ["Free WiFi", "Restaurant", "Spa Services", "Fitness Center", "Breakfast"] 
            : ["Free WiFi", "Parking", "Restaurant"],
          hotelId: hotel.id
        };
      });
      
      return accommodations;
      
    } catch (apiError) {
      console.error(`API Error while searching for ${resort.name}:`, apiError);
      console.log(`Falling back to mock data for ${resort.name} due to API error`);
      return mockAccommodations.filter(acc => 
        acc.id.startsWith(`acc-${resort.id.split('-')[1]}`));
    }
    
  } catch (error) {
    console.error(`Error fetching hotels for ${resort.name}:`, error);
    console.log(`Using mock accommodations as fallback for ${resort.name}`);
    return mockAccommodations.filter(acc => 
      acc.id.startsWith(`acc-${resort.id.split('-')[1]}`));
  }
};

/**
 * Fetch all ski destinations with accommodation options
 */
export const fetchSkiDestinations = async (): Promise<Destination[]> => {
  console.log("Fetching ski destinations with accommodations...");
  
  // Use mock resorts as our base ski resorts
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
      console.log(`Found ${hotels.length} hotels for resort ${resort.name} from API`);
      
      // Create destination packages for each hotel - always use real API data when available
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
    
    console.log(`Successfully created ${destinations.length} destination packages from API data`);
    const sampleDestination = destinations[0];
    console.log(`Sample destination: ${sampleDestination.resort.name} with accommodation: ${sampleDestination.accommodation.name}`);
    
    return destinations;
    
  } catch (error) {
    console.error("Error fetching ski destinations:", error);
    console.log("Using mock destinations as fallback");
    return mockDestinations;
  }
};
