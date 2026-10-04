import { QueryClient } from '@tanstack/react-query';

// staleTime: مدة اعتبار البيانات "طازجة" فلا تُعاد من السيرفر عند التنقل بينها.
// gcTime: مدة الاحتفاظ بالبيانات في الذاكرة بعد عدم استخدامها قبل حذفها.
// بعد انتهاء staleTime، تُعرض البيانات المخزّنة فورًا (بلا شاشة تحميل) ثم تُحدَّث في الخلفية.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 دقائق
      gcTime: 30 * 60 * 1000, // 30 دقيقة
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// مفاتيح الاستعلامات في مكان واحد لتفادي الأخطاء الإملائية عند إبطال الصلاحية (invalidate)
export const queryKeys = {
  screenings: (userId: string) => ['screenings', userId] as const,
  centers: ['centers'] as const,
  events: ['events'] as const,
  eventRegistrations: (userId: string) => ['event-registrations', userId] as const,
  communityPosts: ['community-posts'] as const,
};
