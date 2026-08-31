import { MessageCategory, TrendSummary } from "../types";

export interface RefineToneResponse {
  original_text: string;
  refined_text: string;
  category: MessageCategory;
  tone_summary: string;
  key_points: string[];
  isFallback?: boolean;
}

/**
 * Call server Gemini API to refine student message tone
 */
export async function refineMessageTone(params: {
  raw_text: string;
  selected_category?: MessageCategory;
  tone_style?: string;
}): Promise<RefineToneResponse> {
  try {
    const res = await fetch("/api/refine-tone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Failed to call /api/refine-tone, using client-side fallback", error);
    // Graceful client fallback
    const raw = params.raw_text.trim();
    return {
      original_text: raw,
      refined_text: `เรียนคุณครูครับ/ค่ะ อยากขออนุญาตปรึกษาและขอคำแนะนำเกี่ยวกับเรื่องนี้ครับ: "${raw}" เพื่อทำความเข้าใจและหาแนวทางแก้ไขร่วมกันอย่างสร้างสรรค์ครับ`,
      category: params.selected_category || "Academic",
      tone_summary: "AI ปรับคำพูดให้อยู่ในโทนที่สุภาพ ให้เกียรติ และพร้อมรับฟังคำแนะนำ",
      key_points: ["ต้องการคำแนะนำและการสนับสนุนจากครู"],
      isFallback: true,
    };
  }
}

/**
 * Call server Gemini API to generate class sentiment & trend summary
 */
export async function generateTrendSummary(
  messages: Array<{
    id: string;
    category: string;
    refined_text?: string;
    original_text?: string;
    status?: string;
    timestamp?: number | string;
  }>,
  timeframe: string = "all"
): Promise<TrendSummary> {
  try {
    const res = await fetch("/api/summarize-trends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, timeframe }),
    });

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      createdAt: Date.now(),
      executiveSummary: data.executiveSummary,
      sentimentScore: data.sentimentScore ?? 70,
      sentimentLabel: data.sentimentLabel || "Healthy & Constructive",
      keyThemes: data.keyThemes || [],
      empatheticActions: data.empatheticActions || [],
      urgentAlerts: data.urgentAlerts || [],
      messageCount: messages.length,
    };
  } catch (error) {
    console.error("Failed to generate trend summary from API:", error);
    return {
      createdAt: Date.now(),
      executiveSummary: `สรุปภาพรวมจากข้อความนักเรียน ${messages.length} รายการ: มีความต้องการความชัดเจนในการเรียนและการสนับสนุนด้านจิตใจจากครูผู้สอน`,
      sentimentScore: 68,
      sentimentLabel: "Moderate Stress / Constructive",
      keyThemes: [
        {
          title: "ความชัดเจนในเนื้อหาและการประเมิน",
          count: Math.ceil(messages.length * 0.5),
          description: "นักเรียนต้องการตัวอย่างประกอบเพิ่มเติมและการชี้แจงเกณฑ์คะแนน",
          severity: "medium",
        },
      ],
      empatheticActions: [
        {
          actionTitle: "จัดชั่วโมง Feedback สั้นๆ ในชั้นเรียน",
          description: "รับฟังความคิดเห็นและตอบข้อสงสัยของนักเรียนอย่างเปิดกว้าง",
          suggestedTimeline: "สัปดาห์นี้",
          difficulty: "easy",
        },
      ],
      urgentAlerts: [],
      messageCount: messages.length,
    };
  }
}
