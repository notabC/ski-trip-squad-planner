import { supabase } from "@/integrations/supabase/client";
import { User, Group, Destination, Trip } from "@/types";

// Auth functions
export const registerUser = async (name: string, email: string, password: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    if (data.user) {
      // Create user in users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .insert([
          { id: data.user.id, name, email }
        ])
        .select()
        .single();
      
      if (userError) {
        throw userError;
      }
      
      return userData;
    }
    
    return null;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const signInUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    if (data.user) {
      // Fetch user from users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();
      
      if (userError) {
        throw userError;
      }
      
      return userData;
    }
    
    return null;
  } catch (error) {
    console.error("Error signing in user:", error);
    throw error;
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    // Clear local storage
    localStorage.removeItem("currentUser");
  } catch (error) {
    console.error("Error logging out user:", error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // Check if we have a session
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (sessionData?.session?.user) {
      // Get user data from our users table
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", sessionData.session.user.id)
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    }
    
    // Check for current user in localStorage as fallback
    const currentUserEmail = localStorage.getItem("currentUser");
    if (currentUserEmail) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", currentUserEmail)
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

export const saveCurrentUser = (email: string): void => {
  localStorage.setItem("currentUser", email);
};

// Group methods
export const createGroup = async (name: string, creatorId: string): Promise<Group | null> => {
  const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  // Create new group
  const { data: groupData, error: groupError } = await supabase
    .from('groups')
    .insert([
      { name, creator_id: creatorId, join_code: joinCode }
    ])
    .select()
    .single();
  
  if (groupError || !groupData) {
    console.error('Error creating group:', groupError);
    return null;
  }
  
  // Add creator as a member
  const { error: memberError } = await supabase
    .from('group_members')
    .insert([
      { group_id: groupData.id, user_id: creatorId }
    ]);
  
  if (memberError) {
    console.error('Error adding member to group:', memberError);
    // We could handle this better, but for now just return the group
  }
  
  // Return in the format our app expects
  return {
    id: groupData.id,
    name: groupData.name,
    creatorId: groupData.creator_id,
    members: [creatorId],
    joinCode: groupData.join_code
  };
};

export const joinGroup = async (joinCode: string, userId: string): Promise<Group | null> => {
  // Find the group
  const { data: groupData, error: groupError } = await supabase
    .from('groups')
    .select('*')
    .eq('join_code', joinCode)
    .single();
  
  if (groupError || !groupData) {
    console.error('Error finding group:', groupError);
    return null;
  }
  
  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from('group_members')
    .select('*')
    .eq('group_id', groupData.id)
    .eq('user_id', userId);
  
  if (!existingMember || existingMember.length === 0) {
    // Add user to group
    const { error: memberError } = await supabase
      .from('group_members')
      .insert([
        { group_id: groupData.id, user_id: userId }
      ]);
    
    if (memberError) {
      console.error('Error adding member to group:', memberError);
    }
  }
  
  // Get all members of the group
  const { data: members } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupData.id);
  
  const memberIds = members ? members.map(m => m.user_id) : [userId];
  
  // Return in the format our app expects
  return {
    id: groupData.id,
    name: groupData.name,
    creatorId: groupData.creator_id,
    members: memberIds,
    joinCode: groupData.join_code
  };
};

export const getUserGroups = async (userId: string): Promise<Group[]> => {
  // Get all group_ids where user is a member
  const { data: membershipData, error: membershipError } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', userId);
  
  if (membershipError || !membershipData || membershipData.length === 0) {
    return [];
  }
  
  const groupIds = membershipData.map(m => m.group_id);
  
  // Get all groups
  const { data: groupsData, error: groupsError } = await supabase
    .from('groups')
    .select('*')
    .in('id', groupIds);
  
  if (groupsError || !groupsData) {
    return [];
  }
  
  // Get members for each group
  const groups: Group[] = [];
  
  for (const group of groupsData) {
    const { data: groupMembers } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', group.id);
    
    const memberIds = groupMembers ? groupMembers.map(m => m.user_id) : [];
    
    groups.push({
      id: group.id,
      name: group.name,
      creatorId: group.creator_id,
      members: memberIds,
      joinCode: group.join_code
    });
  }
  
  return groups;
};

export const getGroupById = async (groupId: string): Promise<Group | null> => {
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single();
  
  if (groupError || !group) {
    return null;
  }
  
  // Get members for the group
  const { data: groupMembers } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId);
  
  const memberIds = groupMembers ? groupMembers.map(m => m.user_id) : [];
  
  return {
    id: group.id,
    name: group.name,
    creatorId: group.creator_id,
    members: memberIds,
    joinCode: group.join_code
  };
};

