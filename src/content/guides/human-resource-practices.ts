import type { CourseGuides } from "./types";

// HR205 Human Resource Practices. Outcomes:
// 1. Run a structured, fair hiring process
// 2. Design onboarding that keeps new hires
// 3. Handle employee relations issues with documentation and care

const guides: CourseGuides = {
  "Writing the role": {
    outcome: "Run a structured, fair hiring process",
    intro:
      "A fair hiring process starts before anyone applies, with a written description of what the job actually requires. If you have ever rewritten a vacancy notice because the last one brought in the wrong people, you have done job design. This lesson shows how to present that work.",
    meaning: [
      "Writing the role means separating what the job needs from what the last person happened to have. A good description lists the duties as they are done most weeks, the few requirements that are genuinely essential, and the ones that are only preferred. It is written in plain words a candidate can test themselves against, and it avoids asking for things that do not predict the work, such as years of experience when what you need is a skill you could check in an hour.",
      "The outcome is met when you can show that you worked out the requirements from the job, not from habit, and that the description you wrote was the one the rest of the process was measured against. Rules on what a job advert may and may not ask for vary by country, and some employers add their own; an evaluator expects you to know the ones you worked under and to say how the description followed them.",
    ],
    evaluatorsLookFor: [
      "A duties list that matches what the job holder does in a normal week, not an ideal",
      "Essential requirements kept apart from preferred ones, with a reason each essential one is there",
      "At least one requirement you removed or reworded, and why",
      "A link from the description to how candidates were later assessed",
      "Any legal or employer rules on adverts that you checked, named as you knew them",
    ],
    evidence: [
      "The job description or person specification you wrote, with its date",
      "An earlier version or the previous advert, so the changes can be seen",
      "Notes or an email showing how you gathered the duties from the team or the outgoing holder",
      "The advert as it was published, and where",
      "Figures on who applied, such as the number of applications or how many met the essentials",
    ],
    example: {
      narrative:
        "Between February and May 2023 I was the supervisor responsible for filling a maintenance technician post at a 220-room hotel. The previous advert, used three times since 2019, asked for five years' experience and a trade qualification, and the last round had drawn 6 applicants, none of whom could do the electrical checks that took up most of the week. I spent two shifts with the outgoing technician logging his tasks, and found that about 60 percent of the work was routine electrical and plumbing checks against a maintenance schedule. I rewrote the description around those checks, dropped the years requirement, kept the electrical qualification as essential because the checks required it, and moved the plumbing experience to preferred. The general manager wanted the five years kept and we agreed to leave it out for one round and compare. The new advert drew 23 applicants, 14 of whom met the essentials. The attached old and new descriptions, the task log and the applicant summary are from that period.",
      why:
        "The requirements come from watching the job, the essential and preferred lists are separated with a reason, and the disagreement and the comparison show the description was a decision rather than a form.",
    },
    selfCheck: [
      "Can you name a role you described in writing and the date you did it?",
      "Can you point to one requirement you removed or changed, and say why?",
      "Can you show how the description connected to the way candidates were assessed?",
      "Do you have the description, the advert or an earlier version from that time?",
    ],
  },

  "Structured interviews": {
    outcome: "Run a structured, fair hiring process",
    intro:
      "A structured interview asks every candidate the same questions, scores the answers against the same scale, and records the scores before anyone discusses who they liked. Of all the changes that make hiring fairer, it is the one most within a line manager's own control. This lesson shows how to describe one you ran.",
    meaning: [
      "Structure means the questions are written in advance and tied to the requirements in the job description, each candidate is asked them in the same order, and each answer is scored on a scale that was agreed before the first interview. Two interviewers score separately and compare afterward. Questions ask for a specific past example or set a short task, rather than asking how someone would feel about the job.",
      "The outcome asks for a process that was fair as well as structured. That means the same evidence was collected from everyone, the decision can be traced to the scores, and any adjustment for a candidate, such as extra time or a different format, was offered on the same basis to all who needed it. What may be asked at interview and how long records must be kept vary by country and employer; say which rules you worked under and how your records met them.",
    ],
    evaluatorsLookFor: [
      "A question set written before the first interview, with each question linked to a requirement",
      "A scoring scale with a short description of what a low, middle and high answer looked like",
      "Score sheets completed separately by two or more interviewers for every candidate",
      "A decision that follows from the scores, or an explanation of why it did not",
      "A case where you corrected something in the process, such as a question that was dropped",
    ],
    evidence: [
      "The interview question sheet with the scoring guide, dated",
      "Completed score sheets for the shortlist, with candidate names removed",
      "A summary table or email comparing candidates' scores and recording the decision",
      "Invitations or briefing notes showing candidates were told the format in advance",
      "Feedback you gave to an unsuccessful candidate based on the scores",
    ],
    example: {
      narrative:
        "In September and October 2022 I ran the interviews for two customer service posts at a regional bus operator's depot office. Before the round I wrote seven questions, each tied to a line in the person specification, and a one-to-five scale with a sentence describing what a two and a four looked like. The depot manager and I interviewed nine candidates over four days and scored each one on our own sheets before speaking. After the third interview we agreed that one question about handling abusive callers was producing the same answer from everyone, so we replaced it with a short role play for the remaining six candidates and brought the first three back on the fourth day to do the same role play in person. The totals put a candidate the manager had not warmed to in second place, and we appointed on the scores. Both appointees were still in post a year later. The attached question sheet, the nine anonymized score sheets and the summary table are from that round.",
      why:
        "The questions, the scale and the separate scoring are all in place before the interviews start, a weak question is fixed in a way that keeps the process equal for every candidate, and the decision follows the scores even against an interviewer's instinct.",
    },
    selfCheck: [
      "Can you show a question set and scoring scale that existed before the first interview?",
      "Can you say how many candidates were scored, by whom, and whether the scoring was separate?",
      "Can you trace the appointment decision back to the scores?",
      "Do you have the sheets or the summary from that round, with names removed?",
    ],
  },

  "Onboarding that sticks": {
    outcome: "Design onboarding that keeps new hires",
    intro:
      "Onboarding is everything between the offer and the day the new person no longer needs you to get through a shift. Most of it is done by the line manager, usually without a plan on paper. This lesson shows how to turn what you did for new starters into a design an evaluator can assess.",
    meaning: [
      "An onboarding design has a shape: what happens before day one, what the first day and first week contain, who the new person can ask, what they must be able to do by set points, and when you sit down with them to check. The content varies by job, but the shape is the same whether you are starting a warehouse picker or a payroll clerk. A design is written down, repeated for each starter, and changed when a starter tells you something was missing.",
      "The outcome asks for onboarding that keeps new hires, so the measure is whether people were still there and working independently at the end of the period, and whether they would say the first weeks prepared them. Where the law or your employer requires particular inductions, such as safety training before certain work, the design must include them; name the ones that applied, rather than assuming they are the same everywhere.",
    ],
    evaluatorsLookFor: [
      "A written plan for the first days and weeks, with who does each part",
      "Milestones with dates: what the starter should be able to do by the end of week one, week four and so on",
      "A named person besides the manager whom the starter could ask routine questions",
      "Check-in points that were held, with a note of what came up",
      "Something you changed in the plan because of what a starter told you",
    ],
    evidence: [
      "The onboarding checklist or plan you used, with dates and sign-offs",
      "A buddy or shadowing roster showing who worked alongside each starter",
      "Notes from a one-week or one-month check-in with a starter",
      "Required training records for the period, such as safety induction sign-offs",
      "Figures on starters over a period: how many began, how many were still there at three or six months",
    ],
    example: {
      narrative:
        "From August 2021 to July 2023 I was shift lead at a 40-cover contract catering kitchen inside an office building, and I took on each new kitchen assistant. In the year before I started, 5 of 8 starters had left within three months. In October 2021 I wrote a three-week plan: the first two days on dish and prep with one named assistant as a buddy, the food safety induction, which the employer's procedure required before any food handling, completed and signed, one new station every three days, and a sit-down with me at the end of week one and week three. After the second starter told me the service rush on day three had put her off, I moved the first service shift to the second week. Over the next 18 months 7 people started and 6 were still with us at three months, and all 7 were on the full station rotation by week four. The attached plan, the buddy roster, two check-in notes and the starter summary are from that period.",
      why:
        "The plan has a shape with dates and a named buddy, a required induction is placed where the employer's procedure put it, one change is made because of a starter's feedback, and the result is stated as a count against the earlier count.",
    },
    selfCheck: [
      "Can you describe the first week and first month you planned for a new starter, step by step?",
      "Can you name the person besides you who supported each starter?",
      "Can you point to one change you made to the plan and the starter who prompted it?",
      "Do you have the checklist, roster or check-in notes from that time?",
    ],
  },

  "Why people stay": {
    outcome: "Design onboarding that keeps new hires",
    intro:
      "People stay in a job when they can do it, when someone notices that they do it well, and when they can see what comes next. The months after the onboarding plan ends are when a new starter finds out whether those things are true. This lesson shows how to present the things you did to keep new starters once the induction was over.",
    meaning: [
      "Retention is not a program. It is a set of ordinary habits: a regular conversation with each person about their work, pay and hours that are explained rather than announced, problems fixed when they are raised, and a path to more responsibility that someone has actually walked. When a person leaves, the reason is usually something that was visible weeks earlier to anyone who was looking.",
      "The outcome is about designing onboarding that keeps people, and this lesson covers the end of that design: what happens between the end of the plan and the first anniversary. Evaluators want to see that you knew who was at risk of leaving and why, that you did something specific about it, and that you can show the effect in who stayed. Exit conversations count, as long as what you learned from them changed something.",
    ],
    evaluatorsLookFor: [
      "A regular check-in habit with each starter through their first year, with how often and roughly how long",
      "At least one reason starters had left your area inside their first year, found by asking, and what you changed",
      "A specific thing you did to keep a particular starter, with their reason for considering leaving",
      "A path to more responsibility that at least one person took during your time",
      "Counts of starters who left and who stayed inside twelve months, before and after a change you can attribute",
    ],
    evidence: [
      "A one-to-one schedule or diary extract showing regular conversations with staff",
      "Exit conversation notes from starters who left in their first year, with names removed",
      "A memo or request you made to change pay, hours, duties or equipment for a reason staff gave",
      "A record of someone moving to a new role or level under you",
      "Starter figures over at least a year: how many began, and how many of them left inside twelve months, before and after your change",
    ],
    example: {
      narrative:
        "From January 2022 to March 2024 I managed a 16-person housekeeping team at a serviced apartment block. In my first month I found that 7 of the 9 people who started the previous year had left inside twelve months. Three of the four I spoke to said the same thing: after the two-week induction, nobody gave them their hours more than a week ahead or asked how they were doing. From March 2022 I published the roster four weeks ahead and held a 15-minute conversation with every starter at one, three, six and twelve months. In August 2022 a starter in her fifth month told me she had an offer elsewhere for 50 pence an hour more. I could not match it, but I made a written case for her to take the linen-room role at the next grade, which the operations manager approved in October, and she stayed. Of the 8 people who started in my two years, 2 left inside twelve months. The attached roster announcement, check-in log, grade proposal and starter leaver figures are from that period.",
      why:
        "The reason people left was found by asking, the fix was specific and dated, the individual case shows a decision made within real limits, and the first-year leaver count is given against the earlier count for starters rather than for the whole team.",
    },
    selfCheck: [
      "Can you name one reason starters left your team in their first year and what you changed because of it?",
      "Can you describe a regular conversation you held with each starter, and how often?",
      "Can you point to one starter you kept, and what you did?",
      "Do you have a roster, a check-in log, a proposal or starter leaver figures from that time?",
    ],
  },

  "Documentation habits": {
    outcome: "Handle employee relations issues with documentation and care",
    intro:
      "Employee relations issues are decided on what was written down at the time. A note made on the day, in plain words, dated and kept where it should be, protects the employee, the manager and the employer. This lesson shows how to describe the habits you kept and prove they were real.",
    meaning: [
      "A documentation habit means that after any conversation that matters, such as a warning, a complaint, an absence discussion or an agreed change to someone's duties, you write what was said, what was agreed and what happens next, on the same day, and store it where your employer's process says it goes. The note describes what happened, not what you think of the person. The employee sees it or is told it exists, depending on your employer's rules.",
      "The outcome asks for documentation and care together. Care shows in a note that is fair to the person, written to be read by them, and limited to what is relevant. What must be recorded, who may see it, and how long it is kept vary by country and employer, and some workplaces have union or works council arrangements on top; an evaluator expects you to describe the rules you followed and to show, with personal details removed, that your records would hold up.",
    ],
    evaluatorsLookFor: [
      "Notes made on the day of the event, with the date and time visible",
      "A description of what was said and agreed, free of labels and opinions about the person",
      "A next step with a date in every note that needed one",
      "Where the notes were kept and who had access, as your employer required",
      "One occasion a note you made was later needed and what it allowed to happen",
    ],
    evidence: [
      "Two or three file notes or one-to-one records you wrote, anonymized, showing the same structure each time",
      "A blank template or format you used, if your workplace had one or you made one",
      "An absence record, return-to-work note or similar routine record you kept",
      "An email or message to the employee summarising a conversation, with names removed",
      "A later document, such as a hearing outcome, that cites one of your notes",
    ],
    example: {
      narrative:
        "From March 2020 to December 2022 I was a shift supervisor over 11 operators at a plastics moulding plant. When I started, the only records of conversations with staff were in the managers' heads. I began keeping a file note after any conversation about lateness, conduct or absence: date, time, who was present, what was said, what was agreed, and the review date, written before I went home and placed in the person's file in the office, which was locked as our policy required. Over 33 months I wrote 47 notes. In May 2022 an operator I had spoken to three times about leaving the line early went to a formal hearing, and my three notes, each with the date and the agreement reached, were the basis of the case. He argued that he had never been warned, and the notes showed the dates he had been. The outcome was a written warning rather than dismissal, which I thought was right. The attached note template, three anonymized notes and the hearing outcome letter are from that period.",
      why:
        "The habit is described as a routine with a fixed structure and a count, the storage follows the employer's rule, and the one case where the notes were needed shows them protecting the employee as much as the employer.",
    },
    selfCheck: [
      "Can you describe the structure of a note you wrote after a difficult conversation?",
      "Can you say where your notes were kept and who could see them, under your employer's rules?",
      "Can you point to a time one of your notes was later relied on?",
      "Do you have two or three anonymized notes or the template from that time?",
    ],
  },

  "Handling complaints": {
    outcome: "Handle employee relations issues with documentation and care",
    intro:
      "A complaint from an employee, about a colleague, a manager or the way they have been treated, is the hardest ordinary thing a supervisor handles. Done well, it is heard promptly, looked into fairly, and answered in writing. This lesson shows how to describe a complaint you handled without exposing anyone involved.",
    meaning: [
      "Handling a complaint has steps that are roughly the same everywhere: take it seriously on the day it is raised, write down what was said, decide whether you can deal with it or must pass it to someone else, find out what happened by speaking to the people involved separately, keep the person informed, and give an answer with reasons. Some complaints, such as those about harassment, discrimination or safety, usually have to go to a formal procedure or a named person; the rules for this differ by country and employer, and you need to say which applied.",
      "Care in this outcome means the person who complained was not left waiting or punished for raising it, the person complained about was told what was said and given a chance to answer, and both were treated the same whatever your private view. The outcome is met when you can show those steps and the record of them, with names removed, and can say what you did with what you learned.",
    ],
    evaluatorsLookFor: [
      "The complaint recorded on the day it was made, with what the person said they wanted to happen",
      "A decision, with reasons, about whether you handled it or passed it on, and to whom",
      "Separate conversations with each person involved, each noted",
      "An answer given to the person in writing, within a time you can state",
      "A change you made afterward, or an honest statement that none was needed",
    ],
    evidence: [
      "Your note of the complaint as first raised, anonymized and dated",
      "Notes of the conversations you held while looking into it, with names removed",
      "The written outcome or summary you gave the person",
      "The relevant procedure or policy extract that set out what you had to do",
      "A later action: a roster change, a training request, a referral, with its date",
    ],
    example: {
      narrative:
        "In June 2023 I was the team leader of a nine-person night cleaning crew at a hospital site. One cleaner told me at the start of a shift that a colleague had been making remarks about her accent in front of others for about a month. I wrote down what she told me that night, asked what she wanted to happen, and told her I would come back within two working days. Because our procedure treated this as potential harassment, I reported it to the contracts manager the same night rather than looking into it myself, and I separated the two on the roster from the next shift. I was asked to take a statement from the colleague, which I did on the third day, and from two witnesses. The manager issued a written warning three weeks later and the two were kept on separate wards. The cleaner who complained was still with us six months on. The attached anonymized first note, the two-day update email, my three statements and the roster change are from that period.",
      why:
        "The complaint is recorded on the day, the decision to pass it up follows the employer's procedure for that kind of complaint, both sides are heard separately, the person is kept informed to a stated deadline, and the outcome is followed through on the roster.",
    },
    selfCheck: [
      "Can you describe a complaint you took, what you recorded, and when?",
      "Can you say whether you handled it or passed it on, and which rule decided that?",
      "Can you show that each person involved was heard separately and told the outcome?",
      "Do you have the anonymized notes, the outcome and the procedure from that time?",
    ],
  },
};

export default guides;
