// "use client";

// import React, { useState, useEffect, useRef } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { useMutation, useQuery } from 'convex/react';
// import { api } from '@/convex/_generated/api';
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Id } from '@/convex/_generated/dataModel';
// import { Check, CheckCheck, Send, MessageCircle, Plus } from 'lucide-react';
// import { format } from 'date-fns';
// import { useUser } from '@clerk/nextjs';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { useToast } from "@/components/ui/use-toast";

// export default function ChatPage() {
//   const { user } = useUser();
//   const router = useRouter();
//   const params = useParams();
//   const meetupId = params.meetupId as Id<"meetups">;
//   const { toast } = useToast();
//   const createMeetupChat = useMutation(api.userFunctions.createMeetupChat); 
//   const getUserEvents = useQuery(api.userFunctions.getUserEvents);
//   const getMeetup = useQuery(api.userFunctions.getMeetup, { meetupId });
//   const getMeetups = useQuery(api.userFunctions.getMeetupsByEventId, 
//     getMeetup ? { eventId: getMeetup.eventId } : "skip"
//   );
//   const getMeetupChatId = useQuery(api.userFunctions.getMeetupChatId, { meetupId });
//   const getMeetupChat = useQuery(api.userFunctions.getMeetupChat, 
//     getMeetupChatId ? { meetupChatId: getMeetupChatId } : "skip"
//   );
//   const getChatMessages = useQuery(api.userFunctions.getMeetupChatMessages, 
//     getMeetupChatId ? { meetupChatId: getMeetupChatId } : "skip"
//   );
  
//   const createMessage = useMutation(api.userFunctions.createMessage);
//   const updateMessageStatus = useMutation(api.userFunctions.updateMessageStatus);
//   const createMeetup = useMutation(api.userFunctions.createMeetup);

//   const [newMessage, setNewMessage] = useState('');
//   const [newMeetupName, setNewMeetupName] = useState('');
//   const [newMeetupDescription, setNewMeetupDescription] = useState('');
//   const scrollAreaRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (scrollAreaRef.current) {
//       scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
//     }

//     getChatMessages?.forEach(msg => {
//       if (msg.needsDeliveryUpdate) {
//         updateMessageStatus({ 
//           messageId: msg._id, 
//           status: "delivered",
//           user_id: user?.id || ''
//         }).catch(error => console.error('Error updating message status:', error));
//       }
//     });
//   }, [getChatMessages, updateMessageStatus, user]);

//   const scrollToBottom = () => {
//     if (scrollAreaRef.current) {
//       const scrollContainer = scrollAreaRef.current.querySelector(
//         "[data-radix-scroll-area-viewport]"
//       );
//       if (scrollContainer) {
//         scrollContainer.scrollTop = scrollContainer.scrollHeight;
//       }
//     }
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [getChatMessages]);

//   const handleSendMessage = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (newMessage.trim() && getMeetupChatId && user) {
//       try {
//         await createMessage({
//           user_id: user.id,
//           content: newMessage,
//           meetupChatId: getMeetupChatId,
//         });
//         setNewMessage('');
//         scrollToBottom();
//       } catch (error) {
//         console.error('Error sending message:', error);
//       }
//     }
//   };

//   const handleCreateMeetup = async () => {
//     if (!getMeetup) return;
//     try {
//       const newMeetupId = await createMeetup({
//         eventId: getMeetup.eventId,
//         name: newMeetupName,
//         description: newMeetupDescription,
//         meetupTime: new Date().toISOString(),
//         location: "TBD",
//       });
      
//     //   Create the meetup chat immediately after creating the meetup
//       const newChatId = await createMeetupChat({
//         meetupId: newMeetupId,
//         name: `Chat for ${newMeetupName}`,
//       });
  
//       setNewMeetupName('');
//       setNewMeetupDescription('');
//       toast({
//         title: "Success",
//         description: "Meetup and chat created successfully.",
//       });
//       router.push(`/chat/${newMeetupId}`);
//     } catch (error) {
//       console.error('Error creating meetup:', error);
//       toast({
//         title: "Error",
//         description: "Failed to create meetup. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };

