import { AuthService } from './authService';
import type { CommunityPost, EventItem, Screening, ScreeningCenter } from '../types';

// عنوان السيرفر الرئيسي (نفس قيمة تطبيق فلاتر افتراضيًا، ويمكن تغييره عبر VITE_API_BASE_URL)
const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? '/api';
const TIMEOUT_MS = 10_000;

type Headers_ = Record<string, string>;

// هيدرز عامة بدون مصادقة
const baseHeaders: Headers_ = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

// هيدرز تُرفق التوكن إن كان المستخدم مسجّل دخول، وإلا تُرسل بدونه
async function optionalAuthHeaders(): Promise<Headers_> {
  const headers = { ...baseHeaders };
  const token = await AuthService.getIdToken();
  if (token !== null) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// هيدرز تتطلب تسجيل دخول إجباريًا — ترمي AuthRequiredException إن لم يوجد مستخدم
async function requiredAuthHeaders(): Promise<Headers_> {
  const token = await AuthService.requireIdToken();
  return { ...baseHeaders, Authorization: `Bearer ${token}` };
}

// fetch مع مهلة 10 ثوانٍ (يقابل .timeout(timeoutDuration))
async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(`${BASE_URL}${path}`, { ...init, signal: controller.signal });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new Error('انتهت مهلة الاتصال بالخادم');
    }
    throw new Error('لا يوجد اتصال بالإنترنت');
  } finally {
    clearTimeout(timer);
  }
}

const json = (body: unknown) => JSON.stringify(body);

async function ensureSuccess(response: Response, action: string): Promise<void> {
  if (response.ok) return;

  let detail = '';
  try {
    const body = (await response.clone().json()) as { message?: unknown; error?: unknown };
    const value = typeof body.message === 'string' ? body.message : body.error;
    if (typeof value === 'string') detail = `: ${value}`;
  } catch {
    // Keep the HTTP status when the server does not return a JSON error body.
  }

  throw new Error(`${action} (HTTP ${response.status})${detail}`);
}

