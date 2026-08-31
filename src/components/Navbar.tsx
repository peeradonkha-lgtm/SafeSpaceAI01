import React from "react";
import { ShieldCheck, Sparkles, User, GraduationCap, Lock, LogOut } from "lucide-react";
import { AppView } from "../types";

interface NavbarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  teacherEmail: string | null;
  onTeacherLoginClick: () => void;
  onTeacherLogout: () => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  teacherEmail,
  onTeacherLoginClick,
  onTeacherLogout,
  unreadCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4ECDC4] rounded-xl flex items-center justify-center text-white shadow-sm shadow-[#4ecdc440]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-[#1A1C1E] font-['Outfit',sans-serif]">
                  SafeSpace<span className="text-[#4ECDC4]">.AI</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#E6F8F6] text-[#1F4D4A] px-2.5 py-0.5 rounded-full border border-[#4ECDC4]/40">
                  <Sparkles className="w-3 h-3 text-[#4ECDC4]" />
                  AI Mediator
                </span>
              </div>
              <p className="text-[11px] text-gray-500 hidden sm:block">
                ช่องทางสื่อสารนักเรียน-ครูที่ปลอดภัย & สุภาพเป็นมืออาชีพ
              </p>
            </div>
          </div>

          {/* Privacy Indicator Badge */}
          <div className="hidden md:flex items-center gap-2 bg-[#E1F5FE] px-3.5 py-1 rounded-full border border-[#B3E5FC]">
            <div className="w-2 h-2 bg-[#0288D1] rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-[#0277BD] tracking-wider">
              Anonymous Encryption Active • ปลอดภัย 100%
            </span>
          </div>

          {/* Role Switcher & Action */}
          <div className="flex items-center gap-2">
            <div className="bg-gray-100 p-1 rounded-xl flex items-center border border-gray-200">
              <button
                id="btn-nav-student"
                type="button"
                onClick={() => onViewChange("student")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  currentView === "student"
                    ? "bg-white text-[#1A1C1E] shadow-xs font-bold"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <User className="w-4 h-4 text-[#4ECDC4]" />
                <span>มุมนักเรียน</span>
              </button>

              <button
                id="btn-nav-teacher"
                type="button"
                onClick={() => onViewChange("teacher")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer relative ${
                  currentView === "teacher"
                    ? "bg-white text-[#1A1C1E] shadow-xs font-bold"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>มุมครูผู้สอน</span>
                {unreadCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-[#FF6B6B] inline-block"></span>
                )}
              </button>
            </div>

            {/* Teacher Auth Controls */}
            {currentView === "teacher" && (
              <div className="ml-1">
                {teacherEmail ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600 hidden lg:inline-block max-w-[140px] truncate">
                      {teacherEmail}
                    </span>
                    <button
                      id="btn-teacher-logout"
                      type="button"
                      onClick={onTeacherLogout}
                      title="ออกจากระบบครู"
                      className="p-2 rounded-lg text-gray-500 hover:text-[#FF6B6B] hover:bg-rose-50 border border-gray-200 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    id="btn-teacher-login"
                    type="button"
                    onClick={onTeacherLoginClick}
                    className="px-3.5 py-1.5 rounded-lg bg-[#1A1C1E] text-white text-xs sm:text-sm font-semibold hover:bg-gray-800 transition-colors shadow-xs cursor-pointer"
                  >
                    เข้าสู่ระบบครู
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
