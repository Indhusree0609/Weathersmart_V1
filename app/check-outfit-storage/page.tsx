"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, Loader2, Database, Shirt, Bot, Users, Tags, Zap } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

interface CheckResult {
  component: string
  exists: boolean
  count?: number
  error?: string
  details?: string
  status: "success" | "warning" | "error"
}

interface CheckResponse {
  success: boolean
  results: CheckResult[]
  summary: {
    total: number
    working: number
    missing: number
    errors: number
  }
  error?: string
}

export default function CheckOutfitStoragePage() {
  const { user } = useAuth()
  const [results, setResults] = useState<CheckResult[]>([])
  const [summary, setSummary] = useState<CheckResponse["summary"] | null>(null)
  const [loading, setLoading] = useState(false)
  const [fixing, setFixing] = useState(false)
  const [testingChat, setTestingChat] = useState(false)
  const [chatTestResult, setChatTestResult] = useState<string | null>(null)

  const runCheck = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/check-outfit-storage?action=check")
      const data: CheckResponse = await response.json()

      if (data.success) {
        setResults(data.results)
        setSummary(data.summary)
      } else {
        console.error("Check failed:", data.error)
      }
    } catch (error) {
      console.error("Check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const runFix = async () => {
    setFixing(true)
    try {
      const response = await fetch("/api/check-outfit-storage?action=fix")
      const data = await response.json()

      if (data.success) {
        // Re-run check after fix
        await runCheck()
      }
    } catch (error) {
      console.error("Fix failed:", error)
    } finally {
      setFixing(false)
    }
  }

  const testChatIntegration = async () => {
    setTestingChat(true)
    setChatTestResult(null)

    try {
      if (!user) {
        setChatTestResult("❌ FAILED: Not authenticated. Please log in first.")
        return
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "What should I wear for work today?",
          userId: user.id,
          weatherContext: "Current weather: 70°F, clear sky",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setChatTestResult(
          `✅ SUCCESS: AI responded with ${data.response.length} characters. Found ${data.wardrobeItemCount} wardrobe items.`,
        )
      } else {
        setChatTestResult(`❌ FAILED: ${data.error || "Unknown error"}`)
      }
    } catch (error) {
      setChatTestResult(`❌ ERROR: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setTestingChat(false)
    }
  }

  useEffect(() => {
    runCheck()
  }, [])

  const getStatusIcon = (result: CheckResult) => {
    switch (result.status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <XCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (result: CheckResult) => {
    switch (result.status) {
      case "success":
        return "default"
      case "warning":
        return "secondary"
      case "error":
        return "destructive"
      default:
        return "outline"
    }
  }

  const calculateCompleteness = () => {
    if (!summary) return 0
    return Math.round((summary.working / summary.total) * 100)
  }

  const completeness = calculateCompleteness()
  const isFullyFunctional = completeness === 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">AI Outfit Storage Integration Check</h1>
          </div>
          <p className="text-gray-400">
            Diagnostic tool to check if your AI outfit picker is properly connected to your wardrobe database
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8 border-gray-700 bg-gray-800/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Integration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Overall Progress</span>
                <Badge variant={isFullyFunctional ? "default" : "destructive"}>{completeness}% Complete</Badge>
              </div>
              <Progress value={completeness} className="h-3" />

              {loading ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking database integration...
                </div>
              ) : summary ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{summary.working}</div>
                    <div className="text-sm text-gray-400">Working</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{summary.missing}</div>
                    <div className="text-sm text-gray-400">Missing</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{summary.errors}</div>
                    <div className="text-sm text-gray-400">Errors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{summary.total}</div>
                    <div className="text-sm text-gray-400">Total</div>
                  </div>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Status Details */}
        {results.length > 0 && (
          <div className="grid gap-4 mb-8">
            {results.map((result, index) => (
              <Card key={index} className="border-gray-700 bg-gray-800/80 backdrop-blur-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result)}
                      <div>
                        <h3 className="font-medium text-white">{result.component}</h3>
                        {result.details && <p className="text-sm text-gray-400">{result.details}</p>}
                        {result.error && <p className="text-sm text-red-400">Error: {result.error}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {typeof result.count === "number" && (
                        <Badge variant="outline" className="text-gray-300">
                          {result.count} items
                        </Badge>
                      )}
                      <Badge variant={getStatusColor(result)}>
                        {result.status === "success" ? "OK" : result.status === "warning" ? "Warning" : "Error"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <Card className="mb-8 border-gray-700 bg-gray-800/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">Actions</CardTitle>
            <CardDescription className="text-gray-400">Test and fix your AI outfit picker integration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={runCheck}
                disabled={loading}
                variant="outline"
                className="border-gray-600 hover:bg-gray-700 bg-transparent text-white"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Re-check Status
              </Button>

              {!isFullyFunctional && (
                <Button
                  onClick={runFix}
                  disabled={fixing}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                >
                  {fixing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Fix Integration Issues
                </Button>
              )}

              <Button
                onClick={testChatIntegration}
                disabled={testingChat}
                variant="outline"
                className="border-gray-600 hover:bg-gray-700 bg-transparent text-white"
              >
                {testingChat ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Test Chat Integration
              </Button>
            </div>

            {chatTestResult && (
              <Alert className="border-gray-600 bg-gray-800/50">
                <AlertDescription className="text-gray-300">
                  <pre className="whitespace-pre-wrap text-sm">{chatTestResult}</pre>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Status Messages */}
        {summary && (
          <div className="mb-8">
            {isFullyFunctional ? (
              <Alert className="border-green-500 bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-200">
                  🎉 Your AI outfit picker is fully integrated with the wardrobe database! All components are working
                  correctly.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-yellow-500 bg-yellow-500/10">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-yellow-200">
                  ⚠️ Your AI outfit picker integration has some issues. Click "Fix Integration Issues" to resolve them.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* What This Enables */}
        <Card className="border-gray-700 bg-gray-800/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shirt className="w-5 h-5" />
              What AI Integration Enables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <Bot className="w-5 h-5 text-blue-400 mt-1" />
                <div>
                  <h4 className="font-medium text-white">Smart Recommendations</h4>
                  <p className="text-sm text-gray-400">AI uses your actual wardrobe items for suggestions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-green-400 mt-1" />
                <div>
                  <h4 className="font-medium text-white">Family Wardrobes</h4>
                  <p className="text-sm text-gray-400">Manage outfits for multiple family members</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Tags className="w-5 h-5 text-purple-400 mt-1" />
                <div>
                  <h4 className="font-medium text-white">Outfit Organization</h4>
                  <p className="text-sm text-gray-400">Save and categorize complete outfits</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