export const ApiService = {
  // ================= المجتمع =================

  // جلب المنشورات — متاح للزوار
  async getCommunityPosts(): Promise<CommunityPost[]> {
    const res = await request('/community/posts', { headers: await optionalAuthHeaders() });
    if (res.status === 200) return ((await res.json()).data ?? []) as CommunityPost[];
    throw new Error(`فشل جلب منشورات المجتمع: ${res.status}`);
  },

  // إنشاء منشور — يتطلب تسجيل دخول (userId يُؤخذ من التوكن على الباك اند)
  async createPost(params: { authorName: string; isAnonymous: boolean; content: string }): Promise<boolean> {
    const headers = await requiredAuthHeaders(); // يرمي AuthRequiredException
    const res = await request('/community/posts', { method: 'POST', headers, body: json(params) });
    await ensureSuccess(res, 'فشل نشر المشاركة');
    return true;
  },

  // حذف منشور — للإدارة فقط (الصلاحية تُتحقق على الباك اند)
  // ملاحظة: هذا المسار افتراضي، لم يكن موجودًا في ApiService الأصلي — أضِفه على الباك اند إذا لم يكن متوفرًا بعد
  async deleteCommunityPost(postId: string): Promise<boolean> {
    const headers = await requiredAuthHeaders();
    const res = await request(`/community/posts/${postId}`, { method: 'DELETE', headers });
    await ensureSuccess(res, 'فشل حذف المشاركة');
    return true;
  },

  // ================= المساعد الذكي — يتطلب تسجيل دخول =================

  async sendMessageToAI(message: string, history: { role: string; content: string }[]): Promise<string> {
    const headers = await requiredAuthHeaders();
    const res = await request('/ai/chat', { method: 'POST', headers, body: json({ message, history }) });
    if (res.status === 200) return ((await res.json()).data?.response ?? '') as string;
    throw new Error(`فشل الاتصال بالمساعد الذكي: ${res.status}`);
  },

  // ================= مواعيد الفحص =================

  async getScreenings(userId: string): Promise<Screening[]> {
    const res = await request(`/screenings/${userId}`, { headers: await requiredAuthHeaders() });
    if (res.status === 200) return ((await res.json()).data ?? []) as Screening[];
    throw new Error(`فشل جلب المواعيد: ${res.status}`);
  },

  async addScreening(params: {
    screeningType: string;
    scheduledDate: string;
    notes?: string;
  }): Promise<boolean> {
    const headers = await requiredAuthHeaders();
    const res = await request('/screenings', {
      method: 'POST',
      headers,
      body: json({
        screeningType: params.screeningType,
        scheduledDate: params.scheduledDate,
        notes: params.notes ?? '',
      }),
    });
    await ensureSuccess(res, 'فشل حفظ الموعد');
    return true;
  },

  async updateScreening(id: string, updates: {
    screeningType?: string;
    scheduledDate?: string;
    notes?: string;
  }): Promise<boolean> {
    const headers = await requiredAuthHeaders();
    const res = await request(`/screenings/${id}`, {
      method: 'PUT',
      headers,
      body: json(updates),
    });
    await ensureSuccess(res, 'فشل تحديث الموعد');
    return true;
  },

  async deleteScreening(id: string): Promise<boolean> {
    const headers = await requiredAuthHeaders();
    const res = await request(`/screenings/${id}`, { method: 'DELETE', headers });
    await ensureSuccess(res, 'فشل حذف الموعد');
    return true;
  },

  // ================= الفعاليات =================

  async getEvents(): Promise<EventItem[]> {
    const res = await request('/events', { headers: await optionalAuthHeaders() });
    if (res.status === 200) return ((await res.json()).data ?? []) as EventItem[];
    throw new Error(`فشل جلب الفعاليات: ${res.status}`);
  },

  // تسجيل حضور — يتطلب تسجيل دخول
  async registerForEvent(eventId: string): Promise<boolean> {
    const headers = await requiredAuthHeaders();
    const res = await request(`/events/${eventId}/register`, { method: 'POST', headers });
    await ensureSuccess(res, 'فشل التسجيل في الفعالية');
    return true;
  },

  async getMyEventRegistrations(): Promise<string[]> {
    const headers = await requiredAuthHeaders();
    const res = await request('/events/registrations/me', { headers });
    await ensureSuccess(res, 'فشل جلب تسجيلات الفعاليات');
    return ((await res.json()).data ?? []) as string[];
  },

  async cancelEventRegistration(eventId: string): Promise<boolean> {
    const headers = await requiredAuthHeaders();
    const res = await request(`/events/${eventId}/register`, { method: 'DELETE', headers });
    await ensureSuccess(res, 'فشل إلغاء التسجيل');
    return true;
  },

  // الإدارة — admin فقط (الصلاحية تُتحقق على الباك اند)
  async createEvent(params: {
    title: string;
    description?: string;
    location?: string;
    eventDate: string;
  }): Promise<boolean> {
    const headers = await requiredAuthHeaders();
    const res = await request('/events', { method: 'POST', headers, body: json(params) });
    await ensureSuccess(res, 'فشل إنشاء الفعالية');
    return true;
  },

  async updateEvent(eventId: string, updates: Record<string, unknown>): Promise<boolean> {
    const headers = await requiredAuthHeaders();
    const res = await request(`/events/${eventId}`, { method: 'PUT', headers, body: json(updates) });
    await ensureSuccess(res, 'فشل تحديث الفعالية');
    return true;
  },

  async deleteEvent(eventId: string): Promise<boolean> {
    const headers = await requiredAuthHeaders();
    const res = await request(`/events/${eventId}`, { method: 'DELETE', headers });
    await ensureSuccess(res, 'فشل حذف الفعالية');
    return true;
  },

  // ================= مراكز الكشف =================

  async getScreeningCenters(): Promise<ScreeningCenter[]> {
    const res = await request('/centers', { headers: await optionalAuthHeaders() });
    if (res.status === 200) return ((await res.json()).data ?? []) as ScreeningCenter[];
    throw new Error(`فشل جلب مراكز الفحص: ${res.status}`);
  },

  async createCenter(params: {
    name: string;
    address: string;
    phone?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    locationUrl?: string;
  }): Promise<boolean> {
    const headers = await requiredAuthHeaders();
    const res = await request('/centers', { method: 'POST', headers, body: json(params) });
    await ensureSuccess(res, 'فشل إنشاء المركز');
    return true;
  },

  async updateCenter(centerId: string, updates: Record<string, unknown>): Promise<boolean> {
    const headers = await requiredAuthHeaders();
    const res = await request(`/centers/${centerId}`, { method: 'PUT', headers, body: json(updates) });
    await ensureSuccess(res, 'فشل تحديث المركز');
    return true;
  },

  async deleteCenter(centerId: string): Promise<boolean> {
    const headers = await requiredAuthHeaders();
    const res = await request(`/centers/${centerId}`, { method: 'DELETE', headers });
    await ensureSuccess(res, 'فشل حذف المركز');
    return true;
  },
};
