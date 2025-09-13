"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Clock, Database, Users, Shield, Zap } from "lucide-react"

interface SetupStep {
  id: string
  name: string
  description: string
  status: "pending" | "running" | "success" | "error"
  details?: string
  icon: React.ReactNode
}

export default function DatabaseSetupPage() {
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: "schema",
      name: "Create Database Schema",
      description: "Creating tables, relationships, and constraints",
      status: "pending",
      icon: <Database className="h-5 w-5" />,
    },
    {
      id: "data",
      name: "Seed Lookup Data",
      description: "Inserting categories, colors, relationships, and other reference data",
      status: "pending",
      icon: <Zap className="h-5 w-5" />,
    },
    {
      id: "policies",
      name: "Setup Security Policies",
      description: "Configuring Row Level Security and access permissions",
      status: "pending",
      icon: <Shield className="h-5 w-5" />,
    },
    {
      id: "verify",
      name: "Verify Setup",
      description: "Testing database connectivity and table accessibility",
      status: "pending",
      icon: <CheckCircle className="h-5 w-5" />,
    },
  ])

  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [summary, setSummary] = useState<any>(null)

  const updateStepStatus = (stepId: string, status: SetupStep["status"], details?: string) => {
    setSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, status, details } : step)))
  }

  const executeStep = async (stepId: string, action: string) => {
    updateStepStatus(stepId, "running")

    try {
      const response = await fetch("/api/setup-database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      const result = await response.json()

      if (result.success) {
        updateStepStatus(stepId, "success", getSuccessMessage(stepId, result))
        return result
      } else {
        updateStepStatus(stepId, "error", result.error || "Unknown error occurred")
        return null
      }
    } catch (error: any) {
      updateStepStatus(stepId, "error", error.message)
      return null
    }
  }

  const getSuccessMessage = (stepId: string, result: any) => {
    switch (stepId) {
      case "schema":
        return `${result.tablesCreated || "Multiple"} tables created successfully`
      case "data":
        return `${result.recordsInserted || "Multiple"} records inserted`
      case "policies":
        return `${result.policiesCreated || "Multiple"} security policies configured`
      case "verify":
        return `${result.tablesVerified}/${result.totalTables} tables verified`
      default:
        return "Completed successfully"
    }
  }

  const runSetup = async () => {
    setIsRunning(true)
    setProgress(0)
    setSummary(null)

    const stepActions = [
      { stepId: "schema", action: "create-schema" },
      { stepId: "data", action: "seed-data" },
      { stepId: "policies", action: "setup-policies" },
      { stepId: "verify", action: "verify" },
    ]

    let completedSteps = 0
    const results: any = {}

    for (const { stepId, action } of stepActions) {
      const result = await executeStep(stepId, action)
      results[stepId] = result

      completedSteps++
      setProgress((completedSteps / stepActions.length) * 100)

      // Small delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    // Generate summary
    const successfulSteps = steps.filter((step) => step.status === "success").length
    setSummary({
      totalSteps: steps.length,
      successfulSteps,
      isComplete: successfulSteps === steps.length,
      results,
    })

    setIsRunning(false)
  }

  const getStatusIcon = (status: SetupStep["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "running":
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
    }
  }

  const getStatusColor = (status: SetupStep["status"]) => {
    switch (status) {
      case "success":
        return "border-green-200 bg-green-50"
      case "error":
        return "border-red-200 bg-red-50"
      case "running":
        return "border-blue-200 bg-blue-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Multi-User Family Wardrobe Database Setup</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            This will create a comprehensive database schema supporting multiple users, family members, wardrobe items,
            weather essentials, and child-specific features.
          </p>
        </div>

        {/* Progress Bar */}
        {isRunning && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Setup Progress</span>
                <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>
        )}

        {/* Setup Steps */}
        <div className="space-y-4 mb-8">
          {steps.map((step, index) => (
            <Card key={step.id} className={`transition-all duration-200 ${getStatusColor(step.status)}`}>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">{getStatusIcon(step.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {step.icon}
                      <h3 className="text-lg font-semibold text-gray-900">
                        {index + 1}. {step.name}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-2">{step.description}</p>
                    {step.details && (
                      <p className={`text-sm ${step.status === "error" ? "text-red-600" : "text-green-600"}`}>
                        {step.details}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Button */}
        <div className="text-center mb-8">
          <Button onClick={runSetup} disabled={isRunning} size="lg" className="px-8">
            {isRunning ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Setting up database...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Start Database Setup
              </>
            )}
          </Button>
        </div>

        {/* Summary */}
        {summary && (
          <Card className={summary.isComplete ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {summary.isComplete ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-yellow-500" />
                )}
                <span>Setup {summary.isComplete ? "Complete" : "Partially Complete"}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Steps Completed</p>
                  <p className="text-2xl font-bold">
                    {summary.successfulSteps}/{summary.totalSteps}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Database Status</p>
                  <p className={`text-lg font-semibold ${summary.isComplete ? "text-green-600" : "text-yellow-600"}`}>
                    {summary.isComplete ? "Ready to Use" : "Needs Attention"}
                  </p>
                </div>
              </div>

              {summary.isComplete ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    🎉 Your multi-user family wardrobe database is ready! You can now:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Create family member profiles</li>
                      <li>Add wardrobe items for each person</li>
                      <li>Use child-specific features for kids</li>
                      <li>Manage weather essentials</li>
                      <li>
                        Test the system at{" "}
                        <a href="/test-db" className="text-blue-600 underline">
                          /test-db
                        </a>
                      </li>
                    </ul>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Some steps encountered issues, but core functionality should still work. Check the error details
                    above and consider running the setup again.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Database Features */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Database Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span>Multi-User Support</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Main user accounts</li>
                  <li>• Family member profiles</li>
                  <li>• Relationship management</li>
                  <li>• Individual wardrobes</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-green-500" />
                  <span>Child Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Safety features tracking</li>
                  <li>• Child-specific categories</li>
                  <li>• Activity-based organization</li>
                  <li>• Growth room tracking</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  <span>Weather Integration</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Weather essentials</li>
                  <li>• Condition-based items</li>
                  <li>• Seasonal organization</li>
                  <li>• Assignment system</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
