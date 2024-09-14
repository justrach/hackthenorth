"use client"
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function ToDoItems() {

  type TaskType = {
    id: number;
    title: string;
    description: string;
    dueDate: string;
    assignedTo: string;
    priority: string;
    notes: string;
  } | null;
  const [selectedTask, setSelectedTask] = useState<TaskType>(null);
  
  const tasks = [
    {
      id: 1,
      title: 'Finish the quarterly report',
      description: 'The quarterly report needs to be completed by the end of the month. It should include financial statements, sales projections, and a summary of key achievements.',
      dueDate: '',
      assignedTo: '',
      priority: 'medium',
      notes: ''
    },
    {
      id: 2,
      title: 'Attend the team meeting',
      description: '',
      dueDate: '',
      assignedTo: '',
      priority: '',
      notes: ''
    },
    {
      id: 3,
      title: 'Prepare the presentation slides',
      description: '',
      dueDate: '',
      assignedTo: '',
      priority: '',
      notes: ''
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>To-Do Subjects</CardTitle>
          <CardDescription>Manage your daily subjects and tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input className="flex-1" placeholder="Add a new subject" />
              <Button >Add</Button>
            </div>
            <div className="space-y-2">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className={`flex items-center gap-2 rounded-md p-2 ${task.id === selectedTask?.id ? 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100' : 'bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100'}`}
                  onClick={() => setSelectedTask(task)}
                >
                  {/* <CheckIcon className="h-5 w-5" /> */}
                  <span className="flex-1">{task.title}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            key={selectedTask.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            layout
          >
            <Card>
              <CardHeader>
                <CardTitle>Task Details</CardTitle>
                <CardDescription>View and manage the details of a specific task.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 rounded-md bg-green-100 p-2 text-green-900 dark:bg-green-900 dark:text-green-100">
                    {/* <CheckIcon className="h-5 w-5" /> */}
                    <span className="flex-1">
                      <div className="flex flex-col">
                        <span>{selectedTask.title}</span>
                        <small className="text-sm font-normal text-gray-500 dark:text-gray-400">
                          {selectedTask.description}
                        </small>
                      </div>
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input id="dueDate" type="date" value={selectedTask.dueDate} onChange={(e) => setSelectedTask({ ...selectedTask, dueDate: e.target.value })} />
                    <Label htmlFor="assignedTo">Assigned To</Label>
                    <Input id="assignedTo" type="text" value={selectedTask.assignedTo} onChange={(e) => setSelectedTask({ ...selectedTask, assignedTo: e.target.value })} />
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={selectedTask.priority} onValueChange={(value:any) => setSelectedTask({ ...selectedTask, priority: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" value={selectedTask.notes} onChange={(e) => setSelectedTask({ ...selectedTask, notes: e.target.value })} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button  onClick={() => setSelectedTask(null)}>Cancel</Button>
                    <Button>Save Changes</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// function CheckIcon(props:any) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M20 6 9 17l-5-5" />
//     </svg>
//   );
// }
