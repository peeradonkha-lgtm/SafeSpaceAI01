import React, { useState } from "react";
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Calendar,
  Lock,
} from "lucide-react";
import { StudentMessage } from "../../types";

interface StudentInboxProps {
  messages: StudentMessage[];
  onNewMessageClick: () => void;
}

export const StudentInbox: React.FC<StudentInboxProps> = ({
  messages,
  onNewMessageClick,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(
    messages.length > 0 ? messages[0].id : null
  );

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (timestamp: number | string) => {
    try {
      const date = new Date(Number(timestamp));
      return date.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "เมื่อสักครู่";
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "Academic":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Bullying/Social":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Class Policy":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Personal Support":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  if (messages.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 text-center shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-[#E6F8F6] text-[#4ECDC4] flex items-center justify-center mx-auto mb-4 border border-[#4ECDC4]/30">
          <MessageSquare className="w-7 h-7" />
        </div>
        <h3 className="font-bold text-[#1A1C1E] text-lg mb-1">
          ยังไม่มีประวัติข้อความที่คุณส่ง
        </h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
          เมื่อคุณส่งข้อความถึงครูผ่าน SafeSpace AI คุณสามารถกลับมาดูสถานะและคำตอบของครูที่กล่องข้อความนี้ได้ตลอดเวลาอย่างปลอดภัย
        </p>
        <button
          id="btn-inbox-empty-compose"
          type="button"
          onClick={onNewMessageClick}
          className="px-6 py-3 rounded-xl bg-[#1A1C1E] hover:opacity-90 text-white font-bold text-sm transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-[#4ECDC4]" />
          <span>เริ่มส่งข้อความหรือคำถามใหม่</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overview stats bar */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center justify-between flex-wrap gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#E6F8F6] text-[#1F4D4A] flex items-center justify-center font-bold border border-[#4ECDC4]/30">
            {messages.length}
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#1A1C1E]">
              ข้อความที่คุณส่งทั้งหมด
            </h4>
            <p className="text-xs text-gray-500">
              ติดตามคำตอบจากครูผู้สอนแบบไม่เปิดเผยตัวตน
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium">
          <span className="inline-flex items-center gap-1 text-[#1F4D4A] bg-[#E6F8F6] px-2.5 py-1 rounded-full border border-[#4ECDC4]/40 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4ECDC4]" />
            ตอบกลับแล้ว: {messages.filter((m) => m.status === "replied").length}
          </span>
          <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            รอการตอบ: {messages.filter((m) => m.status === "unread").length}
          </span>
        </div>
      </div>

      {/* Message List */}
      <div className="space-y-3">
        {messages.map((msg) => {
          const isExpanded = expandedId === msg.id;
          const isReplied = msg.status === "replied";

          return (
            <div
              key={msg.id}
              className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                isReplied
                  ? "border-[#4ECDC4]/50 shadow-xs"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* Header Accordion Bar */}
              <div
                id={`card-student-msg-${msg.id}`}
                onClick={() => toggleExpand(msg.id)}
                className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3 cursor-pointer hover:bg-gray-50/70 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className="text-xl sm:text-2xl shrink-0">
                    {msg.moodEmoji || "💬"}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-md font-semibold border ${getCategoryBadgeClass(
                          msg.category
                        )}`}
                      >
                        {msg.category}
                      </span>

                      {isReplied ? (
                        <span className="inline-flex items-center gap-1 text-[11px] bg-[#E6F8F6] text-[#1F4D4A] font-bold px-2.5 py-0.5 rounded-full border border-[#4ECDC4]/40">
                          <CheckCircle2 className="w-3 h-3 text-[#4ECDC4]" />
                          ครูตอบกลับแล้ว
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          ส่งถึงครูแล้ว (รอตรวจสอบ)
                        </span>
                      )}

                      {msg.isUrgent && (
                        <span className="inline-flex items-center gap-1 text-[11px] bg-rose-50 text-[#FF6B6B] font-bold px-2.5 py-0.5 rounded-full border border-rose-200">
                          เร่งด่วน
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-[#1A1C1E] truncate max-w-xl">
                      {msg.refined_text || msg.original_text}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-gray-400 hidden sm:inline-block">
                    {formatDate(msg.timestamp)}
                  </span>
                  <button
                    type="button"
                    className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="p-4 sm:p-5 pt-0 border-t border-gray-100 bg-gray-50/40 space-y-4">
                  {/* Sent Content Section */}
                  <div className="space-y-3 pt-3">
                    <div>
                      <div className="text-xs font-bold text-gray-600 mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#4ECDC4]" />
                        <span>ข้อความฉบับปรับปรุงที่ครูได้รับ (Refined Message)</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#1A1C1E] bg-white p-3.5 rounded-xl border border-gray-200 leading-relaxed font-medium">
                        {msg.refined_text}
                      </p>
                    </div>

                    {/* Original Raw Text (Privately Visible to Student) */}
                    <div>
                      <div className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-[#0288D1]" />
                        <span>ข้อความดิบเดิมของคุณ (มองเห็นเฉพาะคุณเท่านั้น)</span>
                      </div>
                      <p className="text-xs text-gray-500 bg-gray-100 p-2.5 rounded-lg italic">
                        "{msg.original_text}"
                      </p>
                    </div>
                  </div>

                  {/* Teacher's Warm Reply (If available) */}
                  {isReplied && msg.reply ? (
                    <div className="bg-[#E6F8F6] rounded-xl p-4 border border-[#4ECDC4]/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#1F4D4A]">
                          <div className="w-6 h-6 rounded-full bg-[#4ECDC4] text-white flex items-center justify-center">
                            <UserCheck className="w-3.5 h-3.5" />
                          </div>
                          <span>
                            {msg.reply.teacherName || "คำตอบจากครูผู้สอน"}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#2F6662] font-medium">
                          {formatDate(msg.reply.repliedAt)}
                        </span>
                      </div>

                      <div className="bg-white p-3.5 rounded-lg border border-[#4ECDC4]/30 text-xs sm:text-sm text-[#1A1C1E] leading-relaxed whitespace-pre-wrap font-medium">
                        {msg.reply.text}
                      </div>

                      <div className="text-[11px] text-[#2F6662] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#4ECDC4]" />
                        <span>ครูได้ตอบกลับโดยไม่ทราบตัวตนของคุณ ขอบคุณที่กล้าสื่อสารเพื่อชั้นเรียนที่ดีขึ้น</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 rounded-xl p-3.5 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        ข้อความของคุณอยู่ในคิวพิจารณาของครูผู้สอน เมื่อครูตอบกลับ ข้อความจะแสดงที่นี่ทันที
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
