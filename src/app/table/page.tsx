"use client"
import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Data for events
const events = [
  {
    date: "2024-04-25",
    time: "09:00 - 10:00",
    methodName: "Physics Study Session",
    detail: "In-depth concepts review",
  },
  {
    date: "2024-04-25",
    time: "10:30 - 12:00",
    methodName: "Anthropology Paper Drafting",
    detail: "Draft first section",
  },
  {
    date: "2024-04-25",
    time: "16:30 - 17:30",
    methodName: "Gym Session",
    detail: "Cardio and strength training",
  },
  {
    date: "2024-04-25",
    time: "18:30 - 20:30",
    methodName: "Physics Revision",
    detail: "Revisit challenging topics",
  },
  {
    date: "2024-04-25",
    time: "14:00 - 16:00",
    methodName: "Finalize Anthropology Paper",
    detail: "Final edits and references check",
  },
  {
    date: "2024-04-25",
    time: "18:30 - 21:30",
    methodName: "Physics Light Review",
    detail: "Prepare for next day test",
  }
];

function hasEventPassed(eventDate: string, eventTime: string): boolean {
  const [startTime, endTime] = eventTime.split(" - ");
  const currentDate = new Date();
  const endDate = new Date(`${eventDate}T${endTime}:00`);
  return currentDate > endDate;
}


function convertTimeFormat(time:any, format:any) {
  const [startTime, endTime] = time.split(' - ');
  const [startHours, startMinutes] = startTime.split(':');
  const [endHours, endMinutes] = endTime.split(':');

  // Convert hours to numbers to handle comparisons and transformations
  const startH = parseInt(startHours);
  const endH = parseInt(endHours);

  if (format === '12hr') {
    const startAMPM = startH >= 12 ? 'PM' : 'AM';
    const endAMPM = endH >= 12 ? 'PM' : 'AM';
    const startDisplayHours = (startH % 12 === 0 ? 12 : startH % 12);
    const endDisplayHours = (endH % 12 === 0 ? 12 : endH % 12);

    if (startAMPM === endAMPM) {
      // If both times are within the same AM or PM
      return `${startDisplayHours}:${startMinutes} to ${endDisplayHours}:${endMinutes} ${startAMPM}`;
    } else {
      // If the times span AM to PM
      return `${startDisplayHours}:${startMinutes} ${startAMPM} to ${endDisplayHours}:${endMinutes} ${endAMPM}`;
    }
  } else {
    // For 24-hour format
    const startTimeFormatted = `${startH}:${startMinutes}`;
    const endTimeFormatted = `${endH}:${endMinutes}`;
    return `${startTimeFormatted} to ${endTimeFormatted}`;
  }
}


export default function TableDemo() {
  const [timeFormat, setTimeFormat] = useState('12hr');

  return (
    <div className='p-8'>
      <Select onValueChange={value => setTimeFormat(value)}>
        <SelectTrigger className="w-[180px] mb-4">
          <SelectValue placeholder="Select Time Format" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Time Format</SelectLabel>
            <SelectItem value="24hr" onSelect={() => setTimeFormat('24hr')}>24-Hour</SelectItem>
            <SelectItem value="12hr" onSelect={() => setTimeFormat('12hr')}>AM/PM</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Table>
        <TableCaption className="text-lg font-semibold">Your Schedule for Upcoming Events</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Event</TableHead>
            <TableHead className="w-2/3">Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event, index) => (
            <TableRow key={index} className={hasEventPassed(event.date, event.time) ? 'bg-gray-300 opacity-50' : ''}>
              <TableCell>{convertTimeFormat(event.time, timeFormat)}</TableCell>
              <TableCell>{event.methodName}</TableCell>
              <TableCell>{event.detail}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
