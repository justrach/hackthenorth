"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SheetTrigger, SheetContent, Sheet } from "@/components/ui/sheet";
import { PopoverTrigger, PopoverContent, Popover } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { TabsTrigger, TabsList, Tabs, TabsContent } from "@/components/ui/tabs";
import { AccordionTrigger, AccordionContent, AccordionItem, Accordion } from "@/components/ui/accordion";
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table";

type Event = {
  time: string;
  title: string;
  details: string;
};

type ScheduleTableProps = {
  events: Event[];
};

const ScheduleTable: React.FC<ScheduleTableProps> = ({ events }) => (
  <Table className="bg-white shadow rounded-lg">
    <TableHeader className="bg-[#eaeaea]">
      <TableRow>
        <TableHead className="text-[#555] font-semibold">Time</TableHead>
        <TableHead className="text-[#555] font-semibold">Event</TableHead>
        <TableHead className="text-[#555] font-semibold">Details</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {events.map((event, index) => (
        <TableRow key={index} className="border-b">
          <TableCell className="py-2 text-[#333]">{event.time}</TableCell>
          <TableCell className="py-2 text-[#333]">{event.title}</TableCell>
          <TableCell className="py-2 text-[#333]">{event.details}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

type DateAccordionItemProps = {
  date: string;
  events: Event[];
};

const DateAccordionItem: React.FC<DateAccordionItemProps> = ({ date, events }) => (
  <AccordionItem value={date}>
    <AccordionTrigger className="bg-white shadow rounded-lg flex justify-between items-center px-4 py-2 mb-2">
      <div>{date}</div>
      <ChevronDownIcon className="w-4 h-4 transition-transform" />
    </AccordionTrigger>
    <AccordionContent>
      <ScheduleTable events={events} />
    </AccordionContent>
  </AccordionItem>
);

export function DatePage2() {
  const [activeTab, setActiveTab] = useState("both");

  const may15Events: Event[] = [
    { time: "9:00 to 10:00 AM", title: "Physics Study Session", details: "In-depth concepts review" },
    { time: "10:30 AM to 12:00 PM", title: "Anthropology Paper Drafting", details: "Draft first section" },
    { time: "4:30 to 5:30 PM", title: "Gym Session", details: "Cardio and strength training" },
    { time: "6:30 to 8:30 PM", title: "Physics Revision", details: "Revisit challenging topics" },
  ];

  const may16Events: Event[] = [
    { time: "2:00 to 4:00 PM", title: "Finalize Anthropology Paper", details: "Final edits and references check" },
    { time: "6:30 to 9:30 PM", title: "Physics Light Review", details: "Prepare for next day test" },
  ];

  return (
    <>
      <header className="flex items-center justify-between px-4 py-2 bg-[#333] text-white">
        <div className="flex items-center">
          <Link className="flex items-center" href="#">
            <CalendarDaysIcon className="h-6 w-6 mr-2" />
            <span className="text-lg font-bold">Unwrap.life</span>
          </Link>
        </div>
        <nav className="hidden lg:flex">
          <ul className="flex space-x-4">
            <li>
              <Link className="hover:text-gray-300" href="#">
                Home
              </Link>
            </li>
            <li>
              <Link className="hover:text-gray-300" href="#">
                Features
              </Link>
            </li>
            <li>
              <Link className="hover:text-gray-300" href="#">
                Pricing
              </Link>
            </li>
            <li>
              <Link className="hover:text-gray-300" href="#">
                Contact
              </Link>
            </li>
          </ul>
        </nav>
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="text-white hover:bg-white hover:text-[#333]" size="icon" variant="outline">
                <MenuIcon className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="grid gap-2 py-6">
                <Link className="flex w-full items-center py-2 text-lg font-semibold" href="#">
                  Home
                </Link>
                <Link className="flex w-full items-center py-2 text-lg font-semibold" href="#">
                  Features
                </Link>
                <Link className="flex w-full items-center py-2 text-lg font-semibold" href="#">
                  Pricing
                </Link>
                <Link className="flex w-full items-center py-2 text-lg font-semibold" href="#">
                  Contact
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="hidden lg:block">
          <Button className="text-white hover:bg-white hover:text-[#333]" variant="outline">
            Sign Up
          </Button>
        </div>
      </header>
      <div className="bg-[#f7f7f7] p-8">
        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button className="w-[240px] justify-start text-left font-normal" variant="outline">
                    <CalendarDaysIcon className="mr-1 h-4 w-4 -translate-x-1" />
                    Select date
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar initialFocus mode="single" />
                </PopoverContent>
              </Popover>
              <h1 className="text-2xl font-bold text-[#333]">Your Schedule</h1>
            </div>
            <TabsList>
              <TabsTrigger value="both">Both Days</TabsTrigger>
              <TabsTrigger value="may-15">May 15</TabsTrigger>
              <TabsTrigger value="may-16">May 16</TabsTrigger>
            </TabsList>
            <TabsContent value="both">
              <Accordion type="multiple">
                <DateAccordionItem date="May 15, 2023" events={may15Events} />
                <DateAccordionItem date="May 16, 2023" events={may16Events} />
              </Accordion>
            </TabsContent>
            <TabsContent value="may-15">
              <Accordion  type="multiple">
                <DateAccordionItem date="May 15, 2023" events={may15Events} />
              </Accordion>
            </TabsContent>
            <TabsContent value="may-16">
              <Accordion  type="multiple">
                <DateAccordionItem date="May 16, 2023" events={may16Events} />
              </Accordion>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

function CalendarDaysIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
      <path d="M16 18h.01" />
    </svg>
  );
}

function ChevronDownIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24
24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function MenuIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}
