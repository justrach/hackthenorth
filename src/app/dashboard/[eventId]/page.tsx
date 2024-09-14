"use client";
import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Users, Plus, MessageCircle } from 'lucide-react';

export default function EventPage({ params }: { params: { eventId: Id<"events"> } }) {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const eventId = params.eventId;
  const event = useQuery(api.userFunctions.getEvent, { eventId });
  const meetups = useQuery(api.userFunctions.getMeetupsByEventId, { eventId });
  const createMeetup = useMutation(api.userFunctions.createMeetup);

  const [newMeetupName, setNewMeetupName] = useState('');
  const [newMeetupDescription, setNewMeetupDescription] = useState('');
  const [newMeetupTime, setNewMeetupTime] = useState('');
  const [newMeetupLocation, setNewMeetupLocation] = useState('');

  const handleCreateMeetup = async () => {
    try {
      const newMeetupId = await createMeetup({
        eventId,
        name: newMeetupName,
        description: newMeetupDescription,
        meetupTime: new Date(newMeetupTime).toISOString(),
        location: newMeetupLocation,
      });
      setNewMeetupName('');
      setNewMeetupDescription('');
      setNewMeetupTime('');
      setNewMeetupLocation('');
      toast({
        title: "Success",
        description: "Meetup created successfully.",
      });
      // Redirect to the new meetup's chat page
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

  if (!user || !event) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl">{event.name}</CardTitle>
          <CardDescription className="text-xl">{event.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-2">
            <Calendar className="mr-2" />
            <span>{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="mr-2" />
            <span>{event.location}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Users className="mr-2" />
            Meetups
          </CardTitle>
          <CardDescription>Join or create meetups to connect with other attendees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {meetups?.map(meetup => (
              <Card key={meetup._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{meetup.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{meetup.description}</p>
                  <div className="flex items-center mt-2">
                    <Calendar className="mr-2" />
                    <span>{new Date(meetup.meetupTime).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <MapPin className="mr-2" />
                    <span>{meetup.location}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => handleMeetupClick(meetup._id)}
                    className="w-full"
                  >
                    <MessageCircle className="mr-2" />
                    Join Chat
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Dialog>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2" />Create Meetup</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Meetup</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="meetupName">Meetup Name</label>
                  <Input
                    id="meetupName"
                    value={newMeetupName}
                    onChange={(e) => setNewMeetupName(e.target.value)}
                    placeholder="e.g., Coffee Chat for Frontend Devs"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="meetupDescription">Meetup Description</label>
                  <Input
                    id="meetupDescription"
                    value={newMeetupDescription}
                    onChange={(e) => setNewMeetupDescription(e.target.value)}
                    placeholder="Brief description of the meetup"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="meetupTime">Meetup Time</label>
                  <Input
                    id="meetupTime"
                    type="datetime-local"
                    value={newMeetupTime}
                    onChange={(e) => setNewMeetupTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="meetupLocation">Meetup Location</label>
                  <Input
                    id="meetupLocation"
                    value={newMeetupLocation}
                    onChange={(e) => setNewMeetupLocation(e.target.value)}
                    placeholder="e.g., Main Hall, Table 5"
                  />
                </div>
                <Button onClick={handleCreateMeetup}>Create Meetup</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
}