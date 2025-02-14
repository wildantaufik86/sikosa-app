import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserLayout from "./layouts/UserLayout";
import PsikologLayout from "./layouts/PsikologLayout";
import AdminLayout from "./layouts/AdminLayout";
import UserAdmin from "./pages/admin/users/UserAdmin";
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
import PreviewArtikel from "./pages/psikolog/artikel/PreviewArtikel";
import NotificationPage from "./pages/psikolog/notifications/Notifications";
import ArtikelManajemen from "./pages/admin/artikel/ArtikelManajemen";
import AddArtikelAdmin from "./pages/admin/artikel/AddArtikelAdmin";
import EditArtikelAdmin from "./pages/admin/artikel/EditArtikelAdmin";
import LoginPsikolog from "./pages/psikolog/auth/LoginPsikolog";
import AddUser from "./pages/admin/users/AddUser";
import EditUser from "./pages/admin/users/EditUser";
import ArtikelView from "./pages/psikolog/artikel/ArticleView";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Logs from "./pages/admin/logsAdmin/Logs";

function App() {
  return (
    <Router>
      {/* toast */}
      <ToastContainer />
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
          path="/artikel/:slug"
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
          path="/daftar-layanan/:id_psikolog"
          element={
            <UserLayout>
              <DetailPsikolog />
            </UserLayout>
          }
        />
        <Route
          path="/dokter/:id_psikolog"
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
          path="/profile"
          element={
            <UserLayout>
              <Profile />
            </UserLayout>
          }
        />
        <Route
          path="/edit-profile/:id"
          element={
            <UserLayout>
              <EditProfile />
            </UserLayout>
          }
        />

        {/* End Routes User */}

        <Route path="/psikolog/login" element={<LoginPsikolog />} />
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
          path="/psikolog/artikel/:slug"
          element={
            <PsikologLayout>
              <ArtikelView />
            </PsikologLayout>
          }
        />
        <Route
          path="/psikolog/artikel/preview/:slug"
          element={
            <PsikologLayout>
              <PreviewArtikel />
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
          path="/psikolog/artikel/edit/:slug_article"
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
          path="/psikolog/edit-profile/:id"
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
        <Route
          path="/psikolog/notifikasi"
          element={
            <PsikologLayout>
              <NotificationPage />
            </PsikologLayout>
          }
        />
        {/* End Routes Psikolog */}

        {/* Start Routes Admin */}
        <Route
          path="/admin/logs"
          element={
            <AdminLayout>
              <Logs />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/user"
          element={
            <AdminLayout>
              <UserAdmin />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/user/add"
          element={
            <AdminLayout>
              <AddUser />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/user/edit-user/:id"
          element={
            <AdminLayout>
              <EditUser />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/artikel-manajemen"
          element={
            <AdminLayout>
              <ArtikelManajemen />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/artikel-manajemen/add"
          element={
            <AdminLayout>
              <AddArtikelAdmin />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/artikel-manajemen/edit/:id"
          element={
            <AdminLayout>
              <EditArtikelAdmin />
            </AdminLayout>
          }
        />
        {/* End Routes Admin */}
      </Routes>
    </Router>
  );
}

export default App;
