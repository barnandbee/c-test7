// Rosettes: awards shown on the Stats page. Edit freely; ids must stay unique.
// `value` reads from the facts worked out in src/lib/rosettes.ts.

import type { RosetteDef } from "../lib/rosettes";

export const ROSETTES: RosetteDef[] = [
  // Getting going
  { id: "first-steps", name: "First Steps", description: "Finish your first session.", mark: "1st", colour: "award", goal: 1, value: (f) => f.done.length },
  { id: "full-house", name: "Full House", description: "Meet every weekly target in one week.", mark: "★", colour: "award", goal: 1, value: (f) => f.weeksMet },

  // Consistency
  { id: "hat-trick", unit: "weeks", name: "Hat-trick", description: "Meet every target three weeks in a row.", mark: "3", colour: "award", goal: 3, value: (f) => f.longestStreak },
  { id: "consistency-cup", unit: "weeks", name: "Consistency Cup", description: "Meet every target four weeks in a row.", mark: "4", colour: "award", goal: 4, value: (f) => f.longestStreak },
  { id: "season-ticket", unit: "weeks", name: "Season Ticket", description: "Meet every target twelve weeks in a row.", mark: "12", colour: "award", goal: 12, value: (f) => f.longestStreak },

  // Volume
  { id: "fifty-up", name: "Fifty Up", description: "Finish 50 sessions.", mark: "50", colour: "award", goal: 50, value: (f) => f.done.length },
  { id: "centurion", name: "Centurion", description: "Finish 100 sessions.", mark: "100", colour: "award", goal: 100, value: (f) => f.done.length },
  { id: "explorer", name: "Explorer", description: "Try 10 different activities.", mark: "10", colour: "bonus", goal: 10, value: (f) => f.distinctActivities },

  // Running
  { id: "half-century", unit: "km", name: "Half Century", description: "Log 50 km of running.", mark: "50k", colour: "easy", goal: 50, value: (f) => f.totalKm },
  { id: "hundred-club", unit: "km", name: "Hundred Club", description: "Log 100 km of running.", mark: "100k", colour: "easy", goal: 100, value: (f) => f.totalKm },
  { id: "long-haul", unit: "km", name: "Long Haul", description: "Log 500 km of running.", mark: "500k", colour: "easy", goal: 500, value: (f) => f.totalKm },
  { id: "double-figures", unit: "km", name: "Double Figures", description: "Run 10 km or more in one go.", mark: "10k", colour: "easy", goal: 10, value: (f) => f.longestRunKm },
  { id: "spice-rack", name: "Spice Rack", description: "Finish 10 spice runs.", mark: "10", colour: "spice", goal: 10, value: (f) => f.byCategory.spice },
  { id: "hill-climber", name: "Hill Climber", description: "Finish 5 hill sessions.", mark: "▲", colour: "spice", goal: 5, value: (f) => f.titled("hill") },
  { id: "tempo-tamer", name: "Tempo Tamer", description: "Finish 5 tempo sessions.", mark: "T", colour: "spice", goal: 5, value: (f) => f.titled("tempo") },

  // Strength
  { id: "iron-will", name: "Iron Will", description: "Finish 10 strength sessions.", mark: "10", colour: "strength", goal: 10, value: (f) => f.byCategory.strength },
  { id: "progressive-overload", name: "Progressive Overload", description: "Log a heavier weight on an exercise than when you started it.", mark: "kg", colour: "strength", goal: 1, value: (f) => f.exercisesProgressed },

  // Mobility
  { id: "limber-up", name: "Limber Up", description: "Finish 10 mobility sessions.", mark: "10", colour: "mobility", goal: 10, value: (f) => f.byCategory.mobility },
  { id: "neck-and-neck", name: "Neck and Neck", description: "Finish 8 neck and shoulders sessions.", mark: "8", colour: "mobility", goal: 8, value: (f) => f.neckSessions },

  // Extras
  { id: "bonus-points", name: "Bonus Points", description: "Finish 10 bonus sessions.", mark: "+10", colour: "bonus", goal: 10, value: (f) => f.byCategory.bonus },
];
