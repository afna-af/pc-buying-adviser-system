import "./App.css";

import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import { Toaster } from "sonner";

import { AuthProvider } from "./contexts/AuthContext";

import Navbar from "./components/Navbar";

import Landing from "./pages/Landing";
import Chat from "./pages/Chat";
import Catalog from "./pages/Catalog";
import BuildDetail from "./pages/BuildDetail";
import Compare from "./pages/Compare";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";

// Layout Component
function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main>
        <Outlet />
      </main>
    </div>
  );
}

// Main App
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Toast Notifications */}
        <Toaster position="top-right" theme="dark" richColors />

        {/* Routes */}
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Landing />} />

            <Route path="/chat" element={<Chat />} />

            <Route path="/catalog" element={<Catalog />} />

            <Route path="/build/:id" element={<BuildDetail />} />

            <Route path="/compare" element={<Compare />} />

            <Route path="/login" element={<Login />} />

            <Route path="/signup" element={<Signup />} />

            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
