"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Database, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { supabase, authService, wardrobeService, wardrobeProfileService } from "@/lib/supabase"

interface TestResult {
  name: string
  status: "success" | "error" | "warning" | "loading"
  message: string
  details?: any
}

export default function DatabaseTestPage() {
  const [tests, setTests] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const updateTest = (name: string, status: TestResult["status"], message: string, details?: any) => {
    setTests((prev) => {
      const existing = prev.find((t) => t.name === name)
      const newTest = { name, status, message, details }

      if (existing) {
        return prev.map((t) => (t.name === name ? newTest : t))
      } else {
        return [...prev, newTest]
      }
    })
  }

  const runDatabaseTests = async () => {
    setIsRunning(true)
    setTests([])

    // Test 1: Basic Connection
    updateTest("Basic Connection", "loading", "Testing connection...")
    try {
      const { data, error } = await supabase.from("profiles").select("count").limit(1)
      if (error) {
        updateTest("Basic Connection", "error", `Connection failed: ${error.message}`, error)
      } else {
        updateTest("Basic Connection", "success", "Database connection successful!")
      }
    } catch (err: any) {
      updateTest("Basic Connection", "error", `Connection error: ${err.message}`, err)
    }

    // Test 2: Authentication
    updateTest("Authentication", "loading", "Checking auth system...")
    try {
      const user = await authService.getCurrentUser()
      setCurrentUser(user)
      if (user) {
        updateTest("Authentication", "success", `Logged in as: ${user.email}`, { userId: user.id })
      } else {
        updateTest("Authentication", "warning", "No user logged in", null)
      }
    } catch (err: any) {
      updateTest("Authentication", "error", `Auth error: ${err.message}`, err)
    }

    // Test 3: Check Tables
    const tables = ["profiles", "wardrobe_items", "wardrobe_profiles", "categories", "tags", "weather_essentials"]

    for (const table of tables) {
      updateTest(`Table: ${table}`, "loading", "Checking table...")
      try {
        const { data, error } = await supabase.from(table).select("count").limit(1)
        if (error) {
          if (error.code === "PGRST116") {
            updateTest(`Table: ${table}`, "error", "Table does not exist", error)
          } else {
            updateTest(`Table: ${table}`, "warning", `Access issue: ${error.message}`, error)
          }
        } else {
          updateTest(`Table: ${table}`, "success", "Table exists and accessible")
        }
      } catch (err: any) {
        updateTest(`Table: ${table}`, "error", `Error: ${err.message}`, err)
      }
    }

    // Test 4: Storage Buckets
    const buckets = ["wardrobe-images", "profile-pictures"]

    for (const bucket of buckets) {
      updateTest(`Storage: ${bucket}`, "loading", "Checking bucket...")
      try {
        const { data, error } = await supabase.storage.from(bucket).list("", { limit: 1 })
        if (error) {
          updateTest(`Storage: ${bucket}`, "error", `Bucket error: ${error.message}`, error)
        } else {
          updateTest(`Storage: ${bucket}`, "success", "Bucket accessible")
        }
      } catch (err: any) {
        updateTest(`Storage: ${bucket}`, "error", `Error: ${err.message}`, err)
      }
    }

    // Test 5: Sample Data
    updateTest("Sample Data", "loading", "Checking for sample data...")
    try {
      const { data: categories, error } = await supabase.from("categories").select("*").limit(5)
      if (error) {
        updateTest("Sample Data", "warning", `Categories not accessible: ${error.message}`, error)
      } else if (categories && categories.length > 0) {
        updateTest("Sample Data", "success", `Found ${categories.length} categories`, categories)
      } else {
        updateTest("Sample Data", "warning", "No sample categories found")
      }
    } catch (err: any) {
      updateTest("Sample Data", "error", `Error: ${err.message}`, err)
    }

    // Test 6: User-specific data (if logged in)
    if (currentUser) {
      updateTest("User Data", "loading", "Checking user data...")
      try {
        const items = await wardrobeService.getWardrobeItems(currentUser.id)
        const profiles = await wardrobeProfileService.getWardrobeProfiles(currentUser.id)

        updateTest("User Data", "success", `Found ${items.length} wardrobe items, ${profiles?.length || 0} profiles`, {
          wardrobeItems: items.length,
          profiles: profiles?.length || 0,
        })
      } catch (err: any) {
        updateTest("User Data", "error", `Error loading user data: ${err.message}`, err)
      }
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "loading":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    const variants = {
      success: "default",
      error: "destructive",
      warning: "secondary",
      loading: "outline",
    } as const

    return (
      <Badge variant={variants[status]} className="ml-2">
        {status}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Database className="h-8 w-8" />
          Database Connection Test
        </h1>
        <p className="text-muted-foreground mt-2">
          Test your WeatherSmart database connection and verify all components are working
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Database Status</CardTitle>
          <CardDescription>Run comprehensive tests to check database connectivity, tables, and data</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runDatabaseTests} disabled={isRunning} className="w-full">
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              "Run Database Tests"
            )}
          </Button>
        </CardContent>
      </Card>

      {tests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              {tests.filter((t) => t.status === "success").length} passed,{" "}
              {tests.filter((t) => t.status === "error").length} failed,{" "}
              {tests.filter((t) => t.status === "warning").length} warnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tests.map((test, index) => (
                <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(test.status)}
                    <div>
                      <div className="font-medium">{test.name}</div>
                      <div className="text-sm text-muted-foreground">{test.message}</div>
                      {test.details && (
                        <details className="mt-1">
                          <summary className="text-xs cursor-pointer text-blue-600">Show details</summary>
                          <pre className="text-xs mt-1 p-2 bg-gray-100 rounded overflow-auto">
                            {JSON.stringify(test.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(test.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {currentUser && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Current User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <strong>Email:</strong> {currentUser.email}
              </div>
              <div>
                <strong>User ID:</strong> {currentUser.id}
              </div>
              <div>
                <strong>Created:</strong> {new Date(currentUser.created_at).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
