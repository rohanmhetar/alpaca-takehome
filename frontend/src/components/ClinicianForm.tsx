'use client';

import { useState, useEffect } from 'react';
import { Address, Availability } from '../types';

interface ClinicianFormProps {
  onSubmit: (data: {
    clinician_address: Address;
    clinician_availabilities: Availability[];
    max_clients_per_day: number;
    session_duration_hours: number;
  }) => void;
  isLoading: boolean;
}

export default function ClinicianForm({ onSubmit, isLoading }: ClinicianFormProps) {
  const [cities, setCities] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    street_name: '',
    city: '',
    state: 'CA',
    zip_code: '',
    max_clients_per_day: 4,
    session_duration_hours: 2,
  });

  const [availabilities, setAvailabilities] = useState<Availability[]>([
    { day_of_the_week: 1, start_time: '09:00', end_time: '17:00' },
    { day_of_the_week: 2, start_time: '09:00', end_time: '17:00' },
    { day_of_the_week: 3, start_time: '09:00', end_time: '17:00' },
    { day_of_the_week: 4, start_time: '09:00', end_time: '17:00' },
    { day_of_the_week: 5, start_time: '09:00', end_time: '17:00' },
  ]);

  useEffect(() => {
    fetch('http://localhost:8000/city-list')
      .then(response => response.json())
      .then(data => {
        setCities(data.cities);
        if (data.cities.length > 0) {
          setFormData(prev => ({ ...prev, city: data.cities[0] }));
        }
      })
      .catch(error => console.error('Error fetching cities:', error));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Function to ensure time is in 24-hour format (HH:MM)
  const formatTime = (timeStr: string): string => {
    // If time already has correct format, return it
    if (/^\d{2}:\d{2}$/.test(timeStr)) {
      return timeStr;
    }
    
    try {
      // Convert to 24-hour format
      const date = new Date(`1970-01-01T${timeStr}`);
      return date.toTimeString().substring(0, 5);
    } catch (e) {
      console.error('Error formatting time:', e);
      return timeStr; // Return original if there's an error
    }
  };

  const handleAvailabilityChange = (
    day: number,
    field: 'start_time' | 'end_time',
    value: string
  ) => {
    // Format time to ensure it's in 24-hour format (HH:MM)
    const formattedTime = formatTime(value);
    
    console.log(`Updating ${field} for day ${day} to ${formattedTime}`);
    
    setAvailabilities(
      availabilities.map(avail =>
        avail.day_of_the_week === day ? { ...avail, [field]: formattedTime } : avail
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const clinician_address: Address = {
      street_name: formData.street_name,
      city: formData.city,
      state: formData.state,
      zip_code: formData.zip_code,
    };

    // Log the data being sent for debugging
    const dataToSubmit = {
      clinician_address,
      clinician_availabilities: availabilities,
      max_clients_per_day: Number(formData.max_clients_per_day),
      session_duration_hours: Number(formData.session_duration_hours),
    };
    
    console.log('Submitting data:', dataToSubmit);

    onSubmit(dataToSubmit);
  };

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Your Address</h3>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="street_name" className="block text-sm font-medium text-gray-700">
              Street Address
            </label>
            <input
              type="text"
              id="street_name"
              name="street_name"
              value={formData.street_name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <select
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {cities.map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700">
              ZIP Code
            </label>
            <input
              type="text"
              id="zip_code"
              name="zip_code"
              value={formData.zip_code}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Preferences</h3>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="max_clients_per_day" className="block text-sm font-medium text-gray-700">
              Maximum Clients Per Day
            </label>
            <input
              type="number"
              id="max_clients_per_day"
              name="max_clients_per_day"
              value={formData.max_clients_per_day}
              onChange={handleInputChange}
              min="1"
              max="10"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="session_duration_hours" className="block text-sm font-medium text-gray-700">
              Session Duration (hours)
            </label>
            <input
              type="number"
              id="session_duration_hours"
              name="session_duration_hours"
              value={formData.session_duration_hours}
              onChange={handleInputChange}
              min="1"
              max="4"
              step="0.5"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Your Weekly Availability</h3>
        
        <div className="space-y-4">
          {availabilities.map((avail, index) => (
            <div key={avail.day_of_the_week} className="flex items-center space-x-4">
              <div className="w-24">
                <span className="text-sm font-medium text-gray-700">{dayNames[index]}</span>
              </div>
              
              <div>
                <label htmlFor={`start-time-${avail.day_of_the_week}`} className="sr-only">
                  Start Time
                </label>
                <input
                  type="time"
                  id={`start-time-${avail.day_of_the_week}`}
                  value={avail.start_time}
                  onChange={(e) => handleAvailabilityChange(avail.day_of_the_week, 'start_time', e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <span className="text-gray-500">to</span>
              
              <div>
                <label htmlFor={`end-time-${avail.day_of_the_week}`} className="sr-only">
                  End Time
                </label>
                <input
                  type="time"
                  id={`end-time-${avail.day_of_the_week}`}
                  value={avail.end_time}
                  onChange={(e) => handleAvailabilityChange(avail.day_of_the_week, 'end_time', e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
        >
          {isLoading ? 'Generating Schedule...' : 'Generate Optimized Schedule'}
        </button>
      </div>
    </form>
  );
} 