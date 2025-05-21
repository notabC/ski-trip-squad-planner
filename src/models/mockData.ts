import { Destination, SkiResort, HotelAccommodation } from "../types";

// Mock ski resorts
export const mockSkiResorts: SkiResort[] = [
  {
    id: "resort-1",
    name: "Alpine Paradise",
    location: "Chamonix, France",
    description: "Experience the majesty of the French Alps with world-class slopes for all skill levels.",
    image: "/images/ski-resort-1.jpg",
    difficulty: "intermediate"
  },
  {
    id: "resort-2",
    name: "Powder Mountain",
    location: "Whistler, Canada",
    description: "Nestled in the heart of British Columbia, offering access to some of the best powder in North America.",
    image: "/images/ski-resort-2.jpg",
    difficulty: "advanced"
  },
  {
    id: "resort-3",
    name: "Snowy Peaks",
    location: "Zermatt, Switzerland",
    description: "Offering breathtaking views of the Matterhorn and access to some of Europe's most pristine slopes.",
    image: "/images/ski-resort-3.jpg",
    difficulty: "beginner"
  }
];

// Mock accommodations for each resort
export const mockAccommodations: HotelAccommodation[] = [
  // For Alpine Paradise
  {
    id: "acc-1-1",
    name: "Alpine Luxury Resort",
    description: "Premium resort featuring stunning mountain views and luxurious accommodations.",
    image: "/images/hotel-1-1.jpg",
    price: 999,
    amenities: [
      "Ski-in/Ski-out Access",
      "Hot Tub",
      "Free WiFi",
      "Restaurant",
      "Spa Services",
      "Equipment Rental"
    ]
  },
  {
    id: "acc-1-2",
    name: "Mountain View Lodge",
    description: "Cozy lodge with beautiful views and comfortable rooms.",
    image: "/images/hotel-1-2.jpg",
    price: 799,
    amenities: [
      "Restaurant",
      "Bar",
      "Fitness Center",
      "Sauna",
      "Free Parking",
      "Shuttle Service"
    ]
  },
  // For Powder Mountain
  {
    id: "acc-2-1",
    name: "Powder Lodge",
    description: "Charming lodge with cozy accommodations and a vibrant après-ski scene.",
    image: "/images/hotel-2-1.jpg",
    price: 1099,
    amenities: [
      "Indoor Pool",
      "Fireplace Lounge",
      "Complimentary Breakfast",
      "Shuttle Service",
      "Sauna",
      "Game Room"
    ]
  },
  {
    id: "acc-2-2",
    name: "Snow Cabin Resort",
    description: "Rustic cabins with modern amenities in the heart of the mountains.",
    image: "/images/hotel-2-2.jpg",
    price: 899,
    amenities: [
      "Private Cabins",
      "Outdoor Hot Tubs",
      "Fireplaces",
      "Restaurant",
      "Bar",
      "Equipment Rental"
    ]
  },
  // For Snowy Peaks
  {
    id: "acc-3-1",
    name: "Swiss Chalet",
    description: "Traditional Swiss chalet combining old-world charm with modern amenities.",
    image: "/images/hotel-3-1.jpg",
    price: 1299,
    amenities: [
      "Private Balconies",
      "Gourmet Restaurant",
      "Heated Boot Storage",
      "Wellness Center",
      "Bar & Lounge",
      "Concierge Service"
    ]
  },
  {
    id: "acc-3-2",
    name: "Alpine Budget Hotel",
    description: "Affordable accommodations with all the essentials for a great ski trip.",
    image: "/images/hotel-3-2.jpg",
    price: 599,
    amenities: [
      "Free Breakfast",
      "WiFi",
      "Ski Storage",
      "Shuttle Service",
      "Bar",
      "Common Area"
    ]
  }
];

// Create destination packages (resort + accommodation)
export const mockDestinations: Destination[] = [
  // Resort 1 packages
  {
    id: "dest-1-1",
    resort: mockSkiResorts[0],
    accommodation: mockAccommodations[0],
    price: mockAccommodations[0].price + 300, // Base price + lift tickets
    dates: {
      start: "2026-01-15",
      end: "2026-01-22",
    }
  },
  {
    id: "dest-1-2",
    resort: mockSkiResorts[0],
    accommodation: mockAccommodations[1],
    price: mockAccommodations[1].price + 300,
    dates: {
      start: "2026-01-15",
      end: "2026-01-22",
    }
  },
  // Resort 2 packages
  {
    id: "dest-2-1",
    resort: mockSkiResorts[1],
    accommodation: mockAccommodations[2],
    price: mockAccommodations[2].price + 400,
    dates: {
      start: "2026-01-20",
      end: "2026-01-27",
    }
  },
  {
    id: "dest-2-2",
    resort: mockSkiResorts[1],
    accommodation: mockAccommodations[3],
    price: mockAccommodations[3].price + 400,
    dates: {
      start: "2026-01-20",
      end: "2026-01-27",
    }
  },
  // Resort 3 packages
  {
    id: "dest-3-1",
    resort: mockSkiResorts[2],
    accommodation: mockAccommodations[4],
    price: mockAccommodations[4].price + 350,
    dates: {
      start: "2026-02-05",
      end: "2026-02-12",
    }
  },
  {
    id: "dest-3-2",
    resort: mockSkiResorts[2],
    accommodation: mockAccommodations[5],
    price: mockAccommodations[5].price + 350,
    dates: {
      start: "2026-02-05",
      end: "2026-02-12",
    }
  }
];
