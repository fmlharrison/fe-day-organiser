import type { AgendaItem, EventRecord } from "@/lib/events";

export const julyEvent: EventRecord = {
  id: "event-july-2026",
  slug: "july-2026",
  title: "FE DAY",
  tagline: "INSERT COIN — SHARE WHAT YOU KNOW",
  eventDate: "2026-07-01",
  startTime: "10:00",
  endTime: "16:00",
  location: "LION'S SHARE + REMOTE",
};

// Mirrors the July agenda seeded by migration 0006. Open slots keep their old
// text ids so assignment fixtures stay readable.
export const julyAgenda: AgendaItem[] = [
  { id: "doors-open", startTime: "10:00", endTime: "10:30", kind: "fixed", title: "Doors Open + Ice Breaker", description: "Grab a coffee (or a tea, we don't judge) and a quick warm-up game to get the chapter talking." },
  { id: "state-of-fe", startTime: "10:30", endTime: "11:00", kind: "fixed", title: "The State of the FE at Cleo", description: "Joe Angus opens the day with a 30-minute look at where front-end at Cleo is right now — and where it's heading." },
  { id: "morning-break", startTime: "11:00", endTime: "11:20", kind: "break", title: "Morning Break", description: "A 20-minute stretch — legs, mug, repeat." },
  { id: "talk-1", startTime: "11:20", endTime: "11:50", kind: "talk", title: "Talk Slot #1", description: "30 minutes to go deep on something you love." },
  { id: "talk-2", startTime: "11:50", endTime: "12:20", kind: "talk", title: "Talk Slot #2", description: "30 minutes — your stage." },
  { id: "lunch", startTime: "12:30", endTime: "14:00", kind: "break", title: "Lunch", description: "Fuel up. 90 minutes to eat, chat and recharge." },
  { id: "talk-3", startTime: "14:00", endTime: "14:30", kind: "talk", title: "Talk Slot #3", description: "30 minutes to teach us something new." },
  { id: "lightning-1", startTime: "14:30", endTime: "14:40", kind: "lightning", title: "Lightning Slot #1", description: "A post-lunch energy spark." },
  { id: "lightning-2", startTime: "14:40", endTime: "14:50", kind: "lightning", title: "Lightning Slot #2", description: "Another quick hit to keep the pace up." },
  { id: "afternoon-break", startTime: "14:50", endTime: "15:05", kind: "break", title: "Afternoon Break", description: "A 15-minute refuel before the lightning run." },
  { id: "lightning-3", startTime: "15:05", endTime: "15:15", kind: "lightning", title: "Lightning Slot #3", description: "Back-to-back sparks." },
  { id: "lightning-4", startTime: "15:15", endTime: "15:25", kind: "lightning", title: "Lightning Slot #4", description: "Still going." },
  { id: "lightning-5", startTime: "15:25", endTime: "15:35", kind: "lightning", title: "Lightning Slot #5", description: "Last spark of the day." },
  { id: "closing", startTime: "15:35", endTime: "15:45", kind: "fixed", title: "Closing", description: "Wrap-up and thank-yous." },
  { id: "social", startTime: "18:00", endTime: "20:00", kind: "fixed", title: "Social — Bowling @ All Star Lanes", description: "Brick Lane, 6–8pm. A game of bowling, 2 drinks each and some nibbles — head over after closing wraps up." },
];
