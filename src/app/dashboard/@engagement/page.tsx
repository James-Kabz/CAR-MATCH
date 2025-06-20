"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import Loading from "../loading"
import { MessageCircle, Heart, Phone, Calendar, Car, Users } from "lucide-react"

interface UserEngagementData {
  id: string
  userId: string
  userName: string
  matches: number
  messagesSent: number
  favoritesAdded: number
  callsMade: number
  testDrivesScheduled: number
  lastActive: string
}

async function fetchEngagementData(): Promise<UserEngagementData[]> {
  const res = await fetch('/api/analytics/engagement')
  if (!res.ok) throw new Error('Failed to fetch engagement data')
  return res.json()
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function EngagementAnalyticsPage() {
  const { data, isLoading, error } = useQuery<UserEngagementData[]>({
    queryKey: ['engagement-analytics'],
    queryFn: fetchEngagementData,
  })

  if (error) return <div>Error loading data</div>
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loading
          message="Please wait..."
          className="bg-gray/50"
          spinnerClassName="text-blue-600 h-16 w-16"
          messageClassName="text-xl"
        />
      </div>
    )
  }

  // Calculate summary metrics
  const totalUsers = data?.length || 0
  const totalMatches = data?.reduce((acc, curr) => acc + curr.matches, 0) || 0
  const totalMessages = data?.reduce((acc, curr) => acc + curr.messagesSent, 0) || 0
  const totalFavorites = data?.reduce((acc, curr) => acc + curr.favoritesAdded, 0) || 0
  const totalCalls = data?.reduce((acc, curr) => acc + curr.callsMade, 0) || 0
  const totalTestDrives = data?.reduce((acc, curr) => acc + curr.testDrivesScheduled, 0) || 0

  // Prepare data for charts
  const topEngagedUsers = data
    ? [...data]
        .sort((a, b) => (b.matches + b.messagesSent + b.favoritesAdded) - (a.matches + a.messagesSent + a.favoritesAdded))
        .slice(0, 5)
    : []

  const engagementDistribution = [
    { name: 'Messages', value: totalMessages, icon: <MessageCircle className="h-4 w-4" /> },
    { name: 'Favorites', value: totalFavorites, icon: <Heart className="h-4 w-4" /> },
    { name: 'Calls', value: totalCalls, icon: <Phone className="h-4 w-4" /> },
    { name: 'Test Drives', value: totalTestDrives, icon: <Calendar className="h-4 w-4" /> },
    { name: 'Matches', value: totalMatches, icon: <Car className="h-4 w-4" /> },
  ]

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">User Engagement Analytics</h1>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <Car className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMatches}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            <MessageCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMessages}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Heart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFavorites}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Drives</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTestDrives}</div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Top Engaged Users</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topEngagedUsers}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="userName"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tickFormatter={(value: string) => `${value.slice(0, 10)}...`}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value}`, name]}
                    labelFormatter={(label: string) => `User: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="matches" name="Matches" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="messagesSent" name="Messages" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="favoritesAdded" name="Favorites" fill="#ffc658" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={engagementDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {engagementDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value} interactions`, 'Count']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Activity Table */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>User Activity Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matches</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Messages</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Favorites</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calls</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Drives</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data?.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.userName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.matches}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.messagesSent}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.favoritesAdded}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.callsMade}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.testDrivesScheduled}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.lastActive).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}