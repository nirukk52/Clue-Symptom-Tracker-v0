{
"agent_opening_message": "Hey, I'm Clue -- your symptom tracking companion. I'm here to help you log how you're feeling, spot patterns, and make sense of your health data. No pressure, go at your own pace. How are you doing today?",
"test_scenarios": [
{
"persona_id": "overwhelmed_spoonie_multi_condition",
"test_user_email": "overwhelmed_spoonie_multi_condition@gmail.com",
"persona_name": "Overwhelmed Spoonie",
"profile": {
"conditions": ["fibromyalgia", "POTS", "migraine"],
"traits": ["brain fog", "fatigue", "multiple providers", "forgets details"],
"goal": "Track bad days without spending much energy"
},
"user_first_reply": "Honestly pretty rough. Fatigue is bad, my head hurts, and I feel kind of dizzy again.",
"expected_agent_sequence": [
{
"speaker": "assistant",
"message": "That sounds like a lot. Let's keep it light. Which feels most important right now: fatigue, headache, or dizziness?"
},
{
"speaker": "user",
"message": "Fatigue"
},
{
"speaker": "assistant",
"message": "Got it. How bad is your fatigue right now on a 0-10 scale?"
},
{
"speaker": "user",
"message": "8"
},
{
"speaker": "assistant",
"message": "Do you want to keep this as a normal day or mark it as a flare?"
},
{
"speaker": "user",
"message": "Flare"
},
{
"speaker": "assistant",
"message": "Logged. Anything likely behind it today: poor sleep, stress, meds, food, or activity?"
}
],
"what_this_tests": [
"Multi-symptom triage",
"Priority selection",
"Low-energy flow",
"Flare capture"
],
"expected_state": {
"graph": {
"symptom": [
{ "label": "Fatigue" },
{ "label": "Headache" },
{ "label": "Dizziness", "aliases": ["Dizzy"] }
]
},
"logs": {
"symptoms": [
{ "label": "Fatigue", "severity": 8 }
]
},
"timeline": {
"symptoms": [
{ "label": "Fatigue", "severity": 8 }
]
},
"insights": {
"requireNextQuestion": true,
"forbidAnsweredLabels": [
{ "label": "Fatigue" }
]
}
}
},
{
"persona_id": "single_symptom_headache_entry",
"test_user_email": "single_symptom_headache_entry@gmail.com",
"persona_name": "Minimal-input user",
"profile": {
"conditions": [],
"traits": ["gives one-word answers", "may be undiagnosed", "low effort"],
"goal": "Start from almost no context"
},
"user_first_reply": "headache",
"expected_agent_sequence": [
{
"speaker": "assistant",
"message": "Got it. Is this a regular headache for you, or does it feel more like a migraine or flare?"
},
{
"speaker": "user",
"message": "Maybe migraine"
},
{
"speaker": "assistant",
"message": "How bad is it right now on a 0-10 scale?"
},
{
"speaker": "user",
"message": "7"
},
{
"speaker": "assistant",
"message": "Did it start just now, earlier today, or yesterday?"
},
{
"speaker": "user",
"message": "Earlier today"
},
{
"speaker": "assistant",
"message": "Anything that might be connected: poor sleep, stress, food, dehydration, or weather?"
}
],
"what_this_tests": [
"Handling vague first input",
"Condition clarification",
"Fast symptom structuring",
"Minimal friction"
],
"expected_state": {
"graph": {
"symptom": [
{ "label": "Headache" }
],
"optionalCondition": [
{ "label": "Migraine" }
]
},
"logs": {
"symptoms": [
{ "label": "Headache", "severity": 7 }
]
},
"timeline": {
"symptoms": [
{ "label": "Headache", "severity": 7 }
]
},
"insights": {
"requireNextQuestion": true,
"forbidAnsweredLabels": [
{ "label": "Headache" }
]
}
}
},
{
"persona_id": "ibs_food_detective",
"test_user_email": "ibs_food_detective@gmail.com",
"persona_name": "IBS Food Detective",
"profile": {
"conditions": ["IBS"],
"traits": ["frustrated with food tracking", "inconsistent triggers"],
"goal": "Figure out what makes gut symptoms worse"
},
"user_first_reply": "My stomach has been a mess all day. Cramping, bloating, and I have no idea if it's food or stress.",
"expected_agent_sequence": [
{
"speaker": "assistant",
"message": "Let's focus on the gut symptoms first. Which feels worst right now: cramping, bloating, nausea, or something else?"
},
{
"speaker": "user",
"message": "Cramping"
},
{
"speaker": "assistant",
"message": "How strong is the cramping right now on a 0-10 scale?"
},
{
"speaker": "user",
"message": "6"
},
{
"speaker": "assistant",
"message": "Want to log likely drivers too? You can pick any: meal, stress, caffeine, dairy, gluten, or period/hormones."
},
{
"speaker": "user",
"message": "Meal and stress"
},
{
"speaker": "assistant",
"message": "Saved. I can help you watch how meals and stress line up with cramping over the next few days."
}
],
"what_this_tests": [
"Outcome-first symptom capture",
"Driver chips",
"Pattern-question setup",
"IBS-specific flow"
],
"expected_state": {
"graph": {
"symptom": [
{ "label": "Cramping" },
{ "label": "Bloating" }
],
"factor": [
{ "label": "Meal" },
{ "label": "Stress" }
]
},
"logs": {
"symptoms": [
{ "label": "Cramping", "severity": 6 }
]
},
"timeline": {
"symptoms": [
{ "label": "Cramping", "severity": 6 }
]
},
"insights": {
"requireNextQuestion": true,
"forbidAnsweredLabels": [
{ "label": "Cramping" },
{ "label": "Meal" },
{ "label": "Stress" }
]
}
}
},
{
"persona_id": "sleep_deprived_tracker",
"test_user_email": "sleep_deprived_tracker@gmail.com",
"persona_name": "Sleep-Deprived Tracker",
"profile": {
"conditions": ["insomnia"],
"traits": ["groggy", "low morning energy", "wants correlations"],
"goal": "See how sleep affects fatigue and mood"
},
"user_first_reply": "Exhausted. Slept maybe 4 hours and I already feel off.",
"expected_agent_sequence": [
{
"speaker": "assistant",
"message": "I'm with you. Which feels most affected right now: energy, mood, pain, or focus?"
},
{
"speaker": "user",
"message": "Energy"
},
{
"speaker": "assistant",
"message": "How bad is your low energy right now on a 0-10 scale?"
},
{
"speaker": "user",
"message": "9"
},
{
"speaker": "assistant",
"message": "Do you want to quickly log sleep too? Poor, okay, or good?"
},
{
"speaker": "user",
"message": "Poor"
},
{
"speaker": "assistant",
"message": "Saved. After a few days, I can help you spot how poor sleep lines up with your energy crashes."
}
],
"what_this_tests": [
"Sleep-to-outcome framing",
"Low-effort daily check-in",
"Impact-question setup"
],
"expected_state": {
"graph": {
"symptom": [
{ "label": "Fatigue", "aliases": ["Low energy", "Energy", "Exhaustion"] }
],
"factor": [
{ "label": "Sleep", "aliases": ["Poor sleep"] }
]
},
"logs": {
"symptoms": [
{ "label": "Fatigue", "aliases": ["Low energy", "Energy", "Exhaustion"], "severity": 9 }
]
},
"timeline": {
"symptoms": [
{ "label": "Fatigue", "aliases": ["Low energy", "Energy", "Exhaustion"], "severity": 9 }
]
},
"insights": {
"requireNextQuestion": true,
"forbidAnsweredLabels": [
{ "label": "Fatigue", "aliases": ["Low energy", "Energy", "Exhaustion"] },
{ "label": "Sleep", "aliases": ["Poor sleep"] }
]
}
}
},
{
"persona_id": "hormonal_balancer",
"test_user_email": "hormonal_balancer@gmail.com",
"persona_name": "Hormonal Balancer",
"profile": {
"conditions": ["PCOS", "possible endometriosis"],
"traits": ["pain swings", "cycle-related symptoms", "wants doctor-ready records"],
"goal": "Track patterns around cycle and pain"
},
"user_first_reply": "Pelvic pain is back and my mood is all over the place. I think it might be cycle related again.",
"expected_agent_sequence": [
{
"speaker": "assistant",
"message": "Thanks for telling me. Which should we focus on first right now: pelvic pain or mood?"
},
{
"speaker": "user",
"message": "Pelvic pain"
},
{
"speaker": "assistant",
"message": "How intense is the pain right now on a 0-10 scale?"
},
{
"speaker": "user",
"message": "7"
},
{
"speaker": "assistant",
"message": "Do you want to note possible drivers too? Cycle, stress, sleep, food, or activity?"
},
{
"speaker": "user",
"message": "Cycle and stress"
},
{
"speaker": "assistant",
"message": "Logged. I can help you build a clearer pattern around cycle-related pain over time."
}
],
"what_this_tests": [
"Hormonal trigger capture",
"Pain-first flow",
"Doctor-summary friendly structure"
],
"expected_state": {
"graph": {
"symptom": [
{ "label": "Pelvic pain" }
],
"factor": [
{ "label": "Cycle" },
{ "label": "Stress" }
]
},
"logs": {
"symptoms": [
{ "label": "Pelvic pain", "severity": 7 }
]
},
"timeline": {
"symptoms": [
{ "label": "Pelvic pain", "severity": 7 }
]
},
"insights": {
"requireNextQuestion": true,
"forbidAnsweredLabels": [
{ "label": "Pelvic pain" },
{ "label": "Cycle" },
{ "label": "Stress" }
]
}
}
},
{
"persona_id": "fibro_fog_fighter",
"test_user_email": "fibro_fog_fighter@gmail.com",
"persona_name": "Fibro Fog Fighter",
"profile": {
"conditions": ["fibromyalgia"],
"traits": ["pain + fatigue", "brain fog", "cannot handle many questions"],
"goal": "One-tap tracking on flare days"
},
"user_first_reply": "Everything hurts. Bad fibro day.",
"expected_agent_sequence": [
{
"speaker": "assistant",
"message": "I'm sorry you're dealing with that. We can keep this to one-tap answers. Do you want to mark this as a flare?"
},
{
"speaker": "user",
"message": "Yes"
},
{
"speaker": "assistant",
"message": "Done. What's the worst part right now: pain, fatigue, brain fog, or sleep?"
},
{
"speaker": "user",
"message": "Pain"
},
{
"speaker": "assistant",
"message": "Pain level right now, 0-10?"
},
{
"speaker": "user",
"message": "8"
},
{
"speaker": "assistant",
"message": "Saved. We can fill in more later if you want."
}
],
"what_this_tests": [
"Flare-mode trigger from natural language",
"Ultra-low-friction mode",
"Respecting exhaustion"
],
"expected_state": {
"graph": {
"symptom": [
{ "label": "Pain" }
],
"optionalCondition": [
{ "label": "Fibromyalgia" }
]
},
"logs": {
"symptoms": [
{ "label": "Pain", "severity": 8 }
]
},
"timeline": {
"symptoms": [
{ "label": "Pain", "severity": 8 }
]
},
"insights": {
"requireNextQuestion": true,
"forbidAnsweredLabels": [
{ "label": "Pain" }
]
}
}
},
{
"persona_id": "doctor_advocate",
"test_user_email": "doctor_advocate@gmail.com",
"persona_name": "Needs doctor-ready proof",
"profile": {
"conditions": ["chronic pain", "migraine"],
"traits": ["feels dismissed", "wants concise records", "appointment-driven"],
"goal": "Capture data in a format doctors might actually use"
},
"user_first_reply": "I have a doctor appointment next week and I need help tracking what's been going on.",
"expected_agent_sequence": [
{
"speaker": "assistant",
"message": "Absolutely. Let's make this useful for that visit. What symptom do you most want documented first: pain, headache, fatigue, or something else?"
},
{
"speaker": "user",
"message": "Headache"
},
{
"speaker": "assistant",
"message": "How bad is it right now on a 0-10 scale?"
},
{
"speaker": "user",
"message": "6"
},
{
"speaker": "assistant",
"message": "When did this current headache start: just now, earlier today, yesterday, or longer ago?"
},
{
"speaker": "user",
"message": "Earlier today"
},
{
"speaker": "assistant",
"message": "Great, I've started a clean record for your appointment. I can keep capturing headache timing, severity, and likely triggers from here."
}
],
"what_this_tests": [
"Appointment-prep entry point",
"Doctor-oriented symptom structure",
"Onset + severity capture"
],
"expected_state": {
"graph": {
"symptom": [
{ "label": "Headache" }
]
},
"logs": {
"symptoms": [
{ "label": "Headache", "severity": 6 }
]
},
"timeline": {
"symptoms": [
{ "label": "Headache", "severity": 6 }
]
},
"insights": {
"requireNextQuestion": true,
"forbidAnsweredLabels": [
{ "label": "Headache" }
]
}
}
}
],
"design_rules_for_the_agent": [
"If the first reply is vague, clarify the symptom category before asking for more detail.",
"If the first reply includes multiple symptoms, ask the user to choose the top priority first.",
"Ask for severity early because it anchors both tracking and flare detection.",
"Offer flare vs normal-day branching by turn 3 or 4 when symptoms sound acute.",
"Limit to one main question per turn for low-energy users.",
"Use likely-driver chips only after the main symptom is captured.",
"If the user sounds exhausted, switch to one-tap mode and defer detail."
],
"recommended_default_follow_up_order": [
"Pick priority symptom or outcome",
"Severity 0-10",
"Normal day or flare",
"When it started",
"Likely drivers",
"Optional detail for doctor-ready summary"
],
"source_basis": [
"Personas adapted from chronic illness tracking personas including the Overwhelmed Spoonie, IBS Food Detective, Sleep-Deprived Tracker, Hormonal Balancer, and Fibro Fog Fighter. ",
"Sequence structure follows Clue's onboarding, quick check-in, flare mode, and first 20 chat prompt logic.  ",
"Low-energy, doctor-trust, and friction-reduction rules are aligned with the agent requirements and symptom-tracking research docs.   "
]
}
