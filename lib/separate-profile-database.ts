// Weather Smart: Enhanced Supabase Service with Separate Profile Databases
// This service handles both the legacy shared database and new separate database approach

import { supabase } from './supabase'
import type { WardrobeItem, WardrobeProfile } from './supabase'

export interface ProfileDatabase {
  id: string
  profile_id: string
  database_name: string
  connection_string?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProfileDatabaseSummary {
  profile_id: string
  profile_name: string
  relation?: string
  owner_user_id: string
  schema_name?: string
  is_active?: boolean
  schema_created_at?: string
  has_wardrobe_table: number
}

export const separateProfileDatabaseService = {
  /**
   * Check if separate database feature is available
   */
  async isSeparateDatabaseFeatureAvailable(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profile_databases')
        .select('count')
        .limit(1)
      
      return !error
    } catch (error) {
      console.log('Separate database feature not available yet:', error)
      return false
    }
  },

  /**
   * Create a separate database schema for a profile
   */
  async createSeparateDatabase(profileId: string, profileName: string): Promise<{ success: boolean; schemaName?: string; error?: string }> {
    try {
      console.log(`Creating separate database for profile: ${profileName} (${profileId})`)
      
      // Call the database function to create the schema
      const { data, error } = await supabase.rpc('create_profile_wardrobe_schema', {
        profile_id_param: profileId,
        profile_name_param: profileName
      })

      if (error) {
        console.error('Error creating separate database:', error)
        return { success: false, error: error.message }
      }

      console.log(`Successfully created schema: ${data}`)
      return { success: true, schemaName: data }
    } catch (error) {
      console.error('Error in createSeparateDatabase:', error)
      return { success: false, error: 'Failed to create separate database' }
    }
  },

  /**
   * Migrate existing profile data to separate database
   */
  async migrateProfileToSeparateDatabase(profileId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      console.log(`Migrating profile ${profileId} to separate database`)
      
      // Call the migration function
      const { data, error } = await supabase.rpc('migrate_profile_to_separate_database', {
        profile_id_param: profileId
      })

      if (error) {
        console.error('Error migrating profile:', error)
        return { success: false, error: error.message }
      }

      console.log(`Migration result: ${data}`)
      return { success: true, message: data }
    } catch (error) {
      console.error('Error in migrateProfileToSeparateDatabase:', error)
      return { success: false, error: 'Failed to migrate profile data' }
    }
  },

  /**
   * Get the schema name for a profile's separate database
   */
  async getProfileSchemaName(profileId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('get_profile_schema_name', {
        profile_id_param: profileId
      })

      if (error) {
        console.error('Error getting profile schema name:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getProfileSchemaName:', error)
      return null
    }
  },

  /**
   * Get all profile database information
   */
  async getProfileDatabaseSummary(userId: string): Promise<ProfileDatabaseSummary[]> {
    try {
      const { data, error } = await supabase
        .from('profile_database_summary')
        .select('*')
        .eq('owner_user_id', userId)

      if (error) {
        console.error('Error getting profile database summary:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getProfileDatabaseSummary:', error)
      return []
    }
  },

  /**
   * Get wardrobe items from a profile's separate database
   */
  async getProfileWardrobeItems(profileId: string, schemaName: string): Promise<WardrobeItem[]> {
    try {
      console.log(`Fetching wardrobe items from schema: ${schemaName}`)
      
      // Query the profile-specific schema
      const { data, error } = await supabase
        .from(`${schemaName}.wardrobe_items`)
        .select(`
          *,
          category:categories(*),
          tags:${schemaName}.wardrobe_item_tags(
            tag:tags(*)
          )
        `)
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error(`Error fetching items from ${schemaName}:`, error)
        return []
      }

      console.log(`Successfully fetched ${data?.length || 0} items from ${schemaName}`)
      return data || []
    } catch (error) {
      console.error('Error in getProfileWardrobeItems:', error)
      return []
    }
  },

  /**
   * Add wardrobe item to a profile's separate database
   */
  async addProfileWardrobeItem(
    profileId: string, 
    schemaName: string, 
    item: Omit<WardrobeItem, 'id' | 'created_at' | 'updated_at'>
  ): Promise<WardrobeItem | null> {
    try {
      console.log(`Adding wardrobe item to schema: ${schemaName}`)
      
      const itemData = {
        ...item,
        profile_id: profileId
      }

      const { data, error } = await supabase
        .from(`${schemaName}.wardrobe_items`)
        .insert([itemData])
        .select()
        .single()

      if (error) {
        console.error(`Error adding item to ${schemaName}:`, error)
        return null
      }

      console.log(`Successfully added item to ${schemaName}`)
      return data
    } catch (error) {
      console.error('Error in addProfileWardrobeItem:', error)
      return null
    }
  },

  /**
   * Update wardrobe item in a profile's separate database
   */
  async updateProfileWardrobeItem(
    schemaName: string,
    itemId: string,
    updates: Partial<WardrobeItem>
  ): Promise<WardrobeItem | null> {
    try {
      const { data, error } = await supabase
        .from(`${schemaName}.wardrobe_items`)
        .update(updates)
        .eq('id', itemId)
        .select()
        .single()

      if (error) {
        console.error(`Error updating item in ${schemaName}:`, error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in updateProfileWardrobeItem:', error)
      return null
    }
  },

  /**
   * Delete wardrobe item from a profile's separate database
   */
  async deleteProfileWardrobeItem(schemaName: string, itemId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(`${schemaName}.wardrobe_items`)
        .delete()
        .eq('id', itemId)

      if (error) {
        console.error(`Error deleting item from ${schemaName}:`, error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteProfileWardrobeItem:', error)
      return false
    }
  },

  /**
   * Check if a profile has a separate database
   */
  async profileHasSeparateDatabase(profileId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profile_databases')
        .select('id')
        .eq('profile_id', profileId)
        .eq('is_active', true)
        .single()

      return !error && !!data
    } catch (error) {
      return false
    }
  },

  /**
   * Get profile database info
   */
  async getProfileDatabase(profileId: string): Promise<ProfileDatabase | null> {
    try {
      const { data, error } = await supabase
        .from('profile_databases')
        .select('*')
        .eq('profile_id', profileId)
        .eq('is_active', true)
        .single()

      if (error) {
        return null
      }

      return data
    } catch (error) {
      return null
    }
  },

  /**
   * Deactivate a profile's separate database (soft delete)
   */
  async deactivateProfileDatabase(profileId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profile_databases')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('profile_id', profileId)

      return !error
    } catch (error) {
      console.error('Error deactivating profile database:', error)
      return false
    }
  }
}

