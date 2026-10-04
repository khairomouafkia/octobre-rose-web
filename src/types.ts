// أنواع البيانات المشتركة بين الشاشات (تقابل الـ Map<String, dynamic> في Dart)

export interface Screening {
  id: string;
  scheduled_date?: string;
  scheduledDate?: string;
  screening_type?: 'screening' | 'mammogram' | 'ultrasound' | 'clinical_exam' | 'mri';
  screeningType?: 'screening' | 'mammogram' | 'ultrasound' | 'clinical_exam' | 'mri';
  is_completed?: boolean;
  isCompleted?: boolean;
  notes?: string;
}

export interface ScreeningCenter {
  id: string | number;
  name: string;
  address: string;
  phone?: string;
  city?: string;
  latitude: string | number;
  longitude: string | number;
  locationUrl?: string;
}

export interface EventItem {
  id: string | number;
  title: string;
  description?: string;
  location?: string;
  event_date?: string;
  eventDate?: string;
}

export interface CommunityPost {
  id: string | number;
  author_name?: string;
  is_anonymous: boolean;
  content: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
