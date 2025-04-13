'use client';

import { useState } from 'react';
import { ScheduleEntry, Address } from '../types';

interface ScheduleDisplayProps {
  schedule: ScheduleEntry[];
}

export default function ScheduleDisplay({ schedule }: ScheduleDisplayProps) {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [showDetailedView, setShowDetailedView] = useState(false);
  
  if (schedule.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center">
        <p className="text-gray-500">No schedule generated yet. Fill out the form to create optimized schedules.</p>
      </div>
    );
  }

  // Create 3 different schedule options - for the demo we'll just create variations of the same schedule
  const scheduleOptions = [
    {
      id: 1,
      title: "Schedule Option 1",
      schedule: schedule,
      totalHours: Math.round(schedule.length * 2), // Assuming 2 hours per session by default
      totalDriveTime: schedule.reduce((total, entry) => total + entry.drive_time, 0),
      clients: [...new Set(schedule.map(entry => entry.client_name))],
      selected: selectedOptionIndex === 0
    },
    {
      id: 2,
      title: "Schedule Option 2",
      schedule: schedule.slice(0, Math.max(schedule.length - 2, 2)), // Remove 2 entries for variation
      totalHours: Math.round((schedule.length - 2) * 2),
      totalDriveTime: schedule.slice(0, Math.max(schedule.length - 2, 2)).reduce((total, entry) => total + entry.drive_time, 0),
      clients: [...new Set(schedule.slice(0, Math.max(schedule.length - 2, 2)).map(entry => entry.client_name))],
      selected: selectedOptionIndex === 1
    },
    {
      id: 3,
      title: "Schedule Option 3",
      schedule: [...schedule.slice(2), ...schedule.slice(0, 2)], // Reorder for variation
      totalHours: Math.round(schedule.length * 2),
      totalDriveTime: schedule.reduce((total, entry) => total + entry.drive_time, 0) + 30, // Add some time for variation
      clients: [...new Set(schedule.map(entry => entry.client_name))].reverse(), // Different order
      selected: selectedOptionIndex === 2
    }
  ];

  const selectedOption = scheduleOptions[selectedOptionIndex];
  
  // Group schedule entries by day
  const scheduleByDay: { [key: number]: ScheduleEntry[] } = {};
  
  selectedOption.schedule.forEach(entry => {
    if (!scheduleByDay[entry.day]) {
      scheduleByDay[entry.day] = [];
    }
    scheduleByDay[entry.day].push(entry);
  });

  const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  function formatDriveTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  function formatAddress(address: Address): string {
    return `${address.street_name}, ${address.city}, ${address.state}`;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Compatible Client Schedules</h2>
        <p className="text-gray-600 mb-4">
          Select a schedule option that works for you. Each option shows available timeslots, drive times, and the clients who share this schedule.
        </p>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {scheduleOptions.map((option, index) => (
            <div 
              key={option.id} 
              className={`border rounded-lg overflow-hidden ${option.selected ? 'border-2 border-black' : 'border-gray-200'}`}
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">{option.title}</h3>
                  <div className="h-6 w-6 rounded-full border border-gray-300 flex items-center justify-center">
                    {option.selected && <div className="h-4 w-4 rounded-full bg-black"></div>}
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>{option.totalHours} hours total</span>
                  </div>
                  
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>{formatDriveTime(option.totalDriveTime)} drive time</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-2">Clients:</h4>
                  <div className="flex flex-wrap gap-2">
                    {option.clients.map(client => (
                      <span key={client} className="px-3 py-1 bg-gray-100 text-sm rounded-full">
                        {client}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-2">Preview:</h4>
                  <button 
                    onClick={() => {
                      setSelectedOptionIndex(index);
                      setShowDetailedView(true);
                    }}
                    className="w-full text-center py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    View Detailed Schedule
                  </button>
                </div>
                
                <button
                  onClick={() => setSelectedOptionIndex(index)}
                  className={`w-full py-2 rounded ${option.selected ? 'bg-black text-white' : 'bg-white text-black border border-gray-300'}`}
                >
                  {option.selected ? 'Selected' : 'Select Schedule'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showDetailedView && (
        <div className="mt-8 border rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">
                {selectedOption.title} Details
              </h3>
              <div className="text-sm text-gray-600">
                {selectedOption.totalHours} hours total • {formatDriveTime(selectedOption.totalDriveTime)} drive time
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-max grid grid-cols-5 divide-x">
              {dayNames.slice(1).map(day => (
                <div key={day} className="min-w-[200px]">
                  <div className="bg-gray-100 p-4 text-center font-medium">
                    {day}
                  </div>
                  <div className="divide-y">
                    {scheduleByDay[dayNames.indexOf(day)] && scheduleByDay[dayNames.indexOf(day)].map((entry, index) => (
                      <div key={`${entry.client_id}-${index}`} className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">
                            {entry.start_time} - {entry.end_time}
                          </div>
                          <div className="px-3 py-1 bg-gray-800 text-white text-sm rounded-full">
                            {entry.client_name}
                          </div>
                        </div>
                        
                        <div className="flex items-center text-gray-600 text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{formatAddress(entry.client_address)}</span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-yellow-600">{entry.drive_time}m drive time</span>
                        </div>
                      </div>
                    ))}
                    {(!scheduleByDay[dayNames.indexOf(day)] || scheduleByDay[dayNames.indexOf(day)].length === 0) && (
                      <div className="p-4 text-center text-gray-500">No appointments</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 