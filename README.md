# Alpaca Health ABA Clinic Scheduling Optimizer

## Project Overview

This application optimizes the scheduling of ABA clinic appointments by matching clients with clinicians based on availability and minimizing travel time. It provides an efficient way to maximize a clinician's working hours while respecting scheduling constraints.





https://github.com/user-attachments/assets/f427a45e-ff86-45b5-b885-09158abc7ce2





## Key Features

- Algorithm that optimizes clinician schedules based on client availabilities
- Consideration of drive times between locations
- User-friendly interface for clinicians to input their information
- Visual display of optimized weekly schedules
- Backend API for schedule optimization

## Approach and Challenges

### Approach

1. **Data Modeling**: I created clear data models representing clients, clinicians, availabilities, and schedules.
2. **Scheduling Algorithm**: I implemented a greedy algorithm that maximizes clinician working hours while ensuring:
   - No overlapping appointments
   - Consideration of travel time between appointments
   - Respect for client and clinician availabilities
3. **Frontend Development**: I built a clean, responsive UI that allows clinicians to input their information and view their optimized schedule.
4. **Testing**: I tested the algorithm with various inputs to ensure it produces valid schedules.

### Challenges

- **Time Management**: Given the 5-hour time constraint, I had to make strategic decisions about which features to prioritize.
- **Algorithm Complexity**: Balancing between a sophisticated optimization algorithm and a simpler, more maintainable solution.
- **Drive Time Consideration**: Incorporating drive times between appointments added complexity to the scheduling logic.

## Design Decisions

### Backend

- **FastAPI Framework**: Chosen for its performance, ease of use, and built-in validation.
- **Greedy Algorithm**: I opted for a greedy scheduling approach as it provides good results for this type of problem without excessive complexity.
- **Drive Time Matrix**: Used a pre-defined city-to-city travel time matrix for simplicity, though a real implementation would use a mapping API.

### Frontend

- **Next.js**: Used for its server-side rendering capabilities and modern React features.
- **Tailwind CSS**: Chosen for rapid UI development with consistent styling.

## Assumptions

- Appointments are of fixed duration (2 hours by default, configurable).
- Each client can only be scheduled once per week in this MVP.
- Clinicians have consistent weekly schedules.
- Drive times are symmetric (time from A to B equals time from B to A).
- Clinicians do not need to travel back home after each appointment.
- The app is for a single clinician's schedule at a time.
- Days of the week are represented as integers (1-5 for Monday-Friday).
- Times are represented in 24-hour format (HH:MM).

## Setup Instructions

### Backend Setup (Python 3.11+ required)

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv alpaca_venv
source alpaca_venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload
```

### Frontend Setup (Node.js 18+ required)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Default Project Structure

- `frontend/`: Next.js application
  - `src/components/`: Reusable React components
  - `src/app/`: Next.js app router pages
- `backend/`: FastAPI application
  - `app/main.py`: API endpoints

## Development

- Frontend runs on port 3000 with hot reload enabled
- Backend runs on port 8000 with auto-reload enabled
- API documentation available at http://localhost:8000/docs

## Submission

1. Create a private GitHub repository
2. Implement your solution
3. Document any assumptions or trade-offs
4. Include instructions for running your solution
5. Send us the repository link

## Time Expectation

- Expected time: 3-4 hours
- Please don't spend more than 6 hours

## Evaluation Criteria

| Category | Details | Weight |
|----------|---------|--------|
| Product sense and scoping | - Final product decisions alignment with requirements<br>- Appropriate deprioritization of non-crucial parts | 10% |
| Technology selection | - Right tools chosen for the job | 10% |
| Technical Level | - Well-organized and intuitive code structure<br>- Modular code (e.g., React components used)<br>- Proper use of React hooks<br>- Good state management<br>- Correct use of useEffect hooks | 40% |
| Craft and Quality | - Usable and intuitive UI/UX<br>- Presence and severity of bugs | 20% |
| Documentation | - Clear communication of logic and technical decisions in README | 10% |
| Testing | - Presence of tests<br>- Quality and robustness of tests | 10% |

## Sources

- FastAPI Documentation: https://fastapi.tiangolo.com/
- Next.js Documentation: https://nextjs.org/docs
- Tailwind CSS Documentation: https://tailwindcss.com/docs
- React Documentation: https://reactjs.org/docs
- "Introduction to Algorithms" by Cormen, Leiserson, Rivest, and Stein (for algorithm inspiration)
