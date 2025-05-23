import { supabase } from "@/integrations/supabase/client";
import { fetchSkiDestinations } from "./apiService";
import type { User, Group, Trip, Participant, Destination, SkiResort, HotelAccommodation, Vote } from "@/types";

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

export const signInWithMagicLink = async (email: string): Promise<void> => {
  try {
    // Verify that email is not empty
    if (!email) {
      throw new Error("Email is required");
    }
    
    // Send the magic link to the user's email
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      }
    });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error sending magic link:", error);
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
          
          // First check if user exists with same email
          const { data: emailUser } = await supabase
            .from("users")
            .select("*")
            .eq("email", authUser.email)
            .maybeSingle();
            
          if (emailUser) {
            console.log('Found user with same email:', emailUser);
            return emailUser;
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
          } catch (error) {
            console.error("Error creating user record:", error);
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
      
      // Also add user to trip participants if trip exists
      const { data: tripData } = await supabase
        .from('trips')
        .select('id')
        .eq('group_id', groupData.id)
        .maybeSingle();
        
      if (tripData) {
        console.log('Found trip for group, adding user as participant');
        const { error: participantError } = await supabase
          .from('participants')
          .insert([
            { 
              trip_id: tripData.id, 
              user_id: actualUserId,
              status: 'pending',
              payment_status: 'not_paid'
            }
          ]);
          
        if (participantError) {
          console.error('Error adding user as participant:', participantError);
        }
      }
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
    console.error('No members found for group:', groupId);
    return null;
  }
  
  const memberIds = groupMembers.map(m => m.user_id);
  console.log('Creating trip with members:', memberIds);
  
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
  // First check if the participant record exists
  const { data: existingParticipant, error: checkError } = await supabase
    .from('participants')
    .select('*')
    .eq('trip_id', tripId)
    .eq('user_id', userId)
    .maybeSingle();
    
  if (checkError) {
    console.error('Error checking for existing participant:', JSON.stringify(checkError, null, 2));
    return null;
  }
  
  // If no participant record exists, create one with the requested status
  if (!existingParticipant) {
    console.log(`No participant record found for user ${userId} in trip ${tripId}. Creating one now.`);
    const { error: insertError } = await supabase
      .from('participants')
      .insert([{
        trip_id: tripId,
        user_id: userId,
        status: status,
        payment_status: 'not_paid'
      }]);
      
    if (insertError) {
      console.error('Error creating participant record:', JSON.stringify(insertError, null, 2));
      return null;
    }
    
    console.log(`Successfully created participant record with status: ${status}`);
    // After creating, fetch the complete trip data
    return getTripByTripId(tripId);
  }
  
  // If participant record exists, update it
  const { data: updatedParticipant, error: updateError } = await supabase
    .from('participants')
    .update({ status })
    .eq('trip_id', tripId)
    .eq('user_id', userId)
    .select(); // Request the updated row(s)

  if (updateError) {
    console.error('Error updating participant status (raw):', JSON.stringify(updateError, null, 2));
    return null;
  }

  if (!updatedParticipant || updatedParticipant.length === 0) {
    console.warn('Participant status update did not return any updated rows. This might indicate an RLS issue or a non-matching condition.');
  } else {
    console.log('Participant status updated successfully in DB, returned:', updatedParticipant);
  }

  // Fetch the entire updated trip object by its ID
  return getTripByTripId(tripId);
};

