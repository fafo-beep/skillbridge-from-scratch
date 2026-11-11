import type { CourseGuides } from "./types";

// IT160 User Support Fundamentals. Outcomes:
// 1. Diagnose and resolve common user-facing issues methodically
// 2. Manage a ticket queue with clear priorities and records
// 3. Teach users without jargon or condescension

const guides: CourseGuides = {
  "A method you can defend": {
    outcome: "Diagnose and resolve common user-facing issues methodically",
    intro:
      "Anyone who has spent years on a helpdesk has a method, even if it was never written down. This lesson gives it the five names a course uses, reproduce, isolate, fix, verify, document, and shows how to present a fix so an evaluator can follow each step.",
    meaning: [
      "Reproduce means you saw the fault yourself, or had the user show it, before you changed anything. Isolate means you narrowed the cause by changing one thing at a time: a different user on the same machine, the same user on a different machine, a cable, a setting. Fix is the smallest change that removes the cause, not the biggest change that might. Verify means the user confirmed it, not you, ideally after the conditions that caused it have come round again. Document means the ticket says what was wrong, what you did and how you know it worked.",
      "The outcome is met when you can show one fault going through all five steps with your reasoning visible. Guessing and getting lucky does not count, and neither does a reinstall that cleared the symptom without telling you the cause. Evaluators are looking for the moment you could have jumped to a fix and chose to test instead. A fault you narrowed but could not fix, handed on with a record of what you ruled out, beats a quick fix with no record.",
    ],
    evaluatorsLookFor: [
      "A fault described by its symptom, when it happened and who it affected, not by the user's theory of the cause",
      "The steps you took to reproduce it, and what you saw when you did",
      "At least two things you ruled out, with how you ruled each one out",
      "The fix named as a single change, and the reason you picked it over the alternatives",
      "Confirmation from the user or a log that the fault did not come back, and the ticket closed with a cause",
    ],
    evidence: [
      "A ticket record, with personal details removed, showing your notes from first contact to closure",
      "A log extract, screenshot or error text you captured while reproducing the fault",
      "A checklist or step list you built for one type of fault",
      "A knowledge base article or team note you wrote from a fix, with its date",
      "A follow-up message from the user confirming the fix held, or a report showing no repeat ticket",
    ],
    example: {
      narrative:
        "From August 2019 to March 2023 I was the only on-site support technician for a 90-seat accounting firm. In February 2021 three people in the payroll team reported that their shared drive dropped out once or twice a day. The office manager wanted me to replace all three machines, since the budget allowed it. Instead I asked for the exact time of the next drop and got 10:42 a.m. from one user. The switch logs showed a port going down and up at that same minute, on a patch lead that ran under a desk. I swapped the lead, asked the three users to note every drop for a week, and got none in five working days; the week before there had been 9. I wrote up the ticket with the log extract, cause and fix, and added a knowledge base note about checking switch logs before touching workstations. The attached ticket record, switch log extract and knowledge base entry are from that period.",
      why:
        "The symptom is stated with a time, the cheap test is chosen over the expensive guess, and the verification is counted rather than assumed. The records made at the time are named.",
    },
    selfCheck: [
      "Can you describe one fault by its symptom and say how you reproduced it?",
      "Can you name two causes you ruled out and how you ruled them out?",
      "Can you say how you knew the fix held, from the user or from a record?",
      "Do you have the ticket, log or note from that fault with personal details removed?",
    ],
  },

  "Common failure classes": {
    outcome: "Diagnose and resolve common user-facing issues methodically",
    intro:
      "Most support tickets fall into a small number of classes, and knowing them is what lets an experienced technician ask the right first question. This lesson names the classes most desks see and shows how to present your diagnosis as a skill rather than a memory of individual fixes.",
    meaning: [
      "Five classes cover most of a desk's work. Access: the account is locked, the password expired, the person was never added to the group. Connectivity: the device cannot reach the network, the server or the internet, and the first job is to find out which. Configuration: a setting or an update changed something that used to work, and the hardware is fine. Hardware and peripherals: cables, docks, printers, batteries and screens, where swapping the part is the test. Expectation: the system works as designed and the user expected something else, which makes it training or a request, not a fault.",
      "The classes are useful because each has a first question and a first test. An access fault is tested by trying another account; a connectivity fault by trying another device at the same desk; a configuration fault by asking what changed and when. Sorting a new ticket into its class in the first few minutes, then testing that guess, is the outcome's method at speed. Evidence is strongest when you can show a batch of tickets where the class you assigned was right, and one where it was wrong and you moved it.",
    ],
    evaluatorsLookFor: [
      "The classes your desk used, or the ones in your own head, named in your own words",
      "The first question or first test you ran for each class",
      "A case where several tickets turned out to share one cause, and how you spotted it",
      "A ticket you first put in the wrong class, and what told you to move it",
      "Any count showing which classes made up your work over a period",
    ],
    evidence: [
      "An export or summary of tickets you handled with the category or type field filled in",
      "A first-contact checklist, call script or triage sheet you wrote or revised",
      "A known-error record or team note linking many tickets to one cause",
      "A fix script, procedure or step list you wrote for a recurring fault",
      "A message to users or a manager explaining a widespread fault and its cause",
    ],
    example: {
      narrative:
        "From May 2017 to December 2020 I worked on the four-person helpdesk of a logistics company with about 400 office and warehouse users. On a Tuesday in October 2019, 60 tickets came in before lunch about printing failing on the office floor. The facilities manager wanted the printer supplier called out, at around $300 per visit. I checked three tickets myself; all three printers answered a ping and printed a test page from my laptop, so the hardware was fine. Every affected machine had taken an operating system update overnight, which had swapped the printer driver for a generic one. That put the fault in the configuration class, so I wrote a short script to reinstall the correct driver, ran it on 80 machines by 3 p.m., and linked all 60 tickets to one known-error record. We had 4 further tickets the next day, all from laptops that were off overnight. The attached ticket export, known-error record and the message I sent to the floor are from that week.",
      why:
        "The writer tests the hardware before accepting the loudest explanation, names the class the fault belongs to and why, and shows one cause closing many tickets. The 4 tickets the next day are reported rather than left out.",
    },
    selfCheck: [
      "Can you name the classes of fault your desk saw most, in your own words?",
      "Can you state the first test you ran for at least two of those classes?",
      "Can you describe one occasion when many tickets turned out to share a single cause?",
      "Do you have a ticket export, checklist or known-error record from that time?",
    ],
  },

  "Running a queue": {
    outcome: "Manage a ticket queue with clear priorities and records",
    intro:
      "A queue is a list of promises. Running one well means every ticket has a true status, a priority someone could defend, and a note that tells the next person where it stands. This lesson shows how to present queue work, often invisible in a support career, as evidence of managing priorities and records.",
    meaning: [
      "Priority comes from two questions: how many people are affected, and how badly can they work around it. One person who cannot log in outranks ten people whose screensaver is wrong, and a whole site offline outranks both. Most desks write this down as a priority matrix with response and resolution targets for each level. These vary by employer, and an evaluator expects the ones you worked under, not a textbook set. Priority is also allowed to change when the facts change, as long as the change and the reason are recorded.",
      "Hygiene is the rest of it. A title that states the symptom, a status that is true today, a note on every contact, a time stamp on every handover, and a closure that names the cause. The outcome is met when you can show a queue you kept in that condition over a period, the rule you used to order it, and a case where you held the order against pressure. Untouched old tickets are the commonest sign of a queue not being run, and reducing them is strong evidence.",
    ],
    evaluatorsLookFor: [
      "The priority levels and targets your desk used, stated as your employer defined them",
      "A queue report or count showing open tickets by age and priority at two or more dates",
      "A ticket whose priority you raised or lowered, with the reason in the record",
      "A handover note or end-of-shift summary that another person could act on",
      "A closed ticket with a cause recorded, not only a note that it was resolved",
    ],
    evidence: [
      "A queue report or screenshot of the queue view from more than one date",
      "A priority matrix, service level sheet or triage rule you wrote, applied or revised",
      "Handover notes, shift logs or a daily queue summary you sent",
      "An anonymized ticket showing a priority change and the reason recorded",
      "A message to a manager or user explaining why a ticket would wait, and what came first",
    ],
    example: {
      narrative:
        "From January 2020 to June 2022 I ran the ticket queue for a three-person IT team at a secondary school with about 1,100 students and staff. When I took it over there were 140 open tickets, 31 of them older than 30 days, most with no note since they were logged. I wrote a one-page priority sheet with four levels, agreed with the business manager, in which anything affecting an exam room or a whole class counted as the top level. Each Friday I exported the queue by age and sent the count to the team and the business manager. In May 2020 the deputy head asked me to move his laptop battery ahead of a failed classroom projector; I kept the projector first and sent him the sheet with the reason. By the end of the summer term, open tickets over 30 days were down to 4, and every open ticket had a note from the previous week. The attached priority sheet, Friday queue reports and a sample of handover notes are from that period.",
      why:
        "The starting condition is counted, the rule is written down and agreed with someone outside the team, the order is held against a senior request, and the result is measured the same way as the start.",
    },
    selfCheck: [
      "Can you state the priority levels you worked under and what put a ticket in the top one?",
      "Can you show the size and age of your queue at two different dates?",
      "Can you describe one time you held or changed a ticket's priority and recorded why?",
      "Do you have a queue report, priority sheet or handover note from that time?",
    ],
  },

  "Writing for users": {
    outcome: "Teach users without jargon or condescension",
    intro:
      "Most support work is explained in writing: a ticket reply, a how-to sheet, a notice before a change. The test is whether a user can follow it alone without feeling stupid. This lesson shows how to present your replies and guides as evidence of teaching without jargon or condescension.",
    meaning: [
      "Writing for users starts with what the person sees, not what the system does. Click the blue Sign in button at the top right, not authenticate via the portal. One action per line, in the order it happens, with what the screen should show after each, and what to do if it does not. The user's own words are kept even when the technical term differs. Jargon is any word the reader would have to ask about. Condescension is any sentence that explains what they did not ask, or tells them it is simple.",
      "The outcome is met when you can show writing that users followed successfully and that respected them. Successful means a reply that ended a ticket without a second question, or a guide that cut repeat tickets on its topic. Respectful means the same tone for the finance director and the cleaner, the user's mistake named without blame, and a two-line answer left at two lines. Evaluators also look for a case where you held a plain word against someone who wanted the technical one.",
    ],
    evaluatorsLookFor: [
      "A reply to a user that gives steps in the order they happen, with what to expect after each",
      "A guide or notice in words the users already used, with technical terms left out or defined once",
      "A sign users followed it: a closed ticket with no follow-up question, a thank you, fewer repeat tickets",
      "The same plain tone used with senior and junior users",
      "A template or guide you changed because users got stuck, and what you changed",
    ],
    evidence: [
      "Ticket replies you wrote, with names removed, including one to a frustrated user",
      "A how-to sheet, quick guide or screenshot walkthrough you wrote for users",
      "A notice you sent before a change, with the questions it was written to prevent",
      "Ticket counts on one topic before and after a guide or template went out",
      "User feedback: a survey comment, a message, or a review line about your explanations",
    ],
    example: {
      narrative:
        "From September 2021 to August 2024 I was on the two-person service desk of a housing association with about 250 staff, many of them working from vans. In March 2023 we rolled out a second sign-in step by phone app to the first 130 users with the supplier's own guide, and had 70 tickets in the first week, mostly from people stuck at the same screen. I rewrote it as one page: eight steps, one screenshot each, using the exact words on the screen, with a line under each saying what to do if it looked different. The security lead wanted the guide to use the supplier's term for the code. I kept it as the six-digit number from the app on your phone, and we agreed to put his term in brackets once. The second wave of 120 users in May 2023 produced 11 tickets, and 8 of those were from people with no smartphone, a policy question. The attached two guides, the weekly ticket counts for the rollout and three sample replies are from that period.",
      why:
        "The two guides can be compared, the result is a count on the same topic, and the writer kept a plain word by negotiating rather than ignoring the objection. The remaining tickets are explained rather than hidden.",
    },
    selfCheck: [
      "Can you show one reply or guide you wrote that a user followed without a second question?",
      "Can you point to a technical term you replaced with the user's own word, and why?",
      "Can you give a count of tickets on one topic before and after something you wrote?",
      "Do you have the replies, guide or notice with names removed?",
    ],
  },
};

export default guides;
