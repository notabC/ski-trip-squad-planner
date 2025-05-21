# Ski Trip Squad Planner

A collaborative web application for planning ski trips with friends. This app allows groups to vote on ski destinations, each paired with nearby accommodations, and coordinate travel plans.

## Features

- User authentication and group creation
- Ski resort + accommodation package voting
- Trip status tracking (voting, confirmed, completed)
- Participant status management (pending, confirmed, declined)
- Payment tracking

## Technical Details

This application is built with:
- React + TypeScript
- Vite
- Tailwind CSS
- Shadcn/UI components
- Supabase for backend data storage

## LiteAPI Integration

The app uses [LiteAPI](https://liteapi.travel/) to fetch real hotel data near ski resorts:

1. Sign up for a free LiteAPI account at https://dashboard.liteapi.travel/register
2. Get your API key from the dashboard
3. Create a `.env` file in the project root with the following content:
   ```
   VITE_LITE_API_KEY=your_liteapi_key_here
   ```

Without a valid API key, the application will fall back to using mock data.

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables as described above
4. Start the development server:
   ```
   npm run dev
   ```

## Data Flow

- The application fetches ski resorts (3 mock resorts by default)
- For each resort, the app uses liteAPI to fetch nearby hotel accommodations
- These are combined into "destination packages" that users can vote on
- Each package includes resort details, accommodation info, and pricing

## Customization

You can modify the ski resorts in `src/models/mockData.ts` and adjust the LiteAPI search parameters in `src/services/apiService.ts` to target different destinations.

# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/4f40fd76-f1db-41b2-95de-5d01494cb7be

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/4f40fd76-f1db-41b2-95de-5d01494cb7be) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/4f40fd76-f1db-41b2-95de-5d01494cb7be) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
