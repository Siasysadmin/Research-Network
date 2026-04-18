import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ✅ ALL IMPORTS
import Login from "./auth/login/Login";
import Home from "./page/Home";
import IndividualRegister from "./auth/register/IndividualRegister";
import InstituteRegister from "./auth/register/InstituteRegister";
import ApplicationApproved from "./auth/approval/ApplicationApproved";
import IndividualFlow from "./profile/individual/IndividualFlow";
import ProfileCompletion from "./profile/individual/ProfileCompletion";
import OrgOnboardingFlow from "./profile/instituted/OrgOnboardingFlow";
import OrgProfile from "./profile/instituted/OrgProfile";
import SustainbilityWelcome from "./profile/Welcome/SustainabilityWelcom";
import ForgotPassword from "./auth/forgat-passwrod/ForgotPassword";
import VerifyOTP from "./auth/forgat-passwrod/VerifyOTP";
import ResetPassword from "./auth/forgat-passwrod/ResetPassword";

// Admin Imports
import AdminHome from "./Admin/AdminHome";
import InstituteApplications from "./Admin/UserApplications/Institute/InstituteApplications";
import Individual from "./Admin/UserApplications/Individual/Individual";
import ResearchUploadRequests from "./Admin/Research-Upload/ResearchUploadRequests";
import BoardMembers from "./Admin/BoardMemberCard";
import ViewResearchApplication from "./Admin/Research-Upload/ViewResearchApplication";
import CreateEvent from "./Admin/CreateEvent/CreateEvent";
import AdminChat from './Admin/chat/AdminChat';
import AdminCreateGroup from './Admin/chat/AdminCreateGroup';
import AdminEvents from './Admin/Events/AdminEvents';
//Dashboard
import MainContent from "./dashboard/MainContent";
import RightSection from "./dashboard/RightSection";
import ResearchUploadForm from "./dashboard/ResearchUploadForm";
import BoardReviewPortal from "./dashboard/BoardReviewPortal";
import PublicationCard from "./dashboard/PublicationCard";
import IndividualResearcherProfile from "./dashboard/IndividualResearcherProfile";
import IndividualEditProfile from "./dashboard/IndividualEditProfile";
import InstituteProfile from "./dashboard/InstituteProfile";
import InstituteEditProfile from "./dashboard/InstituteEditProfile";
import Library from "./dashboard/Library";
import LibraryViewDetails from "./dashboard/LibraryViewDetails";
import CreatePost from "./dashboard/createpost";
import Chats from "./dashboard/Chats";
import Events from "./dashboard/Events";
import UserProfile from "./dashboard/UserProfile";
import CreateGroup from "./dashboard/CreateGroup";
import GroupDetails from "./dashboard/GroupDetails";

// settings
import Settings from "./settings/setting";
import TermsConditions from "./Legals/TermsConditions";
import PrivacyPolicy from "./Legals/PrivacyPolicy";
import AdminSavedPosts from "./Admin/save/AdminSavedPosts";

const App = () => {
  return (
    <>
      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/verify" element={<VerifyOTP />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/individual" element={<IndividualRegister />} />
        <Route path="/institute" element={<InstituteRegister />} />
        <Route path="/application-approved" element={<ApplicationApproved />} />

        {/* Individual Profile Flow - WITH STEP PARAM */}
        <Route
          path="/profile-individual-flow/:step"
          element={<IndividualFlow />}
        />
        <Route path="/complet" element={<ProfileCompletion />} />

        {/* Institute Profile Flow - WITH STEP PARAM */}
        <Route
          path="/organization-onboarding/:step"
          element={<OrgOnboardingFlow />}
        />
        <Route
          path="/organization-onboarding"
          element={<Navigate to="/organization-onboarding/1" />}
        />

        <Route path="/profileorg" element={<OrgProfile />} />
        <Route path="/welcome" element={<SustainbilityWelcome />} />

        {/* ✅ ADMIN ROUTES */}
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/board-members" element={<BoardMembers />} />
        <Route
          path="/admin/institute-applications"
          element={<InstituteApplications />}
        />
        <Route path="/admin/individual-applications" element={<Individual />} />
        <Route
          path="/admin/research-upload-requests"
          element={<ResearchUploadRequests />}
        />
        <Route
          path="/admin/view-research"
          element={<ViewResearchApplication />}
        />
        <Route path="/admin/create-event" element={<CreateEvent />} />

        <Route path="/admin/chat" element ={<AdminChat/>}/>
        <Route path="/admin/CreateGroup" element ={<AdminCreateGroup/>}/>
        <Route path="/admin/save" element ={<AdminSavedPosts/>}/>
        <Route path="/admin/events" element={<AdminEvents />}/>

        {/* Dashboard */}
        <Route path="/dashboard" element={<MainContent />} />
        <Route path="right" element={<RightSection />} />
        <Route
          path="/dashboard/upload-research"
          element={<ResearchUploadForm />}
        />
        <Route path="/dashboard/board-review" element={<BoardReviewPortal />} />
        <Route path="/dashboard/publications" element={<PublicationCard />} />
        <Route
          path="/dashboard/individual-profile"
          element={<IndividualResearcherProfile />}
        />
        <Route
          path="dashboard/individual-edit-profile"
          element={<IndividualEditProfile />}
        />
        <Route
          path="/dashboard/institute-profile"
          element={<InstituteProfile />}
        />
        <Route
          path="/dashboard/institute-edit-profile"
          element={<InstituteEditProfile />}
        />
        <Route path="/dashboard/library" element={<Library />} />
        <Route
          path="/dashboard/library-view-details"
          element={<LibraryViewDetails />}
        />
        <Route path="/dashboard/create-post" element={<CreatePost />} />
        <Route path="/dashboard/chats" element={<Chats />} />
        <Route path="/dashboard/events" element={<Events />} />
        <Route path="/dashboard/CreateGroup" element={<CreateGroup />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/group" element={<GroupDetails />} />

        {/* Settings */}
        <Route path="/settings" element={<Settings />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
      </Routes>

      <ToastContainer
        position="top-right" // Laptop ke liye default
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={true} // Naya message upar dikhega
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark" // Aapke dark theme UI ke liye perfect hai
        limit={3} // Mobile par screen na bhar jaye isliye limit set karein
      />
    </>
  );
};

export default App;