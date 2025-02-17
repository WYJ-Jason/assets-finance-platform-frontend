import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import type { FC } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Applications from "./pages/Applications";
import CreateApplications from "./pages/CreateApplications";
import ApplicationDetail from './pages/ApplicationDetail';

const App: FC = () => {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute>
                <Applications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-application"
            element={
              <ProtectedRoute>
                <CreateApplications />
              </ProtectedRoute>
            }
          />
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
