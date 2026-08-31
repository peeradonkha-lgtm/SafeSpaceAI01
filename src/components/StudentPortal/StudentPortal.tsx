import React, { useState } from "react";
import { PenTool, Inbox, Shield, Sparkles } from "lucide-react";
import { StudentTab, StudentMessage } from "../../types";
import { PrivacyBanner } from "../PrivacyBanner";
import { MessageComposer } from "./MessageComposer";
import { StudentInbox } from "./StudentInbox";

interface StudentPortalProps {
  messages: StudentMessage[];
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ messages }) => {
  const [activeTab, setActiveTab] = useState<StudentTab>("compose");

  const unrepliedCount = messages.filter((m) => m.status === "unread").length;
  const repliedCount = messages.filter((m) => m.status === "replied").length;

  return (
    <div className="space-y-6">
      {/* Privacy Banner */}
      <PrivacyBanner />

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            id="tab-student-compose"
            type="button"
            onClick={() => setActiveTab("compose")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "compose"
                ? "bg-[#1A1C1E] text-white shadow-xs"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <PenTool className="w-4 h-4 text-[#4ECDC4]" />
            <span>ส่งข้อความใหม่ (Submit Concern)</span>
          </button>

          <button
            id="tab-student-history"
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer relative ${
              activeTab === "history"
                ? "bg-[#1A1C1E] text-white shadow-xs"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <Inbox className="w-4 h-4 text-[#4ECDC4]" />
            <span>กล่องข้อความ & คำตอบครู</span>
            {messages.length > 0 && (
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeTab === "history"
                    ? "bg-[#4ECDC4] text-white"
                    : "bg-[#E6F8F6] text-[#1F4D4A]"
                }`}
              >
                {messages.length}
              </span>
            )}
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500 font-medium">
          <span>ตอบกลับแล้ว: <strong className="text-[#4ECDC4] font-bold">{repliedCount}</strong></span>
          <span>•</span>
          <span>รอพิจารณา: <strong className="text-amber-500 font-bold">{unrepliedCount}</strong></span>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === "compose" && (
        <MessageComposer
          onSuccessSent={() => {
            setActiveTab("history");
          }}
        />
      )}

      {activeTab === "history" && (
        <StudentInbox
          messages={messages}
          onNewMessageClick={() => setActiveTab("compose")}
        />
      )}
    </div>
  );
};
