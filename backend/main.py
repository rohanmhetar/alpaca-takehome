from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime, time
import heapq
from fastapi.responses import JSONResponse

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
class Address(BaseModel):
    street_name: str
    city: str
    state: str
    zip_code: str

class Availability(BaseModel):
    day_of_the_week: int
    start_time: str
    end_time: str

class Client(BaseModel):
    id: str
    name: str
    availabilities: List[Availability]
    address: Address

class Clinician(BaseModel):
    id: str
    name: str
    availabilities: List[Availability]
    address: Address
    max_clients_per_day: int
    session_duration_hours: int

class ScheduleInput(BaseModel):
    clinician_address: Address
    clinician_availabilities: List[Availability] = Field(default_factory=list)
    max_clients_per_day: int = 4
    session_duration_hours: int = 2

class ScheduleOutput(BaseModel):
    day: int
    client_id: str
    client_name: str
    start_time: str
    end_time: str
    client_address: Address
    drive_time: int

# Sample data (would normally be stored in a database)
clients = [
    {
        "id": "C001",
        "name": "Alex Johnson",
        "availabilities": [
            {"day_of_the_week": 1, "start_time": "09:00", "end_time": "11:00"},
            {"day_of_the_week": 1, "start_time": "15:00", "end_time": "17:00"},
            {"day_of_the_week": 3, "start_time": "13:00", "end_time": "15:00"},
            {"day_of_the_week": 5, "start_time": "10:00", "end_time": "12:00"}
        ],
        "address": {
            "street_name": "123 Pine St",
            "city": "San Francisco",
            "state": "CA",
            "zip_code": "94109"
        }
    },
    {
        "id": "C002",
        "name": "Sam Williams",
        "availabilities": [
            {"day_of_the_week": 2, "start_time": "08:00", "end_time": "10:00"},
            {"day_of_the_week": 2, "start_time": "13:00", "end_time": "15:00"},
            {"day_of_the_week": 4, "start_time": "09:00", "end_time": "11:00"},
            {"day_of_the_week": 4, "start_time": "16:00", "end_time": "18:00"}
        ],
        "address": {
            "street_name": "456 Oak Ave",
            "city": "Oakland",
            "state": "CA",
            "zip_code": "94610"
        }
    },
    {
        "id": "C003",
        "name": "Jordan Brown",
        "availabilities": [
            {"day_of_the_week": 1, "start_time": "10:00", "end_time": "12:00"},
            {"day_of_the_week": 2, "start_time": "14:00", "end_time": "16:00"},
            {"day_of_the_week": 3, "start_time": "09:00", "end_time": "11:00"},
            {"day_of_the_week": 5, "start_time": "13:00", "end_time": "15:00"}
        ],
        "address": {
            "street_name": "789 Maple Dr",
            "city": "Berkeley",
            "state": "CA",
            "zip_code": "94703"
        }
    },
    # Adding more clients from the example data
    {
        "id": "C004",
        "name": "Casey Smith",
        "availabilities": [
            {"day_of_the_week": 1, "start_time": "13:00", "end_time": "15:00"},
            {"day_of_the_week": 3, "start_time": "10:00", "end_time": "12:00"},
            {"day_of_the_week": 4, "start_time": "14:00", "end_time": "16:00"},
            {"day_of_the_week": 5, "start_time": "09:00", "end_time": "11:00"}
        ],
        "address": {
            "street_name": "321 Birch Blvd",
            "city": "Palo Alto",
            "state": "CA",
            "zip_code": "94301"
        }
    },
    {
        "id": "C005",
        "name": "Taylor Chen",
        "availabilities": [
            {"day_of_the_week": 2, "start_time": "10:00", "end_time": "12:00"},
            {"day_of_the_week": 3, "start_time": "15:00", "end_time": "17:00"},
            {"day_of_the_week": 4, "start_time": "08:00", "end_time": "10:00"},
            {"day_of_the_week": 5, "start_time": "14:00", "end_time": "16:00"}
        ],
        "address": {
            "street_name": "654 Cedar St",
            "city": "San Jose",
            "state": "CA",
            "zip_code": "95112"
        }
    }
]

