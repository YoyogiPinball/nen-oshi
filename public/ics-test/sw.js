// .ics の確認用: add-*.ics へのアクセスを横取りし、ブラウザ内で作った text/calendar を返す
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

function ics(title, start, end) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//nen-oshi//ics-test//JA', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${crypto.randomUUID()}@nen-oshi`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=Asia/Tokyo:${start}`,
    `DTEND;TZID=Asia/Tokyo:${end}`,
    `SUMMARY:${title}`,
    'DESCRIPTION:念推しの確認用の予定です',
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:締切まであと3日', 'TRIGGER:-P3D', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR', '',
  ].join('\r\n');
}

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  const m = url.pathname.match(/\/add-(plain|inline|attach)\.ics$/);
  if (!m) return;
  const p = url.searchParams;
  const body = ics(p.get('t') || '念推しテスト', p.get('s') || '20261103T230000', p.get('e') || '20261103T235900');
  const headers = { 'Content-Type': 'text/calendar; charset=utf-8' };
  if (m[1] === 'inline') headers['Content-Disposition'] = 'inline; filename="nen-oshi.ics"';
  if (m[1] === 'attach') headers['Content-Disposition'] = 'attachment; filename="nen-oshi.ics"';
  e.respondWith(new Response(body, { headers }));
});
