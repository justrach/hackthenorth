"use client";
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useConvexAuth } from "convex/react";

interface LoggedInPageProps {
  userId: string;
}

export default function LoggedInPage({ userId }: LoggedInPageProps) {
  const { user, isLoaded, isSignedIn } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();
  const createUser = useMutation(api.userFunctions.createUser);
  const updateUser = useMutation(api.userFunctions.updateUser);
  const getUser = useQuery(api.userFunctions.getUserByUserID, isAuthenticated ? { user_id: userId } : "skip");
  const createEvent = useMutation(api.userFunctions.createEvent);
  const createMeetup = useMutation(api.userFunctions.createMeetup);
  const getUserEvents = useQuery(api.userFunctions.getUserEvents, isAuthenticated ? undefined : "skip");
  const createPairMeetups = useMutation(api.userFunctions.createPairMeetup);

  const [isOnboarding, setIsOnboarding] = useState(false);
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState('');
  const [newEventName, setNewEventName] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<Id<"events"> | null>(null);
  const [newMeetupName, setNewMeetupName] = useState('');
  const [newMeetupDescription, setNewMeetupDescription] = useState('');
  const [newMeetupTime, setNewMeetupTime] = useState('');
  const [newMeetupLocation, setNewMeetupLocation] = useState('');
  const [newMeetupMaxParticipants, setNewMeetupMaxParticipants] = useState('');
  const [newMeetupIsPublic, setNewMeetupIsPublic] = useState(false);
  const [newMeetupInvitedUsernames, setNewMeetupInvitedUsernames] = useState('');
  const [pairMeetupsList, setPairMeetupsList] = useState('');

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isAuthenticated && user && getUser === null) {
      createUser({
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
    } else if (getUser && !getUser.isOnboarded) {
      setIsOnboarding(true);
    }
  }, [isAuthenticated, user, getUser, createUser, userId]);

  const handleFinishOnboarding = async () => {
    try {
      await updateUser({
        bio,
        interests: interests.split(',').map(i => i.trim()),
        isOnboarded: true,
      });
      setIsOnboarding(false);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleCreateEvent = async () => {
    try {
      await createEvent({
        name: newEventName,
        description: newEventDescription,
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        location: "TBD",
      });
      setNewEventName('');
      setNewEventDescription('');
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleCreateMeetup = async () => {
    if (!selectedEventId) {
      alert("Please select an event first");
      return;
    }

    if (!newMeetupName || !newMeetupDescription || !newMeetupTime || !newMeetupLocation) {
      alert("Please fill in all required fields");
      return;
    }

    const confirmCreate = window.confirm("Are you sure you want to create this meetup?");
    if (!confirmCreate) {
      return;
    }

    try {
      await createMeetup({
        eventId: selectedEventId,
        name: newMeetupName,
        description: newMeetupDescription,
        meetupTime: newMeetupTime,
        locationName: newMeetupLocation,
        maxParticipants: newMeetupMaxParticipants ? parseInt(newMeetupMaxParticipants) : undefined,
        isPublic: newMeetupIsPublic,
        invitedUsernames: newMeetupInvitedUsernames.split(',').map(username => username.trim()),
      });

      alert("Meetup created successfully!");

      setNewMeetupName('');
      setNewMeetupDescription('');
      setNewMeetupTime('');
      setNewMeetupLocation('');
      setNewMeetupMaxParticipants('');
      setNewMeetupIsPublic(false);
      setNewMeetupInvitedUsernames('');
    } catch (error) {
      console.error('Error creating meetup:', error);
      alert(`Error creating meetup: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleCreatePairMeetups = async () => {
    if (!selectedEventId) {
      alert("Please select an event first");
      return;
    }
  
    const pairs = pairMeetupsList.split('\n').map(line => line.split(',').map(username => username.trim()));
    
    try {
      const results = await Promise.all(pairs.map(([username1, username2]) => 
        createPairMeetups({ eventId: selectedEventId, username1, username2 })
      ));
      const totalCreated = results.reduce((sum, result) => sum + result.length, 0);
      alert(`Created ${totalCreated} pair meetups successfully!`);
      setPairMeetupsList('');
    } catch (error) {
      console.error('Error creating pair meetups:', error);
      alert(`Error creating pair meetups: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  if (!isLoaded || !isSignedIn || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  if (isOnboarding) {
    return (
      <Card className="w-[350px] mx-auto mt-10">
        <CardHeader>
          <CardTitle>Welcome, {user.fullName}!</CardTitle>
          <CardDescription>Let's finish setting up your profile</CardDescription>
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
          <Button onClick={handleFinishOnboarding}>Finish Setup</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user.fullName}!</h1>
      <p className="mb-4">Selected event: {selectedEventId ? getUserEvents?.find(e => e._id === selectedEventId)?.name : 'None'}</p>
      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="meetups">Meetups</TabsTrigger>
          <TabsTrigger value="matcher">Matcher</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Your Events</CardTitle>
            </CardHeader>
            <CardContent>
              {getUserEvents === undefined ? (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Unable to fetch your events. Please try refreshing the page or signing out and back in.
                  </AlertDescription>
                </Alert>
              ) : getUserEvents === null ? (
                <p>Loading events...</p>
              ) : getUserEvents.length === 0 ? (
                <p>You haven't created any events yet.</p>
              ) : (
                getUserEvents.map(event => (
                  <div key={event._id} className="mb-2">
                    <Button
                      variant={selectedEventId === event._id ? "default" : "outline"}
                      onClick={() => setSelectedEventId(event._id)}
                    >
                      {event.name}
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
            <CardFooter>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Create Event</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create a New Event</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="eventName">Event Name</Label>
                      <Input
                        id="eventName"
                        value={newEventName}
                        onChange={(e) => setNewEventName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="eventDescription">Event Description</Label>
                      <Textarea
                        id="eventDescription"
                        value={newEventDescription}
                        onChange={(e) => setNewEventDescription(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateEvent}>Create Event</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="meetups">
          <Card>
            <CardHeader>
              <CardTitle>Meetups</CardTitle>
              {selectedEventId && (
                <CardDescription>
                  Meetups for event: {getUserEvents?.find(e => e._id === selectedEventId)?.name}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {/* Meetup list would go here */}
              <p>No meetups created yet.</p>
            </CardContent>
            <CardFooter>
              <Dialog>
                <DialogTrigger asChild>
                  <Button disabled={!selectedEventId}>Create Meetup</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create a New Meetup</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="meetupName" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="meetupName"
                        value={newMeetupName}
                        onChange={(e) => setNewMeetupName(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="meetupDescription" className="text-right">
                        Description
                      </Label>
                      <Textarea
                        id="meetupDescription"
                        value={newMeetupDescription}
                        onChange={(e) => setNewMeetupDescription(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="meetupTime" className="text-right">
                        Time
                      </Label>
                      <Input
                        id="meetupTime"
                        type="datetime-local"
                        value={newMeetupTime}
                        onChange={(e) => setNewMeetupTime(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="meetupLocation" className="text-right">
                        Location
                      </Label>
                      <Input
                        id="meetupLocation"
                        value={newMeetupLocation}
                        onChange={(e) => setNewMeetupLocation(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="maxParticipants" className="text-right">
                        Max Participants
                      </Label>
                      <Input
                        id="maxParticipants"
                        type="number"
                        value={newMeetupMaxParticipants}
                        onChange={(e) => setNewMeetupMaxParticipants(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="isPublic" className="text-right">
                        Public Meetup
                      </Label>
                      <Switch
                        id="isPublic"
                        checked={newMeetupIsPublic}
                        onCheckedChange={setNewMeetupIsPublic}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="invitedUsernames" className="text-right">
                        Invite Users
                      </Label>
                      <Input
                        id="invitedUsernames"
                        value={newMeetupInvitedUsernames}
                        onChange={(e) => setNewMeetupInvitedUsernames(e.target.value)}
        placeholder="Comma-separated usernames"
        className="col-span-3"
      />
    </div>
  </div>
  <DialogFooter>
    <Button onClick={handleCreateMeetup}>Create Meetup</Button>
  </DialogFooter>
</DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="matcher">
          <Card>
            <CardHeader>
              <CardTitle>Pair Matcher</CardTitle>
              <CardDescription>Create meetups for pairs of users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pairMeetupsList">User Pairs (one pair per line, comma-separated)</Label>
                  <Textarea
                    id="pairMeetupsList"
                    placeholder="user1,user2&#10;user3,user4"
                    value={pairMeetupsList}
                    onChange={(e) => setPairMeetupsList(e.target.value)}
                    rows={10}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCreatePairMeetups} disabled={!selectedEventId}>Create Pair Meetups</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              {getUser && (
                <div>
                  <p><strong>Bio:</strong> {getUser.bio}</p>
                  <p><strong>Interests:</strong> {getUser.interests.join(', ')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}