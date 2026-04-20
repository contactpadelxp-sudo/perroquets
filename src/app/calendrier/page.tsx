'use client';

import { useState, useEffect } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  getMonth,
  differenceInDays,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, X, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { getActiveEventsForMonth } from '@/lib/queries';
import type { BioCalendarEvent } from '@/types/database';
import { cn } from '@/lib/utils';

export default function CalendrierPage() {
  const { species } = useAuth();
  const [month, setMonth] = useState(new Date());
  const [events, setEvents] = useState<BioCalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<BioCalendarEvent | null>(null);

  useEffect(() => {
    supabase
      .from('bio_calendar_events')
      .select('*')
      .eq('species', species)
      .order('recurrence_month_start')
      .then(({ data }) => setEvents(data ?? []));
  }, [species]);

  const currentMonth = getMonth(month) + 1; // 1-12
  const activeEvents = getActiveEventsForMonth(events, currentMonth);

  const days = eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month),
  });

  const startDay = getDay(startOfMonth(month));
  const paddingDays = startDay === 0 ? 6 : startDay - 1;

  // Get events active for a specific day (by month)
  const getEventsForDay = (day: Date): BioCalendarEvent[] => {
    const m = getMonth(day) + 1;
    return getActiveEventsForMonth(events, m);
  };

  // Next bio event
  const getNextEvent = (): { event: BioCalendarEvent; daysUntil: number } | null => {
    const now = new Date();
    const currentM = getMonth(now) + 1;

    let closest: { event: BioCalendarEvent; daysUntil: number } | null = null;

    events.forEach((event) => {
      const start = event.recurrence_month_start;
      if (start === null) return;

      let targetMonth = start;
      let targetYear = now.getFullYear();

      if (start <= currentM) {
        targetYear += 1;
      }

      const targetDate = new Date(targetYear, targetMonth - 1, 1);
      const daysUntil = differenceInDays(targetDate, now);

      if (!closest || daysUntil < closest.daysUntil) {
        closest = { event, daysUntil };
      }
    });

    return closest;
  };

  const nextEvent = getNextEvent();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">📅 Calendrier biologique</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 card-static p-4 space-y-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setMonth(subMonths(month, 1))} className="p-2 rounded-xl hover:bg-white/5">
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-lg font-semibold capitalize">
              {format(month, 'MMMM yyyy', { locale: fr })}
            </h2>
            <button onClick={() => setMonth(addMonths(month, 1))} className="p-2 rounded-xl hover:bg-white/5">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Active events band */}
          {activeEvents.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-105"
                  style={{
                    backgroundColor: (event.color ?? '#A855F7') + '20',
                    color: event.color ?? '#A855F7',
                    border: `1px solid ${(event.color ?? '#A855F7')}40`,
                  }}
                >
                  {event.icon} {event.title}
                </button>
              ))}
            </div>
          )}

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
              <div key={day} className="text-center text-xs text-muted py-2 font-medium">
                {day}
              </div>
            ))}
            {Array.from({ length: paddingDays }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {days.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'aspect-square rounded-xl p-1 flex flex-col items-center gap-0.5 transition-all relative',
                    isToday && 'ring-2 ring-accent-violet',
                    dayEvents.length > 0 ? 'bg-white/[0.03]' : ''
                  )}
                >
                  <span className={cn('text-xs font-medium', isToday && 'text-accent-violet')}>
                    {format(day, 'd')}
                  </span>
                  <div className="flex gap-0.5 flex-wrap justify-center">
                    {dayEvents.slice(0, 3).map((event, i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: event.color ?? '#A855F7' }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 pt-2 border-t border-border">
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: event.color ?? '#71717A' }}
                />
                {event.title}
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Current month events */}
          <div className="card-static p-4 space-y-3">
            <h3 className="font-semibold text-sm">Ce mois-ci</h3>
            {activeEvents.length === 0 ? (
              <p className="text-xs text-muted">Aucun événement biologique ce mois-ci.</p>
            ) : (
              activeEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="w-full text-left p-3 rounded-xl transition-all hover:bg-white/5 space-y-1"
                  style={{ borderLeft: `3px solid ${event.color ?? '#A855F7'}` }}
                >
                  <p className="text-sm font-medium">{event.title}</p>
                  {event.dietary_advice && (
                    <p className="text-xs text-muted line-clamp-2">{event.dietary_advice}</p>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Next event countdown */}
          {nextEvent && (
            <div className="card-static p-4 space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Clock size={14} className="text-accent-violet" />
                Prochain événement
              </h3>
              <p className="text-sm">{nextEvent.event.title}</p>
              <p className="text-2xl font-bold text-accent-violet">
                {nextEvent.daysUntil}
                <span className="text-sm font-normal text-muted ml-1">jours</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Event detail modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedEvent(null)} />
          <div className="relative w-full max-w-lg max-h-[85dvh] bg-card rounded-3xl border border-border overflow-hidden overflow-y-auto">
            <div
              className="p-4 flex items-center justify-between"
              style={{ backgroundColor: (selectedEvent.color ?? '#A855F7') + '10' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedEvent.icon}</span>
                <h3 className="font-semibold">{selectedEvent.title}</h3>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="p-1.5 rounded-xl hover:bg-white/10">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-muted uppercase mb-1">Période</h4>
                <p className="text-sm">
                  Mois {selectedEvent.recurrence_month_start} → Mois {selectedEvent.recurrence_month_end}
                </p>
              </div>

              {selectedEvent.description && (
                <div>
                  <h4 className="text-xs font-semibold text-muted uppercase mb-1">Description</h4>
                  <p className="text-sm leading-relaxed">{selectedEvent.description}</p>
                </div>
              )}

              {selectedEvent.dietary_advice && (
                <div className="bg-accent-green/5 border border-accent-green/20 rounded-2xl p-3">
                  <h4 className="text-xs font-semibold text-accent-green uppercase mb-1">
                    🥗 Conseils alimentaires
                  </h4>
                  <p className="text-sm leading-relaxed">{selectedEvent.dietary_advice}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
