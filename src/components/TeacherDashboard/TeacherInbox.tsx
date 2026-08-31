import React, { useState } from "react";
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Send,
  Eye,
  EyeOff,
  User,
  BookOpen,
  Users,
  CalendarCheck,
  Heart,
  HelpCircle,
  CornerDownRight,
  ShieldAlert,
} from "lucide-react";
import { StudentMessage, MessageCategory } from "../../types";
import { replyToStudentMessage } from "../../lib/firebase";

interface TeacherInboxProps {
  messages: StudentMessage[];
  teacherEmail: string | null;
  onOpenAuthModal: () => void;
}

const PRESET_REPLIES = [
  "ขอบคุณที่สะท้อนความคิดเห็นและแจ้งครูนะครับ ครูจะนำเรื่องนี้ไปปรับปรุงในการสอนคาบถัดไปทันทีครับ",
  "ครูรับทราบปัญหาแล้วครับ เดี๋ยวในสัปดาห์นี้จะเพิ่มเวลาทบทวนเนื้อหา 15 นาที และแจกแบบฝึกหัดเสริมให้ครับ",
  "ขอบคุณที่ไว้วางใจบอกครูนะ สามารถเข้ามาปรึกษาครูที่ห้องพักครูได้ตลอดเวลา ไม่ต้องกังวลเรื่องคะแนนนะ",
  "ครูจะประสานงานและพูดคุยเรื่องบรรยากาศในชั้นเรียนเพื่อสร้างพื้นที่ที่เคารพซึ่งกันและกันอย่างแน่นอนครับ",
];