export const getGroupMembers = async (groupId: string): Promise<User[]> => {
  const { data: memberships, error: membershipsError } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId);
  
  if (membershipsError || !memberships) {
    return [];
  }
  
  const memberIds = memberships.map(m => m.user_id);
  
  if (memberIds.length === 0) {
    return [];
  }
  
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .in('id', memberIds);
  
  if (usersError || !users) {
    return [];
  }
  
  return users as User[];
};

// Trip methods
export const createTrip = async (groupId: string): Promise<Trip | null> => {
  // Get group members
  const { data: groupMembers } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId);
  
  if (!groupMembers || groupMembers.length === 0) {
    return null;
  }
  
  const memberIds = groupMembers.map(m => m.user_id);
  
  // Create trip
  const { data: tripData, error: tripError } = await supabase
    .from('trips')
    .insert([
      { group_id: groupId, status: 'voting' }
    ])
    .select()
    .single();
  
  if (tripError || !tripData) {
    console.error('Error creating trip:', tripError);
    return null;
  }
  
  // Add participants
  const participants = memberIds.map(userId => ({
    trip_id: tripData.id,
    user_id: userId,
    status: 'pending',
    payment_status: 'not_paid'
  }));
  
  const { error: participantsError } = await supabase
    .from('participants')
    .insert(participants);
  
  if (participantsError) {
    console.error('Error adding participants:', participantsError);
  }
  
  // Get the participant data
  const { data: participantData } = await supabase
    .from('participants')
    .select('*')
    .eq('trip_id', tripData.id);
  
  const formattedParticipants: Participant[] = participantData ? participantData.map(p => ({
    userId: p.user_id,
    status: p.status as 'pending' | 'confirmed' | 'declined',
    paymentStatus: p.payment_status as 'not_paid' | 'partially_paid' | 'paid',
    paymentAmount: p.payment_amount
  })) : [];
  
  return {
    id: tripData.id,
    groupId: tripData.group_id,
    selectedDestinationId: tripData.selected_destination_id || "",
    participants: formattedParticipants,
    status: tripData.status as 'voting' | 'confirmed' | 'completed'
  };
};

export const getGroupTrip = async (groupId: string): Promise<Trip | null> => {
  const { data: tripData, error: tripError } = await supabase
    .from('trips')
    .select('*')
    .eq('group_id', groupId)
    .single();
  
  if (tripError || !tripData) {
    return null;
  }
  
  // Get participants
  const { data: participantData } = await supabase
    .from('participants')
    .select('*')
    .eq('trip_id', tripData.id);
  
  const formattedParticipants: Participant[] = participantData ? participantData.map(p => ({
    userId: p.user_id,
    status: p.status as 'pending' | 'confirmed' | 'declined',
    paymentStatus: p.payment_status as 'not_paid' | 'partially_paid' | 'paid',
    paymentAmount: p.payment_amount
  })) : [];
  
  return {
    id: tripData.id,
    groupId: tripData.group_id,
    selectedDestinationId: tripData.selected_destination_id || "",
    participants: formattedParticipants,
    status: tripData.status as 'voting' | 'confirmed' | 'completed'
  };
};

export const updateTripStatus = async (tripId: string, status: Trip['status']): Promise<Trip | null> => {
  const { data: tripData, error: tripError } = await supabase
    .from('trips')
    .update({ status })
    .eq('id', tripId)
    .select()
    .single();
  
  if (tripError || !tripData) {
    console.error('Error updating trip status:', tripError);
    return null;
  }
  
  // Get participants
  const { data: participantData } = await supabase
    .from('participants')
    .select('*')
    .eq('trip_id', tripData.id);
  
  const formattedParticipants: Participant[] = participantData ? participantData.map(p => ({
    userId: p.user_id,
    status: p.status as 'pending' | 'confirmed' | 'declined',
    paymentStatus: p.payment_status as 'not_paid' | 'partially_paid' | 'paid',
    paymentAmount: p.payment_amount
  })) : [];
  
  return {
    id: tripData.id,
    groupId: tripData.group_id,
    selectedDestinationId: tripData.selected_destination_id || "",
    participants: formattedParticipants,
    status: tripData.status as 'voting' | 'confirmed' | 'completed'
  };
};

export const updateParticipantStatus = async (
  tripId: string,
  userId: string,
  status: Participant['status']
): Promise<Trip | null> => {
  const { error: updateError } = await supabase
    .from('participants')
    .update({ status })
    .eq('trip_id', tripId)
    .eq('user_id', userId);
  
  if (updateError) {
    console.error('Error updating participant status:', updateError);
    return null;
  }
  
  // Get updated trip
  return getGroupTrip(await getTripGroupId(tripId));
};

