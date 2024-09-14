"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Check, CheckCheck, Send, MessageCircle, Plus, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Id } from '@/convex/_generated/dataModel';
import { ScrollArea } from '@/components/ui/scroll-area';

// Add these interfaces at the top of your file
interface Event {
    _id: Id<"events">;
    name: string;
    // ... other properties
  }
  interface Meetup {
    _id: Id<"meetups">;
    name: string;
    // ... other properties
  }
  
export default function Dashboard() {
  const { user } = useUser();
  const { toast } = useToast();
  const getUserEvents = useQuery(api.userFunctions.getUserEvents);
  const createEvent = useMutation(api.userFunctions.createEvent);
  const joinEventWithCode = useMutation(api.userFunctions.joinEventWithCode);
  const createMeetup = useMutation(api.userFunctions.createMeetup);
  const createMeetupChat = useMutation(api.userFunctions.createMeetupChat);
  const createMessage = useMutation(api.userFunctions.createMessage);
  const updateMessageStatus = useMutation(api.userFunctions.updateMessageStatus);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedMeetup, setSelectedMeetup] = useState<Meetup | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const userProfiles = useQuery(api.userFunctions.getUserProfiles);

  const [newEventName, setNewEventName] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [newMeetupName, setNewMeetupName] = useState('');
  const [newMeetupDescription, setNewMeetupDescription] = useState('');
  const [newMessage, setNewMessage] = useState('');


  const meetups = useQuery(api.userFunctions.getMeetupsByEventId, 
    selectedEvent ? { eventId: selectedEvent._id } : "skip"
  );

  const getMeetupChatId = useQuery(api.userFunctions.getMeetupChatId, 
    selectedMeetup ? { meetupId: selectedMeetup._id } : "skip"
  );

  const getChatMessages = useQuery(api.userFunctions.getMeetupChatMessages, 
    getMeetupChatId ? { meetupChatId: getMeetupChatId } : "skip"
  );

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }

    getChatMessages?.forEach(msg => {
      if (msg.needsDeliveryUpdate) {
        updateMessageStatus({ 
          messageId: msg._id, 
          status: "delivered",
          user_id: user?.id || ''
        }).catch(error => console.error('Error updating message status:', error));
      }
    });
  }, [getChatMessages, updateMessageStatus, user]);

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
      toast({ title: "Success", description: "Event created successfully." });
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
      toast({ title: "Success", description: "You've successfully joined the event." });
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
    if (!selectedEvent) return;
    try {
      const newMeetupId = await createMeetup({
        eventId: selectedEvent._id,
        name: newMeetupName,
        description: newMeetupDescription,
        meetupTime: new Date().toISOString(),
        location: "TBD",
      });
      
      await createMeetupChat({
        meetupId: newMeetupId,
        name: `Chat for ${newMeetupName}`,
      });

      setNewMeetupName('');
      setNewMeetupDescription('');
      toast({ title: "Success", description: "Meetup created successfully." });
    } catch (error) {
      console.error('Error creating meetup:', error);
      toast({
        title: "Error",
        description: "Failed to create meetup. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async (e:any) => {
    e.preventDefault();
    if (newMessage.trim() && getMeetupChatId && user) {
      try {
        await createMessage({
          user_id: user.id,
          content: newMessage,
          meetupChatId: getMeetupChatId,
        });
        setNewMessage('');
        // Scroll to bottom after sending a message
        setTimeout(() => {
          if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
          }
        }, 0);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };
  const MessageStatus = ({ message }:any) => {
    if (message.senderId === user?.id) {
      if (message.readAt) {
        return <CheckCheck className="text-blue-500" size={16} />;
      } else if (message.deliveredAt) {
        return <Check className="text-gray-500" size={16} />;
      }
    }
    return null;
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Panel: Events & Meetups */}
      <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Events & Meetups</h2>
        </div>
        <ScrollArea className="flex-grow">
          {getUserEvents?.map((event) => (
            <div key={event._id} className="p-2">
              <Button
                variant={event._id === selectedEvent?._id ? "secondary" : "ghost"}
                className="w-full justify-start text-left"
                onClick={() => setSelectedEvent(event)}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {event.name}
              </Button>
              {event._id === selectedEvent?._id && meetups?.map((meetup) => (
                <Button
                  key={meetup._id}
                  variant={meetup._id === selectedMeetup?._id ? "secondary" : "ghost"}
                  className="w-full justify-start pl-8 text-left mt-1"
                  onClick={() => setSelectedMeetup(meetup)}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {meetup.name}
                </Button>
              ))}
            </div>
          ))}
        </ScrollArea>
        <div className="p-4 border-t border-gray-200">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full"><Plus className="mr-2" />Join Event</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join an Event</DialogTitle>
              </DialogHeader>
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
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Right Panel: Chat or Event/Meetup Details */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 bg-white border-b border-gray-200">
          <h1 className="text-2xl font-bold">
            {selectedMeetup ? `${selectedMeetup.name} Chat` : (selectedEvent ? selectedEvent.name : 'Select an Event or Meetup')}
          </h1>
        </div>
        <div className="flex-1 overflow-hidden">
          {selectedMeetup ? (
            <div className="h-full flex flex-col">
              <div className="flex-1 p-4 overflow-auto" ref={scrollAreaRef}>
                {getChatMessages?.slice().reverse().map((message) => (
                  <div key={message._id} className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'} mb-4`}>
                    <div className={`flex ${message.senderId === user.id ? 'flex-row-reverse' : 'flex-row'} items-end max-w-[70%]`}>
                      {message.senderId !== user.id && (
                        <Avatar className="w-8 h-8 mr-2">
                          <AvatarImage 
                            src={userProfiles?.find(profile => profile.user_id === message.senderId)?.profilePictureUrl || ''} 
                            alt={message.senderId} 
                          />
                          <AvatarFallback>{message.senderId.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`flex flex-col ${message.senderId === user.id ? 'items-end' : 'items-start'}`}>
                        <div className={`rounded-lg p-3 ${message.senderId === user.id ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200'}`}>
                          {message.senderId !== user.id && (
                            <p className="text-xs font-semibold mb-1 text-gray-600">
                              {userProfiles?.find(profile => profile.user_id === message.senderId)?.username || 'Unknown User'}
                            </p>
                          )}
                          <p className={`text-sm ${message.senderId === user.id ? 'text-white' : 'text-gray-800'}`}>{message.content}</p>
                        </div>
                        <div className={`flex items-center mt-1 space-x-2 ${message.senderId === user.id ? 'flex-row-reverse' : 'flex-row'}`}>
                          <p className="text-xs text-gray-500">{format(new Date(message.timestamp), 'HH:mm')}</p>
                          <MessageStatus message={message} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button type="submit" size="icon">
                    <Send size={18} />
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              {selectedEvent ? (
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
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="meetupDescription">Meetup Description</label>
                        <Input
                          id="meetupDescription"
                          value={newMeetupDescription}
                          onChange={(e) => setNewMeetupDescription(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleCreateMeetup}>Create Meetup</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <p className="text-gray-500">Select an event to view meetups or create a new one</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}