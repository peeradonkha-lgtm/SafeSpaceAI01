import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  addDoc
} from "firebase/firestore";
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";
import { StudentMessage, TrendSummary, MessageCategory } from "../types";

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom database ID from config
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Collection names
const MESSAGES_COLLECTION = "messages";
const SUMMARIES_COLLECTION = "summaries";

/**
 * Local persistent fallback session identifier
 */
export function getOrCreateLocalSessionId(): string {
  if (typeof window === "undefined") return "session-server";
  const KEY = "safespace_student_uid";
  let sessionId = localStorage.getItem(KEY);
  if (!sessionId) {
    sessionId = "anon_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36);
    localStorage.setItem(KEY, sessionId);
  }
  return sessionId;
}

/**
 * Standard Firestore error handling helper
 */
export function handleFirestoreError(error: unknown, operationDescription: string): void {
  const err = error as { code?: string; message?: string };
  console.error(`[Firestore Error] during ${operationDescription}:`, err?.message || err);
}

/**
 * Ensure anonymous student session authentication
 */
export async function ensureAnonymousStudent(): Promise<{ uid: string; isAnonymous: boolean }> {
  if (auth.currentUser) {
    return {
      uid: auth.currentUser.uid,
      isAnonymous: auth.currentUser.isAnonymous,
    };
  }

  try {
    const credential = await signInAnonymously(auth);
    return {
      uid: credential.user.uid,
      isAnonymous: true,
    };
  } catch (err: any) {
    console.warn("Anonymous Firebase sign-in unavailable, using local persistent session:", err?.message || err);
    return {
      uid: getOrCreateLocalSessionId(),
      isAnonymous: true,
    };
  }
}

/**
 * Teacher sign-in
 */
export async function loginTeacher(email: string, pass: string): Promise<User> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  } catch (error: any) {
    // If user not found, create account for demo ease
    if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential") {
      try {
        const createCred = await createUserWithEmailAndPassword(auth, email, pass);
        return createCred.user;
      } catch (innerErr) {
        throw error;
      }
    }
    throw error;
  }
}

/**
 * Sign out teacher
 */
export async function logoutTeacher(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn("Error signing out:", e);
  }
  try {
    await signInAnonymously(auth);
  } catch {
    // Graceful fallback
  }
}

/**
 * Submit a student message to Firestore
 */
export async function submitStudentMessage(params: {
  original_text: string;
  refined_text: string;
  category: MessageCategory;
  moodEmoji?: string;
  toneSummary?: string;
  keyPoints?: string[];
  isUrgent?: boolean;
}): Promise<string> {
  try {
    const user = await ensureAnonymousStudent();
    const studentSessionId = user.uid;

    const docData = {
      original_text: params.original_text,
      refined_text: params.refined_text,
      category: params.category,
      status: "unread",
      studentSessionId,
      moodEmoji: params.moodEmoji || "😐",
      toneSummary: params.toneSummary || "",
      keyPoints: params.keyPoints || [],
      isUrgent: params.isUrgent || false,
      timestamp: Date.now(),
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), docData);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, "submitStudentMessage");
    throw error;
  }
}

/**
 * Subscribe to current student's messages
 */
export function subscribeStudentMessages(
  studentSessionId: string,
  callback: (messages: StudentMessage[]) => void
) {
  // Try querying by studentSessionId; fallback to local ID if needed
  const localId = getOrCreateLocalSessionId();
  const q = query(collection(db, MESSAGES_COLLECTION));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: StudentMessage[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        // Match if matches either studentSessionId or localId
        if (data.studentSessionId === studentSessionId || (localId && data.studentSessionId === localId)) {
          list.push({
            id: d.id,
            original_text: data.original_text || "",
            refined_text: data.refined_text || "",
            category: data.category || "Academic",
            timestamp: data.timestamp || (data.createdAt ? (data.createdAt as Timestamp).toMillis() : Date.now()),
            status: data.status || "unread",
            studentSessionId: data.studentSessionId || "",
            moodEmoji: data.moodEmoji,
            toneSummary: data.toneSummary,
            keyPoints: data.keyPoints || [],
            reply: data.reply,
            isUrgent: data.isUrgent,
          });
        }
      });
      // Sort newest first
      list.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
      callback(list);
    },
    (err) => {
      handleFirestoreError(err, "subscribeStudentMessages");
    }
  );
}

/**
 * Subscribe to all messages for Teacher Dashboard
 */
