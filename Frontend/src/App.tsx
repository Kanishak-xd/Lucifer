import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { SimpleHeader } from "./components/simple-header";
import HomePage from "./pages/HomePage.tsx";
import AboutPage from "./pages/AboutPage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import SupportPage from "./pages/SupportPage.tsx";
import Footer from "./components/Footer.tsx";

function App() {
  return (
    <Router>
      <div className="min-h-screen dark:bg-black">
        <SimpleHeader />
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/support" element={<SupportPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