export const updateParticipantPaymentStatus = async (
  tripId: string,
  userId: string,
  paymentStatus: Participant['paymentStatus'],
  amount?: number
): Promise<Trip | null> => {
  // First check if the participant record exists
  const { data: existingParticipant, error: checkError } = await supabase
    .from('participants')
    .select('*')
    .eq('trip_id', tripId)
    .eq('user_id', userId)
    .maybeSingle();
    
  if (checkError) {
    console.error('Error checking for existing participant:', JSON.stringify(checkError, null, 2));
    return null;
  }
  
  // If no participant record exists, create one with the requested payment status
  if (!existingParticipant) {
    console.log(`No participant record found for user ${userId} in trip ${tripId}. Creating one now.`);
    const { error: insertError } = await supabase
      .from('participants')
      .insert([{
        trip_id: tripId,
        user_id: userId,
        status: 'pending', // Default status
        payment_status: paymentStatus
      }]);
      
    if (insertError) {
      console.error('Error creating participant record:', JSON.stringify(insertError, null, 2));
      return null;
    }
    
    // After creating, fetch the complete trip data
    return getTripByTripId(tripId);
  }
  
  // If participant record exists, update it
  const updateData: any = { payment_status: paymentStatus };
  if (amount !== undefined) updateData.payment_amount = amount;

  const { data: updatedParticipant, error: updateError } = await supabase
    .from('participants')
    .update(updateData)
    .eq('trip_id', tripId)
    .eq('user_id', userId)
    .select(); // Request the updated row(s)

  if (updateError) {
    console.error('Error updating payment status (raw):', JSON.stringify(updateError, null, 2));
    return null;
  }

  if (!updatedParticipant || updatedParticipant.length === 0) {
    console.warn('Participant payment status update did not return any updated rows. This might indicate an RLS issue or a non-matching condition.');
  } else {
    console.log('Participant payment status updated successfully in DB, returned:', updatedParticipant);
  }

  // Fetch the entire updated trip object by its ID
  return getTripByTripId(tripId);
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

export const getTripByTripId = async (tripId: string): Promise<Trip | null> => {
  const { data: tripData, error: tripError } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single();

  if (tripError || !tripData) {
    if (tripError) console.error(`Error fetching trip by ID ${tripId}:`, tripError);
    return null;
  }

  const { data: participantData, error: participantsError } = await supabase
    .from('participants')
    .select('*')
    .eq('trip_id', tripData.id);

  if (participantsError) {
    console.error(`Error fetching participants for trip ${tripId}:`, participantsError);
    // Optionally, decide if this is a critical error or if you can return partial data
    // For now, we'll continue and return the trip with potentially empty/stale participants if this call fails
  }

  const formattedParticipants: Participant[] = participantData
    ? participantData.map(p => ({
        userId: p.user_id,
        status: p.status as Participant['status'],
        paymentStatus: p.payment_status as Participant['paymentStatus'],
        paymentAmount: p.payment_amount,
      }))
    : [];

  return {
    id: tripData.id,
    groupId: tripData.group_id,
    selectedDestinationId: tripData.selected_destination_id || "",
    participants: formattedParticipants,
    status: tripData.status as Trip['status'],
  };
};

// Destination methods
export const getAllDestinations = async (): Promise<Destination[]> => {
  try {
    // During development, prefer to fetch from API to see real data
    console.log('Fetching destinations from API');
    const apiDestinations = await fetchSkiDestinations();
    
    // Add console log to show what we're returning
    console.log(`Returning ${apiDestinations.length} destinations from API`);
    return apiDestinations;
    
    /* Commented out database check for now to ensure we're using API data
    const { data, error } = await supabase
      .from('destinations')
      .select('*');
    
    if (error) {
      console.error('Error fetching destinations:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log('No destinations found in database, fetching from API');
      return await fetchSkiDestinations();
    }
    
    // Transform the database format to the new model
    return data.map(d => {
      // Create a SkiResort object
      const resort: SkiResort = {
        id: `resort-${d.id}`,
        name: d.name,
        location: d.location,
        description: d.description || '',
        image: d.image || '',
        difficulty: d.difficulty as 'beginner' | 'intermediate' | 'advanced'
      };
      
      // Create a HotelAccommodation object (using basic info from the DB)
      const accommodation: HotelAccommodation = {
        id: `acc-${d.id}`,
        name: `${d.name} Lodging`,
        description: `Accommodation at ${d.name}`,
        image: d.image || '',
        price: d.price * 0.7, // 70% of the total price is accommodation
        amenities: d.amenities || []
      };
      
      // Create the full destination package
      return {
        id: d.id,
        resort,
        accommodation,
        price: d.price,
        dates: {
          start: d.start_date,
          end: d.end_date
        }
      };
    });
    */
  } catch (error) {
    console.error('Error in getAllDestinations:', error);
    return await fetchSkiDestinations();
  }
};

export const getDestinationById = async (id: string): Promise<Destination | null> => {
  try {
    console.log(`Getting destination by ID: ${id}`);
    
    // For client-side IDs (pkg-resort-X-...), fetch from API
    if (id.startsWith('pkg-resort-')) {
      // Extract the resort number
      const resortMatch = id.match(/pkg-resort-(\d+)/);
      if (!resortMatch || !resortMatch[1]) {
        console.error(`Invalid destination ID format: ${id}`);
        return null;
      }
      
      const resortNumber = parseInt(resortMatch[1]);
      console.log(`Looking for destination with resort number: ${resortNumber}`);
      
      // Fetch all destinations from API
      const allDestinations = await fetchSkiDestinations();
      
      // Try to find an exact match first
      const exactMatch = allDestinations.find(d => d.id === id);
      if (exactMatch) {
        console.log(`Found exact match for destination ID: ${id}`);
        return exactMatch;
      }
      
      // If no exact match, find a destination with the same resort number
      const matchingDestinations = allDestinations.filter(d => {
        const match = d.id.match(/pkg-resort-(\d+)/);
        return match && parseInt(match[1]) === resortNumber;
      });
      
      if (matchingDestinations.length > 0) {
        console.log(`Found similar destination with resort number ${resortNumber}: ${matchingDestinations[0].id}`);
        return matchingDestinations[0];
      }
      
      console.log(`No matching destination found. Returning first available destination as fallback.`);
      return allDestinations.length > 0 ? allDestinations[0] : null;
    }
    
    // For database IDs, try the database first
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !data) {
        console.error('Error fetching destination from database:', error);
        throw error; // Will be caught by the outer catch
      }
      
      // Transform to the new model
      const resort: SkiResort = {
        id: `resort-${data.id}`,
        name: data.name,
        location: data.location,
        description: data.description || '',
        image: data.image || '',
        difficulty: data.difficulty as 'beginner' | 'intermediate' | 'advanced'
      };
      
      const accommodation: HotelAccommodation = {
        id: `acc-${data.id}`,
        name: `${data.name} Lodging`,
        description: `Accommodation at ${data.name}`,
        image: data.image || '',
        price: data.price * 0.7, // 70% of the total price is accommodation
        amenities: data.amenities || []
      };
      
      return {
        id: data.id,
        resort,
        accommodation,
        price: data.price,
        dates: {
          start: data.start_date,
          end: data.end_date
        }
      };
    } catch (dbError) {
      console.log('Falling back to API data for destination lookup');
      // Fallback to API
      const allDestinations = await fetchSkiDestinations();
      return allDestinations.length > 0 ? allDestinations[0] : null;
    }
  } catch (error) {
    console.error('Error in getDestinationById:', error);
    // Last resort fallback - return mock data
    const allDestinations = await fetchSkiDestinations();
    return allDestinations.length > 0 ? allDestinations[0] : null;
  }
};

