import type { CourseGuides } from "./types";

// BUS301 Principles of Management. Outcomes:
// 1. Lead, coach, and motivate a team toward goals
// 2. Plan work, allocate budgets and resources, and manage priorities
// 3. Set expectations, give feedback, and manage performance

const guides: CourseGuides = {
  "What managers actually do": {
    outcome: "Plan work, allocate budgets and resources, and manage priorities",
    intro:
      "Most people who have run a shift, a store, a crew or a project have done management work without the title. This lesson names that work in the terms a college uses, so you can see which parts of your experience count and how to describe them.",
    meaning: [
      "Management is deciding what gets done, by whom, with what, and in what order, and then making sure it happens. A college course breaks that into planning, organizing, leading and controlling. In a real job those happen in the same afternoon: you look at the week's orders, decide who works which station, move a deadline, and check at close whether the numbers held.",
      "The outcome asks for the planning and allocating part. It is satisfied when you can show that you set a plan with real constraints (people, hours, money, stock), chose between competing demands, and adjusted when something changed. The scale does not matter. A four-person team and a $20,000 monthly budget is enough; what matters is that the decisions were yours.",
    ],
    evaluatorsLookFor: [
      "Decisions you made, in the first person, not tasks you were given",
      "Real constraints with numbers: headcount, hours, a budget figure, a stock level, a deadline",
      "A trade-off you faced and how you settled it",
      "A result you can point to, even a modest one, and what you would change next time",
      "Dates and a place of work, so the story can be checked against your evidence",
    ],
    evidence: [
      "A staffing plan, roster or schedule you built, showing names or roles against shifts",
      "A budget sheet, purchase plan or stock order you prepared, with the figures",
      "A written plan, memo or email in which you set priorities for a period",
      "A performance review or reference that mentions planning or running operations",
      "A before-and-after figure: overtime hours, wait times, waste, sales per shift",
    ],
    example: {
      narrative:
        "From March 2022 to June 2024 I was assistant manager of a 14-person grocery department. Each Thursday I built the following week's roster against the sales forecast my manager gave me, within a fixed labor budget of about 310 hours a week. The hard part was the Saturday delivery, which needed four people on the floor between 6 and 10 a.m. while the deli needed its two most experienced staff at the same time. I split the difference by moving the delivery to a 5 a.m. start in April 2023 after checking with the supplier, which freed one experienced person for the deli and cut Saturday overtime from an average of 9 hours to 2. I tracked it on the weekly labor report for three months before the store manager adopted it for two other departments. The attached rosters and labor reports are from that period.",
      why:
        "It names the scale, the constraint, the conflict and the decision, and it ends with a number and a document. An evaluator can read the rosters and see the change happen.",
    },
    selfCheck: [
      "Can you name a period when you decided who did what, with what resources?",
      "Can you put at least one real number on it: people, hours, money or stock?",
      "Can you describe one trade-off you settled, not just a plan you followed?",
      "Do you have at least one document from that time that shows the plan?",
    ],
  },

  "Setting goals that hold up": {
    outcome: "Lead, coach, and motivate a team toward goals",
    intro:
      "Goals that survive a busy week are specific, few, and owned by the people who have to hit them. This lesson shows how to describe goals you set for a team and how to prove the team actually worked toward them.",
    meaning: [
      "A goal that holds up has four parts: a number or a clear finish line, a date, a named owner, and a reason the team accepts. Improve service is a wish. Answer every ticket within one working day by the end of March, tracked on the Friday report, is a goal. Most working managers have set goals of the second kind without ever calling it goal setting.",
      "The outcome asks you to show that you led a team toward goals, not that you announced them. That means the goals were visible, people knew where they stood against them each week, and you adjusted when a goal turned out to be wrong. Dropping or changing a goal for a good reason is evidence of leadership, not a failure. Setting twelve goals and tracking none is weak evidence, because it shows goals announced rather than a team led toward them.",
    ],
    evaluatorsLookFor: [
      "Goals written down with a number, a date and an owner, not a general intention",
      "A link between the goal and something the team could see every week",
      "Evidence that the team knew the goal: a meeting note, a board, a message thread",
      "A goal that was changed or dropped, with the reason, which shows the goals were real",
      "The outcome against the target, stated plainly even when the target was missed",
    ],
    evidence: [
      "A written goal statement, team charter or quarter plan with targets and dates",
      "A photo or export of a tracking board, whiteboard or shared sheet showing progress",
      "Minutes or messages from a meeting where goals were set or reviewed with the team",
      "A later report comparing results with the original targets",
      "A reference or review in which someone describes you setting direction for a group",
    ],
    example: {
      narrative:
        "From January to December 2023 I supervised a six-person reception and intake team at a community health center. Complaints about phone wait times had reached about 20 a month. In the first week of January I sat with the team and we agreed on one goal for the quarter: answer 80 percent of calls within two minutes, measured from the phone system report every Friday. Two staff argued the target was impossible during the Monday morning rush, so we added a Monday overflow roster rather than lowering the number. By the end of March we were at 74 percent, short of the target, and I said so in the team meeting and in the report to the practice manager. We kept the goal for a second quarter and reached 83 percent in June, with complaints down to 6 a month. The attached quarter plans, Friday phone reports and April review note are from that period.",
      why:
        "The goal has a number, a date and a measurement source the team could see. It also shows a missed target reported honestly and a second attempt, which is what leading toward a goal looks like.",
    },
    selfCheck: [
      "Can you state one goal you set for a team with a number, a date and an owner?",
      "Can you show how the team saw its progress during the period?",
      "Can you name one goal you changed or dropped, and why?",
      "Do you have a document from the time that records the target or the result?",
    ],
  },

  "Forecasting and budgeting basics": {
    outcome: "Plan work, allocate budgets and resources, and manage priorities",
    intro:
      "A forecast is a guess written down with its reasons, and a budget is a forecast you agreed to live within. If you have ordered stock for a season, planned hours against expected sales, or asked for money for a project, you have done both. This lesson shows how to present that work.",
    meaning: [
      "Forecasting in a working job is rarely a spreadsheet model. It is looking at last year's same month, the bookings already in, the weather, a new competitor across the road, and settling on a number you would defend. Budgeting is then dividing what you have, whether hours, money or stock, across the things that need it, and keeping a record so you notice when the plan slips.",
      "The outcome is met when you can show the forecast you made, the assumptions behind it, the budget you set from it, and what happened. Being wrong is normal. What evaluators want is that you knew why you picked the number, you checked actuals against it during the period, and you changed something when the gap grew. A forecast that was never compared with reality is just a hope.",
    ],
    evaluatorsLookFor: [
      "A forecast figure and the two or three assumptions it rested on",
      "A budget broken into lines you controlled, with amounts",
      "A comparison of planned against actual at some point in the period",
      "An adjustment you made mid-period, with the reason, and what it saved or cost",
      "Honest treatment of the misses: where the number was wrong and what you learned",
    ],
    evidence: [
      "A budget sheet, cost plan or purchase order list you prepared, with the figures",
      "A forecast you sent to a manager or owner, with the reasoning in the email or memo",
      "A variance report, monthly comparison or your own tracking sheet of plan against actual",
      "Supplier quotes or orders showing the quantities you chose and when",
      "Approval of a spending request you wrote, or a reply questioning it that you answered",
    ],
    example: {
      narrative:
        "Between June 2021 and August 2023 I ran the kitchen at a 60-seat independent restaurant. Each August I prepared the food cost budget for the year with the owner. For 2022 I forecast weekly sales of $18,000 based on the previous year's figures plus the bookings already taken for the Christmas period, and set a food cost target of 31 percent, which meant roughly $5,600 a week on purchases. By November, actual sales were running at $15,500 because a nearby office block had closed, and food cost had drifted to 35 percent. I cut the standing vegetable order by a fifth, took two low-margin dishes off the menu and moved to ordering fish twice a week instead of three times. Food cost was back to 32 percent by February 2023. The owner disagreed with removing one of the dishes and we kept it at a higher price instead. The attached budget sheet, weekly purchasing log and February review email are from that year.",
      why:
        "The forecast, the assumptions and the budget line are all stated, and the narrative shows the plan being checked against actuals and changed. The disagreement with the owner shows the decisions were negotiated, not just recorded.",
    },
    selfCheck: [
      "Can you name a number you forecast, and the reasons you chose it?",
      "Can you show the budget or order plan that came from that forecast?",
      "Can you point to a moment when you compared the plan with what actually happened?",
      "Do you have the sheet, order or email that shows the figures?",
    ],
  },

  "Delegation and trust": {
    outcome: "Lead, coach, and motivate a team toward goals",
    intro:
      "Delegation is giving someone a result to own, not a list of steps to follow. It is the part of leading a team that most working managers underrate in their own story, because it looks like doing less. This lesson shows how to describe it and prove it.",
    meaning: [
      "Real delegation has a named person, a clear result, a date, the authority to make decisions within limits, and a check-in that is agreed in advance. Handing over a task and then redoing it yourself is not delegation. Neither is leaving someone alone with a job they were never shown how to do. The skill sits between those two: enough instruction to start, enough room to learn, and a point where you look at the work together.",
      "Trust is what makes this hold. It is built when you let someone's decision stand even though you would have done it differently, and when you take responsibility upward if it goes wrong. The outcome is met when you can show that you gave people real responsibility, coached them through it, and that they grew into work they had not done before. Someone you trained who now does your old job is the strongest evidence there is.",
    ],
    evaluatorsLookFor: [
      "A specific responsibility you handed to a named role, with its scope and limits",
      "How you prepared the person: a walkthrough, a shadow shift, written notes",
      "A check-in arrangement that was agreed, not improvised after a problem",
      "A case where you let a decision stand that you would have made differently",
      "What the person could do at the end of the period that they could not at the start",
    ],
    evidence: [
      "A handover note, checklist or written brief you gave someone taking on a task",
      "A training record, buddy schedule or onboarding plan you ran",
      "Messages or notes from check-ins showing questions asked and decisions left with the person",
      "A promotion, pay change or reference for someone you developed",
      "A roster or org chart from before and after showing responsibilities that moved",
    ],
    example: {
      narrative:
        "From April 2020 to October 2022 I was team leader of a nine-person night shift in a parcel sorting depot. In early 2021 I started covering a second shift two nights a week and needed someone to run the 2 a.m. trailer dispatch. I chose a sorter with 14 months' service who fixed problems before telling me. After three dispatches together I wrote a one-page sheet of the decisions that were his, such as holding a trailer up to 20 minutes for late scans, and the two that still needed my call. In his first week he held a trailer 35 minutes, missed the linehaul window, and the depot manager wanted dispatch back with me. I kept him on it, we went through the call together, and over the next six months dispatch left on time 94 percent of nights against 91 percent when I ran it. He was made a team leader in September 2022, a month before I left. The attached handover sheet, shift logs and my reference for his team leader application are from that time.",
      why:
        "It shows a real handover with written limits, a failure that the writer absorbed rather than reversed, and a measured result that beat the writer's own record. The promotion is proof that the person actually grew.",
    },
    selfCheck: [
      "Can you name one responsibility you handed to someone and what they were allowed to decide?",
      "Can you describe how you prepared them and how you checked in?",
      "Can you point to a time you backed their decision when it went wrong?",
      "Do you have a handover note, training record or reference from that period?",
    ],
  },

  "Feedback that changes behavior": {
    outcome: "Set expectations, give feedback, and manage performance",
    intro:
      "Feedback that works is specific, close to the event, about the work rather than the person, and followed by a check that something changed. Most managers give it every day in passing. This lesson shows how to turn those conversations into evidence that you can set expectations and correct course.",
    meaning: [
      "The useful shape of feedback is short: what you saw, what effect it had, what you want instead, and when you will look again. The last three invoices went out with the wrong tax code, the client queried two, I need every invoice checked against the rate sheet before it goes, and I will look at Friday's batch with you. Praise works the same way: name the specific thing so the person knows what to repeat.",
      "The outcome asks you to show feedback that changed behavior, which means you need the before and the after. An evaluator is looking for a pattern you noticed, a conversation you had, something you wrote down, and a later point where the work was different. Difficult conversations count more than easy ones, including the ones where the person disagreed. Where your employer or country has rules on recording conversations with staff, follow them and say so; the record itself is part of the evidence.",
    ],
    evaluatorsLookFor: [
      "A specific behavior you addressed, described by what happened, not by a label like attitude",
      "The feedback given soon after the event, in private, with a clear ask",
      "A note made at the time, in whatever form your workplace used",
      "A follow-up date that was set and kept",
      "The change in the work afterward, or your honest account of what did not change",
    ],
    evidence: [
      "A one-to-one note, email summary or diary entry recording a feedback conversation",
      "A written expectation you set: a standard, a checklist, a sample of acceptable work",
      "Error logs, audit results or customer feedback from before and after",
      "A later review in which the improvement is recorded",
      "A message from the person acknowledging the conversation or the new standard",
    ],
    example: {
      narrative:
        "From June 2022 to May 2024 I supervised seven care assistants on a residential unit. In October 2022 the daily records showed one assistant completing fluid charts from memory at the end of the shift rather than at each round. Over two weeks I counted 11 charts with identical entries across four residents. I spoke to her that day, on her own, showed her the charts, and explained what the nurse on the next shift could get wrong as a result. She said the rounds were too tight to write as she went. We agreed she would carry the chart folder on the trolley, and I would check her charts each Friday for a month. I wrote the conversation up that day in the supervision record, as our policy required. In the following month I found two incomplete charts, and after that none. Her annual review in June 2023 recorded the improvement. The attached supervision note, chart audit and review extract, with her name and the residents' details removed, are from that period.",
      why:
        "The behavior is described by what the charts showed, the conversation happened the same day and in private, a change was agreed with the person, and the follow-up was counted. The record was kept the way the workplace required.",
    },
    selfCheck: [
      "Can you describe one specific piece of behavior you gave feedback on, by what happened?",
      "Can you say when and where the conversation took place and what you asked for?",
      "Can you show what was different in the work afterward?",
      "Do you have a note, email or record of that conversation made at the time?",
    ],
  },

  "Managing performance over time": {
    outcome: "Set expectations, give feedback, and manage performance",
    intro:
      "Managing performance is the slow version of feedback: setting a standard, measuring against it across months, and acting when someone stays below it or rises above it. This lesson covers reviews, improvement plans and recognition, and how to evidence them without breaching anyone's privacy.",
    meaning: [
      "Over a year, performance management is a cycle: agree what good looks like, review it at set points, record what was found, and decide what happens next. The next step may be more responsibility, more training, a formal improvement plan, or in some cases a decision to end employment. The procedure for the last two varies by country and employer, and an evaluator expects you to know the one you worked under, not to recite a general one.",
      "The outcome is satisfied when you can show the cycle running, not just one review form. That means a standard set in advance, at least two points where you measured against it, a decision you made because of what you found, and the consequence. Strong evidence often includes someone who improved after a structured plan, and someone whose extra effort you recognized in a way they could see. Both are management.",
    ],
    evaluatorsLookFor: [
      "A standard or set of expectations written before the review period, not after",
      "Two or more review points with dates, so the trend is visible",
      "A decision taken on the evidence: a plan, training, a changed role, or a formal process",
      "The procedure you followed for any formal step, named as your employer defined it",
      "What happened to the person's work by the end, in plain terms",
    ],
    evidence: [
      "A review form, appraisal or one-to-one record you completed as the manager, with names removed",
      "A performance improvement plan or support plan with its milestones and dates",
      "Your own tracking of a team member's output or quality across months",
      "A training request or referral you made in response to a review",
      "A recognition note, bonus recommendation or promotion case you wrote",
    ],
    example: {
      narrative:
        "From February 2021 to March 2024 I managed a 12-person inbound sales team at a call center handling insurance renewals. Each adviser had a target of 55 completed renewals a week and a quality score of 85 percent on monitored calls, both set in writing each January. In the April 2022 review one adviser was at 38 renewals and 71 percent for the second quarter running. I put him on a six-week support plan with weekly call reviews and a shadowing session with our best adviser, following the company's capability procedure, which required a written plan and a mid-point meeting with HR present. By the end of week six he was at 52 renewals and 88 percent. The hard decision came in week three, when he missed a review session and I had to decide whether to record it as a breach of the plan; I did, and told him why. The attached blank review template, the anonymized plan with its weekly figures, and the week-six outcome letter are from that period.",
      why:
        "The standard predates the review, there are two measured points and a six-week trend, the formal procedure is named as the employer defined it, and the writer owns an uncomfortable decision inside the process.",
    },
    selfCheck: [
      "Can you name a performance standard you set in advance and the dates you reviewed against it?",
      "Can you describe a decision you took because of what a review showed?",
      "Can you state the procedure your employer required for any formal step you ran?",
      "Do you have a review record or plan from that time with personal details removed?",
    ],
  },

  "Processes and bottlenecks": {
    outcome: "Plan work, allocate budgets and resources, and manage priorities",
    intro:
      "A process is the order work moves through, and a bottleneck is the step where it piles up. Finding the bottleneck and changing something about it is the most useful thing a line manager does with a slow week. This lesson shows how to describe that work in a way an evaluator can follow.",
    meaning: [
      "Every workplace has a flow: orders in, work done, work checked, work out. Under load, one step falls behind and everything after it waits. The signs are a queue, overtime at one station, or people idle at the next. The manager's job is to find which step limits the whole, then do something about it: add a person there, move work away from it, simplify the step, or change the order so the step gets cleaner input.",
      "The outcome is about allocating resources and managing priorities, and this is where it shows most clearly. You decide that the slow step gets the extra pair of hands, not the loud one. You decide that the check moves earlier so bad work stops sooner. Evidence is strongest when you can show the queue or the wait before, the change you made, and the queue after, with a number on each.",
    ],
    evaluatorsLookFor: [
      "A description of the flow of work in a few steps, as it was before you changed it",
      "The bottleneck named, with how you knew: a queue count, a wait time, overtime at one step",
      "The change you made and why you chose it over the alternatives",
      "A measure before and after, even a rough one taken by hand",
      "What it cost: a person moved from elsewhere, a day lost to retraining, a step slowed",
    ],
    evidence: [
      "A process map, flow sketch or written procedure you drew up or revised",
      "Queue counts, wait times, throughput or overtime figures from before and after",
      "A changed roster, station plan or layout showing where you moved people or work",
      "A revised checklist or standard work sheet for the changed step",
      "An email or memo explaining the change to the team or to your manager",
    ],
    example: {
      narrative:
        "From May 2022 to April 2024 I ran the returns area at a regional distribution center, with eight staff on days. Returned items went through four steps: unpack, inspect, grade, and restock or scrap. In September 2022 we were 1,400 items behind, inspection staff were doing two hours of overtime a day, and the restock team spent the last hour of each shift waiting. I counted items at each step for a week and found inspection cleared about 310 a day against 420 arriving. I moved one restocker to inspection, took the serial number check out of inspection and put it at unpack, and set a rule that anything over 30 days old was scrapped without a full inspection. The backlog was cleared in five weeks, overtime fell to roughly three hours a week across the team, and the restock supervisor complained for a month about losing a person. The attached step counts, the revised four-step procedure and the roster change are from that period.",
      why:
        "The flow is laid out, the bottleneck is found by counting rather than guessing, and three distinct changes are named with a before and after. The cost of the change is stated through the complaint rather than hidden.",
    },
    selfCheck: [
      "Can you describe the flow of work in your area in four or five steps?",
      "Can you name the step where work piled up and how you knew?",
      "Can you state what you changed and what it cost somewhere else?",
      "Do you have a count, a procedure or a roster that shows the change?",
    ],
  },

  "Metrics that matter": {
    outcome: "Lead, coach, and motivate a team toward goals",
    intro:
      "A metric matters when the team can move it, can see it, and knows why it is there. Picking three numbers and putting them where people look every day is a leadership act as much as a control. This lesson shows how to present the measures you chose and what they did for the team.",
    meaning: [
      "Most workplaces measure dozens of things and act on none of them. A manager earns this outcome by choosing a small set that connects daily work to the goal, in words the team uses. A dispatch team understands trailers out on time; it does not understand logistics service level. The number should be updated often enough that yesterday's effort shows up, and displayed where it is seen without anyone having to ask.",
      "The outcome asks you to lead and motivate a team toward goals, and a visible number does much of that work for you if it is fair. Fair means the team controls most of what moves it, the measurement is the same every week, and a bad week is discussed, not punished. Evaluators also want to see a metric you dropped because it was driving the wrong behavior. Knowing when a number stops helping is part of the skill.",
    ],
    evaluatorsLookFor: [
      "The two or three measures you chose, with the reason each one was picked over others",
      "Where and how often the team saw the numbers",
      "How the measures were collected and that the method stayed the same",
      "One occasion a number prompted a team conversation and what changed as a result",
      "A measure you dropped or replaced, and why",
    ],
    evidence: [
      "A photo or export of the board, dashboard or sheet the team saw",
      "Your definition of each measure: what counts, what does not, where the data came from",
      "Weekly or monthly figures over at least a quarter",
      "Notes from a huddle or meeting where a number was discussed",
      "A message or memo introducing or retiring a measure, with your reasoning",
    ],
    example: {
      narrative:
        "From October 2021 to September 2023 I led a five-person maintenance crew at a 180-unit apartment complex. When I started, the only number anyone tracked was total work orders closed, which rewarded closing easy jobs first. In January 2022 I replaced it with two measures on a whiteboard in the workshop: work orders older than seven days, and callbacks, meaning a repeat visit for the same fault within 30 days. I updated both every Monday from the work order system. The older-than-seven-days count was 46 when I started and 9 by June. Callbacks were harder; they rose from 4 to 7 a month in the spring because the crew was closing faster, and we spent two Monday meetings on it before agreeing that any plumbing repair got a 48-hour recheck. By September 2023 callbacks averaged 2 a month. The attached whiteboard photos, the Monday figures sheet and the January memo introducing the measures are from that period.",
      why:
        "The old measure is dropped for a stated reason, the new ones are defined in words the crew used, and a number that went the wrong way is treated as a conversation rather than hidden. The result is dated and documented.",
    },
    selfCheck: [
      "Can you name the two or three numbers your team watched and why you chose them?",
      "Can you say where the team saw them and how often they were updated?",
      "Can you describe a time a number went the wrong way and what the team did?",
      "Do you have a photo, sheet or export of the figures from that time?",
    ],
  },
};

export default guides;