//   const MessageStatus = ({ message }: { message: any }) => {
//     if (message.senderId === user?.id) {
//       if (message.readAt) {
//         return <CheckCheck className="text-blue-500" size={16} />;
//       } else if (message.deliveredAt) {
//         return <Check className="text-gray-500" size={16} />;
//       }
//     }
//     return null;
//   };

//   if (!user) return <div>Loading...</div>;

//   return (
//     <div className="container mx-auto p-4 h-screen flex">
//       {/* Meetup List */}
//       <Card className="w-1/4 mr-4 overflow-hidden">
//         <CardHeader>
//           <CardTitle>Meetups</CardTitle>
//         </CardHeader>
//         <CardContent className="p-0">
//           <ScrollArea className="h-[calc(100vh-12rem)]">
//             {getMeetups?.map((meetup) => (
//               <Button
//                 key={meetup._id}
//                 variant={meetup._id === meetupId ? "secondary" : "ghost"}
//                 className="w-full justify-start"
//                 onClick={() => router.push(`/chat/${meetup._id}`)}
//               >
//                 <MessageCircle className="mr-2 h-4 w-4" />
//                 {meetup.name}
//               </Button>
//             ))}
//           </ScrollArea>
//         </CardContent>
//         <CardFooter>
//           <Dialog>
//             <DialogTrigger asChild>
//               <Button className="w-full"><Plus className="mr-2" />Create Meetup</Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Create a New Meetup</DialogTitle>
//               </DialogHeader>
//               <div className="space-y-4">
//                 <div className="space-y-2">
//                   <label htmlFor="meetupName">Meetup Name</label>
//                   <Input
//                     id="meetupName"
//                     value={newMeetupName}
//                     onChange={(e) => setNewMeetupName(e.target.value)}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <label htmlFor="meetupDescription">Meetup Description</label>
//                   <Input
//                     id="meetupDescription"
//                     value={newMeetupDescription}
//                     onChange={(e) => setNewMeetupDescription(e.target.value)}
//                   />
//                 </div>
//                 <Button onClick={handleCreateMeetup}>Create Meetup</Button>
//               </div>
//             </DialogContent>
//           </Dialog>
//         </CardFooter>
//       </Card>

//       {/* Chat Window */}
//       <Card className="w-3/4 flex flex-col overflow-hidden">
//         <CardHeader className="border-b shrink-0">
//           <CardTitle className="text-2xl font-bold">{getMeetup?.name} Chat</CardTitle>
//         </CardHeader>
//         <CardContent className="flex-grow p-0 overflow-hidden">
//           <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
//             <div className="flex flex-col-reverse">
//               {getChatMessages?.map((message) => (
//                 <div key={message._id} className={`flex items-start space-x-4 mb-4 ${message.senderId === user.id ? 'justify-end' : ''}`}>
//                   {message.senderId !== user.id && (
//                     <Avatar>
//                       <AvatarImage src="/placeholder-avatar.jpg" alt={message.senderId} />
//                       <AvatarFallback>{message.senderId.slice(0, 2).toUpperCase()}</AvatarFallback>
//                     </Avatar>
//                   )}
//                   <div className={`flex flex-col ${message.senderId === user.id ? 'items-end' : ''}`}>
//                     <div className={`rounded-lg p-3 ${message.senderId === user.id ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
//                       <p className="text-sm">{message.content}</p>
//                     </div>
//                     <div className="flex items-center mt-1 space-x-2">
//                       <p className="text-xs text-gray-500">{format(new Date(message.timestamp), 'HH:mm')}</p>
//                       <MessageStatus message={message} />
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </ScrollArea>
//         </CardContent>
//         <CardFooter className="border-t p-4 shrink-0">
//           <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
//             <Input
//               value={newMessage}
//               onChange={(e) => setNewMessage(e.target.value)}
//               placeholder="Type your message..."
//               className="flex-1"
//             />
//             <Button type="submit" size="icon">
//               <Send size={18} />
//             </Button>
//           </form>
//         </CardFooter>
//       </Card>
//     </div>
//   );
// }