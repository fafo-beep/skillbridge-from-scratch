import type { CourseGuides } from "./types";

// BUS110 Business Communication. Outcomes:
// 1. Write clear, purposeful business documents
// 2. Present to groups with structure and confidence
// 3. Adapt tone and format to audience and medium

const guides: CourseGuides = {
  "Structure before style": {
    outcome: "Write clear, purposeful business documents",
    intro:
      "A document people read is one where the point comes first, the reason second, and the detail last. If you have written a memo that got a decision, a handover a colleague followed, or a report a manager quoted back to you, you have done this. This lesson shows how to present that writing as evidence.",
    meaning: [
      "Structure is the order in which a reader meets the information. At work the reader is busy and wants three things quickly: what this is about, what you want from them, and by when. A document that opens with background and reaches the request in paragraph four gets skimmed or ignored. Putting the request in the first two lines, then the reasons, then the supporting detail, is most of what a college means by purposeful writing.",
      "The outcome is met when you can show documents you wrote for a real purpose, with a reader, a request and a result you can name. A one-page memo that got a budget approved is stronger evidence than a long report nobody acted on. Evaluators also want to see that you chose the length and the sections deliberately, which usually means you can explain what you left out and why.",
    ],
    evaluatorsLookFor: [
      "The purpose of the document stated in its first few lines, not buried after background",
      "A named reader and what you needed them to do or decide",
      "Headings, numbered steps or a summary that match how the reader would use the document",
      "Something the document caused: an approval, a changed procedure, a question answered",
      "Dates and a workplace, so the document can be matched to your account of it",
    ],
    evidence: [
      "A memo, proposal or request you wrote, with the reply or decision it produced",
      "A procedure, handover or instruction sheet that others used, with names removed",
      "A report or summary a manager forwarded or quoted, shown by the forwarding email",
      "An earlier draft alongside the final version, showing how you reordered it",
      "A reference or review that mentions your written work",
    ],
    example: {
      narrative:
        "From August 2021 to December 2023 I was office coordinator at a 40-person civil engineering consultancy. In March 2022 mileage claims were taking the finance assistant about six hours a month to chase, because people sent them in whatever format they liked. I wrote a one-page memo to the operations director asking for a single claim form and a monthly cut-off date. The first line was the request, the second was the cost in hours, and the rest was the proposed form and the date. The director's first reaction was that a form would annoy the engineers, so I added a short section showing the three fields it actually needed and nothing else. He approved it in April, and chasing time was under an hour a month by June. The memo was later reused as the template for other expense changes. The attached memo, the approval email and the finance assistant's time log are from that period.",
      why:
        "The request is in the first line and the cost is a number. The pushback and the revision show the structure was chosen for the reader, and the time saved can be checked against the log.",
    },
    selfCheck: [
      "Can you name a document you wrote where the request or point was in the first few lines?",
      "Can you say who it was for and what you needed from them?",
      "Can you point to something that happened because of it?",
      "Do you have the document, or the reply to it, from that time?",
    ],
  },

  "Editing yourself": {
    outcome: "Adapt tone and format to audience and medium",
    intro:
      "Editing is the second pass, where you take yourself out of the writing and put the reader in. Cutting a report from four pages to one for an owner, rewriting a notice so the night shift reads it, or turning an email chain into a two-line text are all editing for audience and medium. This lesson shows how to prove it.",
    meaning: [
      "A first draft is written for the writer: it follows the order you found things out and uses the words you were thinking in. Editing reverses that. You ask who reads this, where, on what device, with how much time, and you change length, tone and format to fit. The same decision might become a formal letter to a landlord, a six-line email to your manager and a one-line message on the team board. None is more correct; each is correct for its reader.",
      "The outcome is met when you can show the same content shaped differently for different readers or channels, and explain the choices. Evaluators want evidence of the cut as well as the result: a draft and a final, or a long version and a short one. Tone counts too. A complaint response, a safety notice and a thank-you to a supplier call for different registers, and knowing which to use, and when to pick up the phone instead of writing at all, is part of the skill.",
    ],
    evaluatorsLookFor: [
      "Two versions of the same message for different readers or channels, with the differences explained",
      "Cuts you made, with the reason each thing was removed, visible in a draft and a final",
      "A choice of medium you can justify: letter, email, message, notice, or a call instead",
      "Tone matched to the situation, which an evaluator can judge from the document itself",
      "A reader's reaction: a reply, fewer questions, a notice that was followed",
    ],
    evidence: [
      "A draft and the final version of a document you edited, with the changes visible",
      "A long report and the one-page summary you made from it for a different reader",
      "The same announcement as sent by email, posted on a noticeboard and sent as a text",
      "A customer or client letter you rewrote from a template, with the template alongside",
      "Replies or questions from readers that show the edited version was understood",
    ],
    example: {
      narrative:
        "From February 2020 to September 2022 I was assistant manager at a 90-bed care home. In November 2021 head office sent a 14-page infection control update that every staff member had to confirm they had read within two weeks. After the first week, 11 of 62 staff had signed. I rewrote it as a single sheet of what changed on our floors, in the order of a shift, put a shorter version on the handover board, and sent a four-line text to the agency staff who never saw the board. The regional manager was uneasy that a summary might leave something out, so we agreed the full document stayed in the folder and my sheet gave the page numbers for each point. By the end of the second week 59 of 62 had signed, and the night supervisor said it was the first update her team had actually discussed. The attached original update, my one-page version, the board photo and the sign-off sheet are from that period.",
      why:
        "The same content appears in three formats chosen for three audiences, the cut is defended against a real objection, and the result is a count the sign-off sheet confirms.",
    },
    selfCheck: [
      "Can you show a document you cut or rewrote for a particular reader, with both versions?",
      "Can you explain why you chose that medium over another?",
      "Can you point to a change in tone you made and the reason for it?",
      "Do you have a reply or a record showing the edited version was read?",
    ],
  },

  "Building a talk": {
    outcome: "Present to groups with structure and confidence",
    intro:
      "A talk is a document with a time limit and a room. If you have run a toolbox briefing, explained a new roster to a shift, presented monthly figures to an owner or trained new starters, you have built one. This lesson shows how to present that preparation as evidence of structured presenting.",
    meaning: [
      "Building a talk means deciding the one thing the room should leave knowing, putting it at the start and the end, and choosing only the material that carries it. For a ten-minute slot that is usually three points, each with one example or one number. Slides, if you use them, hold the numbers and pictures your voice cannot; they do not hold your script. A handout or a whiteboard does the same job in a room without a screen.",
      "The outcome asks for structure and confidence in front of a group. Structure is the part you can prove with documents: an outline, slides, notes, a timing plan, the question you expected and prepared for. Confidence shows in the record of what happened: the talk ran to time, the decision was made, people asked about the content rather than asking what you meant. Evaluators credit preparation over polish, and they credit a talk cut to fit its slot over one that overran.",
    ],
    evaluatorsLookFor: [
      "One main message you can state in a sentence, and that appears in the opening and the close",
      "An outline or set of notes made before the talk, with the points in the order given",
      "Material chosen for the group: numbers for an owner, steps for a crew, examples for new starters",
      "A timing plan and how long the talk actually ran",
      "What the group did afterward: a decision, a question, a changed practice",
    ],
    evidence: [
      "Slides, a handout or a flipchart photo from a talk you gave",
      "Your preparation notes or outline, with the timing marked",
      "The agenda or meeting invitation listing you as the presenter",
      "Minutes, notes or a follow-up email recording what was decided or asked",
      "Feedback forms or a message from an attendee about the session",
    ],
    example: {
      narrative:
        "From January 2022 to June 2024 I was warehouse supervisor at a building supplies yard with 22 staff across two shifts. In October 2022 the yard had its third forklift near miss of the year, and the site manager gave me 15 minutes at the all-staff meeting to change how pedestrians and trucks shared the loading bay. I wrote the one message first: nobody walks through the bay, you walk round it. I built the talk on three slides, a photo of the bay with the new route drawn on, the three near-miss dates, and the one rule, and timed a run-through at 11 minutes. Two of the older drivers objected that the route added two minutes to each pick, and I had the figure ready: 40 picks a shift, 80 minutes, which I said was cheaper than one injury. The site manager backed the rule on the spot. There were no bay near misses in the following 12 months. The attached slides, my timed outline and the meeting minutes are from that period.",
      why:
        "The message is settled before the slides are built, the material is chosen for the room, the objection is anticipated with a number, and the result is dated. The outline and minutes let an evaluator check the preparation against what happened.",
    },
    selfCheck: [
      "Can you state the one thing you wanted a group to take away from a talk you gave?",
      "Can you show the outline, notes or slides you prepared beforehand?",
      "Can you say how long the slot was and how long you actually took?",
      "Do you have a record of what the group decided or asked afterward?",
    ],
  },

  "Delivery under pressure": {
    outcome: "Present to groups with structure and confidence",
    intro:
      "Pressure is the moment the room is hostile, the projector fails, the question is one you cannot answer, or the news is bad. Holding a group through that is what confidence means at work, and most people who have run a shift meeting after a bad week have done it. This lesson shows how to evidence it.",
    meaning: [
      "Confidence under pressure is mostly preparation plus a few habits: slowing down, repeating the question before answering it, saying you do not know and when you will find out, and returning to the point you came to make. Delivering bad news to a group, such as cut hours or a failed audit, calls for the facts first, then the reason, then what happens next, then time for questions. Reading from a card is not a weakness if the facts on it are right.",
      "The outcome is met when you can show a presentation or meeting that was difficult, how you prepared for the difficulty, what went wrong on the day, and how the group was left. Evaluators are not looking for a performance that went perfectly. They want to see that you kept the structure when it was tested, answered hard questions honestly, and that people knew what would happen next when they left. A talk you had to change halfway through is often the best evidence you have.",
    ],
    evaluatorsLookFor: [
      "A situation where the group, the news or the setting made the talk hard, described plainly",
      "What you prepared for that difficulty: likely questions, a backup for the technology, the order of the bad news",
      "What went wrong on the day and what you did in the moment",
      "A hard question and the answer you gave, including one you could not answer and how you followed up",
      "How the group was left: what they knew, and what they were told would happen next",
    ],
    evidence: [
      "Your notes for a difficult meeting or talk, including the questions you expected",
      "The slides or handout alongside the printed backup you prepared",
      "A follow-up email answering a question you could not answer in the room",
      "Minutes or notes from the meeting recording the questions and your answers",
      "A message from a manager or attendee about how the session was handled",
    ],
    example: {
      narrative:
        "From March 2021 to May 2023 I was operations lead at a 35-seat contact center for a utility company. In August 2022 I had to tell the team that the Saturday shift was being removed, about 12 percent of the hours for 14 people, and the center manager decided I would present it at the Thursday huddle without him. I wrote the facts on one card, in order: the change, its start date, the hours affected, the two options for making them up, and the dates for one-to-one meetings. I prepared for three expected questions and a fourth, whether more cuts were coming, which I could not answer. Eight minutes in, one adviser walked out and two others began talking over me. I stopped, said every question would be taken, and went back to the card. On further cuts I said I did not know and would answer by Monday, which I did. Twelve of the 14 took the make-up hours. The attached briefing card, my question notes and the Monday follow-up email are from that period.",
      why:
        "The difficulty is named, the preparation includes the question the writer could not answer, the disruption is handled by returning to the structure, and the follow-up was kept. The take-up figure shows how the room was left.",
    },
    selfCheck: [
      "Can you describe one talk or meeting where the room, the news or the setting worked against you?",
      "Can you show what you prepared for that difficulty before the day?",
      "Can you name a hard question you were asked and what you answered?",
      "Do you have the notes, slides or follow-up message from that session?",
    ],
  },
};

export default guides;
