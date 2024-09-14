"use client";
import React, { useState, useEffect, useRef } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRouter } from 'next/navigation';

interface LoggedInPageProps {
    userId: string;
  }
  
  export default function LoggedInPage({ userId }: LoggedInPageProps) {
   
  const { user } = useUser();
  const createUser = useMutation(api.userFunctions.createUser);
  const updateUser = useMutation(api.userFunctions.updateUser);
  const getUser = useQuery(api.userFunctions.getUserByUserID,  { user_id: userId} );
  const createEvent = useMutation(api.userFunctions.createEvent);
  const createMeetup = useMutation(api.userFunctions.createMeetup);
  const createMeetupChat = useMutation(api.userFunctions.createMeetupChat);
  const getUserEvents = useQuery(api.userFunctions.getUserEvents);
  const getUserChats = useQuery(api.userFunctions.getUserChats);
  
  const [selectedEventId, setSelectedEventId] = useState<Id<"events"> | null>(null);
  const [selectedMeetupId, setSelectedMeetupId] = useState<Id<"meetups"> | null>(null);
  const [selectedMeetupChatId, setSelectedMeetupChatId] = useState<Id<"meetupChats"> | null>(null);
  const getMeetups = useQuery(api.userFunctions.getMeetupsByEventId, 
    selectedEventId ? { eventId: selectedEventId } : "skip"
  );
  const getMeetupChat = useQuery(api.userFunctions.getMeetupChat,
    selectedMeetupChatId ? { meetupChatId: selectedMeetupChatId } : "skip"
  );
  const getChatMessages = useQuery(api.userFunctions.getMeetupChatMessages,
    selectedMeetupChatId ? { meetupChatId: selectedMeetupChatId, limit: 50 } : "skip"
  );
  const createMessage = useMutation(api.userFunctions.createMessage);
  const router = useRouter();
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState('');
  const [newEventName, setNewEventName] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newMeetupName, setNewMeetupName] = useState('');
  const [newMeetupDescription, setNewMeetupDescription] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
const handleMeetupSelection = (meetupId: Id<"meetups">) => {
  setSelectedMeetupId(meetupId);
  router.push(`/chat/${meetupId}`);
};
// Add this near the top of your component

useEffect(() => {
    console.log('useEffect triggered');
    console.log('user:', user);
    console.log('getUser:', getUser);
    console.log('userId:', user?.id);
    console.log('isCreatingUser:', isCreatingUser);

    const handleUserSetup = async () => {
      if (user && !getUser && !isCreatingUser) {
        console.log('Attempting to create user');
        setIsCreatingUser(true);
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
        } finally {
          setIsCreatingUser(false);
        }
      } else if (getUser && !getUser.isOnboarded) {
        console.log('User exists but not onboarded');
        setIsOnboarding(true);
      } else if (getUser && getUser.isOnboarded) {
        console.log('User exists and is onboarded');
        setIsOnboarding(false);
      }
    };

    handleUserSetup();
  }, [user, getUser, isCreatingUser, createUser]);

  const handleCreateUser = async () => {
    if (user) {
      setIsCreatingUser(true);
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
        });
        setIsOnboarding(true);
      } catch (error) {
        console.error('Error creating user:', error);
      } finally {
        setIsCreatingUser(false);
      }
    }
  };
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [getChatMessages]);

 
  if (!user || isCreatingUser) {
    return <div>Loading...</div>;
  }
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
    if (selectedEventId) {
      try {
        const meetupId = await createMeetup({
          eventId: selectedEventId,
          name: newMeetupName,
          description: newMeetupDescription,
          meetupTime: new Date().toISOString(),
          location: "TBD",
        });
        const chatId = await createMeetupChat({
          meetupId,
          name: `Chat for ${newMeetupName}`,
        });
        setNewMeetupName('');
        setNewMeetupDescription('');
        setSelectedMeetupId(meetupId);
        setSelectedMeetupChatId(chatId);
      } catch (error) {
        console.error('Error creating meetup:', error);
      }
    }
  };


//   if (!user) {
//     return <div>Loading...</div>;
//   }

  if (isOnboarding) {
    return (
      <Card className="w-[350px] mx-auto mt-10">
        <CardHeader>
          <CardTitle>Welcome, {user.fullName}! and {userId}</CardTitle>
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
          <TabsTrigger value="chats">Chats</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Your Events</CardTitle>
            </CardHeader>
            <CardContent>
              {getUserEvents?.map(event => (
                <div key={event._id} className="mb-2">
                  <Button
                    variant={selectedEventId === event._id ? "default" : "outline"}
                    onClick={() => setSelectedEventId(event._id)}
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
                    <Button onClick={handleCreateEvent}>Create Event</Button>
                  </div>
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
            {selectedEventId ? (
              getMeetups ? (
                getMeetups.map(meetup => (
                  <div key={meetup._id} className="mb-2 p-2 border rounded">
                    <h3 className="font-bold">{meetup.name}</h3>
                    <p>{meetup.description}</p>
                    <p>Time: {new Date(meetup.meetupTime).toLocaleString()}</p>
                    <p>Location: {meetup.location}</p>
                    <p>Status: {meetup.status}</p>
                    <Button onClick={() => handleMeetupSelection(meetup._id)}>View Chat</Button>
                  </div>
                ))
              ) : (
                <p>No meetups found for this event.</p>
              )
            ) : (
              <p>Please select an event to view its meetups.</p>
            )}
          </CardContent>
            <CardFooter>
              <Dialog>
                <DialogTrigger asChild>
                  <Button disabled={!selectedEventId}>Create Meetup</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create a New Meetup</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="meetupName">Meetup Name</Label>
                      <Input
                        id="meetupName"
                        value={newMeetupName}
                        onChange={(e) => setNewMeetupName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meetupDescription">Meetup Description</Label>
                      <Textarea
                        id="meetupDescription"
                        value={newMeetupDescription}
                        onChange={(e) => setNewMeetupDescription(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleCreateMeetup}>Create Meetup</Button>
                  </div>
                </DialogContent>
              </Dialog>
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