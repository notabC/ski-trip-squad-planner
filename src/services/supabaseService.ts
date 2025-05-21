import { supabase } from "@/integrations/supabase/client";
import { User, Group, Destination, Trip, Participant, Vote } from "@/types";

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
      try {
        // Fetch user from users table
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no row is found
        
        if (userError) {
          throw userError;
        }
        
        // If user doesn't exist in users table but does in auth, create a new user record
        if (!userData) {
          const authUser = data.user;
          // First check if a user with same email already exists
          const { data: existingUser } = await supabase
            .from("users")
            .select("*")
            .eq("email", authUser.email)
            .maybeSingle();
            
          // If email already exists, return that user
          if (existingUser) {
            return existingUser;
          }
          
          // Otherwise create a new user
          const newUser = {
            id: authUser.id,
            name: authUser.email ? authUser.email.split('@')[0] : 'User', // Use part of email as name
            email: authUser.email || ''
          };
          
          const { data: newUserData, error: insertError } = await supabase
            .from("users")
            .upsert([newUser], { onConflict: 'id' })
            .select()
            .maybeSingle();
            
          if (insertError) {
            console.error("Error creating user record:", insertError);
            // Return basic user instead of throwing to ensure login still works
            return {
              id: authUser.id,
              name: authUser.email ? authUser.email.split('@')[0] : 'User',
              email: authUser.email || ''
            };
          }
          
          return newUserData || newUser;
        }
        
        return userData;
      } catch (error) {
        console.error("Error fetching user data:", error);
        
        // Fallback: Return a basic user object based on auth data
        return {
          id: data.user.id,
          name: data.user.email ? data.user.email.split('@')[0] : 'User',
          email: data.user.email || ''
        };
      }
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
      try {
        // Try to get user data from our users table
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", sessionData.session.user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching user from users table:", error);
        }
        
        // If user doesn't exist in users table but does in auth, create a new user record
        if (!data) {
          const authUser = sessionData.session.user;
          
          // First check if a user with the same email exists
          const { data: existingUser } = await supabase
            .from("users")
            .select("*")
            .eq("email", authUser.email)
            .maybeSingle();
            
          if (existingUser) {
            return existingUser;
          }
          
          // Insert new user
          const newUser = {
            id: authUser.id,
            name: authUser.email ? authUser.email.split('@')[0] : 'User',
            email: authUser.email || ''
          };
          
          try {
            const { data: newUserData, error: insertError } = await supabase
              .from("users")
              .insert([newUser])
              .select()
              .single();
              
            if (insertError) {
              console.error("Error creating user record:", insertError);
              // Return basic user object as fallback
              return newUser;
            }
            
            return newUserData;
          } catch (insertError) {
            console.error("Error creating user record:", insertError);
            // Return basic user object based on auth data as fallback
            return newUser;
          }
        }
        
        return data;
      } catch (error) {
        console.error("Error in getCurrentUser:", error);
        // Fallback to auth user
        const authUser = sessionData.session.user;
        return {
          id: authUser.id,
          name: authUser.email ? authUser.email.split('@')[0] : 'User',
          email: authUser.email || ''
        };
      }
    }
    
    // Check for current user in localStorage as fallback
    const currentUserEmail = localStorage.getItem("currentUser");
    if (currentUserEmail) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", currentUserEmail)
        .maybeSingle();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        return data;
      }
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
  try {
    console.log('Creating group for user ID:', creatorId);
    
    // First, ensure the user exists in the users table
    const { data: userCheck } = await supabase
      .from('users')
      .select('id')
      .eq('id', creatorId)
      .maybeSingle();
    
    if (!userCheck) {
      console.log('User not found in users table, creating user record');
      // Get user from auth
      const { data: authUser } = await supabase.auth.getUser();
      
      if (!authUser?.user) {
        console.error('Auth user not found');
        return null;
      }
      
      // First check if user exists with same email
      const { data: emailUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', authUser.user.email)
        .maybeSingle();
      
      if (emailUser) {
        console.log('Found user with same email:', emailUser);
        creatorId = emailUser.id;
      } else {
        // Insert the user into the users table
        const newUser = { 
          id: creatorId, 
          name: authUser.user.email ? authUser.user.email.split('@')[0] : 'User', 
          email: authUser.user.email || '' 
        };
        
        console.log('Creating new user record:', newUser);
        
        try {
          const { data: insertedUser, error: insertError } = await supabase
            .from('users')
            .insert([newUser])
            .select()
            .single();
            
          if (insertError) {
            console.error('Error creating user record:', insertError);
            if (insertError.code === '23505') {
              console.log('Duplicate key error, trying to fetch existing user');
              // Email conflict - try to fetch user by email
              const { data: existingUser } = await supabase
                .from('users')
                .select('*')
                .eq('email', newUser.email)
                .maybeSingle();
                
              if (existingUser) {
                console.log('Found existing user by email:', existingUser);
                creatorId = existingUser.id;
              } else {
                return null;
              }
            } else {
              return null;
            }
          } else if (insertedUser) {
            console.log('Created new user:', insertedUser);
          }
        } catch (error) {
          console.error('Error in user creation:', error);
          return null;
        }
      }
    }
    
    // Double-check that user exists
    const { data: finalUserCheck } = await supabase
      .from('users')
      .select('id')
      .eq('id', creatorId)
      .maybeSingle();
      
    if (!finalUserCheck) {
      console.error('Failed to ensure user exists in database');
      return null;
    }
    
    console.log('Confirmed user exists in users table, proceeding with group creation');
    
    // Generate join code
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
    
    console.log('Group created:', groupData);
    
    // Add creator as a member
    const { error: memberError } = await supabase
      .from('group_members')
      .insert([
        { group_id: groupData.id, user_id: creatorId }
      ]);
    
    if (memberError) {
      console.error('Error adding member to group:', memberError);
      // We could handle this better, but for now just return the group
    } else {
      console.log('Added creator as member to group');
    }
    
    // Return in the format our app expects
    return {
      id: groupData.id,
      name: groupData.name,
      creatorId: groupData.creator_id,
      members: [creatorId],
      joinCode: groupData.join_code
    };
  } catch (error) {
    console.error('Error in createGroup:', error);
    return null;
  }
};

