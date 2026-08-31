import React, { useState } from "react";
import { ShieldCheck, EyeOff, KeyRound, Sparkles, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";

export const PrivacyBanner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-[#1A1C1E] text-white rounded-2xl p-5 sm:p-6 shadow-md border border-gray-800 relative overflow-hidden mb-6">
      {/* Subtle Background Accent */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#4ECDC4]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4ECDC4]/20 border border-[#4ECDC4]/30 flex items-center justify-center shrink-0 text-[#4ECDC4]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-bold text-base sm:text-lg text-white">
                  คำสัญญาความปลอดภัย SafeSpace Guarantee
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] bg-[#4ECDC4]/20 text-[#4ECDC4] px-2.5 py-0.5 rounded-full border border-[#4ECDC4]/30 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  100% ไม่เปิดเผยตัวตน (Anonymous)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                ไม่มีการจัดเก็บชื่อ อีเมล ข้อมูลส่วนตัว หรือ IP Address ของคุณในระบบทุกกรณี
              </p>
            </div>
          </div>

          <button
            id="btn-toggle-privacy-details"
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-[#4ECDC4] hover:text-teal-300 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer border border-[#4ECDC4]/20 font-medium"
          >
            <span>{isExpanded ? "ย่อข้อมูล" : "ดูรายละเอียด"}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-5 pt-4 border-t border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-800 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-[#4ECDC4] font-semibold">
                <EyeOff className="w-4 h-4" />
                <span>ไม่มีการเก็บตัวตน (No Identity)</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                ระบบสร้างรหัสเซสชันแบบสุ่ม (Cryptographic Token) เพื่อให้คุณได้รับการตอบกลับจากครู โดยที่ครูจะไม่ทราบว่าใครเป็นคนส่ง
              </p>
            </div>

            <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-800 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-indigo-300 font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>AI กลั่นกรองคำพูด (Tone Filter)</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Gemini AI ช่วยแปลงอารมณ์คับข้องใจให้เป็นประโยคที่สุภาพและสร้างสรรค์ ช่วยรักษาความสัมพันธ์อันดีระหว่างคุณและครู
              </p>
            </div>

            <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-800 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-amber-300 font-semibold">
                <KeyRound className="w-4 h-4" />
                <span>คุณควบคุมได้เต็มที่ (Your Control)</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                คุณสามารถตรวจทาน แก้ไขข้อความที่ AI แนะนำ และกดส่งเมื่อคุณพอใจในถ้อยคำเท่านั้น
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
