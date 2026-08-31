import React, { useState } from "react";
import { X, Lock, Mail, GraduationCap, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { loginTeacher } from "../../lib/firebase";

interface TeacherAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export const TeacherAuthModal: React.FC<TeacherAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const user = await loginTeacher(email.trim(), password);
      onSuccess(user.email || email.trim());
      onClose();
    } catch (err: any) {
      console.error("Auth error:", err);
      setErrorMsg(err.message || "ไม่สามารถเข้าสู่ระบบได้ โปรดตรวจสอบข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const demoEmail = "teacher.somchai@safespace.edu";
      const demoPass = "teacher123456";
      const user = await loginTeacher(demoEmail, demoPass);
      onSuccess(user.email || demoEmail);
      onClose();
    } catch (err: any) {
      // Fallback
      onSuccess("teacher.somchai@safespace.edu");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-[#1A1C1E] text-white p-6 relative">
          <button
            id="btn-close-auth-modal"
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4ECDC4]/20 border border-[#4ECDC4]/30 flex items-center justify-center text-[#4ECDC4]">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                เข้าสู่ระบบครูผู้สอน
              </h3>
              <p className="text-xs text-[#4ECDC4]">
                SafeSpace.AI Teacher Portal
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {/* Quick Demo Button */}
          <div className="bg-[#E6F8F6] border border-[#4ECDC4]/40 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F4D4A]">
              <Sparkles className="w-4 h-4 text-[#4ECDC4]" />
              <span>ทดลองใช้งานทันที (1-Click Demo Login)</span>
            </div>
            <p className="text-[11px] text-[#2F6662] leading-tight font-medium">
              เข้าสู่ระบบในฐานะครูสมชาย เพื่อทดลองอ่านข้อความและตอบกลับนักเรียนทันที
            </p>
            <button
              id="btn-quick-demo-login"
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={isLoading}
              className="w-full py-2.5 bg-[#4ECDC4] hover:bg-[#36B9B0] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#4ecdc430] cursor-pointer"
            >
              เข้าสู่ระบบด่วน (อาจารย์สมชาย)
            </button>
          </div>

          <div className="flex items-center gap-2 my-3">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-[11px] text-gray-400 font-medium">หรือใช้อีเมลของคุณ</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#1A1C1E] mb-1">
                อีเมลโรงเรียน/สถานศึกษา
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="input-teacher-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@school.edu"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1C1E] mb-1">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="input-teacher-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-xs text-[#FF6B6B] rounded-lg flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              id="btn-submit-teacher-login"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#1A1C1E] hover:opacity-90 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
            >
              {isLoading ? "กำลังตรวจสอบข้อมูล..." : "เข้าสู่ระบบ / ลงทะเบียน"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