// Voting methods
export const castVote = async (userId: string, destinationId: string): Promise<Vote> => {
  try {
    console.log(`castVote called with userId: ${userId}, destinationId: ${destinationId}`);
    
    console.log(`About to delete any existing votes for user: ${userId}`);
    
    // First delete any existing votes for this user
    const { error: deleteError } = await supabase
      .from('votes')
      .delete()
      .eq('user_id', userId);
      
    if (deleteError) {
      console.error('Error deleting existing vote:', JSON.stringify(deleteError, null, 2));
      throw deleteError;
    }
    
    console.log(`Successfully deleted any existing votes for user: ${userId}`);
    console.log(`About to insert new vote with destination_id: ${destinationId}`);

    // Create timestamp
    const timestamp = new Date().toISOString();

    // Store the client-side ID directly in the database
    const { data: insertedVote, error: insertError } = await supabase
      .from('votes')
      .insert([
        {
          user_id: userId,
          destination_id: destinationId,
          timestamp: timestamp
        }
      ])
      .select()
      .single();
      
    if (insertError || !insertedVote) {
      console.error('Error casting vote (inserting new vote):', JSON.stringify(insertError, null, 2));
      throw insertError || new Error('Failed to insert vote');
    }
    
    console.log(`Successfully inserted vote:`, insertedVote);
    
    // Return vote info with original destinationId
    return {
      userId,
      destinationId,
      timestamp: new Date(timestamp).getTime()
    };
  } catch (error) {
    console.error('Error in castVote:', error);
    throw error;
  }
};

