import React from "react";

import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from "react-router-dom";

import Home from "./pages/Home";

import Login from "./pages/Login";

import Register from "./pages/Register";

import Notfound from "./pages/Notfound";

import Sidebar from "./components/Sidebar";

import ProtectedRoute from "./components/ProtectedRoute";

import BlogManagementForm from "./BlogsManagement/BlogManagementForm";

import BlogManagementDashboard from "./BlogsManagement/BlogManagementDashboard";

import BlogList from "./BlogsManagement/BlogList";

import BlogEditForm from "./BlogsManagement/BlogEditForm";

import BlogView from "./BlogsManagement/BlogView";

import FormManagementDashboard from "./DynamicForms/FormManagementDashboard";

import FormBuilder from "./DynamicForms/FormBuilder";

import FormSubmissionsView from "./DynamicForms/FormSubmissionsView";

import FormPreviewPage from "./DynamicForms/FormPreviewPage";

import LeadsManagement from "./DynamicForms/LeadsManagement";

import BannerManagementDashboard from "./BannerManagement/BannerManagementDashboard";

import BannerForm from "./BannerManagement/BannerForm";

import ProjectManagementDashboard from "./ProjectManagement/ProjectManagementDashboard";

import ProjectForm from "./ProjectManagement/ProjectForm";

import TeamManagement from "./TeamManagement/TeamManagement";

import TestimonialManagement from "./TestimonialManagement/TestimonialManagement";

import YouTubeManagement from "./YouTubeManagement/YouTubeManagement";

import AnnouncementForm from "./Announcement/AnnouncementForm";

import AnnouncementList from "./Announcement/AnnouncementList";

import AnnouncementPreview from "./Announcement/AnnouncementPreview";

import EmailTemplateManagement from "./DynamicForms/EmailTemplateManagement";

import MediaManagerDashboard from "./components/MediaManager/MediaManagerDashboard";

import GalleryPhotos from "./components/MediaManager/GalleryPhotos";

import VideoUploads from "./components/MediaManager/VideoUploads";

import HappyClients from "./components/MediaManager/HappyClients";

import Awards from "./components/MediaManager/Awards";

import BrochureManagement from "./BrochureManagement/BrochureManagement";

import ProjectLocationManagement from "./ProjectLocationManagement/ProjectLocationManagement";

import { useAdminAuth } from "./context/AdminAuthContext";

import logo from "./assets/jhamtani-logo.webp";



const PublicRoute = ({ children }) => {

  const { isAuthenticated, loading } = useAdminAuth();



  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-[#f5f3ef]">

        <div className="text-center">

          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5A880] mx-auto"></div>

          <p className="mt-4 text-gray-600">Loading...</p>

        </div>

      </div>

    );

  }



  if (isAuthenticated) {

    return <Navigate to="/" replace />;

  }



  return children;

};



