import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout      from './layouts/Layout';
import LandingPage from './pages/LandingPage';
import Login       from './pages/Login';
import Signup      from './pages/Signup';
import Dashboard   from './pages/Dashboard';
import Analytics   from './pages/Analytics';
import Decks       from './pages/Decks';
import Study from './pages/Study';

export default function App() {
  return (

      <Routes>
        {/*
          Layout is the parent — it renders the Header + <Outlet>.
          All children render inside that Outlet.
        */}
        <Route path="/" element={<Layout />}>

          {/* index = renders at exactly "/" */}
          <Route index element={<LandingPage />} />

          {/* Public auth pages */}
          <Route path="login"     element={<Login />} />
          <Route path="signup"    element={<Signup />} />

          {/* Authenticated pages — protected routes coming in Phase 2 */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="decks"     element={<Decks />} />
          <Route path="study/:deckId" element={<Study />} />

        </Route>
      </Routes>
  );
}
