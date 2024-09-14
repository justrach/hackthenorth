"use client";
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';

export default function NewUserOnboarding({ userId }: { userId: string }) {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const createUser = useMutation(api.userFunctions.createUser);
  const updateUser = useMutation(api.userFunctions.updateUser);
  const joinEventWithCode = useMutation(api.userFunctions.joinEventWithCode);
  const getUser = useQuery(api.userFunctions.getUserByUserID, { user_id: userId });

  const [isLoading, setIsLoading] = useState(true);
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    const initializeUser = async () => {
      if (user && !getUser) {
        try {
          await createUser({
            user_id: userId,
            username: user.username || '',
            name: user.fullName || '',
            email: user.primaryEmailAddress?.emailAddress || '',
            profilePictureUrl: user.imageUrl || '',
            bio: '',
            skills: [],
            interests: [],
            isOnboarded: false,
          });
        } catch (error) {
          console.error('Error creating user:', error);
          toast({
            title: "Error",
            description: "Failed to create user profile. Please try again.",
            variant: "destructive",
          });
        }
      } else if (getUser && getUser.isOnboarded) {
        // User is already onboarded, redirect to main app
        router.push('/dashboard');
      }
      setIsLoading(false);
    };

    initializeUser();
  }, [user, getUser]);

  const handleFinishOnboarding = async () => {
    try {
      await updateUser({
        bio,
        interests: interests.split(',').map(i => i.trim()),
        isOnboarded: true,
      });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully set up.",
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleJoinEvent = async () => {
    try {
      await joinEventWithCode({ inviteCode });
      toast({
        title: "Success!",
        description: "You've successfully joined the event.",
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Error joining event:', error);
      toast({
        title: "Error",
        description: "Failed to join event. Please check your invite code and try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading || !user) return <div>Loading...</div>;

  if (getUser && getUser.isOnboarded) {
    return (
      <Card className="w-full max-w-md mx-auto mt-10">
        <CardHeader>
          <CardTitle>Join an Event</CardTitle>
          <CardDescription>Enter your invite code to join an event</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Invite Code</Label>
              <Input
                id="inviteCode"
                placeholder="Enter your invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleJoinEvent} className="w-full">Join Event</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Welcome to EventChat!</CardTitle>
          <CardDescription>Let's set up your profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interests">Interests</Label>
              <Input
                id="interests"
                placeholder="e.g. coding, music, travel (comma-separated)"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleFinishOnboarding}
            className="w-full"
          >
            Finish Setup
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}