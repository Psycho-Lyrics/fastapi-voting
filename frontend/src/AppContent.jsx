import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MainPage from './pages/MainPage';
import ProfilePage from './pages/ProfilePage';
import ConstructorPage from './pages/ConstructorPage';
import Details from './pages/DetailsPage';
import VotesPage from './pages/VotesPage';
import Header from './components/Header';
import HeaderLogin from './components/HeaderLogin';
import DepartmentsPage from "./pages/DepartmentsPage.jsx";

function AppContent() {
  const location = useLocation();

  return (
    <>
      {location.pathname !== '/login' && location.pathname !== '/register' && <Header /> }
      <Routes>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/votes' element={<VotesPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/' element={<MainPage />} />
        <Route path='/profile' element={<ProfilePage />} />
        <Route path='/constructor' element={<ConstructorPage />} />
        <Route path='/details' element={<Details />} />
        <Route path='/votes/:votingId' element={<Details />} />
        <Route path='/departments' element={<DepartmentsPage />} />
      </Routes>
    </>
  );
}

export default AppContent;