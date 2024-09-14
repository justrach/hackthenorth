"use client";
import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import MeetupList from '@/components/(meetups)/meetupList';
import { Calendar, MapPin } from 'lucide-react';

export default function Dashboard() {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const getUserEvents = useQuery(api.userFunctions.getUserEvents);
  const createEvent = useMutation(api.userFunctions.createEvent);
  const joinEventWithCode = useMutation(api.userFunctions.joinEventWithCode);
  const createMeetup = useMutation(api.userFunctions.createMeetup);

  const [newEventName, setNewEventName] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [newMeetupName, setNewMeetupName] = useState('');
  const [newMeetupDescription, setNewMeetupDescription] = useState('');

  const singleEvent = getUserEvents && getUserEvents.length === 1 ? getUserEvents[0] : null;
  const meetups = useQuery(api.userFunctions.getMeetupsByEventId, 
    singleEvent ? { eventId: singleEvent._id } : "skip"
  );

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
      toast({
        title: "Success",
        description: "Event created successfully.",
      });
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleJoinEvent = async () => {
    try {
      await joinEventWithCode({ inviteCode });
      setInviteCode('');
      toast({
        title: "Success",
        description: "You've successfully joined the event.",
      });
    } catch (error) {
      console.error('Error joining event:', error);
      toast({
        title: "Error",
        description: "Failed to join event. Please check your invite code and try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateMeetup = async () => {
    if (!singleEvent) return;
    try {
      const newMeetupId = await createMeetup({
        eventId: singleEvent._id,
        name: newMeetupName,
        description: newMeetupDescription,
        meetupTime: new Date().toISOString(),
        location: "TBD",
      });
      setNewMeetupName('');
      setNewMeetupDescription('');
      toast({
        title: "Success",
        description: "Meetup created successfully.",
      });
      router.push(`/chat/${newMeetupId}`);
    } catch (error) {
      console.error('Error creating meetup:', error);
      toast({
        title: "Error",
        description: "Failed to create meetup. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMeetupClick = (meetupId: Id<"meetups">) => {
    router.push(`/chat/${meetupId}`);
  };

  if (!user) return <div>Loading...</div>;


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user.fullName}!</h1>
      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events">My Events</TabsTrigger>
          <TabsTrigger value="join">Join Event</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          {singleEvent ? (
            <>
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-3xl">{singleEvent.name}</CardTitle>
                  <CardDescription className="text-xl">{singleEvent.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-2">
                    <Calendar className="mr-2" />
                    <span>{new Date(singleEvent.startDate).toLocaleDateString()} - {new Date(singleEvent.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2" />
                    <span>{singleEvent.location}</span>
                  </div>
                </CardContent>
              </Card>
              <MeetupList 
                eventId={singleEvent._id} 
                meetups={meetups} 
                onMeetupClick={handleMeetupClick} 
              />
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Your Events</CardTitle>
              </CardHeader>
              <CardContent>
                {getUserEvents?.map(event => (
                  <div key={event._id} className="mb-2">
                    <Button 
                      variant="outline" 
                      className="w-full text-left"
                      onClick={() => router.push(`/dashboard/${event._id}`)}
                    >
                      {event.name}
                    </Button>
                  </div>
                ))}
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
                        <label htmlFor="eventName">Event Name</label>
                        <Input
                          id="eventName"
                          value={newEventName}
                          onChange={(e) => setNewEventName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="eventDescription">Event Description</label>
                        <Input
                          id="eventDescription"
                          value={newEventDescription}
                          onChange={(e) => setNewEventDescription(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleCreateEvent}>Create Event</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="join">
          <Card>
            <CardHeader>
              <CardTitle>Join an Event</CardTitle>
              <CardDescription>Enter an invite code to join a new event</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="inviteCode">Invite Code</label>
                  <Input
                    id="inviteCode"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="Enter invite code"
                  />
                </div>
                <Button onClick={handleJoinEvent}>Join Event</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}