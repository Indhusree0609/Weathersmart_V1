"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Package, Plus, Database, Loader2 } from "lucide-react"

interface CollectionCheck {
  collectionsExists: boolean
  collectionIdExists: boolean
  junctionExists: boolean
  fullyImplemented: boolean
  error?: string
}

export default function CheckCollectionsPage() {
  const [checking, setChecking] = useState(false)
  const [adding, setAdding] = useState(false)
  const [result, setResult] = useState<CollectionCheck | null>(null)
  const [collections, setCollections] = useState<any[]>([])

  const checkCollections = async () => {
    setChecking(true)
    try {
      const response = await fetch("/api/check-collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check" }),
      })

      const data = await response.json()
      setResult(data)

      if (data.collectionsExists) {
        // Fetch existing collections
        const collectionsResponse = await fetch("/api/check-collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "list" }),
        })
        const collectionsData = await collectionsResponse.json()
        setCollections(collectionsData.collections || [])
      }
    } catch (error) {
      console.error("Error checking collections:", error)
      setResult({
        collectionsExists: false,
        collectionIdExists: false,
        junctionExists: false,
        fullyImplemented: false,
        error: "Failed to check collections feature",
      })
    }
    setChecking(false)
  }

  const addCollections = async () => {
    setAdding(true)
    try {
      const response = await fetch("/api/check-collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add" }),
      })

      const data = await response.json()

      if (data.success) {
        // Re-check after adding
        await checkCollections()
      } else {
        console.error("Failed to add collections:", data.error)
      }
    } catch (error) {
      console.error("Error adding collections:", error)
    }
    setAdding(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Collections Feature Check</h1>
          <p className="text-gray-600">
            Check if your wardrobe database has collections functionality for organizing items
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          <Button onClick={checkCollections} disabled={checking} variant="outline">
            {checking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Check Collections
              </>
            )}
          </Button>

          {result && !result.fullyImplemented && (
            <Button onClick={addCollections} disabled={adding}>
              {adding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Collections Feature
                </>
              )}
            </Button>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Status Overview */}
            <Card
              className={result.fullyImplemented ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}
            >
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {result.fullyImplemented ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-yellow-500" />
                  )}
                  <span>Collections Feature {result.fullyImplemented ? "Implemented" : "Not Implemented"}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {result.collectionsExists ? (
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      ) : (
                        <XCircle className="h-8 w-8 text-red-500" />
                      )}
                    </div>
                    <p className="font-medium">Collections Table</p>
                    <Badge variant={result.collectionsExists ? "default" : "destructive"}>
                      {result.collectionsExists ? "Exists" : "Missing"}
                    </Badge>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {result.collectionIdExists ? (
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      ) : (
                        <XCircle className="h-8 w-8 text-red-500" />
                      )}
                    </div>
                    <p className="font-medium">Collection ID Column</p>
                    <Badge variant={result.collectionIdExists ? "default" : "destructive"}>
                      {result.collectionIdExists ? "Exists" : "Missing"}
                    </Badge>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {result.junctionExists ? (
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      ) : (
                        <XCircle className="h-8 w-8 text-red-500" />
                      )}
                    </div>
                    <p className="font-medium">Junction Table</p>
                    <Badge variant={result.junctionExists ? "default" : "destructive"}>
                      {result.junctionExists ? "Exists" : "Missing"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Collections List */}
            {result.collectionsExists && collections.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>Existing Collections</span>
                  </CardTitle>
                  <CardDescription>Collections found in your database</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {collections.map((collection, index) => (
                      <div
                        key={collection.id || index}
                        className="p-4 border rounded-lg"
                        style={{ borderColor: collection.color_theme || "#e5e7eb" }}
                      >
                        <h3 className="font-semibold text-gray-900">{collection.name}</h3>
                        {collection.description && (
                          <p className="text-sm text-gray-600 mt-1">{collection.description}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {collection.is_seasonal && (
                            <Badge variant="secondary" className="text-xs">
                              {collection.season}
                            </Badge>
                          )}
                          {collection.is_occasion_based && (
                            <Badge variant="secondary" className="text-xs">
                              {collection.occasion}
                            </Badge>
                          )}
                          {collection.is_private && (
                            <Badge variant="outline" className="text-xs">
                              Private
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* What Collections Enable */}
            <Card>
              <CardHeader>
                <CardTitle>What Collections Enable</CardTitle>
                <CardDescription>Benefits of having collections in your wardrobe database</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Organization Features</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Group items by season, occasion, or style</li>
                      <li>• Create themed collections (work, vacation, etc.)</li>
                      <li>• Color-coded organization system</li>
                      <li>• Private collections for personal organization</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">User Experience</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Quick access to related items</li>
                      <li>• Visual organization with color themes</li>
                      <li>• Many-to-many relationships (items in multiple collections)</li>
                      <li>• Easy outfit planning and coordination</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Display */}
            {result.error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>Error: {result.error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Instructions */}
        {!result && (
          <Card>
            <CardHeader>
              <CardTitle>Collections Feature</CardTitle>
              <CardDescription>Collections allow you to organize wardrobe items into groups</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Click "Check Collections" to see if your database already has collections functionality, or add it if
                it's missing.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Collections will enable:</h4>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Seasonal collections (Summer, Winter, etc.)</li>
                  <li>• Occasion-based collections (Work, Formal, Casual)</li>
                  <li>• Personal collections (Favorites, New Items)</li>
                  <li>• Color-themed organization</li>
                  <li>• Items can belong to multiple collections</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
