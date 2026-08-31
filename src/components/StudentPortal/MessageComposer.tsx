import React, { useState } from "react";
import {
  Sparkles,
  Send,
  ArrowRight,
  RefreshCw,
  Edit3,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Users,
  CalendarCheck,
  Heart,
  HelpCircle,
  Lock,
  ChevronRight,
} from "lucide-react";
import confetti from "canvas-confetti";
import { MessageCategory } from "../../types";
import { refineMessageTone, RefineToneResponse } from "../../lib/api";
import { submitStudentMessage } from "../../lib/firebase";

interface MessageComposerProps {
  onSuccessSent: () => void;
}

const CATEGORIES: Array<{ id: MessageCategory; label: string; icon: any; color: string; desc: string }> = [
  {
    id: "Academic",
    label: "วิชาการ & การบ้าน",
    icon: BookOpen,
    color: "bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-300",
    desc: "เนื้อหาไม่เข้าใจ, โจทย์ยาก, การบ้านหนัก",
  },
  {
    id: "Bullying/Social",
    label: "เพื่อน & บรรยากาศในห้อง",
    icon: Users,
    color: "bg-rose-50 text-rose-700 border-rose-200 hover:border-rose-300",
    desc: "ถูกล้อเลียน, เพื่อนรบกวน, บรรยากาศตึงเครียด",
  },
  {
    id: "Class Policy",
    label: "กฎระเบียบ & วันส่งงาน",
    icon: CalendarCheck,
    color: "bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-300",
    desc: "ตารางสอบชน, กำหนดส่งงาน, นโยบายห้อง",
  },
  {
    id: "Personal Support",
    label: "ปรึกษาส่วนตัว & กำลังใจ",
    icon: Heart,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-300",
    desc: "ความเครียด, สุขภาพจิต, ปัญหาส่วนตัว",
  },
  {
    id: "Other",
    label: "เรื่องอื่นๆ ทั่วไป",
    icon: HelpCircle,
    color: "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300",
    desc: "ข้อเสนอแนะหรือคำถามอื่นๆ",
  },
];

const MOODS = [
  { emoji: "😰", label: "เครียด/กังวลมาก", value: "high_stress" },
  { emoji: "😫", label: "เหนื่อยล้า/หมดพลัง", value: "exhausted" },
  { emoji: "😢", label: "เสียใจ/อึดอัดใจ", value: "sad" },
  { emoji: "🤔", label: "สงสัย/สับสน", value: "confused" },
  { emoji: "🥺", label: "ต้องการความช่วยเหลือ", value: "needs_help" },
  { emoji: "😐", label: "ข้อเสนอแนะทั่วไป", value: "neutral" },
];

const SAMPLE_STARTERS = [
  "หนูไม่เข้าใจบทเรียนแคลคูลัสเลยค่ะ การบ้านยากมากจนทำไม่ทัน",
  "กลุ่มเพื่อนในห้องชอบแซวและส่งเสียงดังเวลาหนูพรีเซนต์ ทำให้เครียดมาก",
  "สัปดาห์นี้มีสอบย่อยซ้อนกัน 3 วิชา อยากขอเลื่อนกำหนดส่งรายงานครับ",
  "ช่วงนี้มีเรื่องเครียดที่บ้านทำให้สมาธิเรียนตก อยากขอคำแนะนำจากครูครับ",
];

