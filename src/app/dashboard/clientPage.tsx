"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery, useConvexAuth } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Check, CheckCheck, Send, MessageCircle, Plus, Calendar, Menu, ArrowLeft, MapPin, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Id } from '@/convex/_generated/dataModel';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from 'framer-motion';

interface Meetup {
  _id: Id<"meetups">;
  name: string;
  participantIds: string[];
}

interface Meetup {
  _id: Id<"meetups">;
  name: string;
}
interface Event {
  _id: Id<"events">;
  _creationTime: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  organizerId: Id<"users">;
  attendees: Id<"users">[];
  inviteCodes: string[];
}
export default function DashboardPage({ userId }: { userId: string }) {
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const { toast } = useToast();
  const getUserEvents = useQuery(api.userFunctions.getUserEvents, isAuthenticated ? undefined : "skip");
  const createEvent = useMutation(api.userFunctions.createEvent);
  const joinEventWithCode = useMutation(api.userFunctions.joinEventWithCode);
  const createMeetup = useMutation(api.userFunctions.createMeetup);
  const createMeetupChat = useMutation(api.userFunctions.createMeetupChat);
  const createMessage = useMutation(api.userFunctions.createMessage);
  const updateMessageStatus = useMutation(api.userFunctions.updateMessageStatus);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedMeetup, setSelectedMeetup] = useState<Meetup | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const userProfiles = useQuery(api.userFunctions.getUserProfiles, isAuthenticated ? undefined : "skip");

  const [newEventName, setNewEventName] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [newMeetupName, setNewMeetupName] = useState('');
  const [newMeetupDescription, setNewMeetupDescription] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const personalMeetups = useQuery(api.userFunctions.getPersonalMeetupsByEventId, 
    isAuthenticated && selectedEvent && user ? { eventId: selectedEvent._id } : "skip"
  );

  const globalMeetups = useQuery(api.userFunctions.getGlobalMeetupsByEventId, 
    isAuthenticated && selectedEvent ? { eventId: selectedEvent._id } : "skip"
  );

  const getMeetupChatId = useQuery(api.userFunctions.getMeetupChatId, 
    isAuthenticated && selectedMeetup ? { meetupId: selectedMeetup._id } : "skip"
  );

  const getChatMessages = useQuery(api.userFunctions.getMeetupChatMessages, 
    isAuthenticated && getMeetupChatId ? { meetupChatId: getMeetupChatId } : "skip"
  );

  const getMeetupDetails = useQuery(api.userFunctions.getMeetupDetails, 
    isAuthenticated && selectedMeetup ? { meetupId: selectedMeetup._id } : "skip"
  );

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [getChatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && getMeetupChatId && user) {
      try {
        await createMessage({
          user_id: user.id,
          content: newMessage,
          meetupChatId: getMeetupChatId,
        });
        setNewMessage('');
        scrollToBottom();
      } catch (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }

    getChatMessages?.forEach(msg => {
      if (msg.needsDeliveryUpdate) {
        updateMessageStatus({ 
          messageId: msg._id, 
          status: "delivered",
          user_id: userId
        }).catch(error => {
          console.error('Error updating message status:', error);
          toast({
            title: "Error",
            description: "Failed to update message status.",
            variant: "destructive",
          });
        });
      }
    });
  }, [getChatMessages, updateMessageStatus, userId, toast]);

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
        locationName: "TBD",
        isPublic: false,
        invitedUsernames: [],
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

  const MessageStatus = ({ message }: { message: any }) => {
    if (message.senderId === user?.id) {
      if (message.readAt) {
        return <CheckCheck className="text-blue-500" size={16} />;
      } else if (message.deliveredAt) {
        return <Check className="text-gray-500" size={16} />;
      }
    }
    return null;
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-indigo-700 font-semibold"
          >
            Loading your dashboard...
          </motion.p>
        </motion.div>
      </div>
    );
  }
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden"
    >
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-white p-4 flex justify-between items-center border-b border-gray-200"
      >
        <h1 className="text-xl font-bold text-indigo-700">Dashboard</h1>
        <Button variant="ghost" size="icon" onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}>
          <Menu size={24} className="text-indigo-600" />
        </Button>
      </motion.div>

      <div className="flex-1 flex overflow-hidden">
        <AnimatePresence>
          {(isMobile ? isSidePanelOpen : true) && (
            <motion.div
              initial={isMobile ? { x: -300 } : { x: 0 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`bg-white border-r border-gray-200 flex flex-col ${isMobile ? 'fixed inset-y-0 left-0 z-50 w-64' : 'w-1/4'}`}
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-indigo-700">Events & Meetups</h2>
                {isMobile && (
                  <Button variant="ghost" size="icon" onClick={() => setIsSidePanelOpen(false)}>
                    <ArrowLeft size={24} className="text-indigo-600" />
                  </Button>
                )}
              </div>
              <ScrollArea className="flex-grow">
                <AnimatePresence>
                  {getUserEvents?.map((event) => (
                    <motion.div
                      key={event._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="p-2"
                    >
                      <Button
                        variant={event._id === selectedEvent?._id ? "secondary" : "ghost"}
                        className="w-full justify-start text-left"
                        onClick={() => {
                          setSelectedEvent(event);
                          if (isMobile) setIsSidePanelOpen(false);
                        }}
                      >
                        <Calendar className="mr-2 h-4 w-4 text-indigo-500" />
                        {event.name}
                      </Button>
                      {event._id === selectedEvent?._id && (
                        <Tabs defaultValue="personal" className="w-full mt-2">
                          <TabsList className="w-full">
                            <TabsTrigger value="personal" className="w-1/2">Personal</TabsTrigger>
                            <TabsTrigger value="global" className="w-1/2">Global</TabsTrigger>
                          </TabsList>
                          <TabsContent value="personal">
  {personalMeetups?.map((meetup) => {
    const otherUser = userProfiles?.find(profile => profile.user_id !== user?.id && meetup.participantIds.includes(profile.user_id));
    return (
      <Button
        key={meetup._id}
        variant={meetup._id === selectedMeetup?._id ? "secondary" : "ghost"}
        className="w-full justify-start pl-8 text-left mt-1"
        onClick={() => {
          setSelectedMeetup(meetup);
          if (isMobile) setIsSidePanelOpen(false);
        }}
      >
        <Avatar className="w-6 h-6 mr-2">
          <AvatarImage 
            src={otherUser?.profilePictureUrl || ''} 
            alt={otherUser?.username || 'Participant'} 
          />
          <AvatarFallback>{otherUser?.username?.slice(0, 2).toUpperCase() || meetup.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        {otherUser?.username || meetup.name}
      </Button>
    );
  })}
</TabsContent>
                          <TabsContent value="global">
                            {globalMeetups?.map((meetup) => (
                              <Button
                                key={meetup._id}
                                variant={meetup._id === selectedMeetup?._id ? "secondary" : "ghost"}
                                className="w-full justify-start pl-8 text-left mt-1"
                                onClick={() => {
                                  setSelectedMeetup(meetup);
                                  if (isMobile) setIsSidePanelOpen(false);
                                }}
                              >
                                <MessageCircle className="mr-2 h-4 w-4 text-indigo-400" />
                                {meetup.name}
                              </Button>
                            ))}
                          </TabsContent>
                        </Tabs>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </ScrollArea>
              <div className="p-4 border-t border-gray-200">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700"><Plus className="mr-2" />Join Event</Button>
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
                        />
                      </div>
                      <Button onClick={handleJoinEvent} className="bg-indigo-600 hover:bg-indigo-700">Join Event</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex-1 flex flex-col overflow-hidden"
        >
      <div className="p-4 bg-white border-b border-gray-200">
  {selectedMeetup ? (
    <div className="flex items-center">
      <Avatar className="w-8 h-8 mr-2">
        <AvatarImage 
          src={userProfiles?.find(profile => profile.user_id !== user?.id && selectedMeetup.participantIds.includes(profile.user_id))?.profilePictureUrl || ''} 
          alt="Participant" 
        />
        <AvatarFallback>
          {userProfiles?.find(profile => profile.user_id !== user?.id && selectedMeetup.participantIds.includes(profile.user_id))?.username?.slice(0, 2).toUpperCase() || ''}
        </AvatarFallback>
      </Avatar>
      <h2 className="text-2xl font-bold text-indigo-700">
        {userProfiles?.find(profile => profile.user_id !== user?.id && selectedMeetup.participantIds.includes(profile.user_id))?.username || 'Chat'}
      </h2>
    </div>
  ) : (
    <h2 className="text-2xl font-bold text-indigo-700">
      {selectedEvent ? selectedEvent.name : 'Select an Event or Meetup'}
    </h2>
  )}
  {selectedMeetup && getMeetupDetails?.location && (
    <Button
      variant="outline"
      size="sm"
      className="mt-2 text-indigo-600 border-indigo-300 hover:bg-indigo-50"
      onClick={() => getMeetupDetails?.location?.url && window.open(getMeetupDetails.location.url, '_blank')}
    >
      <MapPin className="mr-2 h-4 w-4" />
      {getMeetupDetails?.location?.name}
    </Button>
  )}
</div>
          <div className="flex-1 overflow-hidden flex flex-col">
            {selectedMeetup ? (
              <>
                <ScrollArea className="flex-1 p-4">
                  <AnimatePresence>
                    {getChatMessages?.slice().reverse().map((message) => (
                      <motion.div
                        key={message._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'} mb-4`}
                      >
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
                            <div className={`rounded-lg p-3 ${message.senderId === user.id ? 'bg-indigo-500 text-white' : 'bg-white border border-gray-200'}`}>
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
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </ScrollArea>
                <div className="p-4 bg-white border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" size="icon" className="bg-indigo-600 hover:bg-indigo-700">
                      <Send size={18} />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="h-full flex items-center justify-center"
              >
                {selectedEvent ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-indigo-600 hover:bg-indigo-700"><Plus className="mr-2" />Create Meetup</Button>
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
                        <Button onClick={handleCreateMeetup} className="bg-indigo-600 hover:bg-indigo-700">Create Meetup</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <p className="text-gray-500">Select an event to view meetups or create a new one</p>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}