export const TeacherInbox: React.FC<TeacherInboxProps> = ({
  messages,
  teacherEmail,
  onOpenAuthModal,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedUrgentOnly, setSelectedUrgentOnly] = useState(false);

  // Active Reply State
  const [replyingMessageId, setReplyingMessageId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [teacherNameInput, setTeacherNameInput] = useState("อาจารย์ประจำวิชา / Instructor");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replySuccessMsg, setReplySuccessMsg] = useState<string | null>(null);

  // Raw message reveal state
  const [revealedRawIds, setRevealedRawIds] = useState<Record<string, boolean>>({});

  const toggleRevealRaw = (id: string) => {
    setRevealedRawIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatDate = (timestamp: number | string) => {
    try {
      const date = new Date(Number(timestamp));
      return date.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "เมื่อสักครู่";
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "Academic":
        return { label: "วิชาการ", bg: "bg-blue-50 text-blue-700 border-blue-200" };
      case "Bullying/Social":
        return { label: "สังคม/เพื่อน", bg: "bg-rose-50 text-rose-700 border-rose-200" };
      case "Class Policy":
        return { label: "กฎระเบียบ", bg: "bg-amber-50 text-amber-700 border-amber-200" };
      case "Personal Support":
        return { label: "ปรึกษาส่วนตัว", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      default:
        return { label: "ทั่วไป", bg: "bg-slate-50 text-slate-700 border-slate-200" };
    }
  };

  // Filter messages
  const filteredMessages = messages.filter((m) => {
    if (selectedCategory !== "all" && m.category !== selectedCategory) {
      return false;
    }
    if (selectedStatus === "unread" && m.status !== "unread") {
      return false;
    }
    if (selectedStatus === "replied" && m.status !== "replied") {
      return false;
    }
    if (selectedUrgentOnly && !m.isUrgent) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRefined = m.refined_text.toLowerCase().includes(q);
      const matchOriginal = m.original_text.toLowerCase().includes(q);
      const matchCategory = m.category.toLowerCase().includes(q);
      if (!matchRefined && !matchOriginal && !matchCategory) {
        return false;
      }
    }
    return true;
  });

  const handleSendReply = async (messageId: string) => {
    if (!replyText.trim()) return;

    setIsSubmittingReply(true);
    try {
      await replyToStudentMessage(
        messageId,
        replyText.trim(),
        teacherEmail || "teacher@safespace.edu",
        teacherNameInput.trim() || "อาจารย์ผู้สอน"
      );

      setReplySuccessMsg("ส่งคำตอบกลับไปยังนักเรียนแบบไม่เปิดเผยตัวตนเรียบร้อยแล้ว!");
      setTimeout(() => {
        setReplySuccessMsg(null);
        setReplyingMessageId(null);
        setReplyText("");
      }, 1800);
    } catch (err: any) {
      console.error("Failed to reply:", err);
      alert("เกิดข้อผิดพลาดในการส่งคำตอบ โปรดลองใหม่อีกครั้ง");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-teacher-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาข้อความ, ปัญหา, หรือหัวข้อ..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] bg-gray-50/50"
            />
          </div>

          {/* Status & Urgent Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSelectedStatus("all")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedStatus === "all" ? "bg-[#1A1C1E] text-white shadow-xs font-bold" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                ทั้งหมด ({messages.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus("unread")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedStatus === "unread" ? "bg-[#1A1C1E] text-white shadow-xs font-bold" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                ยังไม่ตอบ ({messages.filter((m) => m.status === "unread").length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus("replied")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedStatus === "replied" ? "bg-[#1A1C1E] text-white shadow-xs font-bold" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                ตอบแล้ว ({messages.filter((m) => m.status === "replied").length})
              </button>
            </div>

            <button
              id="btn-filter-urgent"
              type="button"
              onClick={() => setSelectedUrgentOnly(!selectedUrgentOnly)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                selectedUrgentOnly
                  ? "bg-rose-50 border-rose-300 text-[#FF6B6B] ring-2 ring-rose-300/30"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#FF6B6B]" />
              <span>เฉพาะเร่งด่วน ({messages.filter((m) => m.isUrgent).length})</span>
            </button>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-gray-400 font-medium whitespace-nowrap mr-1">
            หมวดหมู่:
          </span>
          {[
            { id: "all", label: "ทุกหมวดหมู่" },
            { id: "Academic", label: "📚 วิชาการ & การบ้าน" },
            { id: "Bullying/Social", label: "🤝 สังคม & บูลลี่" },
            { id: "Class Policy", label: "📋 กฎระเบียบห้องเรียน" },
            { id: "Personal Support", label: "💖 ปรึกษาส่วนตัว" },
            { id: "Other", label: "💡 เรื่องอื่นๆ" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-lg border font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-[#E6F8F6] border-[#4ECDC4] text-[#1F4D4A] font-bold"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Message List Feed */}
      {filteredMessages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs">
          <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h4 className="font-bold text-gray-700 text-base mb-1">
            ไม่พบข้อความตรงตามเงื่อนไขที่เลือก
          </h4>
          <p className="text-xs text-gray-500">
            ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองหมวดหมู่ด้านบน
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((msg) => {
            const badge = getCategoryBadge(msg.category);
            const isReplying = replyingMessageId === msg.id;
            const isRawRevealed = revealedRawIds[msg.id];
            const isReplied = msg.status === "replied";

            return (
              <div
                key={msg.id}
                id={`teacher-msg-card-${msg.id}`}
                className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                  msg.isUrgent
                    ? "border-rose-300 ring-2 ring-rose-200/50 shadow-xs"
                    : isReplied
                    ? "border-gray-200"
                    : "border-[#4ECDC4]/50 shadow-xs"
                }`}
              >
                {/* Message Header */}
                <div className="p-5 pb-3 flex items-start sm:items-center justify-between gap-3 flex-wrap border-b border-gray-100">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xl" title="อารมณ์ของนักเรียน">
                      {msg.moodEmoji || "💬"}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-md font-semibold border ${badge.bg}`}
                    >
                      {badge.label}
                    </span>

                    {msg.isUrgent && (
                      <span className="inline-flex items-center gap-1 text-[11px] bg-rose-50 text-[#FF6B6B] font-bold px-2.5 py-0.5 rounded-full border border-rose-200">
                        <AlertCircle className="w-3 h-3 text-[#FF6B6B]" />
                        ต้องการการดูแลเร่งด่วน
                      </span>
                    )}

                    {isReplied ? (
                      <span className="inline-flex items-center gap-1 text-[11px] bg-[#E6F8F6] text-[#1F4D4A] font-bold px-2.5 py-0.5 rounded-full border border-[#4ECDC4]/40">
                        <CheckCircle2 className="w-3 h-3 text-[#4ECDC4]" />
                        ตอบกลับแล้ว
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        ยังไม่ได้ตอบ
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-[10px] text-gray-500">
                      Anon-ID: {msg.studentSessionId ? `${msg.studentSessionId.slice(0, 6)}...` : "Student"}
                    </span>
                    <span>•</span>
                    <span>{formatDate(msg.timestamp)}</span>
                  </div>
                </div>

                {/* Message Body */}
                <div className="p-5 space-y-4">
                  {/* AI Refined Text (Primary) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[#1A1C1E] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#4ECDC4]" />
                        <span>ข้อความที่ผ่านการปรับสำนวนโดย AI (Sanitized & Polite)</span>
                      </span>

                      {/* Raw text toggle */}
                      <button
                        type="button"
                        onClick={() => toggleRevealRaw(msg.id)}
                        className="text-[11px] text-gray-400 hover:text-gray-600 flex items-center gap-1 cursor-pointer transition-colors"
                        title="ดูข้อความดิบเดิมของนักเรียนเพื่อความเข้าใจบริบท"
                      >
                        {isRawRevealed ? (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>ซ่อนข้อความเดิม</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>ดูข้อความดิบเดิม</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm sm:text-base text-[#1A1C1E] leading-relaxed font-medium">
                      {msg.refined_text}
                    </div>

                    {/* Raw text view if revealed */}
                    {isRawRevealed && (
                      <div className="mt-2 p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs text-gray-700">
                        <span className="font-bold text-amber-800 block mb-0.5">
                          ข้อความดิบจากนักเรียน (Raw Student Input):
                        </span>
                        <p className="italic">"{msg.original_text}"</p>
                      </div>
                    )}
                  </div>

                  {/* Key Points extracted */}
                  {msg.keyPoints && msg.keyPoints.length > 0 && (
                    <div className="bg-[#E6F8F6]/40 p-3 rounded-lg border border-[#4ECDC4]/30 text-xs">
                      <span className="font-bold text-[#1F4D4A] block mb-1">
                        ประเด็นความต้องการของนักเรียน:
                      </span>
                      <ul className="space-y-0.5">
                        {msg.keyPoints.map((pt, idx) => (
                          <li key={idx} className="text-[#2F6662] flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#4ECDC4]"></span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Existing Reply Display */}
                  {isReplied && msg.reply && (
                    <div className="bg-[#E6F8F6] p-4 rounded-xl border border-[#4ECDC4]/40 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-[#1F4D4A]">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#4ECDC4]" />
                          <span>คำตอบที่คุณส่งถึงนักเรียนแล้ว:</span>
                        </div>
                        <span className="text-[11px] text-[#2F6662] font-normal">
                          {formatDate(msg.reply.repliedAt)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#1A1C1E] bg-white p-3 rounded-lg border border-[#4ECDC4]/20 whitespace-pre-wrap leading-relaxed font-medium">
                        {msg.reply.text}
                      </p>
                    </div>
                  )}

                  {/* Action / Reply Bar */}
                  {!isReplying ? (
                    <div className="pt-2 flex items-center justify-between gap-3">
                      <button
                        id={`btn-open-reply-${msg.id}`}
                        type="button"
                        onClick={() => {
                          setReplyingMessageId(msg.id);
                          setReplyText(
                            msg.category === "Academic"
                              ? PRESET_REPLIES[1]
                              : PRESET_REPLIES[0]
                          );
                        }}
                        className="px-5 py-2.5 rounded-xl bg-[#1A1C1E] hover:opacity-90 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <CornerDownRight className="w-4 h-4 text-[#4ECDC4]" />
                        <span>{isReplied ? "ส่งคำตอบเพิ่มเติม" : "ตอบกลับนักเรียน (Reply)"}</span>
                      </button>
                    </div>
                  ) : (
                    /* Inline Reply Form */
                    <div className="bg-gray-50 p-4 rounded-xl border border-[#4ECDC4]/40 space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1A1C1E] flex items-center gap-1.5">
                          <Send className="w-3.5 h-3.5 text-[#4ECDC4]" />
                          <span>ตอบกลับไปยัง Anonymous Session ของนักเรียน</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setReplyingMessageId(null)}
                          className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          ยกเลิก
                        </button>
                      </div>

                      {/* Presets */}
                      <div>
                        <span className="text-[11px] font-semibold text-gray-500 block mb-1.5">
                          ⚡ ข้อความสำเร็จรูปที่แนะนำ (Empathetic Presets):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {PRESET_REPLIES.map((preset, pIdx) => (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() => setReplyText(preset)}
                              className="text-[11px] bg-white hover:bg-[#E6F8F6] hover:border-[#4ECDC4]/40 border border-gray-200 text-gray-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-left truncate max-w-xs"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Textarea */}
                      <textarea
                        id={`textarea-reply-${msg.id}`}
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="พิมพ์ข้อความตอบกลับที่ให้กำลังใจและแนะนำแนวทางแก่นักเรียน..."
                        className="w-full rounded-xl border border-gray-300 p-3 text-xs sm:text-sm text-[#1A1C1E] bg-white focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] leading-relaxed"
                      />

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>ลงชื่อ:</span>
                          <input
                            type="text"
                            value={teacherNameInput}
                            onChange={(e) => setTeacherNameInput(e.target.value)}
                            placeholder="อาจารย์ประจำวิชา"
                            className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#4ECDC4]"
                          />
                        </div>

                        <button
                          id={`btn-submit-reply-${msg.id}`}
                          type="button"
                          onClick={() => handleSendReply(msg.id)}
                          disabled={isSubmittingReply || !replyText.trim()}
                          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#4ECDC4] hover:bg-[#36B9B0] text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-[#4ecdc440] cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          <span>{isSubmittingReply ? "กำลังส่งคำตอบ..." : "ส่งคำตอบกลับหานักเรียน"}</span>
                        </button>
                      </div>

                      {replySuccessMsg && (
                        <div className="p-2.5 rounded-lg bg-[#E6F8F6] text-[#1F4D4A] border border-[#4ECDC4]/40 text-xs font-semibold flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#4ECDC4]" />
                          <span>{replySuccessMsg}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