export const updateParticipantPaymentStatus = async (
  tripId: string,
  userId: string,
  paymentStatus: Participant['paymentStatus'],
  amount?: number
): Promise<Trip | null> => {
  const updateData: any = { payment_status: paymentStatus };
  
  if (amount !== undefined) {
    updateData.payment_amount = amount;
  }
  
  const { error: updateError } = await supabase
    .from('participants')
    .update(updateData)
    .eq('trip_id', tripId)
    .eq('user_id', userId);
  
  if (updateError) {
    console.error('Error updating payment status:', updateError);
    return null;
  }
  
  // Get updated trip
  return getGroupTrip(await getTripGroupId(tripId));
};

// Helper function to get group_id from trip_id
const getTripGroupId = async (tripId: string): Promise<string> => {
  const { data } = await supabase
    .from('trips')
    .select('group_id')
    .eq('id', tripId)
    .single();
  
  return data?.group_id || '';
};

// Destination methods
export const getAllDestinations = async (): Promise<Destination[]> => {
  const { data, error } = await supabase
    .from('destinations')
    .select('*');
  
  if (error) {
    console.error('Error fetching destinations:', error);
    return [];
  }
  
  return data.map(d => ({
    id: d.id,
    name: d.name,
    location: d.location,
    description: d.description || '',
    image: d.image || '',
    price: d.price,
    dates: {
      start: d.start_date,
      end: d.end_date
    },
    amenities: d.amenities || [],
    difficulty: d.difficulty as 'beginner' | 'intermediate' | 'advanced'
  }));
};

export const getDestinationById = async (id: string): Promise<Destination | null> => {
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error || !data) {
    console.error('Error fetching destination:', error);
    return null;
  }
  
  return {
    id: data.id,
    name: data.name,
    location: data.location,
    description: data.description || '',
    image: data.image || '',
    price: data.price,
    dates: {
      start: data.start_date,
      end: data.end_date
    },
    amenities: data.amenities || [],
    difficulty: data.difficulty as 'beginner' | 'intermediate' | 'advanced'
  };
};

// Voting methods
export const castVote = async (userId: string, destinationId: string): Promise<void> => {
  // First delete any existing votes by this user
  await supabase
    .from('votes')
    .delete()
    .eq('user_id', userId);
  
  // Then insert the new vote
  const { error } = await supabase
    .from('votes')
    .insert([
      { user_id: userId, destination_id: destinationId }
    ]);
  
  if (error) {
    console.error('Error casting vote:', error);
  }
};

export const getVotesByGroupId = async (groupId: string): Promise<Vote[]> => {
  // Get all members of the group
  const { data: memberships } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId);
  
  if (!memberships || memberships.length === 0) {
    return [];
  }
  
  const memberIds = memberships.map(m => m.user_id);
  
  // Get all votes by these members
  const { data: votes, error } = await supabase
    .from('votes')
    .select('*')
    .in('user_id', memberIds);
  
  if (error || !votes) {
    console.error('Error getting votes:', error);
    return [];
  }
  
  return votes.map(v => ({
    userId: v.user_id,
    destinationId: v.destination_id,
    timestamp: new Date(v.timestamp).getTime()
  }));
};

export const getUserVote = async (userId: string): Promise<Vote | null> => {
  const { data, error } = await supabase
    .from('votes')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  return {
    userId: data.user_id,
    destinationId: data.destination_id,
    timestamp: new Date(data.timestamp).getTime()
  };
};

export const finalizeVoting = async (groupId: string): Promise<Trip | null> => {
  // Get all votes for this group
  const votes = await getVotesByGroupId(groupId);
  
  if (votes.length === 0) {
    return null;
  }
  
  // Count votes for each destination
  const voteCounts: Record<string, number> = {};
  votes.forEach((vote) => {
    voteCounts[vote.destinationId] = (voteCounts[vote.destinationId] || 0) + 1;
  });
  
  // Find destination with most votes
  let selectedDestinationId = "";
  let maxVotes = 0;
  Object.entries(voteCounts).forEach(([destId, count]) => {
    if (count > maxVotes) {
      maxVotes = count;
      selectedDestinationId = destId;
    }
  });
  
  if (!selectedDestinationId) {
    return null;
  }
  
  // Get the trip for this group
  const { data: tripData } = await supabase
    .from('trips')
    .select('id')
    .eq('group_id', groupId)
    .single();
  
  if (!tripData) {
    return null;
  }
  
  // Update the trip
  const { error: updateError } = await supabase
    .from('trips')
    .update({
      selected_destination_id: selectedDestinationId,
      status: 'confirmed'
    })
    .eq('id', tripData.id);
  
  if (updateError) {
    console.error('Error finalizing voting:', updateError);
    return null;
  }
  
  // Return the updated trip
  return getGroupTrip(groupId);
};
