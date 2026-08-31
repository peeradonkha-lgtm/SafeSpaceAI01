import React, { useState, useEffect } from "react";
import {
  Sparkles,
  TrendingUp,
  HeartHandshake,
  AlertTriangle,
  Lightbulb,
  RefreshCw,
  Clock,
  PieChart,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { StudentMessage, TrendSummary, TrendTheme, EmpatheticAction } from "../../types";
import { generateTrendSummary } from "../../lib/api";
import { saveTrendSummary, subscribeLatestTrendSummary } from "../../lib/firebase";

interface TrendAnalyticsProps {
  messages: StudentMessage[];
}

export const TrendAnalytics: React.FC<TrendAnalyticsProps> = ({ messages }) => {
  const [latestSummary, setLatestSummary] = useState<TrendSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Subscribe to latest saved summary in Firestore
  useEffect(() => {
    const unsubscribe = subscribeLatestTrendSummary((summary) => {
      if (summary) {
        setLatestSummary(summary);
      }
    });
    return () => unsubscribe();
  }, []);

  // Compute category statistics
  const categoryCounts = messages.reduce((acc, m) => {
    acc[m.category] = (acc[m.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalMessages = messages.length;

  const getPercentage = (count: number) => {
    if (totalMessages === 0) return 0;
    return Math.round((count / totalMessages) * 100);
  };

  // Generate New AI Trend Summary
  const handleGenerateSummary = async () => {
    if (messages.length === 0) {
      setErrorMsg("ยังไม่มีข้อมูลข้อความจากนักเรียนเพียงพอสำหรับวิเคราะห์แนวโน้ม");
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const summary = await generateTrendSummary(messages);
      setLatestSummary(summary);
      // Persist in Firestore
      await saveTrendSummary(summary);
    } catch (err: any) {
      console.error("Error generating summary:", err);
      setErrorMsg("เกิดข้อผิดพลาดในการประมวลผลด้วย Gemini AI");
    } finally {
      setIsGenerating(false);
    }
  };

  // Format date helper
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
      return "ล่าสุด";
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "high":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner & Trigger */}
      <div className="bg-[#1A1C1E] text-white p-6 sm:p-7 rounded-2xl border border-gray-800 shadow-md relative overflow-hidden">
        {/* Ambient background blur */}
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-[#4ECDC4]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-xl bg-[#4ECDC4]/20 text-[#4ECDC4] border border-[#4ECDC4]/30">
                <TrendingUp className="w-5 h-5" />
              </span>
              <h3 className="font-bold text-lg text-white">
                Classroom Pulse & AI Trend Analytics
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
              Gemini AI รวบรวมข้อความสะท้อนความคิดเห็นของนักเรียนทั้งหมด วิเคราะห์ภาพรวมอารมณ์ และเสนอแนะแนวทางปฏิบัติเชิงบวกสำหรับครูผู้สอน
            </p>
          </div>

          <button
            id="btn-generate-ai-trends"
            type="button"
            onClick={handleGenerateSummary}
            disabled={isGenerating || messages.length === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white transition-all shadow-lg shadow-[#4ecdc440] cursor-pointer shrink-0 ${
              isGenerating || messages.length === 0
                ? "bg-gray-800 text-gray-500 cursor-not-allowed shadow-none border border-gray-700"
                : "bg-[#4ECDC4] hover:bg-[#36B9B0] active:scale-[0.99]"
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>กำลังวิเคราะห์ด้วย Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>ประมวลผลสรุปแนวโน้มใหม่</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-[#FF6B6B]" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Category Breakdown Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { key: "Academic", label: "วิชาการ & การบ้าน", color: "text-blue-700", bar: "bg-blue-600", bg: "bg-white border-gray-200" },
          { key: "Bullying/Social", label: "เพื่อน & บรรยากาศ", color: "text-[#FF6B6B]", bar: "bg-[#FF6B6B]", bg: "bg-white border-gray-200" },
          { key: "Class Policy", label: "กฎ & กำหนดส่ง", color: "text-amber-700", bar: "bg-amber-500", bg: "bg-white border-gray-200" },
          { key: "Personal Support", label: "ปรึกษาส่วนตัว", color: "text-[#1F4D4A]", bar: "bg-[#4ECDC4]", bg: "bg-white border-gray-200" },
          { key: "Other", label: "เรื่องอื่นๆ", color: "text-gray-700", bar: "bg-gray-600", bg: "bg-white border-gray-200" },
        ].map((cat) => {
          const count = categoryCounts[cat.key] || 0;
          const pct = getPercentage(count);

          return (
            <div
              key={cat.key}
              className={`p-4 rounded-2xl border ${cat.bg} shadow-xs flex flex-col justify-between`}
            >
              <span className="text-[11px] font-semibold text-gray-500 truncate">
                {cat.label}
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className={`text-2xl font-black ${cat.color}`}>{count}</span>
                <span className="text-xs font-bold text-gray-400">{pct}%</span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${cat.bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Sentiment & Executive Summary */}
      {latestSummary ? (
        <div className="space-y-6">
          {/* Sentiment & Executive Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#E6F8F6] border border-[#4ECDC4]/30 flex items-center justify-center text-[#4ECDC4]">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      คะแนนบรรยากาศ & อารมณ์โดยรวม
                    </span>
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-mono">
                      วิเคราะห์จาก {latestSummary.messageCount || messages.length} ข้อความ
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-2xl font-black text-[#1A1C1E] font-['Outfit']">
                      {latestSummary.sentimentScore}/100
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                        latestSummary.sentimentScore >= 70
                          ? "bg-[#E6F8F6] text-[#1F4D4A] border-[#4ECDC4]/40"
                          : latestSummary.sentimentScore >= 45
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-rose-50 text-[#FF6B6B] border-rose-200"
                      }`}
                    >
                      {latestSummary.sentimentLabel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>วิเคราะห์เมื่อ: {formatDate(latestSummary.createdAt)}</span>
              </div>
            </div>

            {/* Executive Summary Paragraph */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#4ECDC4]" />
                <span>บทสรุปสาระสำคัญ (Executive Summary)</span>
              </h4>
              <p className="text-sm text-[#1A1C1E] bg-gray-50 p-4 rounded-xl border border-gray-200 leading-relaxed font-medium">
                {latestSummary.executiveSummary}
              </p>
            </div>

            {/* Urgent Alerts Banner if any */}
            {latestSummary.urgentAlerts && latestSummary.urgentAlerts.length > 0 && (
              <div className="bg-rose-50 rounded-xl p-4 border border-rose-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-[#FF6B6B]" />
                  <span>ประเด็นที่แนะนำให้ครูผู้สอนติดตามเป็นพิเศษ (Urgent Flags):</span>
                </div>
                <ul className="space-y-1 pl-6 list-disc text-xs text-rose-700">
                  {latestSummary.urgentAlerts.map((alert, aIdx) => (
                    <li key={aIdx}>{alert}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Recurring Themes & Action Steps Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recurring Themes */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h4 className="font-bold text-sm text-[#1A1C1E]">
                  ประเด็นปัญหาที่พบซ้ำบ่อย (Recurring Themes)
                </h4>
              </div>

              <div className="space-y-3">
                {latestSummary.keyThemes && latestSummary.keyThemes.length > 0 ? (
                  latestSummary.keyThemes.map((theme, tIdx) => (
                    <div
                      key={tIdx}
                      className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-colors space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-xs sm:text-sm text-[#1A1C1E]">
                          {theme.title}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border shrink-0 ${getSeverityBadge(
                            theme.severity
                          )}`}
                        >
                          {theme.severity === "high"
                            ? "ผลกระทบสูง"
                            : theme.severity === "medium"
                            ? "ผลกระทบปานกลาง"
                            : "ทั่วไป"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {theme.description}
                      </p>
                      {theme.count && (
                        <div className="text-[11px] text-gray-400 pt-1">
                          พบประมาณ {theme.count} ข้อความ
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">ไม่มีประเด็นปัญหาซ้ำซ้อน</p>
                )}
              </div>
            </div>

            {/* Empathetic Action Recommendations for Teacher */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h4 className="font-bold text-sm text-[#1A1C1E]">
                  ข้อเสนอแนะเชิงปฏิบัติสำหรับครู (Actionable Steps)
                </h4>
              </div>

              <div className="space-y-3">
                {latestSummary.empatheticActions && latestSummary.empatheticActions.length > 0 ? (
                  latestSummary.empatheticActions.map((action, aIdx) => (
                    <div
                      key={aIdx}
                      className="p-4 rounded-xl border border-[#4ECDC4]/40 bg-[#E6F8F6]/40 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-xs sm:text-sm text-[#1F4D4A] flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#4ECDC4] shrink-0" />
                          <span>{action.actionTitle}</span>
                        </span>
                        <span className="text-[10px] font-bold text-[#1F4D4A] bg-[#E6F8F6] border border-[#4ECDC4]/30 px-2 py-0.5 rounded-full shrink-0">
                          {action.suggestedTimeline || "สัปดาห์นี้"}
                        </span>
                      </div>
                      <p className="text-xs text-[#2F6662] leading-relaxed pl-5 font-medium">
                        {action.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">ยังไม่มีข้อเสนอแนะใหม่</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#E6F8F6] text-[#4ECDC4] flex items-center justify-center mx-auto border border-[#4ECDC4]/30">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h4 className="font-bold text-[#1A1C1E] text-base mb-1">
              ยังไม่มีการสรุปแนวโน้มประจำช่วงเวลานี้
            </h4>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              กดปุ่มด้านบนเพื่อสั่งให้ Gemini AI วิเคราะห์ภาพรวมและแนะนำแนวทางช่วยเหลือชั้นเรียนของคุณทันที
            </p>
          </div>
          <button
            type="button"
            onClick={handleGenerateSummary}
            disabled={isGenerating || messages.length === 0}
            className="px-6 py-3 rounded-xl bg-[#1A1C1E] hover:opacity-90 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#4ECDC4]" />
            <span>เริ่มวิเคราะห์แนวโน้มชั้นเรียนด้วย AI</span>
          </button>
        </div>
      )}
    </div>
  );
};