export function subscribeAllMessages(
  callback: (messages: StudentMessage[]) => void
) {
  const q = query(collection(db, MESSAGES_COLLECTION));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: StudentMessage[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          original_text: data.original_text || "",
          refined_text: data.refined_text || "",
          category: data.category || "Academic",
          timestamp: data.timestamp || (data.createdAt ? (data.createdAt as Timestamp).toMillis() : Date.now()),
          status: data.status || "unread",
          studentSessionId: data.studentSessionId || "",
          moodEmoji: data.moodEmoji,
          toneSummary: data.toneSummary,
          keyPoints: data.keyPoints || [],
          reply: data.reply,
          isUrgent: data.isUrgent,
        });
      });
      // Sort newest first
      list.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
      callback(list);
    },
    (err) => {
      handleFirestoreError(err, "subscribeAllMessages");
    }
  );
}

/**
 * Send teacher reply to an anonymized student message
 */
export async function replyToStudentMessage(
  messageId: string,
  replyText: string,
  teacherEmail: string = "teacher@safespace.edu",
  teacherName: string = "อาจารย์ที่ปรึกษา / Instructor"
): Promise<void> {
  try {
    const docRef = doc(db, MESSAGES_COLLECTION, messageId);
    await updateDoc(docRef, {
      status: "replied",
      reply: {
        text: replyText,
        repliedAt: Date.now(),
        teacherEmail,
        teacherName,
      },
    });
  } catch (error) {
    handleFirestoreError(error, "replyToStudentMessage");
    throw error;
  }
}

/**
 * Save trend summary generated by AI
 */
export async function saveTrendSummary(summary: Omit<TrendSummary, "id">): Promise<string> {
  try {
    const docData = {
      ...summary,
      createdAt: Date.now(),
      serverTime: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, SUMMARIES_COLLECTION), docData);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, "saveTrendSummary");
    throw error;
  }
}

/**
 * Subscribe to latest trend summary
 */
export function subscribeLatestTrendSummary(
  callback: (summary: TrendSummary | null) => void
) {
  const q = query(collection(db, SUMMARIES_COLLECTION));

  return onSnapshot(
    q,
    (snapshot) => {
      const summaries: TrendSummary[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        summaries.push({
          id: d.id,
          createdAt: data.createdAt || Date.now(),
          executiveSummary: data.executiveSummary || "",
          sentimentScore: data.sentimentScore ?? 70,
          sentimentLabel: data.sentimentLabel || "Healthy & Constructive",
          keyThemes: data.keyThemes || [],
          empatheticActions: data.empatheticActions || [],
          urgentAlerts: data.urgentAlerts || [],
          messageCount: data.messageCount || 0,
        });
      });
      summaries.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
      callback(summaries[0] || null);
    },
    (err) => {
      handleFirestoreError(err, "subscribeLatestTrendSummary");
    }
  );
}

/**
 * Seed realistic anonymized demo data for initial testing
 */