export const joinGroup = async (joinCode: string, userId: string): Promise<Group | null> => {
  try {
    console.log('Joining group with code:', joinCode, 'for user:', userId);
    
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
    
    console.log('Found group:', groupData);
    
    // Check if user exists in the users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    let actualUserId = userId;
    
    if (!userData) {
      console.log('User not found in users table, checking auth');
      const { data: authUser } = await supabase.auth.getUser();
      
      if (!authUser || !authUser.user) {
        console.error('Auth user not found');
        return null;
      }
      
      if (authUser.user.email) {
        // First check if user exists with same email
        const { data: emailUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', authUser.user.email)
          .maybeSingle();
        
        if (emailUser) {
          console.log('Found user with same email:', emailUser);
          actualUserId = emailUser.id;
        } else {
          try {
            // Create new user record
            const newUser = { 
              id: actualUserId, 
              name: authUser.user.email.split('@')[0], 
              email: authUser.user.email 
            };
            
            console.log('Creating new user record:', newUser);
            
            const { data: insertedUser, error: insertError } = await supabase
              .from('users')
              .insert([newUser])
              .select()
              .single();
              
            if (insertError) {
              console.error('Error creating user record:', insertError);
              if (insertError.code === '23505') {
                console.log('Duplicate key error, trying to fetch existing user');
                // Email conflict - try to fetch user by email
                const { data: existingUser } = await supabase
                  .from('users')
                  .select('*')
                  .eq('email', newUser.email)
                  .maybeSingle();
                  
                if (existingUser) {
                  console.log('Found existing user by email:', existingUser);
                  actualUserId = existingUser.id;
                } else {
                  return null;
                }
              } else {
                return null;
              }
            } else if (insertedUser) {
              console.log('Created new user:', insertedUser);
            }
          } catch (error) {
            console.error('Error handling user record:', error);
            return null;
          }
        }
      } else {
        return null;
      }
    } else {
      console.log('User found:', userData);
    }
    
    // Double-check that user exists
    const { data: finalUserCheck } = await supabase
      .from('users')
      .select('id')
      .eq('id', actualUserId)
      .maybeSingle();
      
    if (!finalUserCheck) {
      console.error('Failed to ensure user exists in database');
      return null;
    }
    
    // Check if user is already a member
    const { data: existingMember, error: memberCheckError } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', groupData.id)
      .eq('user_id', actualUserId);
    
    if (memberCheckError) {
      console.error('Error checking membership:', memberCheckError);
    }
    
    if (!existingMember || existingMember.length === 0) {
      console.log('Adding user to group as new member');
      // Add user to group
      const { error: memberError } = await supabase
        .from('group_members')
        .insert([
          { group_id: groupData.id, user_id: actualUserId }
        ]);
      
      if (memberError) {
        console.error('Error adding member to group:', memberError);
        return null;
      }
      
      console.log('User successfully added to group');
    } else {
      console.log('User is already a member of this group');
    }
    
    // Get all members of the group
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupData.id);
    
    if (membersError) {
      console.error('Error fetching group members:', membersError);
    }
    
    const memberIds = members ? members.map(m => m.user_id) : [actualUserId];
    
    // Return in the format our app expects
    return {
      id: groupData.id,
      name: groupData.name,
      creatorId: groupData.creator_id,
      members: memberIds,
      joinCode: groupData.join_code
    };
  } catch (error) {
    console.error('Error in joinGroup:', error);
    return null;
  }
};

