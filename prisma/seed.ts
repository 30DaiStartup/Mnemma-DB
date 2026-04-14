/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
const { PrismaClient } = require("../src/generated/prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

const dbPath = path.resolve(process.cwd(), "dev.db");
console.log("Using database:", dbPath);
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear all tables in correct order (children first)
  await prisma.personalIdea.deleteMany();
  await prisma.teamAssignment.deleteMany();
  await prisma.objective.deleteMany();
  await prisma.metric.deleteMany();
  await prisma.kanbanItem.deleteMany();
  await prisma.transcriptSummary.deleteMany();
  await prisma.project.deleteMany();
  await prisma.team.deleteMany();

  // ─── Create Teams ─────────────────────────────────────────────────
  const engineeringTeam = await prisma.team.create({
    data: { slug: "engineering", name: "Engineering", sortOrder: 0 },
  });
  const productTeam = await prisma.team.create({
    data: { slug: "product", name: "Product & Design", sortOrder: 1 },
  });
  const dataTeam = await prisma.team.create({
    data: { slug: "data-analytics", name: "Data & Analytics", sortOrder: 2 },
  });

  // ─── Phase configs ───────────────────────────────────────────────
  const technicalPhases = JSON.stringify([
    { name: "Discussion", description: "Problem definition, stakeholder alignment, transcript capture" },
    { name: "Prototype", description: "Rapid Claude-assisted prototype build" },
    { name: "Feedback", description: "Demo to stakeholders, gather input" },
    { name: "Iteration", description: "Refine based on feedback, multiple cycles" },
    { name: "Production", description: "Deploy, monitor, stabilize" },
  ]);

  const businessPhases = JSON.stringify([
    { name: "Discovery", description: "Research and context gathering" },
    { name: "Planning", description: "Strategy and approach definition" },
    { name: "Drafting", description: "Create deliverables" },
    { name: "Review", description: "Stakeholder review and approval" },
    { name: "Implementation", description: "Execute on the plan" },
  ]);

  // ═══════════════════════════════════════════════════════════════════
  // Project 1: AI Customer Support Bot
  // ═══════════════════════════════════════════════════════════════════
  const project1 = await prisma.project.create({
    data: {
      name: "AI Customer Support Bot",
      description: "An intelligent customer support chatbot powered by Claude that handles tier-1 support tickets, FAQs, and escalation routing for the SaaS platform.",
      type: "technical",
      status: "active",
      phase: "Prototype",
      phaseConfig: technicalPhases,
      health: "on-track",
      nextStep: "Complete integration testing with live customer data",
      leadId: "sarah-chen",
      sortOrder: 0,
      teamId: engineeringTeam.id,
    },
  });

  // Team assignments for Project 1
  await prisma.$transaction([
    prisma.teamAssignment.create({
      data: { projectId: project1.id, memberId: "sarah-chen", role: "lead" },
    }),
    prisma.teamAssignment.create({
      data: { projectId: project1.id, memberId: "marcus-johnson", role: "member" },
    }),
    prisma.teamAssignment.create({
      data: { projectId: project1.id, memberId: "priya-patel", role: "member" },
    }),
    prisma.teamAssignment.create({
      data: { projectId: project1.id, memberId: "alex-rivera", role: "member" },
    }),
  ]);

  // Transcript for Project 1
  const transcript1 = await prisma.transcriptSummary.create({
    data: {
      projectId: project1.id,
      title: "Sprint Review - Bot Accuracy Discussion",
      date: new Date("2026-04-03"),
      summary: "Reviewed the prototype's accuracy on tier-1 tickets. Discussed the need to add multilingual support and improve escalation logic. Team agreed to prioritize response time optimization before adding new languages.",
      participants: JSON.stringify(["sarah-chen", "marcus-johnson", "priya-patel", "alex-rivera"]),
      actionItems: JSON.stringify([
        "Add rate limiting to the bot API endpoint",
        "Create a feedback loop for incorrect responses",
      ]),
      sourceFile: "sprint-review-2026-04-03.md",
      processed: true,
    },
  });

  // Kanban items for Project 1 (6 items: 2 To Do, 2 In Progress, 1 Review, 1 Done)
  await prisma.$transaction([
    // To Do - from transcript (isNew, not approved)
    prisma.kanbanItem.create({
      data: {
        projectId: project1.id,
        title: "Add rate limiting to the bot API endpoint",
        description: "Implement request throttling to prevent abuse and ensure fair usage across tenants.",
        column: "To Do",
        sortOrder: 0,
        priority: "high",
        assigneeId: "alex-rivera",
        source: "transcript",
        sourceId: transcript1.id,
        isNew: true,
        approved: false,
      },
    }),
    // To Do - from transcript (isNew, not approved)
    prisma.kanbanItem.create({
      data: {
        projectId: project1.id,
        title: "Create a feedback loop for incorrect responses",
        description: "Build a mechanism for agents to flag bad bot answers so we can improve the model.",
        column: "To Do",
        sortOrder: 1,
        priority: "medium",
        assigneeId: "priya-patel",
        source: "transcript",
        sourceId: transcript1.id,
        isNew: true,
        approved: false,
      },
    }),
    // In Progress
    prisma.kanbanItem.create({
      data: {
        projectId: project1.id,
        title: "Integrate Claude API for response generation",
        description: "Wire up the Claude API to the bot's response pipeline with proper context window management.",
        column: "In Progress",
        sortOrder: 0,
        priority: "critical",
        assigneeId: "sarah-chen",
        source: "manual",
      },
    }),
    prisma.kanbanItem.create({
      data: {
        projectId: project1.id,
        title: "Build escalation routing logic",
        description: "Implement smart routing that detects when a ticket needs human intervention based on sentiment and topic complexity.",
        column: "In Progress",
        sortOrder: 1,
        priority: "high",
        assigneeId: "marcus-johnson",
        source: "manual",
      },
    }),
    // Review
    prisma.kanbanItem.create({
      data: {
        projectId: project1.id,
        title: "Design FAQ knowledge base schema",
        description: "Create the database schema and indexing strategy for the FAQ knowledge base that the bot queries.",
        column: "Review",
        sortOrder: 0,
        priority: "medium",
        assigneeId: "priya-patel",
        source: "manual",
      },
    }),
    // Done
    prisma.kanbanItem.create({
      data: {
        projectId: project1.id,
        title: "Set up project scaffolding and CI pipeline",
        description: "Initialize the Next.js project, configure ESLint, Prettier, and set up GitHub Actions for CI/CD.",
        column: "Done",
        sortOrder: 0,
        priority: "medium",
        assigneeId: "alex-rivera",
        source: "manual",
      },
    }),
  ]);

  // Metrics for Project 1
  await prisma.$transaction([
    prisma.metric.create({
      data: {
        projectId: project1.id,
        name: "Response Accuracy",
        value: 87,
        unit: "%",
        category: "quality",
        trend: "up",
        history: JSON.stringify([
          { date: "2026-03-15", value: 72 },
          { date: "2026-03-22", value: 78 },
          { date: "2026-03-29", value: 83 },
          { date: "2026-04-05", value: 87 },
        ]),
      },
    }),
    prisma.metric.create({
      data: {
        projectId: project1.id,
        name: "Avg Response Time",
        value: 2.3,
        unit: "s",
        category: "performance",
        trend: "down",
        history: JSON.stringify([
          { date: "2026-03-15", value: 4.1 },
          { date: "2026-03-22", value: 3.5 },
          { date: "2026-03-29", value: 2.8 },
          { date: "2026-04-05", value: 2.3 },
        ]),
      },
    }),
    prisma.metric.create({
      data: {
        projectId: project1.id,
        name: "User Satisfaction",
        value: 4.2,
        unit: "/5",
        category: "satisfaction",
        trend: "up",
        history: JSON.stringify([
          { date: "2026-03-15", value: 3.5 },
          { date: "2026-03-22", value: 3.8 },
          { date: "2026-03-29", value: 4.0 },
          { date: "2026-04-05", value: 4.2 },
        ]),
      },
    }),
  ]);

  // Objectives for Project 1
  await prisma.$transaction([
    prisma.objective.create({
      data: {
        projectId: project1.id,
        title: "Achieve 90% accuracy on tier-1 support tickets",
        description: "Bot should correctly resolve at least 90% of common support requests without human intervention.",
        status: "in-progress",
        sortOrder: 0,
      },
    }),
    prisma.objective.create({
      data: {
        projectId: project1.id,
        title: "Reduce average response time below 2 seconds",
        description: "Optimize the inference pipeline and caching to deliver sub-2s responses for 95th percentile.",
        status: "in-progress",
        sortOrder: 1,
      },
    }),
    prisma.objective.create({
      data: {
        projectId: project1.id,
        title: "Launch beta to 50 internal users by end of April",
        description: "Deploy the bot to the internal support team for real-world testing and feedback collection.",
        status: "not-started",
        sortOrder: 2,
      },
    }),
  ]);

  // ═══════════════════════════════════════════════════════════════════
  // Project 2: Internal Knowledge Base
  // ═══════════════════════════════════════════════════════════════════
  const project2 = await prisma.project.create({
    data: {
      name: "Internal Knowledge Base",
      description: "A centralized, searchable knowledge base for engineering documentation, runbooks, and institutional knowledge powered by semantic search.",
      type: "technical",
      status: "active",
      phase: "Feedback",
      phaseConfig: technicalPhases,
      health: "at-risk",
      nextStep: "Address search relevance issues raised in stakeholder demo",
      leadId: "marcus-johnson",
      sortOrder: 1,
      teamId: engineeringTeam.id,
    },
  });

  await prisma.$transaction([
    prisma.teamAssignment.create({
      data: { projectId: project2.id, memberId: "marcus-johnson", role: "lead" },
    }),
    prisma.teamAssignment.create({
      data: { projectId: project2.id, memberId: "priya-patel", role: "member" },
    }),
    prisma.teamAssignment.create({
      data: { projectId: project2.id, memberId: "jordan-kim", role: "member" },
    }),
  ]);

  const transcript2 = await prisma.transcriptSummary.create({
    data: {
      projectId: project2.id,
      title: "Stakeholder Demo - Search Quality Feedback",
      date: new Date("2026-04-01"),
      summary: "Demoed the search functionality to engineering leads. Feedback was mixed - relevance for long-form queries is poor. Team discussed switching to a hybrid search approach combining keyword and semantic search.",
      participants: JSON.stringify(["marcus-johnson", "priya-patel", "jordan-kim"]),
      actionItems: JSON.stringify([
        "Implement hybrid search combining BM25 and vector similarity",
        "Add document chunking for better retrieval on long articles",
      ]),
      sourceFile: "stakeholder-demo-2026-04-01.md",
      processed: true,
    },
  });

  await prisma.$transaction([
    prisma.kanbanItem.create({
      data: {
        projectId: project2.id,
        title: "Implement hybrid search combining BM25 and vector similarity",
        description: "Replace pure vector search with a hybrid approach to improve relevance for keyword-heavy queries.",
        column: "To Do",
        sortOrder: 0,
        priority: "critical",
        assigneeId: "marcus-johnson",
        source: "transcript",
        sourceId: transcript2.id,
        isNew: true,
        approved: false,
      },
    }),
    prisma.kanbanItem.create({
      data: {
        projectId: project2.id,
        title: "Add document chunking for better retrieval on long articles",
        description: "Split large documents into semantically meaningful chunks for more precise search results.",
        column: "In Progress",
        sortOrder: 0,
        priority: "high",
        assigneeId: "jordan-kim",
        source: "manual",
      },
    }),
    prisma.kanbanItem.create({
      data: {
        projectId: project2.id,
        title: "Build markdown ingestion pipeline",
        description: "Create an automated pipeline that watches for new/updated markdown files and indexes them.",
        column: "Review",
        sortOrder: 0,
        priority: "medium",
        assigneeId: "priya-patel",
        source: "manual",
      },
    }),
    prisma.kanbanItem.create({
      data: {
        projectId: project2.id,
        title: "Set up vector database and embedding generation",
        description: "Deploy the vector DB instance and configure the embedding model for document indexing.",
        column: "Done",
        sortOrder: 0,
        priority: "high",
        assigneeId: "marcus-johnson",
        source: "manual",
      },
    }),
  ]);

  await prisma.$transaction([
    prisma.metric.create({
      data: {
        projectId: project2.id,
        name: "Search Relevance Score",
        value: 62,
        unit: "%",
        category: "quality",
        trend: "down",
        history: JSON.stringify([
          { date: "2026-03-18", value: 71 },
          { date: "2026-03-25", value: 68 },
          { date: "2026-04-01", value: 62 },
        ]),
      },
    }),
    prisma.metric.create({
      data: {
        projectId: project2.id,
        name: "Documents Indexed",
        value: 847,
        unit: "docs",
        category: "coverage",
        trend: "up",
        history: JSON.stringify([
          { date: "2026-03-18", value: 320 },
          { date: "2026-03-25", value: 580 },
          { date: "2026-04-01", value: 847 },
        ]),
      },
    }),
  ]);

  await prisma.$transaction([
    prisma.objective.create({
      data: {
        projectId: project2.id,
        title: "Index all engineering runbooks and post-mortems",
        description: "Ensure 100% of existing runbooks and post-mortem documents are searchable in the knowledge base.",
        status: "in-progress",
        sortOrder: 0,
      },
    }),
    prisma.objective.create({
      data: {
        projectId: project2.id,
        title: "Achieve 80% search relevance score on benchmark queries",
        description: "Pass the internal search quality benchmark with at least 80% relevance on the test query set.",
        status: "not-started",
        sortOrder: 1,
      },
    }),
  ]);

  // ═══════════════════════════════════════════════════════════════════
  // Project 3: Q3 Market Analysis
  // ═══════════════════════════════════════════════════════════════════
  const project3 = await prisma.project.create({
    data: {
      name: "Q3 Market Analysis",
      description: "Comprehensive market analysis for Q3 planning covering competitive landscape, TAM updates, and pricing strategy recommendations.",
      type: "business",
      status: "active",
      phase: "Drafting",
      phaseConfig: businessPhases,
      health: "on-track",
      nextStep: "Complete competitive pricing comparison table",
      leadId: "emma-watson",
      sortOrder: 2,
      teamId: productTeam.id,
    },
  });

  await prisma.$transaction([
    prisma.teamAssignment.create({
      data: { projectId: project3.id, memberId: "emma-watson", role: "lead" },
    }),
    prisma.teamAssignment.create({
      data: { projectId: project3.id, memberId: "david-okafor", role: "member" },
    }),
    prisma.teamAssignment.create({
      data: { projectId: project3.id, memberId: "lisa-zhang", role: "member" },
    }),
  ]);

  const transcript3 = await prisma.transcriptSummary.create({
    data: {
      projectId: project3.id,
      title: "Market Research Kickoff with Strategy Team",
      date: new Date("2026-03-28"),
      summary: "Aligned on scope for the Q3 analysis. Focus areas: enterprise segment growth, mid-market churn analysis, and pricing elasticity study. Data sources identified and assigned to team members.",
      participants: JSON.stringify(["emma-watson", "david-okafor", "lisa-zhang"]),
      actionItems: JSON.stringify([
        "Pull enterprise segment revenue data from Salesforce",
        "Schedule interviews with 5 churned mid-market accounts",
      ]),
      sourceFile: "market-research-kickoff-2026-03-28.md",
      processed: true,
    },
  });

  await prisma.$transaction([
    prisma.kanbanItem.create({
      data: {
        projectId: project3.id,
        title: "Pull enterprise segment revenue data from Salesforce",
        description: "Extract Q1-Q2 revenue data segmented by enterprise tier for trend analysis.",
        column: "In Progress",
        sortOrder: 0,
        priority: "high",
        assigneeId: "david-okafor",
        source: "manual",
      },
    }),
    prisma.kanbanItem.create({
      data: {
        projectId: project3.id,
        title: "Schedule interviews with 5 churned mid-market accounts",
        description: "Reach out to recently churned accounts to understand their reasons for leaving.",
        column: "To Do",
        sortOrder: 0,
        priority: "medium",
        assigneeId: "lisa-zhang",
        source: "manual",
      },
    }),
    prisma.kanbanItem.create({
      data: {
        projectId: project3.id,
        title: "Draft competitive pricing comparison matrix",
        description: "Create a detailed comparison of pricing tiers across top 5 competitors with feature mapping.",
        column: "To Do",
        sortOrder: 1,
        priority: "high",
        assigneeId: "emma-watson",
        source: "manual",
      },
    }),
  ]);

  await prisma.$transaction([
    prisma.metric.create({
      data: {
        projectId: project3.id,
        name: "Research Completion",
        value: 35,
        unit: "%",
        category: "progress",
        trend: "up",
        history: JSON.stringify([
          { date: "2026-03-28", value: 10 },
          { date: "2026-04-01", value: 22 },
          { date: "2026-04-05", value: 35 },
        ]),
      },
    }),
    prisma.metric.create({
      data: {
        projectId: project3.id,
        name: "Interviews Completed",
        value: 3,
        unit: "of 12",
        category: "progress",
        trend: "up",
        history: JSON.stringify([
          { date: "2026-03-28", value: 0 },
          { date: "2026-04-01", value: 1 },
          { date: "2026-04-05", value: 3 },
        ]),
      },
    }),
  ]);

  await prisma.$transaction([
    prisma.objective.create({
      data: {
        projectId: project3.id,
        title: "Deliver final market analysis report to leadership",
        description: "Complete comprehensive report with competitive analysis, TAM sizing, and pricing recommendations.",
        status: "not-started",
        sortOrder: 0,
      },
    }),
    prisma.objective.create({
      data: {
        projectId: project3.id,
        title: "Complete 12 customer interviews across all segments",
        description: "Interview customers from enterprise, mid-market, and SMB segments to validate market hypotheses.",
        status: "in-progress",
        sortOrder: 1,
      },
    }),
  ]);

  // ═══════════════════════════════════════════════════════════════════
  // Project 4: Employee Onboarding Portal
  // ═══════════════════════════════════════════════════════════════════
  const project4 = await prisma.project.create({
    data: {
      name: "Employee Onboarding Portal",
      description: "A self-service onboarding portal for new hires that automates IT provisioning, document signing, and training module assignment.",
      type: "technical",
      status: "backlog",
      phase: "",
      phaseConfig: technicalPhases,
      health: "on-track",
      nextStep: "Awaiting Q3 prioritization review",
      leadId: "lisa-zhang",
      sortOrder: 3,
      teamId: productTeam.id,
    },
  });

  await prisma.$transaction([
    prisma.teamAssignment.create({
      data: { projectId: project4.id, memberId: "lisa-zhang", role: "lead" },
    }),
    prisma.teamAssignment.create({
      data: { projectId: project4.id, memberId: "tom-martinez", role: "member" },
    }),
  ]);

  // No kanban items, no transcripts, no metrics for project 4

  await prisma.$transaction([
    prisma.objective.create({
      data: {
        projectId: project4.id,
        title: "Reduce new hire onboarding time from 5 days to 2 days",
        description: "Automate the manual steps in onboarding to cut the total time to productivity in half.",
        status: "not-started",
        sortOrder: 0,
      },
    }),
    prisma.objective.create({
      data: {
        projectId: project4.id,
        title: "Integrate with Okta SSO and IT provisioning APIs",
        description: "Connect the portal to existing identity management and provisioning systems for automated account setup.",
        status: "not-started",
        sortOrder: 1,
      },
    }),
  ]);

  // ─── Personal Ideas ────────────────────────────────────────────────
  await prisma.$transaction([
    prisma.personalIdea.create({
      data: {
        ownerId: "sarah-chen",
        title: "Automated code review bot using Claude",
        description: "Build a bot that reviews PRs and suggests improvements using Claude API.",
        priority: "high",
        status: "idea",
        sortOrder: 0,
      },
    }),
    prisma.personalIdea.create({
      data: {
        ownerId: "sarah-chen",
        title: "Team standup summary generator",
        description: "Auto-summarize async standup messages from Slack into a daily digest.",
        priority: "medium",
        status: "ready",
        sortOrder: 1,
      },
    }),
    prisma.personalIdea.create({
      data: {
        ownerId: "marcus-johnson",
        title: "Performance monitoring dashboard for KB",
        description: "Real-time dashboard showing search latency, cache hit rates, and indexing throughput.",
        priority: "medium",
        status: "idea",
        sortOrder: 0,
      },
    }),
  ]);

  console.log("Seed completed successfully!");
  console.log(`  - Created 3 teams`);
  console.log(`  - Created 4 projects`);
  console.log(`  - Created 3 personal ideas`);
  console.log(`  - Created kanban items, transcripts, metrics, objectives, and team assignments`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