export async function seedDemoDataset(currentUid: string): Promise<void> {
  const demoMessages = [
    {
      original_text: "หนูไม่เข้าใจบทเรียนแคลคูลัสเรื่องอนุพันธ์เลยค่ะ การบ้านยากมากจนรู้สึกท้อแท้",
      refined_text: "เรียนอาจารย์ครับ/ค่ะ หนูพบว่าเนื้อหาแคลคูลัสเรื่องอนุพันธ์มีความท้าทายค่อนข้างมาก และติดปัญหาในการทำแบบฝึกหัด อยากขอคำแนะนำหรือตัวอย่างเพิ่มเติมในคาบเรียนถัดไปค่ะ",
      category: "Academic" as MessageCategory,
      moodEmoji: "😰",
      toneSummary: "ปรับทัศนคติจากความท้อแท้เป็นการขอคำปรึกษาและตัวอย่างแบบฝึกหัด",
      keyPoints: ["ติดปัญหาหัวข้ออนุพันธ์แคลคูลัส", "ขอตัวอย่างโจทย์และการบ้านเพิ่มเติม"],
      status: "replied" as const,
      isUrgent: false,
      timestamp: Date.now() - 3600 * 1000 * 24 * 2,
      reply: {
        text: "ขอบคุณที่แจ้งครูนะครับ ในคาบวันศุกร์นี้ครูจะเพิ่มช่วงทบทวนโจทย์อนุพันธ์ 15 นาที และแจกแบบฝึกหัดพร้อมเฉลยละเอียดให้ครับ",
        repliedAt: Date.now() - 3600 * 1000 * 24 * 1.5,
        teacherEmail: "teacher@safespace.edu",
        teacherName: "ครูประจำวิชาคณิตศาสตร์",
      }
    },
    {
      original_text: "กลุ่มเพื่อนในห้องชอบแซวและพูดเสียงดังรบกวนเวลาหนูนำเสนอผลงาน ทำให้เครียดมาก",
      refined_text: "เรียนอาจารย์ครับ/ค่ะ อยากขอปรึกษาเรื่องบรรยากาศในชั้นเรียนระหว่างการนำเสนอผลงาน เนื่องจากมีเสียงรบกวนทำให้สูญเสียสมาธิ จึงอยากเสนอแนะให้มีข้อตกลงเรื่องการรับฟังเพื่อนในห้องร่วมกันครับ",
      category: "Bullying/Social" as MessageCategory,
      moodEmoji: "😢",
      toneSummary: "ปรับจากการกล่าวโทษเป็นข้อเสนอแนะในการสร้างกติกาการเคารพซึ่งกันและกัน",
      keyPoints: ["มีเสียงรบกวนขณะนำเสนอ", "ต้องการสร้างข้อตกลงร่วมกันในห้องเรียน"],
      status: "unread" as const,
      isUrgent: true,
      timestamp: Date.now() - 3600 * 1000 * 18,
    },
    {
      original_text: "กำหนดส่งรายงานวิชาวิทยาศาสตร์ชนกับสัปดาห์สอบย่อย 3 วิชา หนักมากแทบไม่ได้นอน",
      refined_text: "เรียนอาจารย์ครับ/ค่ะ ขออนุญาตสอบถามเรื่องกำหนดการส่งรายงานวิชาวิทยาศาสตร์ เนื่องจากสัปดาห์ดังกล่าวมีสอบย่อยซ้อนกันหลายวิชา หากเป็นไปได้อยากขอความอนุเคราะห์พิจารณาขยายเวลาส่งออกไป 2-3 วันเพื่อให้นักเรียนทำผลงานได้เต็มที่ครับ",
      category: "Class Policy" as MessageCategory,
      moodEmoji: "😫",
      toneSummary: "เปลี่ยนจากคำบ่นเรื่องการอดนอนเป็นการขอความอนุเคราะห์พิจารณาไทม์ไลน์อย่างสมเหตุสมผล",
      keyPoints: ["ตารางส่งงานตรงกับช่วงสอบย่อยหลายวิชา", "ขอพิจารณาขยายเวลาส่ง 2-3 วัน"],
      status: "unread" as const,
      isUrgent: false,
      timestamp: Date.now() - 3600 * 1000 * 8,
    },
    {
      original_text: "ช่วงนี้ที่บ้านมีปัญหาส่วนตัวนิดหน่อย ทำให้สมาธิในการเรียนลดลง อยากขอพักใจบ้าง",
      refined_text: "เรียนอาจารย์ที่ปรึกษาครับ/ค่ะ ช่วงนี้มีประเด็นส่วนตัวที่กระทบต่อสภาพจิตใจและสมาธิในการเรียนเล็กน้อย จึงอยากแจ้งให้อาจารย์ทราบล่วงหน้า และอาจจะขออนุญาตเข้าไปขอคำปรึกษาเพิ่มเติมในเวลาที่สะดวกครับ",
      category: "Personal Support" as MessageCategory,
      moodEmoji: "🥺",
      toneSummary: "ปรับให้สื่อสารเรื่องสุขภาพจิตและความพร้อมในการเรียนอย่างเปิดใจและเป็นทางการ",
      keyPoints: ["มีเรื่องส่วนตัวกระทบสมาธิ", "แจ้งอาจารย์ล่วงหน้าเพื่อขอนัดเวลาปรึกษา"],
      status: "replied" as const,
      isUrgent: true,
      timestamp: Date.now() - 3600 * 1000 * 4,
      reply: {
        text: "ยินดีรับฟังและเป็นกำลังใจให้นะครับ สะดวกเข้ามานั่งคุยกันที่ห้องแนะแนวได้ทุกวันช่วงพักเที่ยงหรือหลังเลิกเรียน ไม่ต้องกังวลเรื่องการบ้านนะ ครูยินดีช่วยวางแผนยืดหยุ่นให้ครับ",
        repliedAt: Date.now() - 3600 * 1000 * 2,
        teacherEmail: "counselor@safespace.edu",
        teacherName: "ครูแนะแนวประจำระดับชั้น",
      }
    }
  ];

  try {
    for (const item of demoMessages) {
      await addDoc(collection(db, MESSAGES_COLLECTION), {
        ...item,
        studentSessionId: currentUid,
        createdAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, "seedDemoDataset");
  }
}
