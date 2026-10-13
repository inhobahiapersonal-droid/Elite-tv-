import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Login from './pages/Login';
import Home from './pages/Home';
import Player from './pages/Player';
import Admin from './pages/Admin';

// Route protection component checking elitetv_current_user
function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const currentUser = localStorage.getItem('elitetv_current_user');
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// Strict Admin route protection checking user.role === 'admin'
function AdminRoute({ children }: { children: React.ReactElement }) {
  const currentUserRaw = localStorage.getItem('elitetv_current_user');
  if (!currentUserRaw) {
    return <Navigate to="/" replace />;
  }
  try {
    const user = JSON.parse(currentUserRaw);
    if (user.role !== 'admin') {
      return <Navigate to="/home" replace />;
    }
  } catch {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AppProvider>
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
          path="/player"
          element={
            <ProtectedRoute>
              <Player />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  );
}
