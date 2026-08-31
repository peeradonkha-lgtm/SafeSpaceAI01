import React, { useState } from "react";
import {
  Inbox,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  HelpCircle,
  Database,
} from "lucide-react";
import { TeacherTab, StudentMessage } from "../../types";
import { TeacherInbox } from "./TeacherInbox";
import { TrendAnalytics } from "./TrendAnalytics";
import { seedDemoDataset } from "../../lib/firebase";

interface TeacherDashboardProps {
  messages: StudentMessage[];
  teacherEmail: string | null;
  onOpenAuthModal: () => void;
  currentUserId: string;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  messages,
  teacherEmail,
  onOpenAuthModal,
  currentUserId,
}) => {
  const [activeTab, setActiveTab] = useState<TeacherTab>("inbox");
  const [isSeeding, setIsSeeding] = useState(false);

  const unreadCount = messages.filter((m) => m.status === "unread").length;
  const urgentCount = messages.filter((m) => m.isUrgent).length;

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedDemoDataset(currentUserId);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Teacher Welcome & Overview Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-lg text-[#1A1C1E]">
              กระดานควบคุมอาจารย์ผู้สอน (Teacher Mediator Portal)
            </h2>
            <span className="text-xs bg-[#E6F8F6] text-[#1F4D4A] font-bold px-2.5 py-0.5 rounded-full border border-[#4ECDC4]/40">
              {teacherEmail || "โหมดผู้ดูแลชั้นเรียน"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            รับฟังเสียงสะท้อนจากนักเรียนที่ผ่านการกลั่นกรองคำพูดอย่างสุภาพ พร้อมระบบสรุปแนวโน้มเชิงบวก
          </p>
        </div>

        {/* Quick Seeder for Demo / Empty State */}
        {messages.length === 0 && (
          <button
            id="btn-seed-demo-dataset"
            type="button"
            onClick={handleSeed}
            disabled={isSeeding}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isSeeding ? "กำลังสร้างข้อมูลจำลอง..." : "โหลดข้อมูลตัวอย่าง 4 ข้อความ"}</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            id="tab-teacher-inbox"
            type="button"
            onClick={() => setActiveTab("inbox")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer relative ${
              activeTab === "inbox"
                ? "bg-[#1A1C1E] text-white shadow-xs"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            <Inbox className={`w-4 h-4 ${activeTab === "inbox" ? "text-[#4ECDC4]" : ""}`} />
            <span>กล่องข้อความจากนักเรียน (Inbox)</span>
            {messages.length > 0 && (
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeTab === "inbox"
                    ? "bg-[#4ECDC4] text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {messages.length}
              </span>
            )}
          </button>

          <button
            id="tab-teacher-analytics"
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "bg-[#1A1C1E] text-white shadow-xs"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            <TrendingUp className={`w-4 h-4 ${activeTab === "analytics" ? "text-[#4ECDC4]" : ""}`} />
            <span>การวิเคราะห์แนวโน้ม (AI Trends & Insights)</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500 font-medium">
          <span>ยังไม่ตอบ: <strong className="text-amber-600">{unreadCount}</strong></span>
          <span>•</span>
          <span>เร่งด่วน: <strong className="text-[#FF6B6B]">{urgentCount}</strong></span>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === "inbox" && (
        <TeacherInbox
          messages={messages}
          teacherEmail={teacherEmail}
          onOpenAuthModal={onOpenAuthModal}
        />
      )}

      {activeTab === "analytics" && (
        <TrendAnalytics messages={messages} />
      )}
    </div>
  );
};
