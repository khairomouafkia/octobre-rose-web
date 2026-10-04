// يقابل DateFormat('yyyy-MM-dd hh:mm a') من حزمة intl في Dart
export function formatDateTime(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const hours24 = date.getHours();
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const ampm = hours24 < 12 ? 'AM' : 'PM';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}  ${pad(
    hours12,
  )}:${pad(date.getMinutes())} ${ampm}`;
}

// يقابل DateFormat('d MMMM yyyy - hh:mm a', 'ar') المستخدم في شاشة الفعاليات
export function formatArabicLongDate(date: Date): string {
  const datePart = new Intl.DateTimeFormat('ar', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
  const timePart = new Intl.DateTimeFormat('ar', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
  return `${datePart} - ${timePart}`;
}
