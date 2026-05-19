export const SECTOR_ICON_OPTIONS = [
  { value: '💻', labelAr: 'تقنية', labelEn: 'Technology' },
  { value: '⚡', labelAr: 'طاقة', labelEn: 'Energy' },
  { value: '🏗️', labelAr: 'بناء وعقار', labelEn: 'Construction' },
  { value: '🏨', labelAr: 'سياحة وضيافة', labelEn: 'Tourism' },
  { value: '🏥', labelAr: 'صحة', labelEn: 'Healthcare' },
  { value: '🎓', labelAr: 'تعليم', labelEn: 'Education' },
  { value: '🚢', labelAr: 'لوجستيات', labelEn: 'Logistics' },
  { value: '🎮', labelAr: 'ألعاب', labelEn: 'Gaming' },
  { value: '💼', labelAr: 'أعمال عام', labelEn: 'Business' },
  { value: '🌱', labelAr: 'استدامة', labelEn: 'Sustainability' },
  { value: '🏭', labelAr: 'صناعة', labelEn: 'Industry' },
  { value: '✈️', labelAr: 'طيران', labelEn: 'Aviation' },
  { value: '🛒', labelAr: 'تجزئة', labelEn: 'Retail' },
  { value: '🎬', labelAr: 'ترفيه', labelEn: 'Entertainment' },
  { value: '🌾', labelAr: 'زراعة', labelEn: 'Agriculture' },
  { value: '🔋', labelAr: 'بطاريات وتخزين', labelEn: 'Energy storage' },
  { value: '📊', labelAr: 'مالية', labelEn: 'Finance' },
  { value: '🤖', labelAr: 'ذكاء اصطناعي', labelEn: 'AI' },
  { value: '🏛️', labelAr: 'حكومي', labelEn: 'Government' },
  { value: '🕌', labelAr: 'ثقافة ودين', labelEn: 'Culture' },
  { value: '💎', labelAr: 'فخامة', labelEn: 'Luxury' },
  { value: '🔬', labelAr: 'بحث', labelEn: 'Research' },
];

export function sectorIconOptions(currentIcon) {
  const icon = currentIcon?.trim();
  if (!icon || SECTOR_ICON_OPTIONS.some((o) => o.value === icon)) {
    return SECTOR_ICON_OPTIONS;
  }
  return [{ value: icon, labelAr: icon, labelEn: icon }, ...SECTOR_ICON_OPTIONS];
}
