import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AppShell } from './components/layout/AppShell.jsx';
import { AuthPage, ForgotPassword, ResetPassword } from './pages/AuthPages.jsx';
import { Assistant, Budgets, Categories, Dashboard, Insights, Notifications, OCRScanner, Profile, Reports, Tips, Transactions } from './pages/StudentPages.jsx';
import { Admin } from './pages/Admin.jsx';
import Landing from './pages/Landing.jsx';
import { Loader } from './components/common/Loader.jsx';

function homeFor(role) {
  return role === 'admin' ? '/admin' : '/dashboard';
}

function Guard({ children, admin = false, studentOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader/>;
  if (!user) return <Navigate to={admin ? '/admin/login' : '/login'} replace/>;

  if (admin && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace/>;
  }

  if (studentOnly && user.role === 'admin') {
    return <Navigate to="/admin" replace/>;
  }

  return children;
}

function Guest({ children, allowRole = 'student' }) {
  const { user, loading, signOut } = useAuth();
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (loading || !user || user.role === allowRole || switching) return undefined;
    let active = true;
    setSwitching(true);
    signOut().finally(() => {
      if (active) setSwitching(false);
    });
    return () => {
      active = false;
    };
  }, [user, loading, allowRole, switching, signOut]);

  if (loading || switching) return <Loader/>;

  if (user && user.role === allowRole) {
    return <Navigate to={homeFor(user.role)} replace/>;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing/>}/>

      <Route path="/login" element={<Guest allowRole="student"><AuthPage mode="login"/></Guest>}/>

      <Route
        path="/admin/login"
        element={<Guest allowRole="admin"><AuthPage mode="login" adminOnly/></Guest>}
      />

      <Route path="/register" element={<Guest allowRole="student"><AuthPage mode="register"/></Guest>}/>
      <Route path="/forgot-password" element={<Guest allowRole="student"><ForgotPassword/></Guest>}/>
      <Route path="/reset-password/:token" element={<Guest allowRole="student"><ResetPassword/></Guest>}/>

      <Route element={<Guard><AppShell/></Guard>}>
        <Route path="/dashboard" element={<Guard studentOnly><Dashboard/></Guard>}/>
        <Route path="/transactions" element={<Guard studentOnly><Transactions/></Guard>}/>
        <Route path="/budgets" element={<Guard studentOnly><Budgets/></Guard>}/>
        <Route path="/categories" element={<Guard studentOnly><Categories/></Guard>}/>
        <Route path="/reports" element={<Guard studentOnly><Reports/></Guard>}/>
        <Route path="/insights" element={<Guard studentOnly><Insights/></Guard>}/>
        <Route path="/tips" element={<Guard studentOnly><Tips/></Guard>}/>
        <Route path="/assistant" element={<Guard studentOnly><Assistant/></Guard>}/>
        <Route path="/ocr" element={<Guard studentOnly><OCRScanner/></Guard>}/>
        <Route path="/notifications" element={<Guard studentOnly><Notifications/></Guard>}/>
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/admin" element={<Guard admin><Admin/></Guard>}/>
      </Route>

      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes/>
      </AuthProvider>
    </ThemeProvider>
  );
}
