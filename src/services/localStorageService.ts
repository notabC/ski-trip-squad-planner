import { User, Group, Trip, Vote, Participant, Destination } from "../types";
import { v4 as uuidv4 } from "uuid";
import { mockDestinations } from "../models/mockData";
import { fetchSkiDestinations } from "./apiService";

// Keys for localStorage
const KEYS = {
  USERS: "ski_planner_users",
  CURRENT_USER: "ski_planner_current_user",
  GROUPS: "ski_planner_groups",
  TRIPS: "ski_planner_trips",
  VOTES: "ski_planner_votes",
  DESTINATIONS: "ski_planner_destinations",
};

// Initialize localStorage with mock destinations
export const initializeStorage = () => {
  if (!localStorage.getItem(KEYS.DESTINATIONS)) {
    localStorage.setItem(KEYS.DESTINATIONS, JSON.stringify(mockDestinations));
  }
  
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify([]));
  }
  
  if (!localStorage.getItem(KEYS.GROUPS)) {
    localStorage.setItem(KEYS.GROUPS, JSON.stringify([]));
  }
  
  if (!localStorage.getItem(KEYS.TRIPS)) {
    localStorage.setItem(KEYS.TRIPS, JSON.stringify([]));
  }
  
  if (!localStorage.getItem(KEYS.VOTES)) {
    localStorage.setItem(KEYS.VOTES, JSON.stringify([]));
  }
};

// User methods
export const registerUser = (name: string, email: string): User => {
  const users = JSON.parse(localStorage.getItem(KEYS.USERS) || "[]");
  const existingUser = users.find((u: User) => u.email === email);
  
  if (existingUser) {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(existingUser));
    return existingUser;
  }
  
  const newUser: User = {
    id: uuidv4(),
    name,
    email,
  };
  
  users.push(newUser);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(newUser));
  
  return newUser;
};

export const getCurrentUser = (): User | null => {
  const userString = localStorage.getItem(KEYS.CURRENT_USER);
  return userString ? JSON.parse(userString) : null;
};

export const logoutUser = () => {
  localStorage.removeItem(KEYS.CURRENT_USER);
};

// Group methods
export const createGroup = (name: string, creatorId: string): Group => {
  const groups = JSON.parse(localStorage.getItem(KEYS.GROUPS) || "[]");
  const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const newGroup: Group = {
    id: uuidv4(),
    name,
    creatorId,
    members: [creatorId],
    joinCode,
  };
  
  groups.push(newGroup);
  localStorage.setItem(KEYS.GROUPS, JSON.stringify(groups));
  
  return newGroup;
};

export const joinGroup = (joinCode: string, userId: string): Group | null => {
  const groups = JSON.parse(localStorage.getItem(KEYS.GROUPS) || "[]");
  const groupIndex = groups.findIndex((g: Group) => g.joinCode === joinCode);
  
  if (groupIndex === -1) {
    return null;
  }
  
  const group = groups[groupIndex];
  if (!group.members.includes(userId)) {
    group.members.push(userId);
    localStorage.setItem(KEYS.GROUPS, JSON.stringify(groups));
  }
  
  return group;
};

export const getUserGroups = (userId: string): Group[] => {
  const groups = JSON.parse(localStorage.getItem(KEYS.GROUPS) || "[]");
  return groups.filter((g: Group) => g.members.includes(userId));
};

export const getGroupById = (groupId: string): Group | null => {
  const groups = JSON.parse(localStorage.getItem(KEYS.GROUPS) || "[]");
  const group = groups.find((g: Group) => g.id === groupId);
  return group || null;
};

export const getGroupMembers = (groupId: string): User[] => {
  const group = getGroupById(groupId);
  if (!group) return [];
  
  const users = JSON.parse(localStorage.getItem(KEYS.USERS) || "[]");
  return users.filter((u: User) => group.members.includes(u.id));
};

// Trip methods
export const createTrip = (groupId: string): Trip => {
  const trips = JSON.parse(localStorage.getItem(KEYS.TRIPS) || "[]");
  const group = getGroupById(groupId);
  
  if (!group) {
    throw new Error("Group not found");
  }
  
  const participants: Participant[] = group.members.map((userId) => ({
    userId,
    status: "pending",
    paymentStatus: "not_paid",
  }));
  
  const newTrip: Trip = {
    id: uuidv4(),
    groupId,
    selectedDestinationId: "",
    participants,
    status: "voting",
  };
  
  trips.push(newTrip);
  localStorage.setItem(KEYS.TRIPS, JSON.stringify(trips));
  
  return newTrip;
};

export const getGroupTrip = (groupId: string): Trip | null => {
  const trips = JSON.parse(localStorage.getItem(KEYS.TRIPS) || "[]");
  return trips.find((t: Trip) => t.groupId === groupId) || null;
};

