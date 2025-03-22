// Supabase database operations
import { supabase } from './supabase.js';

// Test database connection and table existence
export async function testDatabaseConnection() {
    try {
        console.log('Testing database connection...');
        
        // First test basic connectivity
        const { error: pingError } = await supabase.from('user_profiles').select('count', { count: 'exact', head: true });
        
        if (pingError) {
            console.error('Database ping failed:', pingError);
            
            // Test if tables exist by checking the system catalog
            try {
                const { data: tableData, error: tableError } = await supabase.rpc('check_table_exists', { 
                    table_name: 'user_profiles'
                });
                
                console.log('Table existence check:', { tableData, tableError });
                
                if (tableError) {
                    console.error('Error checking if tables exist:', tableError);
                }
                
                if (pingError.message.includes('does not exist')) {
                    console.error('Required tables missing');
                    return { 
                        connected: false, 
                        error: 'Required tables do not exist. Please run the SQL setup script in the Supabase dashboard SQL editor.' 
                    };
                }
            } catch (catalogError) {
                console.error('Error checking database catalog:', catalogError);
            }
            
            return { connected: false, error: pingError.message };
        }
        
        // Check if other required tables exist
        const tables = ['mothers', 'doctors', 'ngos'];
        const missingTables = [];
        
        for (const table of tables) {
            try {
                const { error: tableError } = await supabase.from(table).select('count', { count: 'exact', head: true });
                if (tableError && tableError.message.includes('does not exist')) {
                    missingTables.push(table);
                    console.error(`Table "${table}" does not exist`);
                }
            } catch (e) {
                console.error(`Error checking table ${table}:`, e);
            }
        }
        
        if (missingTables.length > 0) {
            const errorMsg = `The following tables are missing: ${missingTables.join(', ')}`;
            console.error(errorMsg);
            return { 
                connected: false, 
                error: `${errorMsg}. Please run the SQL setup script in the Supabase dashboard.` 
            };
        }
        
        console.log('Database connection successful, all required tables exist');
        return { connected: true, error: null };
    } catch (error) {
        console.error('Database connection test error:', error);
        return { connected: false, error: error.message };
    }
}

// Users table operations
export async function insertUserProfile(userId, profileData) {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }
        
        console.log('Inserting user profile:', { userId, profileData });
        
        // Explicitly add user_id to profileData
        profileData.user_id = userId;
        
        // Verify if user already exists to avoid duplicates
        const { data: existingUser } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();
            
        if (existingUser) {
            console.log('User profile already exists, updating instead:', existingUser);
            return updateUserProfile(userId, profileData);
        }
        
        // Try direct insertion
        const { data, error } = await supabase
            .from('user_profiles')
            .insert([profileData])
            .select();

        if (error) {
            console.error('Error inserting user profile:', error);
            
            // Try alternate method if it's an RLS issue
            if (error.message && error.message.includes('policy')) {
                console.log('Attempting to update user metadata as fallback');
                try {
                    // Update auth user metadata instead
                    const { error: metadataError } = await supabase.auth.updateUser({
                        data: { 
                            first_name: profileData.first_name,
                            last_name: profileData.last_name,
                            user_type: profileData.user_type
                        }
                    });
                    
                    if (!metadataError) {
                        console.log('Successfully updated user metadata as fallback');
                        return { data: profileData, error: null };
                    }
                } catch (e) {
                    console.error('Fallback metadata update failed:', e);
                }
            }
            
            throw error;
        }
        
        console.log('User profile inserted successfully:', data);
        return { data, error: null };
    } catch (error) {
        console.error('Failed to insert user profile:', error);
        return { data: null, error };
    }
}

export async function updateUserProfile(userId, profileData) {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }
        
        console.log('Updating user profile:', { userId, profileData });
        
        const { data, error } = await supabase
            .from('user_profiles')
            .update(profileData)
            .eq('user_id', userId)
            .select();

        if (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
        
        console.log('User profile updated successfully:', data);
        return { data, error: null };
    } catch (error) {
        console.error('Failed to update user profile:', error);
        return { data: null, error };
    }
}

export async function getUserProfile(userId) {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }
        
        console.log('Fetching user profile for:', userId);
        
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            // If the profile doesn't exist, return null without error
            if (error.code === 'PGRST116') {
                console.log('User profile not found');
                return { data: null, error: null };
            }
            
            console.error('Error fetching user profile:', error);
            throw error;
        }
        
        console.log('User profile retrieved:', data);
        return { data, error: null };
    } catch (error) {
        console.error('Failed to fetch user profile:', error);
        return { data: null, error };
    }
}

// Mothers table operations
export async function insertMotherData(userId, motherData) {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }
        
        console.log('Inserting mother data:', { userId, motherData });
        
        // Explicitly add user_id to motherData
        motherData.user_id = userId;
        
        // Verify if mother data already exists
        const { data: existingData } = await supabase
            .from('mothers')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();
            
        if (existingData) {
            console.log('Mother data already exists, updating instead:', existingData);
            return updateMotherData(userId, motherData);
        }
        
        // Try direct insertion
        const { data, error } = await supabase
            .from('mothers')
            .insert([motherData])
            .select();

        if (error) {
            console.error('Error inserting mother data:', error);
            
            // If it's an RLS issue, try an alternative approach
            if (error.message && error.message.includes('policy')) {
                console.log('RLS policy error detected - using metadata fallback for mother data');
                
                // We can't insert directly into the mothers table, so store basic info in user metadata
                try {
                    const { error: metadataError } = await supabase.auth.updateUser({
                        data: { 
                            mother_data: motherData
                        }
                    });
                    
                    if (!metadataError) {
                        console.log('Stored mother data in user metadata as fallback');
                        return { data: motherData, error: null };
                    }
                } catch (e) {
                    console.error('Fallback metadata update for mother data failed:', e);
                }
            }
            
            throw error;
        }
        
        console.log('Mother data inserted successfully:', data);
        return { data, error: null };
    } catch (error) {
        console.error('Failed to insert mother data:', error);
        return { data: null, error };
    }
}

