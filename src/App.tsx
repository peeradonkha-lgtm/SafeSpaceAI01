/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, ensureAnonymousStudent, logoutTeacher, subscribeStudentMessages, subscribeAllMessages } from "./lib/firebase";
import { AppView, StudentMessage } from "./types";
import { Navbar } from "./components/Navbar";
import { StudentPortal } from "./components/StudentPortal/StudentPortal";
import { TeacherDashboard } from "./components/TeacherDashboard/TeacherDashboard";
import { TeacherAuthModal } from "./components/TeacherDashboard/TeacherAuthModal";
import { ShieldCheck, HeartHandshake, Sparkles, Lock } from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | { uid: string; isAnonymous?: boolean } | null>(null);
  const [currentView, setCurrentView] = useState<AppView>("student");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [teacherEmail, setTeacherEmail] = useState<string | null>(null);

  // Messages data
  const [studentMessages, setStudentMessages] = useState<StudentMessage[]>([]);
  const [allMessages, setAllMessages] = useState<StudentMessage[]>([]);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Initialize Auth
  useEffect(() => {
    let isMounted = true;

    // Ensure initial anonymous auth for student
    ensureAnonymousStudent()
      .then((user) => {
        if (isMounted) {
          setCurrentUser(user);
          setIsLoadingAuth(false);
        }
      })
      .catch((err) => {
        console.warn("Anonymous auth init:", err);
        if (isMounted) setIsLoadingAuth(false);
      });

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!isMounted) return;
      setCurrentUser(user);
      if (user && !user.isAnonymous) {
        setTeacherEmail(user.email || "teacher@safespace.edu");
      } else {
        setTeacherEmail(null);
      }
    });

    return () => {
      isMounted = false;
      unsubscribeAuth();
    };
  }, []);

  // Subscribe to messages in Firestore
  useEffect(() => {
    if (!currentUser) return;

    // 1. Subscribe to student's own messages
    const unsubscribeStudent = subscribeStudentMessages(currentUser.uid, (msgs) => {
      setStudentMessages(msgs);
    });

    // 2. Subscribe to all messages for teacher
    const unsubscribeAll = subscribeAllMessages((msgs) => {
      setAllMessages(msgs);
    });

    return () => {
      unsubscribeStudent();
      unsubscribeAll();
    };
  }, [currentUser?.uid]);

  const handleTeacherLogout = async () => {
    try {
      await logoutTeacher();
      setTeacherEmail(null);
      setCurrentView("student");
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = allMessages.filter((m) => m.status === "unread").length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1A1C1E] selection:bg-[#4ECDC4]/20 selection:text-[#1A1C1E] font-sans">
      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        onViewChange={(v) => setCurrentView(v)}
        teacherEmail={teacherEmail}
        onTeacherLoginClick={() => setIsAuthModalOpen(true)}
        onTeacherLogout={handleTeacherLogout}
        unreadCount={unreadCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentView === "student" ? (
          <StudentPortal messages={studentMessages} />
        ) : (
          <TeacherDashboard
            messages={allMessages}
            teacherEmail={teacherEmail}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            currentUserId={currentUser?.uid || "student-anonymous"}
          />
        )}
      </main>

      {/* Teacher Auth Modal */}
      <TeacherAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(email) => {
          setTeacherEmail(email);
          setCurrentView("teacher");
        }}
      />

      {/* Accessible Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12 text-xs text-gray-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-[#4ECDC4] text-white flex items-center justify-center text-[10px] font-bold">
              S
            </div>
            <span className="font-bold text-[#1A1C1E]">SafeSpace.AI</span>
            <span>— พื้นที่สื่อสารที่ปลอดภัยและสร้างสรรค์สำหรับนักเรียนและครู</span>
          </div>

          <div className="flex items-center gap-4 text-gray-400">
            <span className="inline-flex items-center gap-1 font-medium">
              <Lock className="w-3 h-3 text-[#4ECDC4]" />
              <span>Zero IP Logging</span>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3 text-[#4ECDC4]" />
              <span>Gemini 3.7 AI Powered</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
