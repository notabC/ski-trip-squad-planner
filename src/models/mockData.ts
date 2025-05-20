
import { Destination } from "../types";

export const mockDestinations: Destination[] = [
  {
    id: "dest-1",
    name: "Alpine Paradise Resort",
    location: "Chamonix, France",
    description: "Experience the majesty of the French Alps at this premium resort featuring stunning mountain views, world-class slopes for all skill levels, and luxurious accommodations.",
    image: "/images/ski-resort-1.jpg",
    price: 1299,
    dates: {
      start: "2026-01-15",
      end: "2026-01-22",
    },
    amenities: [
      "Ski-in/Ski-out Access",
      "Hot Tub",
      "Free WiFi",
      "Restaurant",
      "Spa Services",
      "Equipment Rental"
    ],
    difficulty: "intermediate"
  },
  {
    id: "dest-2",
    name: "Powder Mountain Lodge",
    location: "Whistler, Canada",
    description: "Nestled in the heart of British Columbia, this charming lodge offers access to some of the best powder in North America with cozy accommodations and a vibrant après-ski scene.",
    image: "/images/ski-resort-2.jpg",
    price: 1499,
    dates: {
      start: "2026-01-20",
      end: "2026-01-27",
    },
    amenities: [
      "Indoor Pool",
      "Fireplace Lounge",
      "Complimentary Breakfast",
      "Shuttle Service",
      "Sauna",
      "Game Room"
    ],
    difficulty: "advanced"
  },
  {
    id: "dest-3",
    name: "Snowy Peaks Chalet",
    location: "Zermatt, Switzerland",
    description: "This traditional Swiss chalet combines old-world charm with modern amenities, offering breathtaking views of the Matterhorn and access to some of Europe's most pristine slopes.",
    image: "/images/ski-resort-3.jpg",
    price: 1799,
    dates: {
      start: "2026-02-05",
      end: "2026-02-12",
    },
    amenities: [
      "Private Balconies",
      "Gourmet Restaurant",
      "Heated Boot Storage",
      "Wellness Center",
      "Bar & Lounge",
      "Concierge Service"
    ],
    difficulty: "beginner"
  }
];