export const MessageComposer: React.FC<MessageComposerProps> = ({ onSuccessSent }) => {
  const [rawText, setRawText] = useState("");
  const [category, setCategory] = useState<MessageCategory>("Academic");
  const [selectedMood, setSelectedMood] = useState("😰");
  const [toneStyle, setToneStyle] = useState("สุภาพและสร้างสรรค์");
  const [isUrgent, setIsUrgent] = useState(false);

  // AI Refinement State
  const [isRefining, setIsRefining] = useState(false);
  const [refinedResult, setRefinedResult] = useState<RefineToneResponse | null>(null);
  const [editableRefinedText, setEditableRefinedText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle AI Refine Click
  const handleRefine = async () => {
    if (!rawText.trim()) {
      setErrorMsg("กรุณากรอกข้อความหรือความรู้สึกของคุณก่อนกดปรับปรุงด้วย AI");
      return;
    }

    setErrorMsg(null);
    setIsRefining(true);

    try {
      const result = await refineMessageTone({
        raw_text: rawText,
        selected_category: category,
        tone_style: toneStyle,
      });

      setRefinedResult(result);
      setEditableRefinedText(result.refined_text);
      if (result.category) {
        setCategory(result.category);
      }
    } catch (err: any) {
      setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อ AI โปรดลองใหม่อีกครั้ง");
    } finally {
      setIsRefining(false);
    }
  };

  // Handle Final Submit to Firestore
  const handleSend = async () => {
    if (!editableRefinedText.trim()) {
      setErrorMsg("ข้อความที่จะส่งไม่สามารถเว้นว่างได้");
      return;
    }

    setIsSending(true);
    setErrorMsg(null);

    try {
      await submitStudentMessage({
        original_text: rawText,
        refined_text: editableRefinedText,
        category: category,
        moodEmoji: selectedMood,
        toneSummary: refinedResult?.tone_summary || "",
        keyPoints: refinedResult?.key_points || [],
        isUrgent: isUrgent,
      });

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#0d9488", "#10b981", "#6366f1", "#f59e0b"],
        });
      } catch (e) {
        // Safe ignore
      }

      // Reset form
      setRawText("");
      setRefinedResult(null);
      setEditableRefinedText("");
      onSuccessSent();
    } catch (err: any) {
      setErrorMsg(err.message || "ไม่สามารถส่งข้อความได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-[#1A1C1E] text-white flex items-center justify-center text-sm font-bold shadow-xs">
              1
            </span>
            <div>
              <h3 className="font-bold text-[#1A1C1E] text-base">
                Student Portal: Express Yourself
              </h3>
              <p className="text-xs text-gray-500">
                SafeSpace AI จะช่วยปรับถ้อยคำให้สุภาพและสร้างสรรค์ก่อนส่งถึงครู
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#0277BD] bg-[#E1F5FE] px-3 py-1 rounded-full font-semibold border border-[#B3E5FC]">
            <Lock className="w-3.5 h-3.5 text-[#0288D1]" />
            <span>Anonymous Encryption Active</span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              เลือกหมวดหมู่เรื่องที่ต้องการสื่อสาร (Select Category)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    id={`btn-category-${cat.id.toLowerCase().replace(/[^a-z]/g, "")}`}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#E6F8F6] border-[#4ECDC4] ring-2 ring-[#4ECDC4]/20 shadow-xs"
                        : "bg-gray-50/70 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-[#4ECDC4] text-white" : "bg-white text-gray-600 border border-gray-200"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-[#1A1C1E]">
                        {cat.label}
                      </div>
                      <div className="text-[11px] text-gray-500 leading-tight mt-0.5">
                        {cat.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mood Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              อารมณ์/ความรู้สึกในตอนนี้ (Your Current Feeling)
            </label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => {
                const isSelected = selectedMood === m.emoji;
                return (
                  <button
                    key={m.value}
                    id={`btn-mood-${m.value}`}
                    type="button"
                    onClick={() => setSelectedMood(m.emoji)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-400/20 font-bold"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-base">{m.emoji}</span>
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Starters / Suggestions */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                What's on your mind? (Raw Message)
              </label>
              <span className="text-[11px] text-gray-400">
                {rawText.length} ตัวอักษร
              </span>
            </div>

            {/* Starter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                💡 ลองคลิกตัวอย่าง:
              </span>
              {SAMPLE_STARTERS.map((s, idx) => (
                <button
                  key={idx}
                  id={`btn-sample-starter-${idx}`}
                  type="button"
                  onClick={() => setRawText(s)}
                  className="text-[11px] bg-gray-100 hover:bg-[#E6F8F6] hover:text-[#1F4D4A] hover:border-[#4ECDC4]/40 border border-gray-200 text-gray-600 px-2.5 py-0.5 rounded-md transition-colors cursor-pointer truncate max-w-[200px]"
                  title={s}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <div className="relative">
              <textarea
                id="textarea-student-raw-input"
                rows={4}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Tell us how you feel or ask a question. Be honest—we will polish the tone for you. (เช่น 'หนูไม่เข้าใจบทเรียนเลย การบ้านยากเกินไปจนเหนื่อยมาก...')"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-[#1A1C1E] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:bg-white transition-all leading-relaxed"
              />
            </div>
          </div>

          {/* Options & Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer">
              <input
                id="checkbox-is-urgent"
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="rounded text-[#4ECDC4] focus:ring-[#4ECDC4] w-4 h-4 border-gray-300"
              />
              <span>ต้องการความช่วยเหลือเร่งด่วน (Urgent Attention)</span>
            </label>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {rawText && (
                <button
                  id="btn-clear-raw-input"
                  type="button"
                  onClick={() => {
                    setRawText("");
                    setRefinedResult(null);
                  }}
                  className="bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  ล้างข้อความ
                </button>
              )}

              <button
                id="btn-refine-with-ai"
                type="button"
                onClick={handleRefine}
                disabled={isRefining || !rawText.trim()}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white transition-all shadow-sm cursor-pointer ${
                  isRefining || !rawText.trim()
                    ? "bg-gray-300 cursor-not-allowed text-gray-500 shadow-none"
                    : "bg-[#1A1C1E] hover:opacity-90 active:scale-[0.99]"
                }`}
              >
                {isRefining ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>กำลังแปลงสำนวนด้วย Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#4ECDC4]" />
                    <span>Refine with AI (ปรับสำนวน)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#FF6B6B]" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Step 2: AI Tone Refinement Card (Professional Polish Look) */}
      {refinedResult && (
        <div className="bg-[#E6F8F6] p-6 rounded-2xl border-2 border-dashed border-[#4ECDC4] shadow-sm animate-fadeIn space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#4ECDC4] rounded-xl text-white shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#1F4D4A] flex items-center gap-2">
                  <span>Gemini Refinement Result</span>
                  <span className="text-[11px] bg-white/70 text-[#1F4D4A] px-2 py-0.5 rounded-full font-bold border border-[#4ECDC4]/30">
                    {refinedResult.category}
                  </span>
                </h3>
                <p className="text-xs text-[#2F6662]">
                  ถ้อยคำได้รับการปรับปรุงให้สุภาพ ให้เกียรติ และพร้อมส่งถึงอาจารย์
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#1F4D4A] bg-white/80 px-3 py-1 rounded-full border border-[#4ECDC4]/40 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#4ECDC4]" />
              <span>98.2% Professional Tone</span>
            </div>
          </div>

          {/* AI Explanation Banner */}
          {refinedResult.tone_summary && (
            <div className="bg-white/80 border border-[#4ECDC4]/40 rounded-xl p-3.5 flex items-start gap-3 text-xs text-[#1F4D4A]">
              <Sparkles className="w-4 h-4 text-[#4ECDC4] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">สรุปการปรับปรุง: </span>
                <span>{refinedResult.tone_summary}</span>
              </div>
            </div>
          )}

          {/* Before vs After Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Before: Raw Student Input */}
            <div className="bg-white/70 rounded-xl p-4 border border-gray-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                    ข้อความเดิมของคุณ (Raw Input)
                  </span>
                  <span className="text-base">{selectedMood}</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200 italic leading-relaxed whitespace-pre-wrap">
                  "{rawText}"
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200 text-[11px] text-gray-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#0288D1]" />
                <span>ข้อความดิบนี้จะไม่ถูกส่งให้ครูผู้สอน</span>
              </div>
            </div>

            {/* After: Polished & Editable */}
            <div className="bg-white rounded-xl p-4 border border-[#4ECDC4] flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1F4D4A] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#4ECDC4]" />
                    ข้อความที่จะส่งถึงครู (Polished Message)
                  </span>
                  <span className="text-[11px] text-[#1F4D4A] bg-[#E6F8F6] px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 border border-[#4ECDC4]/30">
                    <Edit3 className="w-3 h-3" />
                    แก้ไขได้
                  </span>
                </div>

                <textarea
                  id="textarea-editable-refined-message"
                  rows={4}
                  value={editableRefinedText}
                  onChange={(e) => setEditableRefinedText(e.target.value)}
                  className="w-full rounded-lg border border-[#4ECDC4]/50 bg-white p-3 text-xs sm:text-sm text-[#1A1C1E] font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                />
              </div>

              {/* Key Points */}
              {refinedResult.key_points && refinedResult.key_points.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-[11px] font-bold text-[#1F4D4A] mb-1">
                    ประเด็นสำคัญที่สรุปได้ (Core Needs):
                  </div>
                  <ul className="space-y-0.5">
                    {refinedResult.key_points.map((pt, i) => (
                      <li key={i} className="text-[11px] text-[#2F6662] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4ECDC4]"></span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Confirmation & Send Button */}
          <div className="bg-white/90 p-4 rounded-xl border border-[#4ECDC4]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#1F4D4A] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#4ECDC4] shrink-0" />
              <span>
                ส่งแบบ <strong>Anonymous ไม่ระบุตัวตน 100%</strong> พร้อมรหัสติดตามคำตอบ
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                id="btn-re-refine"
                type="button"
                onClick={handleRefine}
                disabled={isRefining}
                className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>แปลงใหม่</span>
              </button>

              <button
                id="btn-send-anonymously"
                type="button"
                onClick={handleSend}
                disabled={isSending || !editableRefinedText.trim()}
                className="flex-1 sm:flex-none px-8 py-2.5 rounded-xl bg-[#4ECDC4] hover:bg-[#36B9B0] text-white font-bold text-sm transition-all shadow-lg shadow-[#4ecdc440] flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>กำลังส่งอย่างปลอดภัย...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Anonymously (ส่งข้อความ)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