export const updateTripStatus = (tripId: string, status: Trip['status']): Trip | null => {
  const trips = JSON.parse(localStorage.getItem(KEYS.TRIPS) || "[]");
  const tripIndex = trips.findIndex((t: Trip) => t.id === tripId);
  
  if (tripIndex === -1) {
    return null;
  }
  
  trips[tripIndex].status = status;
  localStorage.setItem(KEYS.TRIPS, JSON.stringify(trips));
  
  return trips[tripIndex];
};

export const updateParticipantStatus = (
  tripId: string,
  userId: string,
  status: Participant['status']
): Trip | null => {
  const trips = JSON.parse(localStorage.getItem(KEYS.TRIPS) || "[]");
  const tripIndex = trips.findIndex((t: Trip) => t.id === tripId);
  
  if (tripIndex === -1) {
    return null;
  }
  
  const participantIndex = trips[tripIndex].participants.findIndex(
    (p: Participant) => p.userId === userId
  );
  
  if (participantIndex === -1) {
    return null;
  }
  
  trips[tripIndex].participants[participantIndex].status = status;
  localStorage.setItem(KEYS.TRIPS, JSON.stringify(trips));
  
  return trips[tripIndex];
};

export const updateParticipantPaymentStatus = (
  tripId: string,
  userId: string,
  paymentStatus: Participant['paymentStatus'],
  amount?: number
): Trip | null => {
  const trips = JSON.parse(localStorage.getItem(KEYS.TRIPS) || "[]");
  const tripIndex = trips.findIndex((t: Trip) => t.id === tripId);
  
  if (tripIndex === -1) {
    return null;
  }
  
  const participantIndex = trips[tripIndex].participants.findIndex(
    (p: Participant) => p.userId === userId
  );
  
  if (participantIndex === -1) {
    return null;
  }
  
  trips[tripIndex].participants[participantIndex].paymentStatus = paymentStatus;
  
  if (amount !== undefined) {
    trips[tripIndex].participants[participantIndex].paymentAmount = amount;
  }
  
  localStorage.setItem(KEYS.TRIPS, JSON.stringify(trips));
  
  return trips[tripIndex];
};

// Destination methods
export const getAllDestinations = async () => {
  let destinations = null;
  
  try {
    // Try to get destinations from local storage first
    destinations = JSON.parse(localStorage.getItem('destinations') || 'null');
    
    // If no destinations in local storage, or we want fresh data, fetch from API
    if (!destinations || destinations.length === 0) {
      destinations = await fetchSkiDestinations();
      localStorage.setItem('destinations', JSON.stringify(destinations));
    }
  } catch (error) {
    console.error('Error getting destinations:', error);
    // Initialize with mock data from apiService if there's an error
    destinations = await fetchSkiDestinations();
  }
  
  return destinations || [];
};

export const getDestinationById = (id: string): Destination | null => {
  const destinations = getAllDestinations();
  return destinations.find((d) => d.id === id) || null;
};

// Voting methods
export const castVote = (userId: string, destinationId: string): void => {
  const votes = JSON.parse(localStorage.getItem(KEYS.VOTES) || "[]");
  
  // Remove any existing votes from this user
  const filteredVotes = votes.filter((v: Vote) => v.userId !== userId);
  
  const newVote: Vote = {
    userId,
    destinationId,
    timestamp: Date.now(),
  };
  
  filteredVotes.push(newVote);
  localStorage.setItem(KEYS.VOTES, JSON.stringify(filteredVotes));
};

export const getVotesByGroupId = (groupId: string): Vote[] => {
  const votes = JSON.parse(localStorage.getItem(KEYS.VOTES) || "[]");
  const group = getGroupById(groupId);
  
  if (!group) {
    return [];
  }
  
  return votes.filter((v: Vote) => group.members.includes(v.userId));
};

export const getUserVote = (userId: string): Vote | null => {
  const votes = JSON.parse(localStorage.getItem(KEYS.VOTES) || "[]");
  return votes.find((v: Vote) => v.userId === userId) || null;
};

export const finalizeVoting = (groupId: string): Trip | null => {
  const votes = getVotesByGroupId(groupId);
  if (votes.length === 0) return null;
  
  // Count votes for each destination
  const voteCounts: Record<string, number> = {};
  votes.forEach((vote) => {
    voteCounts[vote.destinationId] = (voteCounts[vote.destinationId] || 0) + 1;
  });
  
  // Find the destination with the most votes
  let selectedDestinationId = "";
  let maxVotes = 0;
  Object.entries(voteCounts).forEach(([destId, count]) => {
    if (count > maxVotes) {
      maxVotes = count;
      selectedDestinationId = destId;
    }
  });
  
  // Update the trip with the selected destination
  const trips = JSON.parse(localStorage.getItem(KEYS.TRIPS) || "[]");
  const tripIndex = trips.findIndex((t: Trip) => t.groupId === groupId);
  
  if (tripIndex === -1 || !selectedDestinationId) {
    return null;
  }
  
  trips[tripIndex].selectedDestinationId = selectedDestinationId;
  trips[tripIndex].status = "confirmed";
  
  localStorage.setItem(KEYS.TRIPS, JSON.stringify(trips));
  
  return trips[tripIndex];
};
