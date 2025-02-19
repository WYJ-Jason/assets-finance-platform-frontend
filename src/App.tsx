import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import type { FC } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Applications from './pages/Applications';
import CreateApplications from './pages/CreateApplications';
import ApplicationDetail from './pages/ApplicationDetail';

// Main application component using Function Component type
const App: FC = () => {
  return (
    <div className="App">
      {/* Set up browser router for client-side routing */}
      <BrowserRouter>
        {/* Define route configuration */}
        <Routes>
          {/* Default route - Login page */}
          <Route path="/" element={<Login />} />

          {/* Protected route for Home page */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Protected route for Applications list page */}
          <Route
            path="/applications"
            element={
              <ProtectedRoute>
                <Applications />
              </ProtectedRoute>
            }
          />

          {/* Protected route for Create Application page */}
          <Route
            path="/create-application"
            element={
              <ProtectedRoute>
                <CreateApplications />
              </ProtectedRoute>
            }
          />

          {/* Protected route for Application Detail page */}
          <Route
            path="/application"
            element={
              <ProtectedRoute>
                <ApplicationDetail />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