// Enhanced wardrobe service that can work with both shared and separate databases
export const enhancedWardrobeService = {
  /**
   * Get wardrobe items for a profile, automatically detecting if it uses separate database
   */
  async getWardrobeItems(userId: string, profileId?: string): Promise<WardrobeItem[]> {
    try {
      // Check if separate database feature is available
      const separateDbAvailable = await separateProfileDatabaseService.isSeparateDatabaseFeatureAvailable()
      
      if (!separateDbAvailable || !profileId) {
        // Fall back to original shared database approach
        const { wardrobeService } = await import('./supabase')
        return wardrobeService.getWardrobeItems(userId, profileId)
      }

      // Check if this profile has a separate database
      const profileDb = await separateProfileDatabaseService.getProfileDatabase(profileId)
      
      if (profileDb) {
        // Use separate database
        console.log(`Using separate database for profile ${profileId}: ${profileDb.database_name}`)
        return separateProfileDatabaseService.getProfileWardrobeItems(profileId, profileDb.database_name)
      } else {
        // Fall back to shared database
        console.log(`Using shared database for profile ${profileId}`)
        const { wardrobeService } = await import('./supabase')
        return wardrobeService.getWardrobeItems(userId, profileId)
      }
    } catch (error) {
      console.error('Error in enhancedWardrobeService.getWardrobeItems:', error)
      return []
    }
  },

  /**
   * Add wardrobe item, automatically routing to correct database
   */
  async addWardrobeItem(item: Omit<WardrobeItem, 'id' | 'created_at' | 'updated_at'>): Promise<WardrobeItem | null> {
    try {
      const separateDbAvailable = await separateProfileDatabaseService.isSeparateDatabaseFeatureAvailable()
      
      if (!separateDbAvailable || !item.wardrobe_profile_id) {
        // Use shared database
        const { wardrobeService } = await import('./supabase')
        return wardrobeService.addWardrobeItem(item)
      }

      // Check if profile has separate database
      const profileDb = await separateProfileDatabaseService.getProfileDatabase(item.wardrobe_profile_id)
      
      if (profileDb) {
        // Use separate database
        return separateProfileDatabaseService.addProfileWardrobeItem(
          item.wardrobe_profile_id,
          profileDb.database_name,
          item
        )
      } else {
        // Use shared database
        const { wardrobeService } = await import('./supabase')
        return wardrobeService.addWardrobeItem(item)
      }
    } catch (error) {
      console.error('Error in enhancedWardrobeService.addWardrobeItem:', error)
      return null
    }
  }
}
