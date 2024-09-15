"use client"

import { useEffect, useState } from 'react';
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StatsData {
  total_users: number;
  total_messages: number;
  avg_messages_per_user: number;
  most_active_user: string;
  user_message_counts: Record<string, number>;
  total_meetups: number;
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(response => response.json())
      .then(data => setStats(data))
      .catch(error => console.error('Error fetching stats:', error));
  }, []);

  if (!stats) {
    return <div>Loading...</div>;
  }

  const chartData = Object.entries(stats.user_message_counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([user, count]) => ({ user, count }));

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">User Statistics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
            <CardDescription>Top 10 most active users</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="user" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-start gap-2 text-sm">
              <div className="grid gap-2">
                <div className="flex items-center gap-2 font-medium leading-none">
                  Most active user: {stats.most_active_user}
                </div>
                <div className="flex items-center gap-2 leading-none text-muted-foreground">
                  Total messages: {stats.total_messages}
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overall Statistics</CardTitle>
            <CardDescription>Key metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Users</dt>
                <dd className="mt-1 text-3xl font-semibold">{stats.total_users}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Meetups</dt>
                <dd className="mt-1 text-3xl font-semibold">{stats.total_meetups}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Avg Messages/User</dt>
                <dd className="mt-1 text-3xl font-semibold">{stats.avg_messages_per_user.toFixed(2)}</dd>
              </div>
            </dl>
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-start gap-2 text-sm">
              <div className="grid gap-2">
                <div className="flex items-center gap-2 font-medium leading-none">
                  Trending up <TrendingUp className="h-4 w-4" />
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}