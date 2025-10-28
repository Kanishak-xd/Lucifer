import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Analytics } from "@vercel/analytics/react";

import { SimpleHeader } from "./components/simple-header";
import HomePage from "./pages/HomePage.tsx";
import AboutPage from "./pages/AboutPage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import SupportPage from "./pages/SupportPage.tsx";
import Footer from "./components/Footer.tsx";

// Auth success page component
function AuthSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Successful!</h1>
        <p className="text-gray-600">You have been logged in successfully.</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen dark:bg-black">
          <SimpleHeader />
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }/>
            <Route path="/support" element={<SupportPage />} />
            <Route path="/auth/success" element={<AuthSuccessPage />} />
          </Routes>
          <Footer />
        </div>
      </Router>
      <Analytics />
    </AuthProvider>
  );
}

export default App;