# City-to-city average drive times in minutes (one-way)
CITY_DRIVE_TIMES = {
    ("San Francisco", "Oakland"): 25,
    ("San Francisco", "Berkeley"): 35,
    ("San Francisco", "Palo Alto"): 45,
    ("San Francisco", "San Jose"): 60,
    ("San Francisco", "Mountain View"): 50,
    ("San Francisco", "Fremont"): 45,
    ("San Francisco", "Sunnyvale"): 55,
    ("San Francisco", "Santa Clara"): 55,
    ("San Francisco", "San Mateo"): 25,
    ("San Francisco", "Hayward"): 35,
    ("San Francisco", "Walnut Creek"): 40,
    ("San Francisco", "Millbrae"): 20,
    ("San Francisco", "Daly City"): 15,
    ("San Francisco", "South San Francisco"): 15,
    
    ("Oakland", "Berkeley"): 15,
    ("Oakland", "Palo Alto"): 40,
    ("Oakland", "San Jose"): 45,
    ("Oakland", "Mountain View"): 40,
    ("Oakland", "Fremont"): 30,
    ("Oakland", "Sunnyvale"): 45,
    ("Oakland", "Santa Clara"): 45,
    ("Oakland", "San Mateo"): 30,
    ("Oakland", "Hayward"): 20,
    ("Oakland", "Walnut Creek"): 25,
    ("Oakland", "Millbrae"): 30,
    ("Oakland", "Daly City"): 30,
    ("Oakland", "South San Francisco"): 25,
    
    ("Berkeley", "Palo Alto"): 45,
    ("Berkeley", "San Jose"): 55,
    ("Berkeley", "Mountain View"): 50,
    ("Berkeley", "Fremont"): 35,
    ("Berkeley", "Sunnyvale"): 50,
    ("Berkeley", "Santa Clara"): 50,
    ("Berkeley", "San Mateo"): 35,
    ("Berkeley", "Hayward"): 25,
    ("Berkeley", "Walnut Creek"): 25,
    ("Berkeley", "Millbrae"): 35,
    ("Berkeley", "Daly City"): 35,
    ("Berkeley", "South San Francisco"): 30,
    
    ("Palo Alto", "San Jose"): 20,
}

# Base drive time within the same city in minutes
SAME_CITY_DRIVE_TIME = 15

def get_drive_time(origin_address: Address, destination_address: Address) -> int:
    """
    Get the estimated drive time in minutes between two addresses.
    """
    origin_city = origin_address.city
    destination_city = destination_address.city
    
    # If same city, use base drive time
    if origin_city == destination_city:
        return SAME_CITY_DRIVE_TIME
    
    # Try to find the city pair in our lookup table
    drive_time = CITY_DRIVE_TIMES.get((origin_city, destination_city))
    
    # If not found, try the reverse order
    if drive_time is None:
        drive_time = CITY_DRIVE_TIMES.get((destination_city, origin_city))
    
    # If still not found, estimate based on similar cities or use a default
    if drive_time is None:
        # Default fallback estimate
        drive_time = 45
    
    return drive_time

def time_to_minutes(time_str: str) -> int:
    """Convert time string (HH:MM or other formats) to minutes since midnight."""
    try:
        # Check if the format is already HH:MM with 24-hour time
        if ":" in time_str and len(time_str) == 5:
            hours, minutes = map(int, time_str.split(':'))
            return hours * 60 + minutes
        
        # Handle other time formats by parsing with datetime
        from datetime import datetime
        # Try to parse common time formats
        for fmt in ["%H:%M", "%I:%M %p", "%I:%M%p"]:
            try:
                dt = datetime.strptime(time_str, fmt)
                return dt.hour * 60 + dt.minute
            except ValueError:
                continue
                
        # If we get here, no format matched, try one last approach
        # Try to treat the input as an ISO time string
        try:
            dt = datetime.fromisoformat(f"2000-01-01T{time_str}")
            return dt.hour * 60 + dt.minute
        except ValueError:
            # If all else fails, fall back to our original approach
            if ":" in time_str:
                hours, minutes = map(int, time_str.split(':'))
                return hours * 60 + minutes
            raise ValueError(f"Could not parse time: {time_str}")
            
    except Exception as e:
        print(f"Error converting time {time_str}: {e}")
        # Default to 9:00 if we can't parse
        return 9 * 60

