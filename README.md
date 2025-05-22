# Ski Trip Squad Planner

A collaborative web application for planning ski trips with friends. This application allows groups to vote on destinations, track participant status, and manage payments all in one place.

## Deployment

- **Live Demo**: [https://ski-trip-squad-planner.lovable.app](https://ski-trip-squad-planner.lovable.app)
- **GitHub Repository**: [https://github.com/notabC/ski-trip-squad-planner](https://github.com/notabC/ski-trip-squad-planner)

## Tech Stack

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Components**: Shadcn UI (built on Radix UI)
- **Styling**: Tailwind CSS
- **Backend/Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Query + React Context
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: React Router
- **Charts/Data Visualization**: Recharts

## Features

- Authentication (email/password, magic link)
- Group creation with unique join codes
- Destination voting system
- Trip status management (voting → confirmed → completed)
- Participant status tracking
- Payment tracking
- Mobile-responsive design
- LiteAPI Integration:
  - Fetches real hotel data for ski destinations
  - Transforms API data to application format
  - Robust error handling with fallback to mock data

## Setup Instructions

### Prerequisites

- Node.js 18+ or Bun
- NPM/Yarn/Bun package manager
- Git

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/notabC/ski-trip-squad-planner.git
   cd ski-trip-squad-planner
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. Create a `.env` file in the root directory with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

### Database Setup

This application uses Supabase as the backend. You'll need to create the following tables in your Supabase project:

- `users`: Store user information
- `groups`: Store group information
- `trips`: Store trip information
- `destinations`: Store destination information
- `votes`: Store user votes for destinations

Refer to the `src/types/index.ts` file for the exact schema requirements.

## Architecture

The application follows a component-based architecture with the following main directories:

- `src/components`: UI components
- `src/pages`: Page components with routing
- `src/services`: API and service functions
- `src/hooks`: Custom React hooks
- `src/types`: TypeScript type definitions
- `src/integrations`: Third-party integrations (Supabase)
- `src/utils`: Utility functions

## Key Trade-offs and Decisions

### Client-side vs. Server-side

- The application is primarily client-side rendered for simplicity and faster development.
- This approach trades some SEO benefits for development speed and simplified deployment.

### Supabase as Backend

- Using Supabase provides a complete backend solution without requiring a custom server.
- Trade-off: Limited to Supabase's feature set, but significantly reduced backend development time.

### Local Storage for User Data Caching

- Some user data is cached in local storage for better performance.
- Trade-off: Potential data staleness vs. reduced API calls.

### UI Component Library

- Using Shadcn UI (built on Radix UI) provides accessible, customizable components.
- Trade-off: Additional learning curve but higher quality UI with less custom code.

### React Query for Data Fetching

- Provides caching, refetching, and synchronization with minimal boilerplate.
- Trade-off: Additional dependency but significantly improved data handling capabilities.

## AI Tools Integration

This project leveraged several AI tools throughout the development process:

### Tools and Their Contributions

- **Cursor**: Primary AI-powered IDE used for coding, debugging, research, and planning. Cursor's code assistance capabilities significantly accelerated development across all aspects of the project.

- **Claude**: Utilized primarily for UI/UX design decisions, helping to create a cohesive and intuitive interface while maintaining design consistency throughout the application.

- **Lovable**: Applied for code generation and architecture planning, particularly useful for outlining component structures and service patterns.

- **Gemini**: Employed for debugging complex issues and conducting technical research on libraries and implementation approaches.

### Impact on Development

The integration of these AI tools dramatically transformed the development workflow:

- **Accelerated Learning**: Reduced the learning curve for new technologies and libraries by providing contextual examples and explanations, making it possible to adopt and implement modern tools quickly.

- **Rapid Prototyping**: Enabled much faster creation of working prototypes, reducing what would typically take months to days of development time.

- **Enhanced Problem Solving**: Simplified debugging processes by suggesting potential solutions and identifying common pitfalls.

- **Architecture Planning**: Facilitated better planning for large-scale application structure through intelligent suggestions and pattern recognition.

### Challenges and Limitations

While AI tools provided substantial benefits, they weren't without limitations:

- AI assistance struggled with highly complex tasks requiring deep domain expertise
- Complex debugging scenarios sometimes required traditional manual troubleshooting
- Large-scale application architecture still benefited from human experience and oversight

Despite these limitations, AI tools made previously challenging tasks accessible and significantly compressed development timelines, enabling the creation of a more robust application in less time.

## Next Steps and Future Improvements

1. **Real-time Collaboration**
   - Implement Supabase real-time subscriptions for live updates
   - Add chat functionality for group communication

2. **Enhanced Trip Management**
   - Itinerary planning
   - Cost splitting calculator
   - Weather forecasts for destinations

3. **Authentication Enhancements**
   - Add social logins (Google, Facebook)
   - Implement two-factor authentication

4. **Performance Optimizations**
   - Implement code splitting
   - Add service worker for offline support
   - Optimize bundle size

5. **Data Integrity**
   - Add more comprehensive validation
   - Implement database rules for better security

6. **Testing**
   - Add unit tests with Vitest
   - Add integration tests with Testing Library
   - Add end-to-end tests with Cypress

7. **Mobile Experience**
   - Consider developing a mobile app using React Native or Flutter
   - Add push notifications for important updates

## License

This project is licensed under the MIT License.