export const getUserGroups = async (userId: string): Promise<Group[]> => {
  try {
    console.log('Getting user groups for:', userId);
    
    // First, ensure the user exists in the users table
    const { data: userCheck } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    if (!userCheck) {
      // Try to get current user from auth
      const { data: authData } = await supabase.auth.getUser();
      
      if (authData?.user && authData.user.id === userId) {
        console.log('User exists in auth but not in users table, creating record');
        
        // First check if user exists with same email
        const { data: emailUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', authData.user.email)
          .maybeSingle();
        
        if (emailUser) {
          console.log('Found user with same email:', emailUser);
          userId = emailUser.id;
        } else {
          try {
            // Create user record
            const newUser = {
              id: userId,
              name: authData.user.email ? authData.user.email.split('@')[0] : 'User',
              email: authData.user.email || ''
            };
            
            const { data: insertedUser, error: insertError } = await supabase
              .from('users')
              .insert([newUser])
              .select()
              .single();
              
            if (insertError) {
              console.error('Error creating missing user:', insertError);
              if (insertError.code === '23505') {
                // Email conflict - try to fetch user by email
                const { data: existingUser } = await supabase
                  .from('users')
                  .select('*')
                  .eq('email', newUser.email)
                  .maybeSingle();
                  
                if (existingUser) {
                  userId = existingUser.id;
                } else {
                  return [];
                }
              } else {
                return [];
              }
            }
          } catch (error) {
            console.error('Error creating missing user:', error);
            return [];
          }
        }
      } else {
        return [];
      }
    }
    
    // Double-check user exists now
    const { data: finalUserCheck } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
      
    if (!finalUserCheck) {
      console.error('Failed to ensure user exists in database');
      return [];
    }
    
    // Get all group_ids where user is a member
    const { data: membershipData, error: membershipError } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId);
    
    if (membershipError) {
      console.error('Error fetching group memberships:', membershipError);
      return [];
    }
    
    if (!membershipData || membershipData.length === 0) {
      console.log('No group memberships found for user:', userId);
      
      // As a fallback, check if user is a creator of any groups
      const { data: createdGroups, error: createdError } = await supabase
        .from('groups')
        .select('*')
        .eq('creator_id', userId);
      
      if (createdError) {
        console.error('Error fetching created groups:', createdError);
        return [];
      }
      
      if (!createdGroups || createdGroups.length === 0) {
        console.log('No created groups found for user');
        return [];
      }
      
      console.log('Found groups where user is creator:', createdGroups);
      
      // For each group where user is creator, ensure they are also a member
      const groups: Group[] = [];
      
      for (const group of createdGroups) {
        // Check if user is already a member
        const { data: existingMember } = await supabase
          .from('group_members')
          .select('*')
          .eq('group_id', group.id)
          .eq('user_id', userId)
          .maybeSingle();
        
        // If not a member, add them
        if (!existingMember) {
          console.log('Adding creator as member for group:', group.id);
          await supabase
            .from('group_members')
            .insert({ group_id: group.id, user_id: userId });
        }
        
        groups.push({
          id: group.id,
          name: group.name,
          creatorId: group.creator_id,
          members: [userId], // Just the creator for now
          joinCode: group.join_code
        });
      }
      
      return groups;
    }
    
    const groupIds = membershipData.map(m => m.group_id);
    console.log('Found group IDs from memberships:', groupIds);
    
    // Get all groups
    const { data: groupsData, error: groupsError } = await supabase
      .from('groups')
      .select('*')
      .in('id', groupIds);
    
    if (groupsError) {
      console.error('Error fetching groups:', groupsError);
      return [];
    }
    
    if (!groupsData || groupsData.length === 0) {
      console.log('No groups found for the membership IDs');
      return [];
    }
    
    console.log('Fetched groups data:', groupsData);
    
    // Get members for each group
    const groups: Group[] = [];
    
    for (const group of groupsData) {
      const { data: groupMembers, error: membersError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', group.id);
      
      if (membersError) {
        console.error('Error fetching group members:', membersError);
        continue;
      }
      
      const memberIds = groupMembers ? groupMembers.map(m => m.user_id) : [];
      
      groups.push({
        id: group.id,
        name: group.name,
        creatorId: group.creator_id,
        members: memberIds,
        joinCode: group.join_code
      });
    }
    
    console.log('Processed groups with members:', groups);
    return groups;
  } catch (error) {
    console.error('Unexpected error in getUserGroups:', error);
    return [];
  }
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