def minutes_to_time(minutes: int) -> str:
    """Convert minutes since midnight to time string (HH:MM)."""
    hours = minutes // 60
    mins = minutes % 60
    return f"{hours:02d}:{mins:02d}"

def check_overlap(slot1_start: int, slot1_end: int, slot2_start: int, slot2_end: int) -> bool:
    """Check if two time slots overlap."""
    return max(slot1_start, slot2_start) < min(slot1_end, slot2_end)

def optimize_schedule(clinician_input: ScheduleInput) -> List[ScheduleOutput]:
    """
    Generate an optimized weekly schedule for the clinician.
    The algorithm maximizes the number of working hours while respecting drive times.
    """
    print(f"Starting schedule optimization with session duration: {clinician_input.session_duration_hours} hours")
    print(f"Max clients per day: {clinician_input.max_clients_per_day}")
    
    # Convert clients to Client objects
    client_objects = [Client(**client) for client in clients]
    
    # Store the clinician's schedule for each day
    schedule = []
    
    # For each day of the week (1-5, Monday to Friday)
    for day in range(1, 6):
        print(f"\nProcessing day {day}:")
        day_schedule = []
        
        # Get clinician's availability for this day
        clinician_day_availabilities = [a for a in clinician_input.clinician_availabilities 
                                        if a.day_of_the_week == day]
        
        if not clinician_day_availabilities:
            print(f"  No clinician availability for day {day}, skipping")
            continue  # Skip days when clinician is not available
        
        print(f"  Clinician availability on day {day}:")
        
        # Convert clinician availability to minutes for easier comparison
        clinician_time_slots = []
        for avail in clinician_day_availabilities:
            print(f"    {avail.start_time} - {avail.end_time}")
            clinician_start = time_to_minutes(avail.start_time)
            clinician_end = time_to_minutes(avail.end_time)
            clinician_time_slots.append((clinician_start, clinician_end))
        
        # Determine overall availability for the day
        day_start = min(slot[0] for slot in clinician_time_slots)
        day_end = max(slot[1] for slot in clinician_time_slots)
        
        # Get clients available on this day
        available_clients = []
        for client in client_objects:
            client_day_availabilities = [a for a in client.availabilities 
                                        if a.day_of_the_week == day]
            
            for avail in client_day_availabilities:
                try:
                    start_time_minutes = time_to_minutes(avail.start_time)
                    end_time_minutes = time_to_minutes(avail.end_time)
                    drive_time = get_drive_time(clinician_input.clinician_address, client.address)
                    
                    available_clients.append({
                        "client": client,
                        "start_time": start_time_minutes,
                        "end_time": end_time_minutes,
                        "drive_time": drive_time
                    })
                    
                    print(f"  Client {client.name} available {avail.start_time} - {avail.end_time}, drive time: {drive_time} min")
                except Exception as e:
                    print(f"  Error processing client {client.name}: {e}")
        
        if not available_clients:
            print(f"  No available clients for day {day}, skipping")
            continue
        
        # Sort clients by start time for initial processing
        available_clients.sort(key=lambda x: x["start_time"])
        
        # We'll use a different approach: try to place appointments sequentially with drive time considered
        scheduled_appointments = []
        scheduled_client_ids = set()  # Track which clients are already scheduled
        
        # Calculate session duration in minutes
        session_duration = int(clinician_input.session_duration_hours * 60)
        
        # Keep track of the clinician's current location and time
        current_time = day_start
        current_location = clinician_input.clinician_address
        
        # Try to schedule appointments throughout the day
        while current_time < day_end and len(scheduled_appointments) < clinician_input.max_clients_per_day:
            best_appointment = None
            best_score = -1  # Higher score is better
            
            for client_slot in available_clients:
                client = client_slot["client"]
                
                # Skip if this client is already scheduled
                if client.id in scheduled_client_ids:
                    continue
                
                client_start = client_slot["start_time"]
                client_end = client_slot["end_time"]
                
                # Calculate drive time from current location to this client
                drive_time = 0
                if current_location == clinician_input.clinician_address:
                    drive_time = client_slot["drive_time"]  # From home to client
                else:
                    # From previous client to this client
                    for prev_appt in scheduled_appointments:
                        if prev_appt["end_time"] == current_time:
                            prev_client = prev_appt["client"]
                            drive_time = get_drive_time(prev_client.address, client.address)
                            break
                
                # Earliest possible start time considering drive time
                earliest_start = max(current_time + drive_time, client_start)
                
                # Check if we have enough time for the session
                if earliest_start + session_duration <= client_end:
                    # Check if this fits within clinician's availability
                    fits_availability = False
                    for clin_start, clin_end in clinician_time_slots:
                        if clin_start <= earliest_start and earliest_start + session_duration <= clin_end:
                            fits_availability = True
                            break
                    
                    if fits_availability:
                        # Score this appointment (prefer earlier times and shorter drive times)
                        time_score = 1000 - earliest_start  # Earlier is better
                        drive_score = 100 - drive_time      # Shorter drive is better
                        score = time_score + drive_score
                        
                        if score > best_score:
                            best_score = score
                            best_appointment = {
                                "client": client,
                                "start_time": earliest_start,
                                "end_time": earliest_start + session_duration,
                                "drive_time": drive_time
                            }
            
            # If we found a valid appointment, schedule it
            if best_appointment:
                print(f"  ✅ Scheduled client {best_appointment['client'].name} at {minutes_to_time(best_appointment['start_time'])} - {minutes_to_time(best_appointment['end_time'])} (drive time: {best_appointment['drive_time']} min)")
                scheduled_appointments.append(best_appointment)
                scheduled_client_ids.add(best_appointment["client"].id)
                
                # Update current time and location
                current_time = best_appointment["end_time"]
                current_location = best_appointment["client"].address
                
                # Add buffer for drive time to next appointment
                # We'll determine the actual drive time when we select the next appointment
            else:
                # If no valid appointment found, move time forward to try the next window
                # This handles gaps in clinician availability
                next_window_start = float('inf')
                for clin_start, clin_end in clinician_time_slots:
                    if clin_start > current_time:
                        next_window_start = min(next_window_start, clin_start)
                
                if next_window_start < float('inf'):
                    current_time = next_window_start
                    current_location = clinician_input.clinician_address  # Assume clinician returns home during long breaks
                else:
                    # No more availability windows today
                    break
        
        # Convert scheduled appointments to output format
        for appt in scheduled_appointments:
            day_schedule.append(ScheduleOutput(
                day=day,
                client_id=appt["client"].id,
                client_name=appt["client"].name,
                start_time=minutes_to_time(appt["start_time"]),
                end_time=minutes_to_time(appt["end_time"]),
                client_address=appt["client"].address,
                drive_time=appt["drive_time"]
            ))
        
        # Add appointments to the overall schedule
        schedule.extend(day_schedule)
        
        print(f"  Total appointments for day {day}: {len(day_schedule)}")
    
    print(f"\nTotal schedule entries: {len(schedule)}")
    return schedule

