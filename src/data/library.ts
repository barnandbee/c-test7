// Built-in activity library. Edit this file to change what's in the app.
// See "Editing the library" in README.md for the field reference.
//
// Rules of thumb:
// - Never change an existing `id`. Past sessions point at it.
// - `legs: true` marks a leg-heavy session (warns if it's the day before a spice run).
// - `neck: true` marks a neck and shoulders mobility session.
// - `paces` lists which of your training paces to show on a run card, worked out
//   from your 5km time: race | tempo | long | easy | recovery. Put the main effort
//   first; it also shows on the closed card. On spice runs, easy is shown as the
//   warm-up and cool-down pace.

import type { Activity } from "../types";

export const LIBRARY: Activity[] = [
  // ---------- Easy runs ----------
  {
    id: "easy-5k", category: "easy", title: "Easy 5km", short: "Easy 5km", duration: "30–35 min", paces: ["easy"],
    description: "Your normal 5km at a pace where you could talk in full sentences.",
    steps: [
      "Start slower than feels natural for the first kilometre.",
      "Settle into conversation pace and hold it.",
      "Finish feeling you could keep going.",
    ],
  },
  {
    id: "easy-strides", category: "easy", title: "Easy 5km + strides", short: "5km + strides", duration: "35–40 min", paces: ["easy"],
    description: "An easy run with a few short, quick bursts at the end. They help with form and speed without being tiring.",
    steps: [
      "Run your easy 5km.",
      "Walk for a couple of minutes to settle your breathing.",
      "Do 4 strides of 20–30 seconds each: start at a jog, build smoothly to around 80–90% effort, then ease off. Think smooth and quick, not a sprint.",
      "Walk back between each one until you’ve recovered.",
      "Over a few weeks, build up to 6–8 strides.",
    ],
    links: [
      { label: "Runner’s World Australia: how to run strides", url: "https://runnersworldonline.com.au/how-to-run-strides/" },
      { label: "The Running Channel: how to run strides (with video)", url: "https://therunningchannel.com/how-to-run-strides/" },
    ],
  },
  {
    id: "easy-recovery", category: "easy", title: "Recovery run", short: "Recovery 3–4km", duration: "20–25 min", paces: ["recovery"],
    description: "3–4km, slower than your normal easy pace. Use this after a long run, a hard session or a poor night’s sleep.",
    steps: [
      "Keep it genuinely slow, even if it feels too easy.",
      "Stop at 3–4km, even if you feel good.",
    ],
  },

  // ---------- Spice runs ----------
  {
    id: "spice-runrecover", category: "spice", title: "Run / recover intervals", short: "Intervals", duration: "35–45 min", paces: ["tempo", "race", "easy"],
    description: "A simple time-based session from Canadian Running, with three levels. Start with the middle one.",
    steps: [
      "Warm up with 5–10 min of easy running.",
      "Level 1: 1 min steady running, then 2 min brisk walk.",
      "Level 2: 2 min at a moderate push, then 1 min easy jog.",
      "Level 3: 3 min hard, then 1 min easy jog.",
      "Repeat your chosen level for 20–30 minutes.",
      "Cool down with 5–10 min of easy running.",
    ],
    links: [{ label: "Canadian Running: go-to workouts for every runner", url: "https://runningmagazine.ca/?p=108521" }],
  },
  {
    id: "spice-km", category: "spice", title: "Kilometre repeats", short: "Km repeats", duration: "40–45 min", paces: ["race", "easy"],
    description: "A classic 5km-focused session. It’s hard but short.",
    steps: [
      "Warm up with 10 min of easy running.",
      "Run 1km at a hard but controlled effort (8 out of 10).",
      "Recover with a 2 min walk or jog.",
      "Do 3 repeats in total, building to 4 when that feels manageable.",
      "Cool down with 10 min of easy running.",
    ],
    links: [{ label: "Outside Run: getting started with interval running", url: "https://run.outsideonline.com/training/getting-started-with-interval-running/?scope=anon" }],
  },
  {
    id: "spice-fartlek", category: "spice", title: "Landmark fartlek", short: "Fartlek", duration: "30–35 min", paces: ["race", "easy"],
    description: "“Speed play”: unstructured faster bursts using things you pass. There’s no timing or pacing to worry about.",
    steps: [
      "Run steadily for 5–10 min to warm up.",
      "Pick a landmark ahead (a lamp post, tree or corner) and run faster until you reach it.",
      "Jog easily until your breathing settles, then pick the next landmark.",
      "Keep this going for around 20 minutes.",
      "Cool down with 5 min of easy running.",
    ],
    links: [
      { label: "Canadian Running: the 4 best workouts for beginner runners", url: "https://runningmagazine.ca/?p=83558" },
      { label: "RunnersConnect: fartlek workouts to try", url: "https://runnersconnect.net/fartlek-training-workouts/" },
    ],
  },
  {
    id: "spice-hills-intro", category: "spice", title: "Intro hills (Jeff Galloway)", short: "Intro hills", duration: "30 min", paces: ["easy"],
    description: "A gentle first hill session from Runner’s World that builds up very gradually.",
    steps: [
      "Jog for 10 min, then walk for 2 min.",
      "On a gentle incline, run up at an easy pace for 5 seconds, then walk back down.",
      "Repeat for 7 seconds, then 10 seconds, walking down after each one.",
      "If you feel strong, repeat the whole sequence.",
      "Next time, do the sequence twice and finish with a 30-second climb.",
      "Over time, lengthen the climbs and add hills, working towards 10 climbs. One hill session every 1–2 weeks is plenty.",
    ],
    links: [
      { label: "Runner’s World SA: the up side of hills", url: "https://www.runnersworld.co.za/training/the-up-side-of-hills/" },
      { label: "Canadian Running: hill workout for beginners", url: "https://runningmagazine.ca/?p=83017" },
    ],
  },
  {
    id: "spice-hills-30", category: "spice", title: "Hill repeats: 6–8 × 30 sec", short: "Hill repeats", duration: "35 min", paces: ["easy"],
    description: "The step up from intro hills. Use a moderately steep hill rather than the steepest one around.",
    steps: [
      "Warm up with 10 min of easy running.",
      "Run uphill hard for 30 seconds (around 90% effort), with short steps, driving your arms and looking ahead rather than at your feet.",
      "Jog back down very slowly so your breathing has settled before the next one.",
      "Do 6 repeats, building to 8.",
      "Cool down with 10 min of easy running.",
    ],
    links: [{ label: "Runkeeper: hill repeats workout", url: "https://runkeeper.com/cms/?p=8279" }],
  },
  {
    id: "spice-tempo-5s", category: "spice", title: "Tempo intervals: 4 × 5 min", short: "Tempo 4×5", duration: "40 min", paces: ["tempo", "easy"],
    description: "Tempo running broken into chunks. This is the best first tempo session.",
    steps: [
      "Run easy for 5 min.",
      "Run 5 min at tempo effort (“comfortably hard”: you could only speak a few words), then jog easily for 2 min.",
      "Do this 4 times in total.",
      "Finish with 5 min of easy running.",
      "Next step: 2 × 10 min of tempo with a 3 min jog between.",
    ],
    links: [{ label: "Runner’s World SA: four fast tempo workouts", url: "https://www.runnersworld.co.za/training/four-fast-tempo-workouts-for-runners/" }],
  },
  {
    id: "spice-tempo-classic", category: "spice", title: "Classic tempo run", short: "Tempo 20", duration: "40–50 min", paces: ["tempo", "easy"],
    description: "One continuous block at tempo effort. If 20 minutes feels like too much at first, start with 15.",
    steps: [
      "Run easy for 10 min.",
      "Run 20 min at tempo effort, building to 30 min over time.",
      "Finish with 10 min of easy running.",
      "On a hilly route, keep the effort steady and let your pace drop on the climbs.",
    ],
    links: [{ label: "Runner’s World SA: four fast tempo workouts", url: "https://www.runnersworld.co.za/training/four-fast-tempo-workouts-for-runners/" }],
  },
  {
    id: "spice-long", category: "spice", title: "Long run: 10–12km", short: "Long run", duration: "65–80 min", paces: ["long"],
    description: "Your one or two monthly long runs. In a long-run week, it counts as your spice run.",
    steps: [
      "Run slower than your 5km pace (Runner’s World suggests 45 sec to 1:30 per km slower). You should still be able to chat.",
      "Build distance by only 1–2km at a time.",
      "Walk breaks are fine and still count.",
      "Eat a small bland snack an hour or two before. Take water if it’s warm.",
      "Run a loop route so you can cut it short if your gut or legs complain.",
      "Keep your other runs that week easy.",
    ],
    links: [{ label: "Runner’s World Australia: 8 ways to extend your long run", url: "https://runnersworldonline.com.au/8-ways-to-extend-long-run-endurance/" }],
  },

  // ---------- Strength ----------
  {
    id: "str-a", category: "strength", title: "Session A: legs + core", short: "Strength A", duration: "20–25 min", legs: true,
    description: "Warm up for 3 min first (march on the spot, arm circles, 10 squats, leg swings). Do 2 rounds in weeks 1–2, then 3 rounds. Rest 30–60 sec between exercises. Avoid doing this session the day before a spice run.",
    exercises: [
      { name: "Goblet squat", dose: "10 reps · 5kg", howTo: "Feet slightly wider than hips, toes turned out a little. Hold the weight vertically against your chest. Push your hips back and bend your knees as if sitting into a low chair, keeping your chest up and heels down. Push through your whole foot to stand. Easier: squat down onto a real chair." },
      { name: "Reverse lunge", dose: "8 per leg · bodyweight, then 2kg each hand", howTo: "Step one foot well back and lower your back knee towards the floor until both knees are at roughly 90°. Push through your front heel to step back up. Do all reps on one side, then switch. Hold a wall for balance if needed." },
      { name: "Glute bridge", dose: "12 reps · 5kg on hips", howTo: "Lie on your back with knees bent and feet flat near your bottom. Rest the weight on your hip bones. Squeeze your bum to lift your hips into a straight line from knees to shoulders. Pause for 2 sec, then lower slowly. You should feel it in your bum, not your lower back." },
      { name: "Calf raises", dose: "15 reps · bodyweight", howTo: "Stand on the edge of a step with your heels hanging off, holding a rail. Rise as high as you can onto your toes, then lower slowly until your heels dip below the step. Harder: do them on one leg." },
      { name: "Dead bug", dose: "6 per side", howTo: "Lie on your back with arms pointing at the ceiling and knees bent at 90° above your hips. Press your lower back into the floor. Slowly lower your opposite arm and leg towards the floor without touching it, then return and switch sides. Breathe out as you extend." },
    ],
  },
  {
    id: "str-b", category: "strength", title: "Session B: upper body + back of legs", short: "Strength B", duration: "20–25 min",
    description: "Same format as Session A: warm up for 3 min, do 2–3 rounds, and rest 30–60 sec between exercises.",
    exercises: [
      { name: "Romanian deadlift", dose: "10 reps · 5kg", howTo: "Stand tall with knees slightly soft, holding the weight in front of your thighs. Keeping your back flat, push your hips backwards and let the weight slide down to about knee height. You’ll feel a stretch in your hamstrings. Squeeze your bum to stand up. It’s a hinge, so your knees barely bend." },
      { name: "Bent-over row", dose: "10 per arm · 5kg", howTo: "Place one hand and the same-side knee on a bed or bench, keeping your back flat. Let the weight hang from your other hand. Pull it up towards your hip, leading with your elbow, squeeze, then lower slowly. Don’t twist your body." },
      { name: "Incline push-up", dose: "8–10 reps", howTo: "Hands on a kitchen counter or table edge, a bit wider than your shoulders. Walk your feet back until your body is straight. Lower your chest towards the edge with your elbows about 45° from your body, then push back up. A higher surface is easier and a lower one is harder." },
      { name: "Shoulder press", dose: "10 reps · 2kg each hand", howTo: "Stand tall with the weights at shoulder height, palms facing forward. Press them straight overhead, then lower slowly. Squeeze your bum and stomach so your lower back doesn’t arch. Start with 1kg if 2kg is too much." },
      { name: "Side plank", dose: "20–30 sec per side", howTo: "Lie on your side propped on your forearm, elbow under your shoulder, knees bent and stacked. Lift your hips into a straight line and hold while breathing normally. Harder: straighten your legs." },
    ],
  },
  {
    id: "str-c", category: "strength", title: "Session C: quick full body", short: "Strength C", duration: "15 min",
    description: "For busy weeks. Repeat the circuit 3 times, resting 1 min between rounds.",
    exercises: [
      { name: "Goblet squat", dose: "10 reps · 5kg", howTo: "As in Session A." },
      { name: "Bent-over row", dose: "10 per arm · 5kg", howTo: "As in Session B." },
      { name: "Glute bridge", dose: "10 reps", howTo: "As in Session A." },
      { name: "Plank", dose: "30 sec", howTo: "On your forearms and toes with your body in a straight line from head to heels. Drop to your knees if needed." },
    ],
  },
  {
    id: "str-vid-runners", category: "strength", title: "Follow-along: beginner strength for runners", short: "Runners strength video", duration: "~15 min",
    description: "A bodyweight routine aimed at runners. It’s a good option on days when you’d rather follow a video than read steps.",
    links: [{ label: "YouTube: Beginner Strength Workout for Runners", url: "https://www.youtube.com/watch?v=JATx1R9lCMo" }],
  },
  {
    id: "str-vid-rc", category: "strength", title: "Follow-along: 12-min strength for runners (The Running Channel)", short: "Running Channel 12-min", duration: "12 min",
    description: "A short runner-focused session. It’s quick enough to do straight after an easy run.",
    links: [{ label: "The Running Channel: Strength Training For Runners", url: "https://therunningchannel.com/videos/strength-training-for-runners/" }],
  },
  {
    id: "str-vid-mh15", category: "strength", title: "Follow-along: Men’s Health UK 15-min dumbbell", short: "Men’s Health 15-min", duration: "15 min",
    description: "Five full-body dumbbell moves. The trainer will use heavier weights than you have, so use your 5kg and slow each rep down rather than chasing his numbers.",
    links: [{ label: "YouTube: Men’s Health UK 15-minute full-body dumbbell workout", url: "https://www.youtube.com/watch?v=CN5ZRPEgis4" }],
  },
  {
    id: "str-vid-mh30", category: "strength", title: "Follow-along: Men’s Health UK 30-min lower body + core", short: "Men’s Health 30-min legs", duration: "30 min", legs: true,
    description: "A step up. Save this for after 4–6 weeks of Sessions A and B, and not before a spice run.",
    links: [{ label: "YouTube: Men’s Health UK 30-minute lower body and core", url: "https://www.youtube.com/watch?v=FhppgCtoLsM" }],
  },
  {
    id: "str-vid-beg30", category: "strength", title: "Follow-along: 30-min beginner dumbbell (with modifications)", short: "Beginner dumbbell 30", duration: "30 min",
    description: "A full-body session that shows easier versions throughout. It’s useful for checking your form.",
    links: [{ label: "YouTube: 30 Minute Full Body Beginner Dumbbell Workout", url: "https://www.youtube.com/watch?v=GY1JhB9BEkk" }],
  },

  // ---------- Mobility ----------
  {
    id: "mob-ywt-neck", category: "mobility", title: "Yoga With Tim: neck, shoulders + upper back", short: "Neck & shoulders", duration: "10 min", neck: true,
    description: "Your weekly neck session. It works well in the evening. Add a jaw release at the end: let your jaw hang slightly open, gently massage in front of your ears, and do a few slow yawns.",
    links: [{ label: "YouTube: Yoga for Neck, Shoulders, Upper Back (10 min)", url: "https://www.youtube.com/watch?v=NuYhGYG30ZI" }],
  },
  {
    id: "mob-ywt-runners", category: "mobility", title: "Yoga With Tim: yoga for runners", short: "YWT runners", duration: "30 min",
    description: "A stretch sequence built for runners. Good after a long run or on a rest day.",
    links: [{ label: "YouTube: Yoga For Runners (30 min)", url: "https://www.youtube.com/watch?v=iOfcOQ1Slmo" }],
  },
  {
    id: "mob-ywt-legs", category: "mobility", title: "Yoga With Tim: tight legs, hips + hamstrings", short: "YWT hips & hams", duration: "25 min",
    description: "Warms up then stretches the hips, hamstrings and quads. Good after hills or Session B.",
    links: [{ label: "YouTube: Total Body Yoga Stretch for Tight Legs (25 min)", url: "https://www.youtube.com/watch?v=zCNUuIB70BA" }],
  },
  {
    id: "mob-ywt-hatha", category: "mobility", title: "Yoga With Tim: morning hatha flow", short: "YWT hatha flow", duration: "25 min",
    description: "A full-body opening and strengthening class. Good on a non-running morning.",
    links: [{ label: "YouTube: Morning Yoga Hatha Flow (25 min)", url: "https://www.youtube.com/watch?v=Dnlxcp7jiP0" }],
  },
  {
    id: "mob-jr-10", category: "mobility", title: "Julia Reppel: 10-min daily mobility", short: "Julia 10-min", duration: "10 min",
    description: "Covers spine, shoulders, hips, ankles and wrists with no equipment. A quick fallback on busy days, or a warm-up before strength.",
    links: [{ label: "YouTube: 10 Min. Daily Mobility", url: "https://www.youtube.com/watch?v=wC_oQsUdbmc" }],
  },
  {
    id: "mob-jr-25", category: "mobility", title: "Julia Reppel: 25-min full body mobility", short: "Julia 25-min", duration: "25 min",
    description: "A longer circuit-style routine designed by Julia, focused on the spine, shoulders, hips and ankles.",
    links: [{ label: "YouTube: 25 Min. Full Body Mobility Workout x Julia Reppel", url: "https://www.youtube.com/watch?v=qti526J8YXY" }],
  },

  // ---------- Bonus ----------
  {
    id: "bonus-walk", category: "bonus", title: "Long walk", short: "Long walk", duration: "45+ min",
    description: "Easy movement that also helps with digestion and stress. A good weekend option.",
  },
  {
    id: "bonus-swim", category: "bonus", title: "Swim", short: "Swim", duration: "20–40 min",
    description: "Low-impact cardio that’s kind to your legs after a long run.",
  },
  {
    id: "bonus-yoga", category: "bonus", title: "Extra short yoga or stretch", short: "Extra stretch", duration: "10–15 min",
    description: "Any short video from the mobility list, done on top of your two.",
  },
];

/** Follow-along channels shown under the library. */
export const MORE_VIDEOS: { label: string; url: string }[] = [
  { label: "mobility by Julia Reppel", url: "https://www.youtube.com/@julia.reppel/videos" },
  { label: "Yoga With Tim", url: "https://www.youtube.com/channel/UCciuZl2ydLCvN5txlLW0rIg" },
];