function AppWrapper() {

  const location = useLocation();

  const { isAuthenticated } = useAdminAuth();



  const hideSidebarRoutes = ['/login', '/register'];

  const shouldHideSidebar = hideSidebarRoutes.includes(location.pathname);

  const showChrome = !shouldHideSidebar && isAuthenticated;



  return (

    <div className="flex min-h-screen min-h-[100dvh] bg-[#f5f3ef] overflow-x-hidden w-full">

      {showChrome && <Sidebar />}



      {showChrome && (

        <header className="lg:hidden fixed top-0 inset-x-0 h-14 bg-[#191f26] z-30 flex items-center justify-center px-16 shadow-md">

          <img src={logo} alt="Jhamtani" className="h-8 w-auto object-contain" />

        </header>

      )}



      <main

        className={

          showChrome

            ? "flex-grow ml-0 lg:ml-[17.5rem] transition-all duration-300 w-full min-w-0 pt-16 lg:pt-0"

            : "flex-grow transition-all duration-300 w-full min-w-0"

        }

      >

        <Routes>

          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />



          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />



          <Route path="/blog-management" element={<ProtectedRoute><BlogEditForm /></ProtectedRoute>} />

          <Route path="/blog-management/dashboard" element={<ProtectedRoute><BlogManagementDashboard /></ProtectedRoute>} />

          <Route path="/blog-management/list" element={<ProtectedRoute><BlogList /></ProtectedRoute>} />

          <Route path="/blog-management/create" element={<ProtectedRoute><BlogEditForm /></ProtectedRoute>} />

          <Route path="/blog-management/edit/:blogId" element={<ProtectedRoute><BlogEditForm /></ProtectedRoute>} />

          <Route path="/blog-management/view/:blogId" element={<ProtectedRoute><BlogView /></ProtectedRoute>} />



          <Route path="/form-management" element={<ProtectedRoute><FormManagementDashboard /></ProtectedRoute>} />

          <Route path="/form-management/create" element={<ProtectedRoute><FormBuilder /></ProtectedRoute>} />

          <Route path="/form-management/edit/:formId" element={<ProtectedRoute><FormBuilder /></ProtectedRoute>} />

          <Route path="/form-management/submissions/:formId" element={<ProtectedRoute><FormSubmissionsView /></ProtectedRoute>} />

          <Route path="/form-management/preview/:formId" element={<ProtectedRoute><FormPreviewPage /></ProtectedRoute>} />

          <Route path="/brochure" element={<ProtectedRoute><BrochureManagement /></ProtectedRoute>} />

          <Route path="/project-location" element={<ProtectedRoute><ProjectLocationManagement /></ProtectedRoute>} />

          <Route path="/leads-management" element={<ProtectedRoute><LeadsManagement /></ProtectedRoute>} />



          <Route path="/banner-management" element={<ProtectedRoute><BannerManagementDashboard /></ProtectedRoute>} />

          <Route path="/banner-management/create" element={<ProtectedRoute><BannerForm /></ProtectedRoute>} />

          <Route path="/banner-management/edit/:id" element={<ProtectedRoute><BannerForm /></ProtectedRoute>} />



          <Route path="/project-management" element={<ProtectedRoute><ProjectManagementDashboard /></ProtectedRoute>} />

          <Route path="/project-management/create" element={<ProtectedRoute><ProjectForm /></ProtectedRoute>} />

          <Route path="/project-management/edit/:id" element={<ProtectedRoute><ProjectForm /></ProtectedRoute>} />



          <Route path="/teammanagement" element={<ProtectedRoute><TeamManagement /></ProtectedRoute>} />

          <Route path="/testimonialmanagement" element={<ProtectedRoute><TestimonialManagement /></ProtectedRoute>} />

          <Route path="/youtube-management" element={<ProtectedRoute><YouTubeManagement /></ProtectedRoute>} />

          <Route path="/announcement" element={<ProtectedRoute><AnnouncementForm /></ProtectedRoute>} />

          <Route path="/announcement/list" element={<ProtectedRoute><AnnouncementList /></ProtectedRoute>} />

          <Route path="/announcement/preview" element={<ProtectedRoute><AnnouncementPreview /></ProtectedRoute>} />

          <Route path="/email-templates" element={<ProtectedRoute><EmailTemplateManagement /></ProtectedRoute>} />



          <Route path="/media-manager" element={<ProtectedRoute><MediaManagerDashboard /></ProtectedRoute>} />

          <Route path="/media-manager/gallery-photos" element={<ProtectedRoute><GalleryPhotos /></ProtectedRoute>} />

          <Route path="/media-manager/video-uploads" element={<ProtectedRoute><VideoUploads /></ProtectedRoute>} />

          <Route path="/media-manager/happy-clients" element={<ProtectedRoute><HappyClients /></ProtectedRoute>} />

          <Route path="/media-manager/awards" element={<ProtectedRoute><Awards /></ProtectedRoute>} />



          <Route path="/forms/:page" element={<ProtectedRoute><FormPreviewPage /></ProtectedRoute>} />

          <Route path="*" element={<Notfound />} />

        </Routes>

      </main>

    </div>

  );

}



function App() {

  return (

    <Router>

      <AppWrapper />

    </Router>

  );

}



export default App;

