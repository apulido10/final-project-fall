"use client";

import { useEffect, useMemo, useState } from "react";
import { buildICSForDay, downloadICS, type Task } from "@/utils/ics";

const START_HOUR = 8; 
const END_HOUR = 20; // 8pm

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

function hourLabel(h: number) {
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:00 ${ampm}`;
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(() => ymd(new Date()));
  const [tasks, setTasks] = useState<Record<number, string>>({});

  const today = useMemo(() => new Date(), []);
  const selected = useMemo(() => new Date(selectedDate + "T00:00:00"), [selectedDate]);

  const storageKey = useMemo(() => `hourly-planner:${selectedDate}`, [selectedDate]);

  // Load tasks for the day
  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      setTasks({});
      return;
    }
    try {
      setTasks(JSON.parse(raw));
    } catch {
      setTasks({});
    }
  }, [storageKey]);

  // Save tasks for the day
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
  }, [tasks, storageKey]);

  const nowHour = new Date().getHours();
  const isToday = ymd(new Date()) === selectedDate;

const hourRows: number[] = [];
  for (let h = START_HOUR; h <= END_HOUR; h++) hourRows.push(h);

  function updateTask(hour: number, value: string) {
    setTasks((prev) => ({ ...prev, [hour]: value }));
  }

  function clearDay() {
    setTasks({});
  }

  function exportToICS() {
    const list: Task[] = hourRows.map((hour) => ({
      hour,
      title: tasks[hour] ?? "",
    }));

    const text = buildICSForDay(selected, list);
    downloadICS(`MySchedule-${selectedDate}.ics`, text);
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-3xl p-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Hourly Planner</h1>
            <p className="text-sm text-gray-600">
              Plan your day by the hour, then export to Apple/Google Calendar.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            <label className="text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-[170px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm"
            />
          </div>
        </header>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={exportToICS}
            className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
          >
            Export .ics (Apple/Google)
          </button>

          <button
            onClick={clearDay}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-gray-100"
          >
            Clear day
          </button>

          <div className="ml-auto text-sm text-gray-600 flex items-center">
            {isToday ? (
              <span>
                Current hour: <span className="font-semibold">{hourLabel(nowHour)}</span>
              </span>
            ) : (
              <span>Not today (no live highlight)</span>
            )}
          </div>
        </div>

        <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-[110px_1fr] border-b border-gray-200 bg-gray-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
            <div>Time</div>
            <div>Task</div>
          </div>

          <div className="divide-y divide-gray-200">
            {hourRows.map((hour) => {
              const highlight = isToday && hour === nowHour;
              return (
                <div
                  key={hour}
                  className={`grid grid-cols-[110px_1fr] items-center gap-3 px-4 py-3 ${
                    highlight ? "bg-yellow-50" : ""
                  }`}
                >
                  <div className="text-sm font-medium text-gray-800">{hourLabel(hour)}</div>

                  <input
                    value={tasks[hour] ?? ""}
                    onChange={(e) => updateTask(hour, e.target.value)}
                    placeholder="Type a task…"
                    className={`w-full rounded-xl border px-3 py-2 text-sm shadow-sm outline-none transition ${
                      highlight
                        ? "border-yellow-300 focus:ring-2 focus:ring-yellow-200"
                        : "border-gray-300 focus:ring-2 focus:ring-gray-200"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </section>

 
      </div>
    </main>
  );
}
