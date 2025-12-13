export type Task = { hour: number; title: string };

function toICSDateLocal(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const YYYY = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const DD = pad(d.getDate());
  const HH = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${YYYY}${MM}${DD}T${HH}${mm}${ss}`;
}

function escapeICS(text: string) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function buildICSForDay(date: Date, tasks: Task[]) {
  const nowStamp = toICSDateLocal(new Date());

  const events = tasks
    .filter((t) => t.title.trim().length > 0)
    .map((t, idx) => {
      const start = new Date(date);
      start.setHours(t.hour, 0, 0, 0);

      const end = new Date(date);
      end.setHours(t.hour + 1, 0, 0, 0);

      const uid = `${date.toISOString().slice(0, 10)}-${t.hour}-${idx}@hourly-planner`;

      return [
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${nowStamp}`,
        `DTSTART:${toICSDateLocal(start)}`,
        `DTEND:${toICSDateLocal(end)}`,
        `SUMMARY:${escapeICS(t.title)}`,
        "END:VEVENT",
      ].join("\r\n");
    })
    .join("\r\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Hourly Planner//EN",
    "CALSCALE:GREGORIAN",
    events,
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadICS(filename: string, icsText: string) {
  const blob = new Blob([icsText], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}
