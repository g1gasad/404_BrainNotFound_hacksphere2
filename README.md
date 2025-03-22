# MaterCare - Maternal Healthcare System

This application provides a comprehensive platform for maternal healthcare, connecting expectant mothers with healthcare providers and support organizations.

## Setup Instructions

### 1. Supabase Setup

1. Create a Supabase account and project at [https://supabase.com](https://supabase.com)
2. Get your Supabase URL and anon key from the project dashboard
3. Update the `js/supabase.js` file with your credentials:

```js
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'
```

4. Run the database setup script by navigating to the SQL Editor in the Supabase dashboard and running `supabase-schema.sql`

### 2. Local Development

1. Clone this repository
2. Open the folder in your preferred code editor
3. If you have a local development server, use it to serve the files
4. Or simply open the index.html file in your browser

## Features

- User authentication (login/register) for different user types:
  - Expectant Mothers
  - Healthcare Providers
  - NGOs/Support Organizations
- User profiles and dashboards
- Appointment scheduling and tracking
- Health record management
- Resource library
- Emergency support

## Database Structure

The application uses Supabase for authentication and database storage with the following tables:

- `user_profiles`: Common user information
- `mothers`: Data specific to expectant mothers
- `doctors`: Data specific to healthcare providers
- `ngos`: Data specific to support organizations
- `medical_records`: Health records and documentation
- `appointments`: Scheduled appointments

## Troubleshooting

If you encounter issues with the Supabase connection:

1. Ensure your Supabase URL and anon key are correct
2. Check that you've run the SQL setup script in the Supabase dashboard
3. Verify that your database has all required tables
4. Check browser console for specific error messages

## Security

This application implements Row Level Security (RLS) to ensure that:

- Public data is accessible to all users
- Personal data is only accessible to the respective users
- Healthcare providers can access appropriate patient information
- All data is properly secured with authentication checks