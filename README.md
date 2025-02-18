# Assets Finance Platform

A modern web application for managing financial applications and assets, built with React and AWS Amplify.

This project is also deployed on AWS Amplify and can be accessed via https://main.d3rbq98slafjb4.amplifyapp.com

## Features
- User authentication with AWS Cognito
- CRUD operations for financial applications
- Responsive UI with Tailwind CSS
- Form validation and progress saving

## Technologies
- React 19
- TypeScript 5.7
- AWS Amplify (Authentication)
- Tailwind CSS
- React Router
- Vite

## Local Development Setup

### 1. Clone repository
```bash
git clone https://github.com/WYJ-Jason/assets-finance-platform-frontend.git
cd assets-finance-platform-frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start backend server
- You can deploy the backend code via [assets-finance-platform-backend](https://github.com/WYJ-Jason/assets-finance-platform-backend.git) and run it locally (How to deploy the backend server can be found in the backend repository) 
- You can also use the production api endpoint (Exposing the api endpoint is for interview purposes only)
- You can find the api documentation at [API Documentation](https://documenter.getpostman.com/view/36825287/2sAYXFiHWX)



### 4. Configure Environment Variables
Create a `.env` file in the frontend root directory:
```env
# For local development:
VITE_API_ENDPOINT=http://localhost:3000

# For production use:
# VITE_API_ENDPOINT=https://0diq7qih77.execute-api.ap-southeast-2.amazonaws.com/Prod/
```


### 5. Start development server
```bash
npm run dev
```

### 6. Project Structure
```bash
src/
├── pages/            # Main application pages
├── components/       # Reusable components
├── App.tsx           # Root component
├── main.tsx          # Entry point
amplify/              # AWS Amplify configuration
public/               # Static assets
```
### 7.Project task breakdown
- You can find the task breakdown via [Project Task Breakdown](https://docs.google.com/document/d/1Fhqj3rYH0xFZDrn77a9zdAPv6eyQ8uw8/edit?usp=sharing&ouid=110668639377071033626&rtpof=true&sd=true)