// src/App.js

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserLayout from "./layouts/UserLayout";
import PsikologLayout from "./layouts/PsikologLayout";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/DashboardAdmin";
import Home from "./pages/user/Home";
import Services from "./pages/user/daftar-layanan/Services";
import Artikel from "./pages/user/artikel/Artikel";
import LoginPage from "./pages/user/auth/LoginPage";
import RegisterPage from "./pages/user/auth/RegisterPage";
import DetailPsikolog from "./pages/user/daftar-layanan/DetailService";
import ChatDokter from "./pages/user/chat-dokter/ChatDokter";
import ArtikelDetail from "./pages/user/artikel/DetailArtikel";
import RiwayatPages from "./pages/user/riwayat/RiwayatPages";
import Profile from "./pages/user/profil/Profil";
import EditProfile from "./pages/user/profil/EditProfil";
import Beranda from "./pages/psikolog/Beranda";
import ArtikelPage from "./pages/psikolog/artikel/Artikel";
import TambahArtikel from "./pages/psikolog/artikel/TambahArtikel";
import ProfilePsikolog from "./pages/psikolog/profil/ProfilPsikolog";
import EditProfilePsikolog from "./pages/psikolog/profil/EditProfilePsikolog";
import MessagePage from "./pages/psikolog/messages/MessagesPage";
import LayananPage from "./pages/psikolog/layanan/LayananPage";
import EditArtikel from "./pages/psikolog/artikel/EditArtikel";

function App() {
  return (
    <Router>
      <Routes>
        {/* Star Routes User */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/"
          element={
            <UserLayout>
              <Home />
            </UserLayout>
          }
        />
        <Route
          path="/artikel"
          element={
            <UserLayout>
              <Artikel />
            </UserLayout>
          }
        />
        <Route
          path="/artikel/1"
          element={
            <UserLayout>
              <ArtikelDetail />
            </UserLayout>
          }
        />
        <Route
          path="/daftar-layanan"
          element={
            <UserLayout>
              <Services />
            </UserLayout>
          }
        />
        <Route
          path="/daftar-layanan/1"
          element={
            <UserLayout>
              <DetailPsikolog />
            </UserLayout>
          }
        />
        <Route
          path="/chat-dokter/1"
          element={
            <UserLayout>
              <ChatDokter />
            </UserLayout>
          }
        />
        <Route
          path="/riwayat"
          element={
            <UserLayout>
              <RiwayatPages />
            </UserLayout>
          }
        />
        <Route
          path="/profil"
          element={
            <UserLayout>
              <Profile />
            </UserLayout>
          }
        />
        <Route
          path="/edit-profile/1"
          element={
            <UserLayout>
              <EditProfile />
            </UserLayout>
          }
        />

        {/* End Routes User */}

        {/* Start Routes Psikolog */}
        <Route
          path="/psikolog/dashboard"
          element={
            <PsikologLayout>
              <Beranda />
            </PsikologLayout>
          }
        />
        <Route
          path="/psikolog/artikel"
          element={
            <PsikologLayout>
              <ArtikelPage />
            </PsikologLayout>
          }
        />
        <Route
          path="/psikolog/artikel/add"
          element={
            <PsikologLayout>
              <TambahArtikel />
            </PsikologLayout>
          }
        />
        <Route
          path="/psikolog/artikel/edit/1"
          element={
            <PsikologLayout>
              <EditArtikel />
            </PsikologLayout>
          }
        />
        <Route
          path="/psikolog/profile"
          element={
            <PsikologLayout>
              <ProfilePsikolog />
            </PsikologLayout>
          }
        />
        <Route
          path="/psikolog/edit-profile/1"
          element={
            <PsikologLayout>
              <EditProfilePsikolog />
            </PsikologLayout>
          }
        />
        <Route
          path="/psikolog/messages"
          element={
            <PsikologLayout>
              <MessagePage />
            </PsikologLayout>
          }
        />
        <Route
          path="/psikolog/layanan"
          element={
            <PsikologLayout>
              <LayananPage />
            </PsikologLayout>
          }
        />
        {/* End Routes Psikolog */}

        {/* Start Routes Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          }
        />
        {/* End Routes Admin */}
      </Routes>
    </Router>
  );
}

export default App;