@app.get("/")
async def health_check():
    return {"status": "healthy"}

@app.get("/clients", response_model=List[Client])
async def get_clients():
    return [Client(**client) for client in clients]

@app.post("/optimize-schedule", response_model=List[ScheduleOutput])
async def create_optimized_schedule(input_data: ScheduleInput):
    try:
        # Log the input data for debugging
        print("Received schedule optimization request:")
        print(f"Clinician address: {input_data.clinician_address}")
        print(f"Max clients per day: {input_data.max_clients_per_day}")
        print(f"Session duration hours: {input_data.session_duration_hours}")
        
        # Log availabilities
        print("Clinician availabilities:")
        for avail in input_data.clinician_availabilities:
            print(f"  Day {avail.day_of_the_week}: {avail.start_time} - {avail.end_time}")
        
        optimized_schedule = optimize_schedule(input_data)
        
        # Log the output schedule
        print(f"Generated schedule with {len(optimized_schedule)} appointments")
        
        return optimized_schedule
    except Exception as e:
        print(f"Error in schedule optimization: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/city-list")
async def get_city_list():
    # Extract unique cities from drive times matrix
    cities = set()
    for city_pair in CITY_DRIVE_TIMES.keys():
        cities.add(city_pair[0])
        cities.add(city_pair[1])
    
    # Add cities from the clients
    for client in clients:
        cities.add(client["address"]["city"])
    
    return {"cities": sorted(list(cities))}