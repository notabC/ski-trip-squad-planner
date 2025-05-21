export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Group {
  id: string;
  name: string;
  creatorId: string;
  members: string[]; // User IDs
  joinCode: string;
}

export interface SkiResort {
  id: string;
  name: string;
  location: string;
  description: string;
  image: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface HotelAccommodation {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  amenities: string[];
  hotelId?: string; // Original ID from liteAPI
}

export interface Destination {
  id: string;
  resort: SkiResort;
  accommodation: HotelAccommodation;
  price: number; // Total package price
  dates: {
    start: string;
    end: string;
  };
}

export interface Vote {
  userId: string;
  destinationId: string;
  timestamp: number;
}

export interface Trip {
  id: string;
  groupId: string;
  selectedDestinationId: string;
  participants: Participant[];
  status: 'voting' | 'confirmed' | 'completed';
  votingDeadline?: string;
}

export interface Participant {
  userId: string;
  status: 'pending' | 'confirmed' | 'declined';
  paymentStatus: 'not_paid' | 'partially_paid' | 'paid';
  paymentAmount?: number;
}
