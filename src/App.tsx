import React, { createContext, useContext, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, getDocFromServer, updateDoc } from "firebase/firestore";
import { auth, db } from "./lib/firebase";

// Components
import Home from "./pages/Home";
import Features from "./pages/Features";
import Auth from "./pages/Auth";
import DashboardLayout from "./components/DashboardLayout";
import Overview from "./pages/dashboard/Overview";
import Upload from "./pages/dashboard/Upload";
import MyReleases from "./pages/dashboard/MyReleases";
import Wallet from "./pages/dashboard/Wallet";
import Profile from "./pages/dashboard/Profile";
import Artists from "./pages/dashboard/Artists";
import Labels from "./pages/dashboard/Labels";
import ContentID from "./pages/dashboard/ContentID";
import OACRequest from "./pages/dashboard/OACRequest";
import Reports from "./pages/dashboard/Reports";
import Support from "./pages/dashboard/Support";
import AssetView from "./pages/dashboard/AssetView";
import AdminLayout from "./components/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminReview from "./pages/admin/AdminReview";
import AdminReleases from "./pages/admin/AdminReleases";
import AdminFinance from "./pages/admin/AdminFinance";
import AdminArtists from "./pages/admin/AdminArtists";
import AdminLabels from "./pages/admin/AdminLabels";
import AdminOAC from "./pages/admin/AdminOAC";
import AdminContentID from "./pages/admin/AdminContentID";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminReports from "./pages/admin/AdminReports";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminPlaceholder from "./pages/admin/AdminPlaceholder";

// Auth Context
interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true, isAdmin: false });
export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Critical: Verify connection to Firestore on boot
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, "test", "connection"));
      } catch (error) {
        if (error instanceof Error && error.message.includes("the client is offline")) {
          console.error("Please check your Firebase configuration or wait for provisioning.");
        }
      }
    };
    testConnection();

    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const adminEmail = "musicdistributionindia.in@gmail.com".toLowerCase();
        const userEmail = u.email?.toLowerCase();
        const pDoc = await getDoc(doc(db, "users", u.uid));
        
        if (pDoc.exists()) {
          const data = pDoc.data();
          // Force admin status if email matches current master account
          if (userEmail === adminEmail && data.role !== "admin") {
            await updateDoc(doc(db, "users", u.uid), { role: "admin" });
            data.role = "admin";
            // Ensure synchronization with the dedicated admins collection
            await setDoc(doc(db, "admins", u.uid), { uid: u.uid, email: userEmail }, { merge: true });
          }
          setProfile(data);
          setIsAdmin(data.role === "admin");
        } else {
          // Automatic role assignment for the master admin account on first login
          const role = userEmail === adminEmail ? "admin" : "artist";
          
          const newProfile = {
            email: u.email,
            displayName: u.displayName || u.email?.split("@")[0],
            role: role,
            walletBalance: 0,
            status: "active",
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, "users", u.uid), newProfile);
          setProfile(newProfile);
          setIsAdmin(role === "admin");

          if (role === "admin") {
            await setDoc(doc(db, "admins", u.uid), { uid: u.uid, email: userEmail });
          }
        }
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-brand-light">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
          <p className="font-display font-medium text-brand-dark animate-pulse text-lg tracking-widest uppercase">IND Distribution</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={user ? <DashboardLayout /> : <Navigate to="/auth" />}>
            <Route index element={<Overview />} />
            <Route path="upload" element={<Upload />} />
            <Route path="releases" element={<MyReleases />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="artists" element={<Artists />} />
            <Route path="labels" element={<Labels />} />
            <Route path="content-id" element={<ContentID />} />
            <Route path="oac" element={<OACRequest />} />
            <Route path="reports" element={<Reports />} />
            <Route path="support" element={<Support />} />
            <Route path="releases/:id" element={<AssetView />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={isAdmin ? <AdminLayout /> : <Navigate to="/dashboard" />}>
            <Route index element={<AdminHome />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="releases" element={<AdminReleases />} />
            <Route path="finance" element={<AdminFinance />} />
            <Route path="artists" element={<AdminArtists />} />
            <Route path="labels" element={<AdminLabels />} />
            <Route path="oac" element={<AdminOAC />} />
            <Route path="content-id" element={<AdminContentID />} />
            <Route path="review/:releaseId" element={<AdminReview />} />
            <Route path="plans" element={<AdminSettings />} />
            <Route path="platforms" element={<AdminSettings />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="cms" element={<AdminPlaceholder title="Content Management" />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="logs" element={<AdminLogs />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
