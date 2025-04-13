'use client';

import { useState } from 'react';
import ClinicianForm from '../components/ClinicianForm';
import ScheduleDisplay from '../components/ScheduleDisplay';
import { ScheduleEntry } from '../types';

export default function Home() {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const handleFormSubmit = async (formData: any) => {
    setIsLoading(true);
    try {
      // Make sure numeric values are properly converted to numbers
      const dataToSend = {
        ...formData,
        max_clients_per_day: Number(formData.max_clients_per_day),
        session_duration_hours: Number(formData.session_duration_hours),
        // Make sure day_of_the_week is a number in availabilities
        clinician_availabilities: formData.clinician_availabilities.map((avail: any) => ({
          ...avail,
          day_of_the_week: Number(avail.day_of_the_week)
        }))
      };
      
      console.log('Sending data to backend:', dataToSend);
      
      const response = await fetch('http://localhost:8000/optimize-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error(`Failed to generate schedule: ${errorText}`);
      }

      const data = await response.json();
      console.log('Received schedule from backend:', data);
      setSchedule(data);
      setShowForm(false); // Hide the form after successful submission
    } catch (error) {
      console.error('Error generating schedule:', error);
      alert('Failed to generate schedule. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Alpaca Health Scheduling Tool</h1>
              <p className="text-blue-100">Optimize your ABA clinic schedules</p>
            </div>
            {!showForm && schedule.length > 0 && (
              <button 
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-white text-blue-600 rounded-md shadow hover:bg-blue-50"
              >
                Edit Preferences
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {showForm ? (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Enter Your Information</h2>
            <ClinicianForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          </div>
        ) : (
          <ScheduleDisplay schedule={schedule} />
        )}
      </main>

      <footer className="bg-gray-100 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Alpaca Health Technologies &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