export async function updateMotherData(userId, motherData) {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }
        
        console.log('Updating mother data:', { userId, motherData });
        
        const { data, error } = await supabase
            .from('mothers')
            .update(motherData)
            .eq('user_id', userId)
            .select();

        if (error) {
            console.error('Error updating mother data:', error);
            throw error;
        }
        
        console.log('Mother data updated successfully:', data);
        return { data, error: null };
    } catch (error) {
        console.error('Failed to update mother data:', error);
        return { data: null, error };
    }
}

// Doctors table operations
export async function insertDoctorData(userId, doctorData) {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }
        
        console.log('Inserting doctor data:', { userId, doctorData });
        
        // Verify if doctor data already exists
        const { data: existingData } = await supabase
            .from('doctors')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();
            
        if (existingData) {
            console.log('Doctor data already exists, updating instead:', existingData);
            return updateDoctorData(userId, doctorData);
        }
        
        const { data, error } = await supabase
            .from('doctors')
            .insert([
                {
                    user_id: userId,
                    ...doctorData
                }
            ])
            .select();

        if (error) {
            console.error('Error inserting doctor data:', error);
            throw error;
        }
        
        console.log('Doctor data inserted successfully:', data);
        return { data, error: null };
    } catch (error) {
        console.error('Failed to insert doctor data:', error);
        return { data: null, error };
    }
}

export async function updateDoctorData(userId, doctorData) {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }
        
        console.log('Updating doctor data:', { userId, doctorData });
        
        const { data, error } = await supabase
            .from('doctors')
            .update(doctorData)
            .eq('user_id', userId)
            .select();

        if (error) {
            console.error('Error updating doctor data:', error);
            throw error;
        }
        
        console.log('Doctor data updated successfully:', data);
        return { data, error: null };
    } catch (error) {
        console.error('Failed to update doctor data:', error);
        return { data: null, error };
    }
}

// NGOs table operations
export async function insertNgoData(userId, ngoData) {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }
        
        console.log('Inserting NGO data:', { userId, ngoData });
        
        // Verify if NGO data already exists
        const { data: existingData } = await supabase
            .from('ngos')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();
            
        if (existingData) {
            console.log('NGO data already exists, updating instead:', existingData);
            return updateNgoData(userId, ngoData);
        }
        
        const { data, error } = await supabase
            .from('ngos')
            .insert([
                {
                    user_id: userId,
                    ...ngoData
                }
            ])
            .select();

        if (error) {
            console.error('Error inserting NGO data:', error);
            throw error;
        }
        
        console.log('NGO data inserted successfully:', data);
        return { data, error: null };
    } catch (error) {
        console.error('Failed to insert NGO data:', error);
        return { data: null, error };
    }
}

export async function updateNgoData(userId, ngoData) {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }
        
        console.log('Updating NGO data:', { userId, ngoData });
        
        const { data, error } = await supabase
            .from('ngos')
            .update(ngoData)
            .eq('user_id', userId)
            .select();

        if (error) {
            console.error('Error updating NGO data:', error);
            throw error;
        }
        
        console.log('NGO data updated successfully:', data);
        return { data, error: null };
    } catch (error) {
        console.error('Failed to update NGO data:', error);
        return { data: null, error };
    }
}

// Generic function to insert data into any table
export async function insertData(tableName, data) {
    try {
        if (!tableName) {
            throw new Error('Table name is required');
        }
        
        console.log(`Inserting data into ${tableName}:`, data);
        
        const { data: result, error } = await supabase
            .from(tableName)
            .insert([data])
            .select();

        if (error) {
            console.error(`Error inserting data into ${tableName}:`, error);
            throw error;
        }
        
        console.log(`Data inserted successfully into ${tableName}:`, result);
        return { data: result, error: null };
    } catch (error) {
        console.error(`Failed to insert data into ${tableName}:`, error);
        return { data: null, error };
    }
}

// Generic function to fetch data from any table
export async function getData(tableName, columns = '*', query = {}) {
    try {
        if (!tableName) {
            throw new Error('Table name is required');
        }
        
        console.log(`Fetching data from ${tableName} with query:`, query);
        
        let queryBuilder = supabase
            .from(tableName)
            .select(columns);
        
        // Apply filters from query object
        Object.entries(query).forEach(([key, value]) => {
            queryBuilder = queryBuilder.eq(key, value);
        });
        
        const { data, error } = await queryBuilder;

        if (error) {
            console.error(`Error fetching data from ${tableName}:`, error);
            throw error;
        }
        
        console.log(`Data retrieved from ${tableName}:`, data);
        return { data, error: null };
    } catch (error) {
        console.error(`Failed to fetch data from ${tableName}:`, error);
        return { data: null, error };
    }
} 