export const getVotesByGroupId = async (groupId: string): Promise<Vote[]> => {
  try {
    console.log(`Getting votes for group: ${groupId}`);
    
    // Get all members of the group
    const { data: memberships, error: memberError } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId);
    
    if (memberError) {
      console.error('Error fetching group members:', memberError);
      return [];
    }
    
    if (!memberships || memberships.length === 0) {
      console.log(`No members found for group: ${groupId}`);
      return [];
    }
    
    const memberIds = memberships.map(m => m.user_id);
    console.log(`Found ${memberIds.length} members in group`);
    
    // Get all votes by these members
    const { data: votes, error } = await supabase
      .from('votes')
      .select('*')
      .in('user_id', memberIds);
    
    if (error) {
      console.error('Error getting votes:', error);
      return [];
    }
    
    if (!votes || votes.length === 0) {
      console.log(`No votes found for group members`);
      return [];
    }
    
    console.log(`Found ${votes.length} votes for group members:`, votes);
    
    // Simply map the vote data to our Vote interface
    const resultVotes = votes.map(vote => ({
      userId: vote.user_id,
      destinationId: vote.destination_id,
      timestamp: new Date(vote.timestamp).getTime()
    }));
    
    console.log(`Returning ${resultVotes.length} votes for group:`, resultVotes);
    return resultVotes;
  } catch (error) {
    console.error('Error in getVotesByGroupId:', error);
    return [];
  }
};

export const getUserVote = async (userId: string): Promise<Vote | null> => {
  try {
    console.log(`Getting vote for user: ${userId}`);
    
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(); // allow 0 rows without 406
      
    if (error) {
      console.error('Error fetching vote:', error);
      return null;
    }
    
    if (!data) {
      console.log(`No vote found for user: ${userId}`);
      return null;
    }
    
    console.log(`Found vote in database:`, data);
    
    // Simply use the client-side ID stored directly in the database
    return {
      userId: data.user_id,
      destinationId: data.destination_id,
      timestamp: new Date(data.timestamp).getTime()
    };
  } catch (error) {
    console.error('Error in getUserVote:', error);
    return null;
  }
};

export const finalizeVoting = async (groupId: string): Promise<Trip | null> => {
  try {
    // Get all votes for this group
    const votes = await getVotesByGroupId(groupId);
    
    if (votes.length === 0) {
      console.log('No votes found for group:', groupId);
      return null;
    }
    
    console.log('Finalizing votes:', votes);
    
    // Count votes for each destination
    const voteCounts: Record<string, number> = {};
    votes.forEach((vote) => {
      voteCounts[vote.destinationId] = (voteCounts[vote.destinationId] || 0) + 1;
    });
    
    console.log('Vote counts:', voteCounts);
    
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
      console.log('No winning destination found');
      return null;
    }
    
    console.log('Selected destination ID:', selectedDestinationId);
    
    // Get the trip for this group
    const { data: tripData } = await supabase
      .from('trips')
      .select('id')
      .eq('group_id', groupId)
      .single();
    
    if (!tripData) {
      console.log('No trip found for group:', groupId);
      return null;
    }
    
    console.log(`Updating trip ${tripData.id} with selected destination ${selectedDestinationId}`);
    
    // Verify the destination exists before updating the trip
    const destination = await getDestinationById(selectedDestinationId);
    if (!destination) {
      console.error(`Could not find destination with ID: ${selectedDestinationId}`);
      // Continue anyway with the client ID, as our getDestinationById can now handle client IDs
    }
    
    // Update the trip with the client-side destination ID
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
  } catch (error) {
    console.error('Error in finalizeVoting:', error);
    return null;
  }
};

// Add a new function to get user by ID
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (error || !data) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
    
    return data as User;
  } catch (error) {
    console.error('Error in getUserById:', error);
    return null;
  }
};
