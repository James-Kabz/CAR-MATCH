"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface ListingViewData {
  id: string
  title: string
  brand: string
  model: string
  year: number
  views: number
}

async function fetchViewsData(): Promise<ListingViewData[]> {
  const res = await fetch('/api/analytics/views')
  if (!res.ok) throw new Error('Failed to fetch views data')
  return res.json()
}

export default function AnalyticsPage() {
  const { data, isLoading, error } = useQuery<ListingViewData[]>({
    queryKey: ['views-analytics'],
    queryFn: fetchViewsData,
  })

  if (error) return <div>Error loading data</div>

  // Calculate average views safely
  const averageViews = data && data.length > 0 
    ? Math.round(data.reduce((acc, curr) => acc + curr.views, 0) / data.length)
    : 0

  // Get unique brands with total views
  const brandViews = data 
    ? Array.from(new Set(data.map(item => `${item.brand}-${item.model}-${item.year}`)))
        .map(uniqueId => {
          const [brand, model, year] = uniqueId.split('-')
          return {
            id: uniqueId,
            brand,
            model,
            year: parseInt(year),
            totalViews: data
              .filter(item => item.brand === brand && item.model === model && item.year === parseInt(year))
              .reduce((acc, curr) => acc + curr.views, 0)
          }
        })
        .sort((a, b) => b.totalViews - a.totalViews)
        .slice(0, 5)
    : []

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Car Views Analytics</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Top Viewed Cars</CardTitle>
        </CardHeader>
        <CardContent className="h-[500px]">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="title" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  tickFormatter={(value: string) => `${value.slice(0, 15)}...`}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value} views`, 'Views']}
                  labelFormatter={(label: string) => `Car: ${label}`}
                />
                <Legend />
                <Bar 
                  dataKey="views" 
                  name="Views" 
                  fill="#8884d8" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Views Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <div className="space-y-2">
                <p>Total Cars Tracked: {data?.length || 0}</p>
                <p>Most Viewed: {data?.[0]?.title || 'N/A'} ({data?.[0]?.views || 0} views)</p>
                <p>Average Views: {averageViews}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Brands</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <ul className="space-y-2">
                {brandViews.map(({ id, brand, totalViews }) => (
                  <li key={id} className="flex justify-between">
                    <span>{brand}</span>
                    <span>{totalViews} views</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}