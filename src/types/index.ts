
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

export interface Destination {
  id: string;
  name: string;
  location: string;
  description: string;
  image: string;
  price: number;
  dates: {
    start: string;
    end: string;
  };
  amenities: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
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
