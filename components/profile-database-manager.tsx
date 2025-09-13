"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Database, 
  Users, 
  Shield, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { wardrobeProfileService } from '@/lib/supabase'
import { 
  separateProfileDatabaseService, 
  enhancedWardrobeService,
  type ProfileDatabaseSummary 
} from '@/lib/separate-profile-database'
import type { WardrobeProfile } from '@/lib/supabase'

interface ProfileDatabaseManagerProps {
  onDatabaseCreated?: () => void
}

export default function ProfileDatabaseManager({ onDatabaseCreated }: ProfileDatabaseManagerProps) {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<WardrobeProfile[]>([])
  const [profileSummaries, setProfileSummaries] = useState<ProfileDatabaseSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [featureAvailable, setFeatureAvailable] = useState(false)
  const [processingProfiles, setProcessingProfiles] = useState<Set<string>>(new Set())
  const [showMigrationDialog, setShowMigrationDialog] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<WardrobeProfile | null>(null)

  useEffect(() => {
    if (user) {
      checkFeatureAvailability()
      loadData()
    }
  }, [user])

  const checkFeatureAvailability = async () => {
    const available = await separateProfileDatabaseService.isSeparateDatabaseFeatureAvailable()
    setFeatureAvailable(available)
  }

  const loadData = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Load profiles
      const profilesData = await wardrobeProfileService.getWardrobeProfiles(user.id)
      setProfiles(profilesData || [])

      // Load profile database summaries if feature is available
      if (featureAvailable) {
        const summaries = await separateProfileDatabaseService.getProfileDatabaseSummary(user.id)
        setProfileSummaries(summaries)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSeparateDatabase = async (profile: WardrobeProfile) => {
    setProcessingProfiles(prev => new Set(prev).add(profile.id))
    
    try {
      // Create separate database schema
      const createResult = await separateProfileDatabaseService.createSeparateDatabase(
        profile.id, 
        profile.name
      )

      if (!createResult.success) {
        throw new Error(createResult.error || 'Failed to create database')
      }

      // Migrate existing data
      const migrateResult = await separateProfileDatabaseService.migrateProfileToSeparateDatabase(profile.id)
      
      if (!migrateResult.success) {
        console.warn('Database created but migration failed:', migrateResult.error)
      }

      // Reload data to show updated status
      await loadData()
      onDatabaseCreated?.()

      console.log(`Successfully created separate database for ${profile.name}`)
    } catch (error) {
      console.error('Error creating separate database:', error)
      alert(`Failed to create separate database for ${profile.name}: ${error}`)
    } finally {
      setProcessingProfiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(profile.id)
        return newSet
      })
    }
  }

  const handleDeactivateDatabase = async (profileId: string) => {
    if (!confirm('Are you sure you want to deactivate this separate database? The profile will revert to using the shared database.')) {
      return
    }

    setProcessingProfiles(prev => new Set(prev).add(profileId))
    
    try {
      const success = await separateProfileDatabaseService.deactivateProfileDatabase(profileId)
      
      if (success) {
        await loadData()
        console.log('Successfully deactivated separate database')
      } else {
        throw new Error('Failed to deactivate database')
      }
    } catch (error) {
      console.error('Error deactivating database:', error)
      alert(`Failed to deactivate database: ${error}`)
    } finally {
      setProcessingProfiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(profileId)
        return newSet
      })
    }
  }

  const getProfileSummary = (profileId: string): ProfileDatabaseSummary | undefined => {
    return profileSummaries.find(summary => summary.profile_id === profileId)
  }

  const getProfileStatus = (profile: WardrobeProfile) => {
    const summary = getProfileSummary(profile.id)
    
    if (summary?.schema_name && summary.is_active) {
      return {
        type: 'separate' as const,
        label: 'Separate Database',
        color: 'bg-green-500',
        icon: CheckCircle
      }
    } else {
      return {
        type: 'shared' as const,
        label: 'Shared Database',
        color: 'bg-blue-500',
        icon: Database
      }
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading profile database information...</span>
        </CardContent>
      </Card>
    )
  }

  if (!featureAvailable) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Separate Profile Databases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The separate profile database feature is not yet available. Please run the database migration script first.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Profile Database Management
          </CardTitle>
          <p className="text-sm text-gray-600">
            Manage separate databases for each family member's wardrobe data. This provides complete data isolation between profiles.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profiles.length === 0 ? (
              <Alert>
                <Users className="h-4 w-4" />
                <AlertDescription>
                  No additional profiles found. Create family member profiles first to set up separate databases.
                </AlertDescription>
              </Alert>
            ) : (
              profiles.map((profile) => {
                const status = getProfileStatus(profile)
                const summary = getProfileSummary(profile.id)
                const isProcessing = processingProfiles.has(profile.id)
                const StatusIcon = status.icon

                return (
                  <div key={profile.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                          {profile.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold">{profile.name}</h3>
                          <p className="text-sm text-gray-600">
                            {profile.relation} • {profile.age ? `${profile.age} years old` : 'Age not specified'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant="secondary" 
                          className={`${status.color} text-white flex items-center gap-1`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </Badge>
                        
                        {status.type === 'shared' ? (
                          <Button
                            onClick={() => handleCreateSeparateDatabase(profile)}
                            disabled={isProcessing}
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            {isProcessing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <ArrowRight className="w-4 h-4" />
                            )}
                            Create Separate Database
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleDeactivateDatabase(profile.id)}
                              disabled={isProcessing}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                              Deactivate
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {summary?.schema_name && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <div className="text-sm space-y-1">
                          <div><strong>Schema:</strong> {summary.schema_name}</div>
                          <div><strong>Created:</strong> {summary.schema_created_at ? new Date(summary.schema_created_at).toLocaleDateString() : 'Unknown'}</div>
                          <div><strong>Status:</strong> {summary.has_wardrobe_table > 0 ? 'Active' : 'Pending Setup'}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <Button
              onClick={loadData}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Benefits of Separate Databases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">✓ Complete Data Isolation</h4>
              <p className="text-gray-600">Each family member's wardrobe data is completely separate and private.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">✓ Independent Management</h4>
              <p className="text-gray-600">Family members can manage their own wardrobes without affecting others.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">✓ Better Performance</h4>
              <p className="text-gray-600">Smaller, focused databases provide faster query performance.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">✓ Enhanced Security</h4>
              <p className="text-gray-600">Row-level security ensures data can only be accessed by the profile owner.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
