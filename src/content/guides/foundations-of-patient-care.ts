import type { CourseGuides } from "./types";

// HC101 Foundations of Patient Care. Outcomes:
// 1. Apply safety and hygiene standards in care settings
// 2. Support patients with dignity across routine care
// 3. Communicate observations to clinical staff accurately

const guides: CourseGuides = {
  "Infection control in practice": {
    outcome: "Apply safety and hygiene standards in care settings",
    intro:
      "Hand hygiene, gloves and aprons, cleaning between patients and knowing when to change precautions are the part of care work that nobody sees done well and everybody notices done badly. This lesson shows how to describe the infection control you already practice and how to prove it to an evaluator who was not there.",
    meaning: [
      "Infection control in a care setting is a set of habits done the same way every time. You clean your hands before touching a patient, before a clean task, after contact with body fluids, after touching the patient and after touching their surroundings. You put on gloves and an apron for the task that needs them and take them off before you leave the bedside. You clean shared equipment between patients and you know what to do with linen, sharps and waste. None of this is impressive on its own. It becomes evidence when you can show you did it consistently and noticed when others did not.",
      "The outcome is met when you can describe the standards your workplace used, show that you followed them, and show that you acted when something was wrong: a missing dispenser, a colleague cutting a corner, a patient with symptoms that should have changed the precautions. Which precautions apply to which infection, and how audits are run, vary by country and employer. Describe the version you worked under and say where it came from, rather than reciting a general one.",
    ],
    evaluatorsLookFor: [
      "The hygiene and protective equipment standards your workplace used, named as it named them",
      "A routine you followed on every shift, described step by step, not a general claim of being careful",
      "A time you changed what you did for one patient because of a risk you noticed",
      "A time you raised a gap: stock, a colleague's practice, a cleaning schedule not kept",
      "Any audit, spot check or training record from the period, and what it found",
    ],
    evidence: [
      "A hand hygiene audit, spot check or observation result with your name or role on it",
      "Training certificates or competency sign-offs for infection control, protective equipment or sharps",
      "A cleaning schedule, equipment log or bay checklist you completed",
      "An email, message or incident form in which you reported a hygiene gap",
      "A reference or supervision note that mentions your standards at the bedside",
    ],
    example: {
      narrative:
        "From May 2021 to August 2023 I was a care assistant on a 28-bed medical ward in a district hospital. In the winter of 2022 we had four patients with diarrhea in one bay within two days. I was the one who noticed that the second and third patients had both been using the same commode because the bay's spare had gone to another ward. I told the nurse in charge before the end of my shift, took the commode out for decontamination and asked for a second one. The nurse closed the bay to admissions and sent stool samples, and three of the four came back with the same gut infection. At the ward meeting I was asked why I had not said something sooner, and I said honestly that I had assumed the commode was being cleaned between uses. After that I signed the commode cleaning line on the bay checklist myself every shift. The attached hand hygiene audit from that quarter, the bay checklist and my supervision note are from that period.",
      why:
        "The standard is shown by what was done, the gap is specific and the writer owns the delay rather than hiding it. The action is proportionate: tell the nurse, remove the equipment, change the record.",
    },
    selfCheck: [
      "Can you describe the hand hygiene and protective equipment routine your workplace used, in order?",
      "Can you name a time you changed precautions for one patient and why?",
      "Can you point to a hygiene gap you reported and what happened next?",
      "Do you have an audit, checklist or training record from that period?",
    ],
  },

  "Reporting and escalation": {
    outcome: "Communicate observations to clinical staff accurately",
    intro:
      "A care assistant sees more of a patient in a shift than any clinician does. The value of that is lost unless what you saw reaches the right person in time and in a form they can act on. This lesson covers reporting observations, escalating concerns and completing incident forms, and how to prove all three.",
    meaning: [
      "Reporting is routine: the observations you took, the food and fluid taken, a change in mood or skin, written where the next person will read it and said aloud at handover. Escalation is the step beyond routine: deciding that something cannot wait for the next round and telling a nurse or doctor now. Both need the same discipline. Say what you saw, with the time and the number where there is one, separate from what you think it means. A patient who has not passed urine since 6 a.m. is a report. A patient who seems a bit off is a feeling.",
      "Incident reporting is the formal end of this. A fall, a medication error you noticed, a near miss, a complaint from a relative: each needs a form completed on the day, in the system your employer uses, with facts rather than blame. The outcome is met when you can show observations recorded accurately, one concern you escalated with the reason and the result, and one incident you reported through the proper route. The threshold for escalation and the form used vary by employer. Know yours and name it.",
    ],
    evaluatorsLookFor: [
      "Observations stated as facts with times and numbers, kept separate from your interpretation",
      "A concern you escalated outside the normal routine: who you told, when, and what they did",
      "An incident or near miss you reported on the day, through the route your employer required",
      "What happened after: a change to the care plan, a review, or a reason nothing changed",
      "Where you were unsure whether to escalate, how you decided",
    ],
    evidence: [
      "Observation charts, fluid balance or care records you completed, with patient details removed",
      "An incident or near miss form you submitted, anonymized, or its reference number",
      "A handover sheet or note in your writing from a shift where you raised a concern",
      "A message, email or supervision note showing a nurse or manager acknowledging what you reported",
      "Training records for observations, early warning scores or incident reporting",
    ],
    example: {
      narrative:
        "From February 2020 to October 2022 I worked nights as a care assistant in a 40-bed nursing home. On a night in July 2021 I did the 2 a.m. check on a resident who usually slept through and found her awake, restless and breathing faster than I was used to seeing. I counted 26 breaths a minute, which was 10 above her usual, and her skin felt hot. The nurse on duty was in the middle of a medication round and said she would come when she finished. I decided it could not wait, said so, and gave her the number. She came, took a full set of observations and called the out-of-hours doctor, who sent the resident to hospital with a chest infection. The next day the manager asked me to write it up as a near miss because of the delay, and I did, that morning. The attached observation chart, the anonymized near miss form and the handover sheet are from that night.",
      why:
        "The observation has a number and a baseline, the escalation is a decision made against resistance, and the form was done the same day. The writer reports the nurse's delay as fact, not as a complaint.",
    },
    selfCheck: [
      "Can you state one observation you reported with the time and the number?",
      "Can you name a concern you escalated, who you told and what they did?",
      "Can you describe one incident or near miss you reported through the proper route, and when?",
      "Do you have a chart, form or handover note from that period with personal details removed?",
    ],
  },

  "Assisting with daily living": {
    outcome: "Support patients with dignity across routine care",
    intro:
      "Washing, dressing, eating, moving and using the toilet are where dignity is kept or lost, several times a day. This lesson shows how to describe personal care and mobility support in a way that proves you did it safely and with respect, not just that you did it.",
    meaning: [
      "Daily living support is skilled work that looks ordinary. The skill is in the choices: asking before touching, closing the door, letting a patient do the part they can do even when it is slower, choosing the right aid for the move and checking the care plan rather than guessing. Moving and handling is the safety edge of this. Using a hoist or slide sheet the way you were trained, with the number of staff the plan says, protects the patient and your own back. The rules on who may do which moves and what training is required vary by country and employer.",
      "The outcome asks you to show dignity across routine care, which means an evaluator wants more than a list of tasks. They want to see how you handled the moments where dignity was at risk: a patient who refused a wash, a shared bay with no curtain, a relative who wanted to help in a way the patient did not. They want to see that you followed the care plan and that you noticed when it no longer fitted the person in front of you and said so.",
    ],
    evaluatorsLookFor: [
      "The daily tasks you supported, named plainly, with the aids or equipment you used",
      "How you gained consent and kept privacy during personal care, described as what you did",
      "A time a patient refused or resisted care and how you responded",
      "A moving and handling decision checked against the care plan or risk assessment",
      "Something you changed, or asked to have changed, in a care plan because of what you saw",
    ],
    evidence: [
      "Moving and handling, personal care or dementia training certificates with dates",
      "A care plan, repositioning chart or food and fluid record you completed, anonymized",
      "A supervision note or observed practice assessment covering personal care",
      "Feedback from a patient or family, or a complaint and its outcome, with names removed",
      "A reference from a nurse or manager that speaks to how you treated patients",
    ],
    example: {
      narrative:
        "Between March 2019 and December 2022 I was a care assistant in a 36-bed residential home for older people. One resident, a former teacher with dementia, had started refusing her morning wash three or four times a week, and two colleagues had taken to doing it anyway with the door open to finish the round on time. In April 2021 I asked the senior carer if I could try something different for a month. I moved her wash to after breakfast, closed the door, laid out her own things in the order she had always used them and asked her to do her face and hands herself while I did the rest. She refused twice in the first week and five times across the whole month, down from about 14 in the month before. The senior carer updated her care plan to the later time, and one colleague said it put the whole round behind. The attached care plan revision, my daily notes from those weeks and the supervision record are from that period.",
      why:
        "The dignity problem is named as a practice, not a person, and the change is tested for a fixed period with a count before and after. The cost to the round is reported rather than left out.",
    },
    selfCheck: [
      "Can you describe one personal care task step by step, including how you asked and kept privacy?",
      "Can you name a time a patient refused care and what you did?",
      "Can you point to a moving and handling choice you made and the plan it followed?",
      "Do you have a training certificate, care record or supervision note from that time?",
    ],
  },

  "Communicating with patients and families": {
    outcome: "Support patients with dignity across routine care",
    intro:
      "Most of what a patient and their family know about a day in care comes from a care assistant. What you say, what you do not say, and how you listen shapes whether a person feels treated as an adult. This lesson shows how to describe and prove it.",
    meaning: [
      "Good communication at the bedside is plain. You introduce yourself and say what you are about to do. You speak to the patient, not over them to a relative or colleague. You adjust for hearing, language, confusion and pain, and you wait for the answer. With families you stay inside your role: you can say what you saw and what the patient has done today, and you refer questions about diagnosis and medication to the nurse or doctor. What you may share, and with whom, depends on consent and on your employer's confidentiality policy, so describe the rule you worked to.",
      "The outcome is met when you can show communication that kept a person's dignity under some pressure: a frightened patient, an angry relative, a request for information you were not able to give, a patient who could not speak for themselves. Evaluators look for the words you used, the choice you made about what to say, and what the patient or family did next. They also look for the moment you passed something on, because listening to a family is often how a concern first gets reported.",
    ],
    evaluatorsLookFor: [
      "A specific conversation described: who, where, and roughly the words used",
      "How you adjusted for a barrier such as hearing, language, confusion or distress",
      "A request you redirected because it was outside your role, and how you said it",
      "A family concern you listened to and passed on, and what the family was told afterward",
      "A patient who could not speak for themselves and how you found out what they wanted",
    ],
    evidence: [
      "Thank-you cards, feedback forms or survey comments that name you or your role",
      "A complaint you were involved in and its outcome, anonymized",
      "Communication, dementia or safeguarding training certificates with dates",
      "A daily note or handover record where you wrote down a family's concern and who you told",
      "A supervision or appraisal note that comments on how you speak with patients and relatives",
    ],
    example: {
      narrative:
        "From September 2020 to June 2023 I worked as a healthcare assistant on a 24-bed stroke rehabilitation unit. In November 2021 a patient's daughter arrived at visiting time, found her father had been moved to a side room, and told me loudly in the corridor that nobody ever explained anything. I asked her to come into the day room, sat down with her, and told her what I could: that he had been moved that morning, that he had eaten half his lunch, and that he had walked 12 meters with the physiotherapist. I said the reason for the move was a question for the nurse and that I would ask the nurse to come now, which I did. The nurse explained it in about five minutes. The daughter came back the next day, apologized, and asked me to keep telling her the walking distance. I recorded both conversations in his notes. The attached daily notes, the ward feedback card she left in December and my appraisal from March 2022 are from that period.",
      why:
        "The conflict is real and in public, and the writer moves it somewhere private, shares only what is within the role and fetches the right person for the rest. Both conversations are recorded and the family's later response is on file.",
    },
    selfCheck: [
      "Can you describe one conversation with a patient or relative in roughly the words you used?",
      "Can you name a question you redirected because it was outside your role, and how?",
      "Can you point to a family concern you passed on and what came of it?",
      "Do you have feedback, a record or a training certificate from that period?",
    ],
  },
};

export default guides;
