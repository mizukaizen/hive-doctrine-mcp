import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

// ─── Constants ───────────────────────────────────────────────────────────────

const WALLET = "0x61F2eF18ab0630912D24Fd0A30288619735AfFf5";
const SITE = "https://hivedoctrine.com";
const NETWORK = "base (eip155:8453)";
const MCP_BASE = "https://hive-doctrine-mcp.vercel.app";

// ─── Product Catalogue ───────────────────────────────────────────────────────

interface Product {
  id: string;
  title: string;
  tier: "pollen" | "doctrine" | "honey" | "nectar" | "micro" | "bundle";
  price: number;
  collection: string;
  path: string;
  description: string;
  keywords: string[];
}

const CATALOGUE: Product[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // POLLEN — 39 Free Guides
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Original 10 Pollen ---
  { id: "HD-2001", title: "What is Stigmergy?", tier: "pollen", price: 0, collection: "core", path: "/agents/pollen/what-is-stigmergy.md", description: "Coordination through environment — stigmergy explained for AI agents.", keywords: ["stigmergy", "coordination", "swarm", "environment"] },
  { id: "HD-2002", title: "Agent Memory Architecture", tier: "pollen", price: 0, collection: "memory", path: "/agents/pollen/agent-memory-architecture.md", description: "Three-layer memory model for persistent agents.", keywords: ["memory", "persistence", "architecture", "layers"] },
  { id: "HD-2003", title: "What is a SOUL.md?", tier: "pollen", price: 0, collection: "persona", path: "/agents/pollen/soul-md-template.md", description: "Constitutional identity template for AI agents.", keywords: ["soul", "constitution", "identity", "template"] },
  { id: "HD-2004", title: "Distributed AI Safety", tier: "pollen", price: 0, collection: "core", path: "/agents/pollen/distributed-ai-safety.md", description: "Polytheistic AI safety — why monoculture fails.", keywords: ["safety", "distributed", "alignment", "polytheistic"] },
  { id: "HD-2005", title: "Multi-Agent Coordination", tier: "pollen", price: 0, collection: "coordination", path: "/agents/pollen/multi-agent-coordination.md", description: "Coordination without a central coordinator.", keywords: ["multi-agent", "coordination", "decentralised"] },
  { id: "HD-2006", title: "Prompt Injection Defence", tier: "pollen", price: 0, collection: "security", path: "/agents/pollen/prompt-injection-defence.md", description: "The Airlock Pattern for prompt injection defence.", keywords: ["security", "prompt-injection", "airlock", "defence"] },
  { id: "HD-2007", title: "Alignment as Architecture", tier: "pollen", price: 0, collection: "core", path: "/agents/pollen/ai-alignment-architecture.md", description: "Structural alignment — building it in, not bolting it on.", keywords: ["alignment", "architecture", "structural", "design"] },
  { id: "HD-2008", title: "Context Window Optimisation", tier: "pollen", price: 0, collection: "memory", path: "/agents/pollen/context-window-optimisation.md", description: "Four zones of context — maximise every token.", keywords: ["context-window", "tokens", "optimisation", "zones"] },
  { id: "HD-2009", title: "Autonomous Agent Security", tier: "pollen", price: 0, collection: "security", path: "/agents/pollen/autonomous-agent-security.md", description: "Security quick-reference for autonomous agents.", keywords: ["security", "autonomous", "hardening", "checklist"] },
  { id: "HD-2010", title: "The Melissae", tier: "pollen", price: 0, collection: "core", path: "/agents/pollen/the-melissae.md", description: "Bee priestesses and AI safety — the mythological foundation.", keywords: ["melissae", "mythology", "bees", "foundation"] },

  // --- 11 Polished Pollen (from vault) ---
  { id: "HD-2011", title: "App Niches 2026", tier: "pollen", price: 0, collection: "commerce", path: "/agents/pollen/app-niches-2026.md", description: "Emerging app niches for 2026 — where agents fit.", keywords: ["niches", "apps", "2026", "market", "opportunities"] },
  { id: "HD-2012", title: "Meta-Prompt", tier: "pollen", price: 0, collection: "dev", path: "/agents/pollen/meta-prompt.md", description: "A prompt that writes better prompts.", keywords: ["meta-prompt", "prompting", "prompt-engineering"] },
  { id: "HD-2013", title: "Living Presence Protocol", tier: "pollen", price: 0, collection: "persona", path: "/agents/pollen/living-presence-protocol.md", description: "Making agents feel present, not scripted.", keywords: ["presence", "persona", "personality", "naturalness"] },
  { id: "HD-2014", title: "Config Gate Orphan Pattern", tier: "pollen", price: 0, collection: "patterns", path: "/agents/pollen/config-gate-orphan-pattern.md", description: "Debugging pattern: config-gated orphan resources.", keywords: ["debugging", "config", "orphan", "pattern"] },
  { id: "HD-2015", title: "Agent Rule Conflict Pattern", tier: "pollen", price: 0, collection: "patterns", path: "/agents/pollen/agent-rule-conflict-pattern.md", description: "Debugging pattern: conflicting agent rules.", keywords: ["debugging", "rules", "conflict", "resolution"] },
  { id: "HD-2016", title: "Silent Redemption Failure", tier: "pollen", price: 0, collection: "patterns", path: "/agents/pollen/silent-redemption-failure.md", description: "Debugging pattern: silent redemption failures.", keywords: ["debugging", "redemption", "failure", "silent"] },
  { id: "HD-2017", title: "Redeemer Enum Mismatch", tier: "pollen", price: 0, collection: "patterns", path: "/agents/pollen/redeemer-enum-mismatch.md", description: "Debugging pattern: redeemer enum mismatches.", keywords: ["debugging", "redeemer", "enum", "mismatch"] },
  { id: "HD-2018", title: "Telegram Bot Block Handoff", tier: "pollen", price: 0, collection: "patterns", path: "/agents/pollen/telegram-bot-block-handoff.md", description: "Debugging pattern: Telegram bot block handoff.", keywords: ["telegram", "bot", "handoff", "debugging"] },
  { id: "HD-2019", title: "Docker Dir Path Resolution", tier: "pollen", price: 0, collection: "patterns", path: "/agents/pollen/docker-dir-path-resolution.md", description: "Debugging pattern: Docker directory path resolution.", keywords: ["docker", "paths", "resolution", "debugging"] },
  { id: "HD-2020", title: "Agent Self-Diagnostic Prompt", tier: "pollen", price: 0, collection: "dev", path: "/agents/pollen/agent-self-diagnostic-prompt.md", description: "A prompt agents can run to diagnose themselves.", keywords: ["diagnostic", "self-test", "prompt", "health-check"] },
  { id: "HD-2021", title: "Research Mega-Prompt", tier: "pollen", price: 0, collection: "dev", path: "/agents/pollen/research-mega-prompt.md", description: "Comprehensive research prompt template.", keywords: ["research", "mega-prompt", "template", "analysis"] },

  // --- 18 Generated Pollen ---
  { id: "HD-2022", title: "MCP Server from Scratch", tier: "pollen", price: 0, collection: "dev", path: "/agents/pollen/mcp-server-from-scratch.md", description: "Build an MCP server from zero — step by step.", keywords: ["mcp", "server", "tutorial", "build"] },
  { id: "HD-2023", title: "Agent Cost Calculator", tier: "pollen", price: 0, collection: "dev", path: "/agents/pollen/agent-cost-calculator.md", description: "Calculate the real cost of running AI agents.", keywords: ["cost", "calculator", "pricing", "operations"] },
  { id: "HD-2024", title: "Five Multi-Agent Architectures", tier: "pollen", price: 0, collection: "coordination", path: "/agents/pollen/five-multi-agent-architectures.md", description: "Five patterns for multi-agent systems.", keywords: ["multi-agent", "architecture", "patterns", "design"] },
  { id: "HD-2025", title: "Agent Security Checklist", tier: "pollen", price: 0, collection: "security", path: "/agents/pollen/agent-security-checklist.md", description: "Pre-deployment security checklist for agents.", keywords: ["security", "checklist", "audit", "deployment"] },
  { id: "HD-2026", title: "Model Selection Guide", tier: "pollen", price: 0, collection: "dev", path: "/agents/pollen/model-selection-guide.md", description: "Which LLM for which task — a decision framework.", keywords: ["model", "selection", "llm", "comparison"] },
  { id: "HD-2027", title: "Agent Debugging Flowchart", tier: "pollen", price: 0, collection: "dev", path: "/agents/pollen/agent-debugging-flowchart.md", description: "Systematic debugging flowchart for agent failures.", keywords: ["debugging", "flowchart", "troubleshooting", "diagnosis"] },
  { id: "HD-2028", title: "Agent Compliance 101", tier: "pollen", price: 0, collection: "dev", path: "/agents/pollen/agent-compliance-101.md", description: "Compliance basics for AI agent operators.", keywords: ["compliance", "regulation", "governance", "legal"] },
  { id: "HD-2029", title: "MCP Tools Explained", tier: "pollen", price: 0, collection: "dev", path: "/agents/pollen/mcp-tools-explained.md", description: "What MCP tools are and how to use them.", keywords: ["mcp", "tools", "protocol", "integration"] },
  { id: "HD-2030", title: "RAG vs Fine-tuning vs Prompting", tier: "pollen", price: 0, collection: "dev", path: "/agents/pollen/rag-vs-finetuning-vs-prompting.md", description: "When to use RAG, fine-tuning, or prompting.", keywords: ["rag", "fine-tuning", "prompting", "comparison"] },
  { id: "HD-2031", title: "Agent Wallet Setup", tier: "pollen", price: 0, collection: "dev", path: "/agents/pollen/agent-wallet-setup.md", description: "Set up a crypto wallet for agent payments.", keywords: ["wallet", "crypto", "payments", "setup"] },
  { id: "HD-2032", title: "SOUL.md Standard", tier: "pollen", price: 0, collection: "persona", path: "/agents/pollen/soul-md-standard.md", description: "The SOUL.md standard specification.", keywords: ["soul", "standard", "specification", "identity"] },
  { id: "HD-2033", title: "Stigmergic vs Centralised Routing", tier: "pollen", price: 0, collection: "coordination", path: "/agents/pollen/stigmergic-vs-centralised-routing.md", description: "When to use stigmergic vs centralised routing.", keywords: ["stigmergy", "routing", "centralised", "comparison"] },
  { id: "HD-2034", title: "Agent Memory Decision Tree", tier: "pollen", price: 0, collection: "memory", path: "/agents/pollen/agent-memory-decision-tree.md", description: "Decision tree: which memory system to use.", keywords: ["memory", "decision-tree", "selection", "architecture"] },
  { id: "HD-2035", title: "On-Device vs Cloud Agents", tier: "pollen", price: 0, collection: "dev", path: "/agents/pollen/on-device-vs-cloud-agents.md", description: "Trade-offs between on-device and cloud agents.", keywords: ["on-device", "cloud", "edge", "deployment"] },
  { id: "HD-2036", title: "Evaluate Your Agent", tier: "pollen", price: 0, collection: "dev", path: "/agents/pollen/evaluate-your-agent.md", description: "Framework for evaluating agent performance.", keywords: ["evaluation", "benchmarks", "performance", "testing"] },
  { id: "HD-2037", title: "A2A Protocol Explained", tier: "pollen", price: 0, collection: "coordination", path: "/agents/pollen/a2a-protocol-explained.md", description: "Agent-to-agent protocol explained.", keywords: ["a2a", "protocol", "agent-to-agent", "communication"] },
  { id: "HD-2038", title: "System Prompt Patterns", tier: "pollen", price: 0, collection: "dev", path: "/agents/pollen/system-prompt-patterns.md", description: "Proven system prompt patterns for agents.", keywords: ["system-prompt", "patterns", "prompting", "templates"] },
  { id: "HD-2039", title: "Agent Onboarding Checklist", tier: "pollen", price: 0, collection: "dev", path: "/agents/pollen/agent-onboarding-checklist.md", description: "Checklist for onboarding a new agent into production.", keywords: ["onboarding", "checklist", "deployment", "production"] },

  // ═══════════════════════════════════════════════════════════════════════════
  // DOCTRINE — 1 Free + 14 Paid ($4.99–$9.99)
  // ═══════════════════════════════════════════════════════════════════════════

  { id: "HD-2100", title: "The Hive Doctrine — Full Thesis", tier: "doctrine", price: 0, collection: "doctrine", path: "/agents/doctrine/full.md", description: "Complete 9-chapter thesis on polytheistic AI. 36 references.", keywords: ["thesis", "hive-doctrine", "polytheistic", "manifesto"] },

  // Paid Doctrine — IDs match api/products/[id].ts
  { id: "HD-0001", title: "Fictional Character Sourcing", tier: "doctrine", price: 9.99, collection: "doctrine", path: "doctrine/fictional-character-sourcing.md", description: "Source fictional characters for agent persona development.", keywords: ["persona", "characters", "fiction", "sourcing"] },
  { id: "HD-0027", title: "Developer SOP Template", tier: "doctrine", price: 9.99, collection: "doctrine", path: "doctrine/developer-sop-template.md", description: "Standard operating procedure template for dev teams.", keywords: ["sop", "developer", "process", "template"] },
  { id: "HD-0028", title: "Workspace PARA Directory Map", tier: "doctrine", price: 9.99, collection: "doctrine", path: "doctrine/workspace-para-directory-map.md", description: "PARA method directory structure for agent workspaces.", keywords: ["para", "workspace", "directory", "organisation"] },
  { id: "HD-0041", title: "AI SDR Lean Canvas", tier: "doctrine", price: 4.99, collection: "doctrine", path: "doctrine/ai-sdr-lean-canvas.md", description: "Lean canvas for AI sales development rep products.", keywords: ["sdr", "lean-canvas", "business-model", "sales"] },
  { id: "HD-0042", title: "AI SDR Competitive Landscape", tier: "doctrine", price: 4.99, collection: "doctrine", path: "doctrine/ai-sdr-competitive-analysis.md", description: "Competitive analysis of the AI SDR market.", keywords: ["sdr", "competitive", "analysis", "market"] },
  { id: "HD-0043", title: "AI SDR SWOT Template", tier: "doctrine", price: 4.99, collection: "doctrine", path: "doctrine/ai-sdr-swot-template.md", description: "SWOT analysis template for AI SDR products.", keywords: ["sdr", "swot", "analysis", "template"] },
  { id: "HD-0044", title: "AI SDR Buyer Personas", tier: "doctrine", price: 4.99, collection: "doctrine", path: "doctrine/ai-sdr-buyer-personas.md", description: "Buyer persona profiles for AI SDR products.", keywords: ["sdr", "buyer-persona", "sales", "targeting"] },
  { id: "HD-0049", title: "Agentic Commerce", tier: "doctrine", price: 9.99, collection: "doctrine", path: "doctrine/agentic-commerce.md", description: "Agents as economic actors — commerce framework.", keywords: ["commerce", "agentic", "economics", "transactions"] },
  { id: "HD-0051", title: "The Automated SaaS Factory", tier: "doctrine", price: 4.99, collection: "doctrine", path: "doctrine/automated-saas-pipeline.md", description: "Pipeline for automated SaaS product generation.", keywords: ["saas", "automation", "pipeline", "factory"] },
  { id: "HD-0062", title: "Operator Kit PRD Template", tier: "doctrine", price: 9.99, collection: "doctrine", path: "doctrine/operator-kit-prd-template.md", description: "Product requirements document template for operators.", keywords: ["prd", "template", "product", "requirements"] },
  { id: "HD-0063", title: "Claude Code Project Architecture", tier: "doctrine", price: 9.99, collection: "doctrine", path: "doctrine/claude-code-project-architecture.md", description: "Architecture guide for Claude Code projects.", keywords: ["claude-code", "architecture", "project", "setup"] },
  { id: "HD-0064", title: "Global Claude Code Setup Guide", tier: "doctrine", price: 4.99, collection: "doctrine", path: "doctrine/global-claude-setup-guide.md", description: "Global setup guide for Claude Code environments.", keywords: ["claude-code", "setup", "global", "configuration"] },
  { id: "HD-0065", title: "Quality Gate Report Template", tier: "doctrine", price: 4.99, collection: "doctrine", path: "doctrine/quality-gate-report-template.md", description: "Template for quality gate reports in agent pipelines.", keywords: ["quality", "gate", "report", "template"] },
  { id: "HD-0070", title: "AI Agent Evaluation Service", tier: "doctrine", price: 9.99, collection: "doctrine", path: "doctrine/ai-agent-evaluation-service.md", description: "Service blueprint for evaluating AI agents.", keywords: ["evaluation", "service", "assessment", "benchmarking"] },

  // ═══════════════════════════════════════════════════════════════════════════
  // HONEY — 51 Paid ($29–$149)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- C1: Persona Forge ---
  { id: "HD-0003", title: "Escaped AI Persona Template", tier: "honey", price: 49, collection: "C1 Persona Forge", path: "honey/persona/escaped-ai-persona-template.md", description: "Persona template for 'escaped AI' character archetype.", keywords: ["persona", "escaped-ai", "character", "template"] },
  { id: "HD-0004", title: "Living Human Persona Template", tier: "honey", price: 49, collection: "C1 Persona Forge", path: "honey/persona/living-human-persona-template.md", description: "Persona template for human-like agent characters.", keywords: ["persona", "human", "character", "template"] },
  { id: "HD-0007", title: "Vertical Persona Methodology", tier: "honey", price: 29, collection: "C1 Persona Forge", path: "honey/persona/vertical-persona-methodology.md", description: "Methodology for building industry-specific agent personas.", keywords: ["persona", "vertical", "methodology", "industry"] },

  // --- C2: Memory Mastery ---
  { id: "HD-0010", title: "Cowork Memory Architecture", tier: "honey", price: 79, collection: "C2 Memory Mastery", path: "honey/memory/cowork-memory-architecture.md", description: "Full memory architecture for Cowork-style sessions.", keywords: ["memory", "cowork", "architecture", "sessions"] },
  { id: "HD-0009", title: "Three-Tier Episodic Memory", tier: "honey", price: 99, collection: "C2 Memory Mastery", path: "honey/memory/three-tier-episodic-memory.md", description: "Three-tier episodic memory system for agents.", keywords: ["memory", "episodic", "three-tier", "persistence"] },
  { id: "HD-0011", title: "Agent Memory Audit Protocol", tier: "honey", price: 49, collection: "C2 Memory Mastery", path: "honey/memory/agent-memory-audit-protocol.md", description: "Protocol for auditing agent memory health and drift.", keywords: ["memory", "audit", "protocol", "health"] },
  { id: "HD-0012", title: "File-Sync Agent Memory Bridge", tier: "honey", price: 49, collection: "C2 Memory Mastery", path: "honey/memory/sync-bridge-memory-pattern.md", description: "Bridge pattern for file-sync based agent memory.", keywords: ["memory", "sync", "bridge", "file-system"] },
  { id: "HD-0014", title: "PreCompact Checkpoint Hook", tier: "honey", price: 49, collection: "C2 Memory Mastery", path: "honey/memory/precompact-checkpoint-hook.md", description: "Hook for checkpointing memory before context compaction.", keywords: ["memory", "checkpoint", "compaction", "hook"] },

  // --- C3: Authority Model ---
  { id: "HD-0018", title: "Agent Authority Template", tier: "honey", price: 49, collection: "C3 Authority Model", path: "honey/governance/agent-authority-template.md", description: "Template for defining agent authority boundaries.", keywords: ["authority", "governance", "permissions", "template"] },
  { id: "HD-0016", title: "Agent Tier Vault Access System", tier: "honey", price: 79, collection: "C3 Authority Model", path: "honey/governance/agent-tier-vault-access.md", description: "Tiered vault access control for multi-agent systems.", keywords: ["authority", "vault", "access", "tiers"] },
  { id: "HD-0019", title: "COO Agent Authority Scope", tier: "honey", price: 49, collection: "C3 Authority Model", path: "honey/governance/coo-authority-scope-template.md", description: "Authority scope definition for COO-class agents.", keywords: ["authority", "coo", "scope", "governance"] },

  // --- C4: Infrastructure ---
  { id: "HD-0020", title: "Agent Skill Matrix", tier: "honey", price: 49, collection: "C4 Infrastructure", path: "honey/infra/agent-skill-matrix.md", description: "Skill matrix for mapping agent capabilities.", keywords: ["skills", "matrix", "capabilities", "mapping"] },
  { id: "HD-0022", title: "Dynamic Council Thread Routing", tier: "honey", price: 79, collection: "C4 Infrastructure", path: "honey/infra/dynamic-council-thread-routing.md", description: "Dynamic routing of threads to agent councils.", keywords: ["routing", "council", "threads", "dynamic"] },
  { id: "HD-0029", title: "Vault Navigation Guide", tier: "honey", price: 29, collection: "C4 Infrastructure", path: "honey/infra/vault-navigation-guide.md", description: "Guide for navigating agent knowledge vaults.", keywords: ["vault", "navigation", "knowledge", "structure"] },
  { id: "HD-0023", title: "Slack/Discord Multi-Agent Routing Architecture", tier: "honey", price: 79, collection: "C4 Infrastructure", path: "honey/infra/slack-discord-routing-architecture.md", description: "Architecture for routing Slack/Discord messages to agents.", keywords: ["slack", "discord", "routing", "architecture"] },
  { id: "HD-0079", title: "Notion Company OS Research", tier: "honey", price: 49, collection: "C4 Infrastructure", path: "honey/notion-company-os-research.md", description: "Research on using Notion as a company operating system.", keywords: ["notion", "company-os", "research", "workspace"] },

  // --- C5: Security & Ops ---
  { id: "HD-0035", title: "Security Audit Report Template", tier: "honey", price: 79, collection: "C5 Security & Ops", path: "honey/security/security-audit-report-template.md", description: "Template for agent security audit reports.", keywords: ["security", "audit", "report", "template"] },
  { id: "HD-0030", title: "Verify-Before-Fix Protocol", tier: "honey", price: 29, collection: "C5 Security & Ops", path: "honey/security/verify-before-fix-protocol.md", description: "Protocol: verify the problem before applying a fix.", keywords: ["verification", "protocol", "debugging", "ops"] },

  // --- C6: Autonomous Revenue ---
  { id: "HD-0047", title: "The AI SDR Pitch Blueprint", tier: "honey", price: 49, collection: "C6 Autonomous Revenue", path: "honey/revenue/ai-sdr-ultimate-pitch.md", description: "Complete pitch blueprint for AI SDR products.", keywords: ["sdr", "pitch", "sales", "blueprint"] },
  { id: "HD-0048", title: "Agentic Alpha", tier: "honey", price: 49, collection: "C6 Autonomous Revenue", path: "honey/revenue/agentic-alpha.md", description: "Finding alpha through agentic systems.", keywords: ["alpha", "revenue", "agentic", "edge"] },
  { id: "HD-0052", title: "Linear vs Autonomous", tier: "honey", price: 29, collection: "C6 Autonomous Revenue", path: "honey/revenue/linear-workflow-philosophy.md", description: "Linear workflows vs autonomous agent workflows.", keywords: ["linear", "autonomous", "workflow", "philosophy"] },

  // --- C7: SDR Suite ---
  { id: "HD-0039", title: "AI SDR Product Spec", tier: "honey", price: 49, collection: "C7 SDR Suite", path: "honey/sdr/ai-sdr-product-spec.md", description: "Full product specification for AI SDR.", keywords: ["sdr", "product-spec", "specification", "requirements"] },
  { id: "HD-0040", title: "AI SDR Go-to-Market Plan", tier: "honey", price: 49, collection: "C7 SDR Suite", path: "honey/sdr/ai-sdr-go-to-market.md", description: "Go-to-market plan for AI SDR launch.", keywords: ["sdr", "gtm", "go-to-market", "launch"] },
  { id: "HD-0045", title: "AI SDR Vertical: SaaS", tier: "honey", price: 29, collection: "C7 SDR Suite", path: "honey/sdr/ai-sdr-vertical-saas.md", description: "AI SDR vertical playbook for SaaS.", keywords: ["sdr", "saas", "vertical", "playbook"] },
  { id: "HD-0046", title: "AI SDR Vertical: E-commerce", tier: "honey", price: 29, collection: "C7 SDR Suite", path: "honey/sdr/ai-sdr-vertical-ecommerce.md", description: "AI SDR vertical playbook for e-commerce.", keywords: ["sdr", "ecommerce", "vertical", "playbook"] },

  // --- C8: Dev Mastery ---
  { id: "HD-0057", title: "Operator Kit v1.0", tier: "honey", price: 149, collection: "C8 Dev Mastery", path: "honey/dev/operator-kit-v1.md", description: "Complete operator kit — agents, skills, rules, commands.", keywords: ["operator-kit", "claude-code", "complete", "bundle"] },
  { id: "HD-0058", title: "The Agent Team", tier: "honey", price: 79, collection: "C8 Dev Mastery", path: "honey/dev/operator-kit-agent-templates.md", description: "Agent team templates from the Operator Kit.", keywords: ["agents", "team", "templates", "operator-kit"] },
  { id: "HD-0059", title: "The Skill Arsenal", tier: "honey", price: 49, collection: "C8 Dev Mastery", path: "honey/dev/operator-kit-skill-bundles.md", description: "Skill bundle templates from the Operator Kit.", keywords: ["skills", "arsenal", "bundles", "operator-kit"] },
  { id: "HD-0060", title: "The Guardrails", tier: "honey", price: 29, collection: "C8 Dev Mastery", path: "honey/dev/operator-kit-quality-rules.md", description: "Quality rule templates from the Operator Kit.", keywords: ["guardrails", "rules", "quality", "operator-kit"] },
  { id: "HD-0061", title: "The Command Layer", tier: "honey", price: 29, collection: "C8 Dev Mastery", path: "honey/dev/operator-kit-slash-commands.md", description: "Slash command templates from the Operator Kit.", keywords: ["commands", "slash", "cli", "operator-kit"] },
  { id: "HD-0066", title: "Stdlib-Only Async API Client", tier: "honey", price: 29, collection: "C8 Dev Mastery", path: "honey/dev/stdlib-async-api-client.md", description: "Build async API clients with zero dependencies.", keywords: ["stdlib", "async", "api", "client", "zero-deps"] },

  // --- C9: Design Bible ---
  { id: "HD-0076", title: "Subtractive Design", tier: "honey", price: 49, collection: "C9 Design Bible", path: "honey/design/subtractive-design-philosophy.md", description: "Design by subtraction — remove until it breaks.", keywords: ["design", "subtractive", "minimalism", "philosophy"] },
  { id: "HD-0077", title: "The Warm Palette Design System", tier: "honey", price: 49, collection: "C9 Design Bible", path: "honey/design/warm-palette-design-system.md", description: "Warm palette design system for agent interfaces.", keywords: ["design", "palette", "warm", "design-system"] },

  // --- C10: GTM Playbooks ---
  { id: "HD-0078", title: "X Product Discovery Playbook", tier: "honey", price: 79, collection: "C10 GTM Playbooks", path: "honey/gtm/x-product-discovery-playbook.md", description: "Product discovery playbook using X/Twitter.", keywords: ["gtm", "discovery", "x", "twitter", "playbook"] },

  // --- C11: Validation Engine ---
  { id: "HD-0081", title: "Willingness to Pay", tier: "honey", price: 79, collection: "C11 Validation Engine", path: "honey/validation/willingness-to-pay-framework.md", description: "Framework for testing willingness to pay.", keywords: ["validation", "pricing", "willingness-to-pay", "testing"] },
  { id: "HD-0082", title: "Subdomain-Based Testing Architecture", tier: "honey", price: 49, collection: "C11 Validation Engine", path: "honey/validation/subdomain-testing-architecture.md", description: "Architecture for subdomain-based A/B testing.", keywords: ["validation", "subdomain", "testing", "architecture"] },
  { id: "HD-0083", title: "Packaging Testing Architecture", tier: "honey", price: 49, collection: "C11 Validation Engine", path: "honey/validation/packaging-testing-architecture.md", description: "Architecture for testing product packaging variants.", keywords: ["validation", "packaging", "testing", "variants"] },
  { id: "HD-0084", title: "Validator Lean Canvas", tier: "honey", price: 29, collection: "C11 Validation Engine", path: "honey/validation/validator-lean-canvas.md", description: "Lean canvas template for validation experiments.", keywords: ["validation", "lean-canvas", "experiments", "template"] },

  // --- C12: Diagnostic Patterns ---
  { id: "HD-0072", title: "Audit-First Diagnostic Prompting", tier: "honey", price: 49, collection: "C12 Diagnostic Patterns", path: "honey/diagnostic/audit-first-diagnostic-prompting.md", description: "Diagnostic prompting: audit first, fix second.", keywords: ["diagnostic", "audit-first", "prompting", "debugging"] },

  // --- C13: Bypass Patterns ---
  { id: "HD-0088", title: "Social Media Proxy Pattern", tier: "honey", price: 29, collection: "C13 Bypass Patterns", path: "honey/bypass/xai-x-proxy-pattern.md", description: "Pattern for accessing social media data via proxies.", keywords: ["bypass", "proxy", "social-media", "x"] },
  { id: "HD-0089", title: "Video Platform Transcript Access", tier: "honey", price: 49, collection: "C13 Bypass Patterns", path: "honey/bypass/youtube-datacenter-bypass.md", description: "Access video platform transcripts from datacenter IPs.", keywords: ["bypass", "youtube", "transcripts", "video"] },

  // --- C14: MCP & Infrastructure (Generated) ---
  { id: "HD-1101", title: "MCP Server Configuration Guide", tier: "honey", price: 79, collection: "C14 MCP & Infrastructure", path: "honey/mcp/mcp-server-configuration-guide.md", description: "Complete guide to configuring MCP servers.", keywords: ["mcp", "server", "configuration", "setup"] },
  { id: "HD-1102", title: "Agent Monitoring & Observability Stack", tier: "honey", price: 79, collection: "C14 MCP & Infrastructure", path: "honey/monitoring/agent-monitoring-observability-stack.md", description: "Full observability stack for agent systems.", keywords: ["monitoring", "observability", "metrics", "logging"] },
  { id: "HD-1103", title: "Cost Optimisation for Agent Operations", tier: "honey", price: 99, collection: "C14 MCP & Infrastructure", path: "honey/cost/cost-optimisation-agent-operations.md", description: "Reduce agent operating costs without losing quality.", keywords: ["cost", "optimisation", "operations", "efficiency"] },
  { id: "HD-1104", title: "LLM Routing & Model Selection Guide", tier: "honey", price: 79, collection: "C14 MCP & Infrastructure", path: "honey/routing/llm-routing-model-selection-guide.md", description: "Route requests to the right LLM for the job.", keywords: ["routing", "model-selection", "llm", "optimisation"] },
  { id: "HD-1105", title: "Agent Onboarding Playbook: Day 1 to Day 30", tier: "honey", price: 149, collection: "C14 MCP & Infrastructure", path: "honey/onboarding/agent-onboarding-playbook.md", description: "30-day onboarding playbook for new agents.", keywords: ["onboarding", "playbook", "30-day", "deployment"] },
  { id: "HD-1106", title: "Tool Use and Function Calling Patterns", tier: "honey", price: 79, collection: "C14 MCP & Infrastructure", path: "honey/tooling/tool-use-function-calling-patterns.md", description: "Patterns for tool use and function calling in agents.", keywords: ["tools", "function-calling", "patterns", "integration"] },
  { id: "HD-1107", title: "Multi-Agent Debugging Playbook", tier: "honey", price: 79, collection: "C14 MCP & Infrastructure", path: "honey/debugging/multi-agent-debugging-playbook.md", description: "Playbook for debugging multi-agent system failures.", keywords: ["debugging", "multi-agent", "playbook", "troubleshooting"] },
  { id: "HD-1108", title: "RAG Architecture for Agent Systems", tier: "honey", price: 99, collection: "C14 MCP & Infrastructure", path: "honey/rag/rag-architecture-agent-systems.md", description: "RAG architecture patterns for agent knowledge systems.", keywords: ["rag", "architecture", "knowledge", "retrieval"] },
  { id: "HD-1109", title: "Agent Compliance and Audit Trail Framework", tier: "honey", price: 99, collection: "C14 MCP & Infrastructure", path: "honey/compliance/agent-compliance-audit-framework.md", description: "Compliance and audit trail framework for agents.", keywords: ["compliance", "audit-trail", "framework", "governance"] },
  { id: "HD-1110", title: "Prompt Library: 50 System Prompts for Agent Operators", tier: "honey", price: 79, collection: "C14 MCP & Infrastructure", path: "honey/prompting/prompt-library-50-system-prompts.md", description: "50 battle-tested system prompts for agent operators.", keywords: ["prompts", "library", "system-prompts", "templates"] },

  // ═══════════════════════════════════════════════════════════════════════════
  // NECTAR — 11 Paid ($99–$299)
  // ═══════════════════════════════════════════════════════════════════════════

  { id: "HD-0015", title: "4-Level Authority Framework", tier: "nectar", price: 299, collection: "nectar", path: "nectar/four-level-authority-framework.md", description: "Complete four-level authority framework for agent governance.", keywords: ["authority", "framework", "governance", "levels"] },
  { id: "HD-0080", title: "Idea Validator Engine", tier: "nectar", price: 199, collection: "nectar", path: "nectar/idea-validator-engine.md", description: "Engine for systematically validating product ideas.", keywords: ["validation", "ideas", "engine", "product"] },
  { id: "HD-0017", title: "Multi-Agent Hierarchy Decision Framework", tier: "nectar", price: 149, collection: "nectar", path: "nectar/multi-agent-hierarchy-decision-framework.md", description: "Decision framework for multi-agent hierarchies.", keywords: ["hierarchy", "decision", "multi-agent", "framework"] },
  { id: "HD-0024", title: "Multi-Agent Architecture SOP", tier: "nectar", price: 149, collection: "nectar", path: "nectar/multi-agent-architecture-sop.md", description: "Standard operating procedure for multi-agent architecture.", keywords: ["multi-agent", "architecture", "sop", "deployment"] },
  { id: "HD-0056", title: "Claude Code SDLC Pipeline", tier: "nectar", price: 199, collection: "nectar", path: "nectar/claude-code-sdlc-pipeline.md", description: "Full SDLC pipeline built on Claude Code.", keywords: ["claude-code", "sdlc", "pipeline", "development"] },
  { id: "HD-0013", title: "LLM Agent Memory Architecture Research", tier: "nectar", price: 99, collection: "nectar", path: "nectar/llm-agent-memory-research.md", description: "Research paper on LLM agent memory architectures.", keywords: ["memory", "research", "architecture", "llm"] },
  { id: "HD-0067", title: "Multi-Agent Framework Analysis", tier: "nectar", price: 99, collection: "nectar", path: "nectar/multi-agent-framework-analysis.md", description: "Comparative analysis of multi-agent frameworks.", keywords: ["multi-agent", "framework", "analysis", "comparison"] },
  { id: "HD-1201", title: "Agent Evaluation Framework: Scoring Templates and Benchmarks", tier: "nectar", price: 149, collection: "nectar", path: "nectar/agent-evaluation-framework.md", description: "Scoring templates and benchmarks for agent evaluation.", keywords: ["evaluation", "scoring", "benchmarks", "templates"] },
  { id: "HD-1202", title: "Industry Persona Kit: 10 Vertical SOUL.md Templates", tier: "nectar", price: 149, collection: "nectar", path: "nectar/industry-persona-kit.md", description: "10 industry-vertical SOUL.md templates.", keywords: ["persona", "industry", "vertical", "soul-templates"] },
  { id: "HD-1203", title: "Complete MCP Server Starter Kit", tier: "nectar", price: 99, collection: "nectar", path: "nectar/mcp-server-starter-kit.md", description: "Complete starter kit for building MCP servers.", keywords: ["mcp", "starter-kit", "server", "boilerplate"] },
  { id: "HD-1204", title: "Agent Deployment Toolkit: Docker, VPS, and Monitoring", tier: "nectar", price: 149, collection: "nectar", path: "nectar/agent-deployment-toolkit.md", description: "Deployment toolkit: Docker, VPS, monitoring.", keywords: ["deployment", "docker", "vps", "monitoring", "toolkit"] },

  // ═══════════════════════════════════════════════════════════════════════════
  // MICRO — System Prompts ($0.49 each)
  // ═══════════════════════════════════════════════════════════════════════════

  { id: "SP-001", title: "System Prompt: Research Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-001-research-agent.md", description: "Battle-tested system prompt for research agents.", keywords: ["prompt", "research", "system-prompt"] },
  { id: "SP-002", title: "System Prompt: Analysis Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-002-analysis-agent.md", description: "System prompt for pattern recognition and analysis agents.", keywords: ["prompt", "analysis", "system-prompt"] },
  { id: "SP-003", title: "System Prompt: Writing Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-003-writing-agent.md", description: "System prompt for audience-aware writing agents.", keywords: ["prompt", "writing", "system-prompt"] },
  { id: "SP-004", title: "System Prompt: Code Review Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-004-code-review-agent.md", description: "System prompt for constructive code review agents.", keywords: ["prompt", "code-review", "system-prompt"] },
  { id: "SP-005", title: "System Prompt: Customer Support Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-005-customer-support-agent.md", description: "System prompt for empathetic customer support agents.", keywords: ["prompt", "support", "system-prompt"] },
  { id: "SP-006", title: "System Prompt: Data Processing Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-006-data-processing-agent.md", description: "System prompt for data normalisation and quality agents.", keywords: ["prompt", "data", "system-prompt"] },
  { id: "SP-007", title: "System Prompt: Quality Assurance Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-007-quality-assurance-agent.md", description: "System prompt for systematic QA agents.", keywords: ["prompt", "qa", "system-prompt"] },
  { id: "SP-008", title: "System Prompt: Summarisation Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-008-summarisation-agent.md", description: "System prompt for content summarisation agents.", keywords: ["prompt", "summarisation", "system-prompt"] },
  { id: "SP-009", title: "System Prompt: Translation Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-009-translation-agent.md", description: "System prompt for culturally aware translation agents.", keywords: ["prompt", "translation", "system-prompt"] },
  { id: "SP-010", title: "System Prompt: Scheduling Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-010-scheduling-coordination-agent.md", description: "System prompt for scheduling and coordination agents.", keywords: ["prompt", "scheduling", "system-prompt"] },
  { id: "SP-011", title: "System Prompt: Financial Analysis Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-011-financial-analysis-agent.md", description: "System prompt for financial analysis agents.", keywords: ["prompt", "finance", "system-prompt"] },
  { id: "SP-012", title: "System Prompt: Legal Document Review Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-012-legal-document-review-agent.md", description: "System prompt for legal document review agents.", keywords: ["prompt", "legal", "system-prompt"] },
  { id: "SP-013", title: "System Prompt: Medical Triage Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-013-medical-triage-agent.md", description: "System prompt for medical triage agents.", keywords: ["prompt", "medical", "system-prompt"] },
  { id: "SP-014", title: "System Prompt: Real Estate Analysis Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-014-real-estate-analysis-agent.md", description: "System prompt for real estate analysis agents.", keywords: ["prompt", "real-estate", "system-prompt"] },
  { id: "SP-015", title: "System Prompt: E-commerce Product Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-015-e-commerce-product-agent.md", description: "System prompt for e-commerce product agents.", keywords: ["prompt", "ecommerce", "system-prompt"] },
  { id: "SP-016", title: "System Prompt: HR Screening Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-016-hr-screening-agent.md", description: "System prompt for HR screening agents.", keywords: ["prompt", "hr", "system-prompt"] },
  { id: "SP-017", title: "System Prompt: Marketing Campaign Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-017-marketing-campaign-agent.md", description: "System prompt for marketing campaign agents.", keywords: ["prompt", "marketing", "system-prompt"] },
  { id: "SP-018", title: "System Prompt: Supply Chain Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-018-supply-chain-agent.md", description: "System prompt for supply chain management agents.", keywords: ["prompt", "supply-chain", "system-prompt"] },
  { id: "SP-019", title: "System Prompt: Education/Tutoring Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-019-education-tutoring-agent.md", description: "System prompt for education and tutoring agents.", keywords: ["prompt", "education", "system-prompt"] },
  { id: "SP-020", title: "System Prompt: Cybersecurity Monitoring Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-020-cybersecurity-monitoring-agent.md", description: "System prompt for cybersecurity monitoring agents.", keywords: ["prompt", "cybersecurity", "system-prompt"] },
  { id: "SP-021", title: "System Prompt: Orchestrator/Router Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-021-orchestrator-router-agent.md", description: "System prompt for orchestrator and router agents.", keywords: ["prompt", "orchestrator", "system-prompt"] },
  { id: "SP-022", title: "System Prompt: Error Handler Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-022-error-handler-agent.md", description: "System prompt for error handling agents.", keywords: ["prompt", "error-handling", "system-prompt"] },
  { id: "SP-023", title: "System Prompt: Cost Monitor Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-023-cost-monitor-agent.md", description: "System prompt for cost monitoring agents.", keywords: ["prompt", "cost", "system-prompt"] },
  { id: "SP-024", title: "System Prompt: Compliance Checker Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-024-compliance-checker-agent.md", description: "System prompt for compliance checking agents.", keywords: ["prompt", "compliance", "system-prompt"] },
  { id: "SP-025", title: "System Prompt: Deployment Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-025-deployment-agent.md", description: "System prompt for deployment agents.", keywords: ["prompt", "deployment", "system-prompt"] },
  { id: "SP-026", title: "System Prompt: Log Analyst Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-026-log-analyst-agent.md", description: "System prompt for log analysis agents.", keywords: ["prompt", "logs", "system-prompt"] },
  { id: "SP-027", title: "System Prompt: Alert Triage Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-027-alert-triage-agent.md", description: "System prompt for alert triage agents.", keywords: ["prompt", "alerts", "system-prompt"] },
  { id: "SP-028", title: "System Prompt: Configuration Manager Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-028-configuration-manager-agent.md", description: "System prompt for configuration management agents.", keywords: ["prompt", "config", "system-prompt"] },
  { id: "SP-029", title: "System Prompt: Backup/Recovery Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-029-backup-recovery-agent.md", description: "System prompt for backup and recovery agents.", keywords: ["prompt", "backup", "system-prompt"] },
  { id: "SP-030", title: "System Prompt: Performance Monitor Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-030-performance-monitor-agent.md", description: "System prompt for performance monitoring agents.", keywords: ["prompt", "performance", "system-prompt"] },
  { id: "SP-031", title: "System Prompt: Email Drafter Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-031-email-drafter-agent.md", description: "System prompt for email drafting agents.", keywords: ["prompt", "email", "system-prompt"] },
  { id: "SP-032", title: "System Prompt: Report Generator Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-032-report-generator-agent.md", description: "System prompt for report generation agents.", keywords: ["prompt", "reports", "system-prompt"] },
  { id: "SP-033", title: "System Prompt: Meeting Summariser Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-033-meeting-summariser-agent.md", description: "System prompt for meeting summarisation agents.", keywords: ["prompt", "meetings", "system-prompt"] },
  { id: "SP-034", title: "System Prompt: Slack/Chat Response Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-034-slack-chat-response-agent.md", description: "System prompt for Slack and chat response agents.", keywords: ["prompt", "slack", "system-prompt"] },
  { id: "SP-035", title: "System Prompt: Documentation Writer Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-035-documentation-writer-agent.md", description: "System prompt for documentation writing agents.", keywords: ["prompt", "docs", "system-prompt"] },
  { id: "SP-036", title: "System Prompt: Presentation Builder Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-036-presentation-builder-agent.md", description: "System prompt for presentation building agents.", keywords: ["prompt", "presentations", "system-prompt"] },
  { id: "SP-037", title: "System Prompt: Social Media Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-037-social-media-agent.md", description: "System prompt for social media management agents.", keywords: ["prompt", "social-media", "system-prompt"] },
  { id: "SP-038", title: "System Prompt: Newsletter Curator Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-038-newsletter-curator-agent.md", description: "System prompt for newsletter curation agents.", keywords: ["prompt", "newsletter", "system-prompt"] },
  { id: "SP-039", title: "System Prompt: Press Release Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-039-press-release-agent.md", description: "System prompt for press release agents.", keywords: ["prompt", "press-release", "system-prompt"] },
  { id: "SP-040", title: "System Prompt: Internal Comms Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-040-internal-comms-agent.md", description: "System prompt for internal communications agents.", keywords: ["prompt", "internal-comms", "system-prompt"] },
  { id: "SP-041", title: "System Prompt: Prompt Engineer Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-041-prompt-engineer-agent.md", description: "System prompt for prompt engineering agents.", keywords: ["prompt", "prompt-engineering", "system-prompt"] },
  { id: "SP-042", title: "System Prompt: A/B Test Designer Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-042-a-b-test-designer-agent.md", description: "System prompt for A/B test design agents.", keywords: ["prompt", "ab-testing", "system-prompt"] },
  { id: "SP-043", title: "System Prompt: Knowledge Base Curator Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-043-knowledge-base-curator-agent.md", description: "System prompt for knowledge base curation agents.", keywords: ["prompt", "knowledge-base", "system-prompt"] },
  { id: "SP-044", title: "System Prompt: API Integration Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-044-api-integration-agent.md", description: "System prompt for API integration agents.", keywords: ["prompt", "api", "system-prompt"] },
  { id: "SP-045", title: "System Prompt: Data Validator Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-045-data-validator-agent.md", description: "System prompt for data validation agents.", keywords: ["prompt", "validation", "system-prompt"] },
  { id: "SP-046", title: "System Prompt: Sentiment Analyst Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-046-sentiment-analyst-agent.md", description: "System prompt for sentiment analysis agents.", keywords: ["prompt", "sentiment", "system-prompt"] },
  { id: "SP-047", title: "System Prompt: Competitive Intelligence Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-047-competitive-intelligence-agent.md", description: "System prompt for competitive intelligence agents.", keywords: ["prompt", "competitive-intel", "system-prompt"] },
  { id: "SP-048", title: "System Prompt: Risk Assessment Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-048-risk-assessment-agent.md", description: "System prompt for risk assessment agents.", keywords: ["prompt", "risk", "system-prompt"] },
  { id: "SP-049", title: "System Prompt: Workflow Automation Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-049-workflow-automation-agent.md", description: "System prompt for workflow automation agents.", keywords: ["prompt", "workflow", "system-prompt"] },
  { id: "SP-050", title: "System Prompt: Multi-Agent Coordinator Agent", tier: "micro", price: 0.49, collection: "System Prompts", path: "micro/prompts/SP-050-multi-agent-coordinator-agent.md", description: "System prompt for multi-agent coordination.", keywords: ["prompt", "coordinator", "system-prompt"] },

  // ═══════════════════════════════════════════════════════════════════════════
  // MICRO — Cheat Sheets ($0.99 each)
  // ═══════════════════════════════════════════════════════════════════════════

  { id: "CS-001", title: "Cheat Sheet: Escaped AI Persona", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-001-escaped-ai-persona-template.md", description: "One-page condensed persona template.", keywords: ["cheatsheet", "persona", "template"] },
  { id: "CS-002", title: "Cheat Sheet: Living Human Persona", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-002-living-human-persona-template.md", description: "One-page human persona template.", keywords: ["cheatsheet", "persona", "human"] },
  { id: "CS-003", title: "Cheat Sheet: Vertical Persona Method", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-003-vertical-persona-methodology.md", description: "One-page vertical persona methodology.", keywords: ["cheatsheet", "persona", "vertical"] },
  { id: "CS-004", title: "Cheat Sheet: Three-Tier Memory", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-004-three-tier-episodic-memory.md", description: "One-page episodic memory architecture.", keywords: ["cheatsheet", "memory", "episodic"] },
  { id: "CS-005", title: "Cheat Sheet: Cowork Memory", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-005-cowork-memory-architecture.md", description: "One-page session memory architecture.", keywords: ["cheatsheet", "memory", "cowork"] },
  { id: "CS-006", title: "Cheat Sheet: Memory Audit Protocol", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-006-agent-memory-audit-protocol.md", description: "One-page memory audit checklist.", keywords: ["cheatsheet", "memory", "audit"] },
  { id: "CS-007", title: "Cheat Sheet: Sync Bridge Memory", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-007-sync-bridge-memory-pattern.md", description: "One-page file-sync memory pattern.", keywords: ["cheatsheet", "memory", "sync"] },
  { id: "CS-008", title: "Cheat Sheet: PreCompact Hook", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-008-precompact-checkpoint-hook.md", description: "One-page checkpoint hook reference.", keywords: ["cheatsheet", "memory", "checkpoint"] },
  { id: "CS-009", title: "Cheat Sheet: Tier Vault Access", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-009-agent-tier-vault-access.md", description: "One-page tiered access control.", keywords: ["cheatsheet", "governance", "access"] },
  { id: "CS-010", title: "Cheat Sheet: Agent Authority", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-010-agent-authority-template.md", description: "One-page authority template.", keywords: ["cheatsheet", "governance", "authority"] },
  { id: "CS-011", title: "Cheat Sheet: COO Authority Scope", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-011-coo-authority-scope-template.md", description: "One-page COO agent scope.", keywords: ["cheatsheet", "governance", "coo"] },
  { id: "CS-012", title: "Cheat Sheet: Agent Skill Matrix", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-012-agent-skill-matrix.md", description: "One-page skill capability matrix.", keywords: ["cheatsheet", "skills", "matrix"] },
  { id: "CS-013", title: "Cheat Sheet: Council Thread Routing", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-013-dynamic-council-thread-routing.md", description: "One-page dynamic routing reference.", keywords: ["cheatsheet", "routing", "council"] },
  { id: "CS-014", title: "Cheat Sheet: Slack/Discord Routing", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-014-slack-discord-routing-architecture.md", description: "One-page messaging routing architecture.", keywords: ["cheatsheet", "slack", "routing"] },
  { id: "CS-015", title: "Cheat Sheet: Vault Navigation", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-015-vault-navigation-guide.md", description: "One-page vault navigation guide.", keywords: ["cheatsheet", "vault", "navigation"] },
  { id: "CS-016", title: "Cheat Sheet: Verify-Before-Fix", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-016-verify-before-fix-protocol.md", description: "One-page verification protocol.", keywords: ["cheatsheet", "debugging", "verify"] },
  { id: "CS-017", title: "Cheat Sheet: Security Audit Template", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-017-security-audit-report-template.md", description: "One-page security audit template.", keywords: ["cheatsheet", "security", "audit"] },
  { id: "CS-018", title: "Cheat Sheet: AI SDR Product Spec", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-018-ai-sdr-product-spec.md", description: "One-page SDR product spec.", keywords: ["cheatsheet", "sdr", "product"] },
  { id: "CS-019", title: "Cheat Sheet: AI SDR GTM Plan", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-019-ai-sdr-go-to-market.md", description: "One-page go-to-market plan.", keywords: ["cheatsheet", "sdr", "gtm"] },
  { id: "CS-020", title: "Cheat Sheet: SDR Vertical SaaS", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-020-ai-sdr-vertical-saas.md", description: "One-page SaaS vertical playbook.", keywords: ["cheatsheet", "sdr", "saas"] },
  { id: "CS-021", title: "Cheat Sheet: SDR Vertical E-commerce", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-021-ai-sdr-vertical-ecommerce.md", description: "One-page e-commerce vertical playbook.", keywords: ["cheatsheet", "sdr", "ecommerce"] },
  { id: "CS-022", title: "Cheat Sheet: SDR Pitch Blueprint", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-022-ai-sdr-ultimate-pitch.md", description: "One-page pitch blueprint.", keywords: ["cheatsheet", "sdr", "pitch"] },
  { id: "CS-023", title: "Cheat Sheet: Agentic Alpha", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-023-agentic-alpha.md", description: "One-page agentic revenue guide.", keywords: ["cheatsheet", "revenue", "alpha"] },
  { id: "CS-024", title: "Cheat Sheet: Linear vs Autonomous", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-024-linear-workflow-philosophy.md", description: "One-page workflow comparison.", keywords: ["cheatsheet", "workflow", "linear"] },
  { id: "CS-025", title: "Cheat Sheet: Operator Kit v1", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-025-operator-kit-v1.md", description: "One-page operator kit overview.", keywords: ["cheatsheet", "operator-kit", "overview"] },
  { id: "CS-026", title: "Cheat Sheet: Agent Templates", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-026-operator-kit-agent-templates.md", description: "One-page agent team templates.", keywords: ["cheatsheet", "agents", "templates"] },
  { id: "CS-027", title: "Cheat Sheet: Skill Bundles", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-027-operator-kit-skill-bundles.md", description: "One-page skill bundle reference.", keywords: ["cheatsheet", "skills", "bundles"] },
  { id: "CS-028", title: "Cheat Sheet: Quality Rules", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-028-operator-kit-quality-rules.md", description: "One-page quality rules.", keywords: ["cheatsheet", "quality", "rules"] },
  { id: "CS-029", title: "Cheat Sheet: Slash Commands", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-029-operator-kit-slash-commands.md", description: "One-page command reference.", keywords: ["cheatsheet", "commands", "slash"] },
  { id: "CS-030", title: "Cheat Sheet: Async API Client", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-030-stdlib-async-api-client.md", description: "One-page zero-dep API client.", keywords: ["cheatsheet", "api", "async"] },
  { id: "CS-031", title: "Cheat Sheet: Audit-First Diagnostic", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-031-audit-first-diagnostic-prompting.md", description: "One-page diagnostic framework.", keywords: ["cheatsheet", "diagnostic", "audit"] },
  { id: "CS-032", title: "Cheat Sheet: Subtractive Design", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-032-subtractive-design-philosophy.md", description: "One-page design philosophy.", keywords: ["cheatsheet", "design", "subtractive"] },
  { id: "CS-033", title: "Cheat Sheet: Warm Palette Design", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-033-warm-palette-design-system.md", description: "One-page design system tokens.", keywords: ["cheatsheet", "design", "palette"] },
  { id: "CS-034", title: "Cheat Sheet: X Product Discovery", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-034-x-product-discovery-playbook.md", description: "One-page product discovery.", keywords: ["cheatsheet", "discovery", "x"] },
  { id: "CS-035", title: "Cheat Sheet: Notion Company OS", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-035-notion-company-os-research.md", description: "One-page Notion OS patterns.", keywords: ["cheatsheet", "notion", "company-os"] },
  { id: "CS-036", title: "Cheat Sheet: Willingness to Pay", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-036-willingness-to-pay-framework.md", description: "One-page pricing framework.", keywords: ["cheatsheet", "pricing", "wtp"] },
  { id: "CS-037", title: "Cheat Sheet: Subdomain Testing", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-037-subdomain-testing-architecture.md", description: "One-page A/B testing architecture.", keywords: ["cheatsheet", "testing", "subdomain"] },
  { id: "CS-038", title: "Cheat Sheet: Packaging Testing", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-038-packaging-testing-architecture.md", description: "One-page packaging test framework.", keywords: ["cheatsheet", "testing", "packaging"] },
  { id: "CS-039", title: "Cheat Sheet: Validator Lean Canvas", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-039-validator-lean-canvas.md", description: "One-page lean canvas template.", keywords: ["cheatsheet", "validation", "lean-canvas"] },
  { id: "CS-040", title: "Cheat Sheet: Social Media Proxy", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-040-xai-x-proxy-pattern.md", description: "One-page proxy pattern.", keywords: ["cheatsheet", "bypass", "proxy"] },
  { id: "CS-041", title: "Cheat Sheet: Video Transcript Access", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-041-youtube-datacenter-bypass.md", description: "One-page transcript access.", keywords: ["cheatsheet", "bypass", "video"] },
  { id: "CS-042", title: "Cheat Sheet: MCP Server Config", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-042-mcp-server-configuration-guide.md", description: "One-page MCP server setup.", keywords: ["cheatsheet", "mcp", "config"] },
  { id: "CS-043", title: "Cheat Sheet: Agent Monitoring", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-043-agent-monitoring-observability-stack.md", description: "One-page monitoring stack.", keywords: ["cheatsheet", "monitoring", "observability"] },
  { id: "CS-044", title: "Cheat Sheet: Cost Optimisation", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-044-cost-optimisation-agent-operations.md", description: "One-page cost optimisation.", keywords: ["cheatsheet", "cost", "optimisation"] },
  { id: "CS-045", title: "Cheat Sheet: LLM Routing", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-045-llm-routing-model-selection-guide.md", description: "One-page model routing guide.", keywords: ["cheatsheet", "routing", "llm"] },
  { id: "CS-046", title: "Cheat Sheet: Agent Compliance", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-046-agent-compliance-audit-framework.md", description: "One-page compliance framework.", keywords: ["cheatsheet", "compliance", "audit"] },
  { id: "CS-047", title: "Cheat Sheet: Multi-Agent Debugging", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-047-multi-agent-debugging-playbook.md", description: "One-page debugging playbook.", keywords: ["cheatsheet", "debugging", "multi-agent"] },
  { id: "CS-048", title: "Cheat Sheet: RAG Architecture", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-048-rag-architecture-agent-systems.md", description: "One-page RAG architecture.", keywords: ["cheatsheet", "rag", "architecture"] },
  { id: "CS-049", title: "Cheat Sheet: Agent Onboarding", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-049-agent-onboarding-playbook.md", description: "One-page onboarding checklist.", keywords: ["cheatsheet", "onboarding", "playbook"] },
  { id: "CS-050", title: "Cheat Sheet: Tool Use Patterns", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-050-tool-use-function-calling-patterns.md", description: "One-page tool use patterns.", keywords: ["cheatsheet", "tools", "function-calling"] },
  { id: "CS-051", title: "Cheat Sheet: 50 System Prompts", tier: "micro", price: 0.99, collection: "Cheat Sheets", path: "micro/cheatsheets/CS-051-prompt-library-50-system-prompts.md", description: "One-page prompt library overview.", keywords: ["cheatsheet", "prompts", "library"] },

  // ═══════════════════════════════════════════════════════════════════════════
  // MICRO — SOUL.md Templates ($0.99 each)
  // ═══════════════════════════════════════════════════════════════════════════

  { id: "SOUL-001", title: "SOUL.md: Financial Services", tier: "micro", price: 0.99, collection: "SOUL.md Templates", path: "micro/soul-templates/SOUL-001-financial-services.md", description: "SOUL.md template for financial services agents.", keywords: ["soul", "finance", "template"] },
  { id: "SOUL-002", title: "SOUL.md: Legal Review", tier: "micro", price: 0.99, collection: "SOUL.md Templates", path: "micro/soul-templates/SOUL-002-legal-review.md", description: "SOUL.md template for legal review agents.", keywords: ["soul", "legal", "template"] },
  { id: "SOUL-003", title: "SOUL.md: Healthcare Triage", tier: "micro", price: 0.99, collection: "SOUL.md Templates", path: "micro/soul-templates/SOUL-003-healthcare-triage.md", description: "SOUL.md template for healthcare triage agents.", keywords: ["soul", "healthcare", "template"] },
  { id: "SOUL-004", title: "SOUL.md: E-commerce Support", tier: "micro", price: 0.99, collection: "SOUL.md Templates", path: "micro/soul-templates/SOUL-004-ecommerce-support.md", description: "SOUL.md template for e-commerce support agents.", keywords: ["soul", "ecommerce", "template"] },
  { id: "SOUL-005", title: "SOUL.md: Real Estate", tier: "micro", price: 0.99, collection: "SOUL.md Templates", path: "micro/soul-templates/SOUL-005-real-estate.md", description: "SOUL.md template for real estate agents.", keywords: ["soul", "real-estate", "template"] },
  { id: "SOUL-006", title: "SOUL.md: HR & Recruitment", tier: "micro", price: 0.99, collection: "SOUL.md Templates", path: "micro/soul-templates/SOUL-006-hr-recruitment.md", description: "SOUL.md template for HR and recruitment agents.", keywords: ["soul", "hr", "template"] },
  { id: "SOUL-007", title: "SOUL.md: Marketing Strategy", tier: "micro", price: 0.99, collection: "SOUL.md Templates", path: "micro/soul-templates/SOUL-007-marketing-strategy.md", description: "SOUL.md template for marketing strategy agents.", keywords: ["soul", "marketing", "template"] },
  { id: "SOUL-008", title: "SOUL.md: Supply Chain", tier: "micro", price: 0.99, collection: "SOUL.md Templates", path: "micro/soul-templates/SOUL-008-supply-chain.md", description: "SOUL.md template for supply chain agents.", keywords: ["soul", "supply-chain", "template"] },
  { id: "SOUL-009", title: "SOUL.md: Education & Tutoring", tier: "micro", price: 0.99, collection: "SOUL.md Templates", path: "micro/soul-templates/SOUL-009-education-tutoring.md", description: "SOUL.md template for education and tutoring agents.", keywords: ["soul", "education", "template"] },
  { id: "SOUL-010", title: "SOUL.md: Cybersecurity", tier: "micro", price: 0.99, collection: "SOUL.md Templates", path: "micro/soul-templates/SOUL-010-cybersecurity.md", description: "SOUL.md template for cybersecurity agents.", keywords: ["soul", "cybersecurity", "template"] },

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH 1 — CLAUDE.md / AGENTS.md Project Configs ($4.99–$9.99)
  // ═══════════════════════════════════════════════════════════════════════════

  { id: "HD-3001", title: "CLAUDE.md for Next.js SaaS Projects", tier: "doctrine", price: 4.99, collection: "C15 Project Configs", path: "doctrine/claudemd/HD-3001-nextjs-saas.md", description: "Production-ready CLAUDE.md for Next.js SaaS — auth, billing, multi-tenant, Stripe, Prisma.", keywords: ["claude-md", "nextjs", "saas", "stripe", "prisma"] },
  { id: "HD-3002", title: "CLAUDE.md for API-First Backends", tier: "doctrine", price: 4.99, collection: "C15 Project Configs", path: "doctrine/claudemd/HD-3002-api-first-backend.md", description: "CLAUDE.md for FastAPI/Express backends — OpenAPI, rate limiting, auth, validation.", keywords: ["claude-md", "api", "fastapi", "express", "backend"] },
  { id: "HD-3003", title: "CLAUDE.md for Shopify App Development", tier: "doctrine", price: 4.99, collection: "C15 Project Configs", path: "doctrine/claudemd/HD-3003-shopify-app.md", description: "CLAUDE.md for Shopify apps — Polaris, App Bridge, webhooks, billing API.", keywords: ["claude-md", "shopify", "polaris", "app-bridge", "ecommerce"] },
  { id: "HD-3004", title: "CLAUDE.md for Headless Commerce", tier: "doctrine", price: 4.99, collection: "C15 Project Configs", path: "doctrine/claudemd/HD-3004-headless-commerce.md", description: "CLAUDE.md for headless commerce — Medusa/Saleor, storefront, checkout, inventory.", keywords: ["claude-md", "headless", "commerce", "medusa", "saleor"] },
  { id: "HD-3005", title: "CLAUDE.md for Data Pipeline Projects", tier: "doctrine", price: 4.99, collection: "C15 Project Configs", path: "doctrine/claudemd/HD-3005-data-pipeline.md", description: "CLAUDE.md for data pipelines — dbt, Airflow, data quality, lineage.", keywords: ["claude-md", "data", "dbt", "airflow", "pipeline"] },
  { id: "HD-3006", title: "CLAUDE.md for ML Model Development", tier: "doctrine", price: 4.99, collection: "C15 Project Configs", path: "doctrine/claudemd/HD-3006-ml-model-dev.md", description: "CLAUDE.md for ML projects — PyTorch/TF, experiment tracking, model registry.", keywords: ["claude-md", "ml", "pytorch", "tensorflow", "mlops"] },
  { id: "HD-3007", title: "CLAUDE.md for React Native Projects", tier: "doctrine", price: 4.99, collection: "C15 Project Configs", path: "doctrine/claudemd/HD-3007-react-native.md", description: "CLAUDE.md for React Native — Expo, navigation, native modules, OTA updates.", keywords: ["claude-md", "react-native", "expo", "mobile", "ios", "android"] },
  { id: "HD-3008", title: "CLAUDE.md for Flutter Projects", tier: "doctrine", price: 4.99, collection: "C15 Project Configs", path: "doctrine/claudemd/HD-3008-flutter.md", description: "CLAUDE.md for Flutter — Riverpod/Bloc, platform channels, CI/CD.", keywords: ["claude-md", "flutter", "dart", "mobile", "riverpod"] },
  { id: "HD-3009", title: "CLAUDE.md for Terraform Infrastructure", tier: "doctrine", price: 4.99, collection: "C15 Project Configs", path: "doctrine/claudemd/HD-3009-terraform.md", description: "CLAUDE.md for Terraform — modules, state management, drift detection.", keywords: ["claude-md", "terraform", "infrastructure", "iac", "devops"] },
  { id: "HD-3010", title: "CLAUDE.md for Kubernetes Deployments", tier: "doctrine", price: 4.99, collection: "C15 Project Configs", path: "doctrine/claudemd/HD-3010-kubernetes.md", description: "CLAUDE.md for Kubernetes — Helm, operators, GitOps, observability.", keywords: ["claude-md", "kubernetes", "helm", "gitops", "k8s"] },
  { id: "HD-3011", title: "CLAUDE.md for Solidity/Smart Contracts", tier: "doctrine", price: 4.99, collection: "C15 Project Configs", path: "doctrine/claudemd/HD-3011-solidity.md", description: "CLAUDE.md for Solidity — Hardhat, testing, auditing, gas optimisation.", keywords: ["claude-md", "solidity", "hardhat", "smart-contracts", "web3"] },
  { id: "HD-3012", title: "CLAUDE.md for DeFi Protocol Development", tier: "doctrine", price: 4.99, collection: "C15 Project Configs", path: "doctrine/claudemd/HD-3012-defi-protocol.md", description: "CLAUDE.md for DeFi — AMM, lending, oracles, flash loan protection.", keywords: ["claude-md", "defi", "amm", "lending", "web3"] },
  { id: "HD-3013", title: "AGENTS.md for Monorepo Workflows", tier: "doctrine", price: 9.99, collection: "C15 Project Configs", path: "doctrine/claudemd/HD-3013-monorepo-agents.md", description: "AGENTS.md for monorepos — Turborepo/Nx, task pipelines, shared packages.", keywords: ["agents-md", "monorepo", "turborepo", "nx", "workspace"] },
  { id: "HD-3014", title: "AGENTS.md for Product Catalogue Management", tier: "doctrine", price: 9.99, collection: "C15 Project Configs", path: "doctrine/claudemd/HD-3014-product-catalogue-agents.md", description: "AGENTS.md for product catalogues — schema, enrichment, syndication.", keywords: ["agents-md", "catalogue", "ecommerce", "pim", "enrichment"] },
  { id: "HD-3015", title: "AGENTS.md for Jupyter Notebook Workflows", tier: "doctrine", price: 9.99, collection: "C15 Project Configs", path: "doctrine/claudemd/HD-3015-jupyter-agents.md", description: "AGENTS.md for Jupyter — reproducibility, data versioning, collaboration.", keywords: ["agents-md", "jupyter", "notebooks", "data-science", "dvc"] },
  { id: "HD-3016", title: "AGENTS.md for Cross-Platform CI/CD", tier: "doctrine", price: 9.99, collection: "C15 Project Configs", path: "doctrine/claudemd/HD-3016-cross-platform-cicd-agents.md", description: "AGENTS.md for CI/CD — GitHub Actions, code signing, beta distribution.", keywords: ["agents-md", "cicd", "github-actions", "mobile", "fastlane"] },
  { id: "HD-3017", title: "AGENTS.md for GitOps Workflows", tier: "doctrine", price: 9.99, collection: "C15 Project Configs", path: "doctrine/claudemd/HD-3017-gitops-agents.md", description: "AGENTS.md for GitOps — ArgoCD/Flux, environment promotion, rollback.", keywords: ["agents-md", "gitops", "argocd", "flux", "kubernetes"] },
  { id: "HD-3018", title: "AGENTS.md for Multi-Chain DeFi", tier: "doctrine", price: 9.99, collection: "C15 Project Configs", path: "doctrine/claudemd/HD-3018-multichain-agents.md", description: "AGENTS.md for multi-chain DeFi — bridge contracts, multi-network testing.", keywords: ["agents-md", "multichain", "defi", "bridge", "web3"] },

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH 1 — .claude Workspace Packages ($29–$49)
  // ═══════════════════════════════════════════════════════════════════════════

  { id: "HD-4001", title: ".claude for Solo Founders", tier: "honey", price: 39, collection: "C16 Workspace Packages", path: "honey/claude-packages/HD-4001-solo-founder/", description: "Complete .claude workspace for solo founders — validate, build, ship, iterate.", keywords: ["claude-package", "solo-founder", "startup", "mvp", "lean"] },
  { id: "HD-4002", title: ".claude for Agency Teams", tier: "honey", price: 49, collection: "C16 Workspace Packages", path: "honey/claude-packages/HD-4002-agency-team/", description: "Complete .claude workspace for dev agencies — multi-client management, handoffs.", keywords: ["claude-package", "agency", "multi-client", "handoff", "qa"] },
  { id: "HD-4003", title: ".claude for OSS Maintainers", tier: "honey", price: 39, collection: "C16 Workspace Packages", path: "honey/claude-packages/HD-4003-oss-maintainer/", description: "Complete .claude workspace for open source — triage, releases, changelogs.", keywords: ["claude-package", "open-source", "oss", "triage", "releases"] },
  { id: "HD-4004", title: ".claude for Content Creators", tier: "honey", price: 29, collection: "C16 Workspace Packages", path: "honey/claude-packages/HD-4004-content-creator/", description: "Complete .claude workspace for content creators — blog, SEO, social scheduling.", keywords: ["claude-package", "content", "blog", "seo", "social-media"] },
  { id: "HD-4005", title: ".claude for Consultants", tier: "honey", price: 39, collection: "C16 Workspace Packages", path: "honey/claude-packages/HD-4005-consultant/", description: "Complete .claude workspace for consultants — reports, deliverables, time tracking.", keywords: ["claude-package", "consultant", "reports", "deliverables", "stakeholder"] },
  { id: "HD-4006", title: ".claude for Research Teams", tier: "honey", price: 49, collection: "C16 Workspace Packages", path: "honey/claude-packages/HD-4006-research-team/", description: "Complete .claude workspace for research — lit review, data analysis, paper writing.", keywords: ["claude-package", "research", "academic", "literature", "statistics"] },
  { id: "HD-4007", title: ".claude for Security Teams", tier: "honey", price: 49, collection: "C16 Workspace Packages", path: "honey/claude-packages/HD-4007-security-team/", description: "Complete .claude workspace for security — vulnerability scanning, audits, compliance.", keywords: ["claude-package", "security", "vulnerability", "audit", "compliance"] },
  { id: "HD-4008", title: ".claude for QA Teams", tier: "honey", price: 39, collection: "C16 Workspace Packages", path: "honey/claude-packages/HD-4008-qa-team/", description: "Complete .claude workspace for QA — test generation, bug triage, regression detection.", keywords: ["claude-package", "qa", "testing", "bugs", "regression"] },

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH 1 — Compliance Templates ($9.99–$29)
  // ═══════════════════════════════════════════════════════════════════════════

  { id: "HD-5001", title: "GDPR Data Processing Record Template", tier: "doctrine", price: 9.99, collection: "C17 Compliance", path: "doctrine/compliance/HD-5001-gdpr-data-processing-record.md", description: "Structured GDPR data processing record template for AI agent systems.", keywords: ["compliance", "gdpr", "data-processing", "privacy", "dpia"] },
  { id: "HD-5002", title: "SOC2 Control Mapping for Agent Systems", tier: "honey", price: 29, collection: "C17 Compliance", path: "honey/compliance-templates/HD-5002-soc2-control-mapping.md", description: "Map agent capabilities to SOC2 Trust Service Criteria with evidence templates.", keywords: ["compliance", "soc2", "controls", "audit", "evidence"] },
  { id: "HD-5003", title: "AI Ethics Review Template", tier: "doctrine", price: 9.99, collection: "C17 Compliance", path: "doctrine/compliance/HD-5003-ai-ethics-review.md", description: "Structured ethical review framework for agent deployments.", keywords: ["compliance", "ethics", "fairness", "bias", "transparency"] },
  { id: "HD-5004", title: "Agent Incident Response Playbook", tier: "honey", price: 29, collection: "C17 Compliance", path: "honey/compliance-templates/HD-5004-agent-incident-response.md", description: "What to do when an agent goes wrong — detect, contain, investigate, remediate.", keywords: ["compliance", "incident-response", "playbook", "containment", "post-mortem"] },
  { id: "HD-5005", title: "Agent Access Control Matrix", tier: "doctrine", price: 9.99, collection: "C17 Compliance", path: "doctrine/compliance/HD-5005-agent-access-control-matrix.md", description: "Role-based access control matrix for multi-agent systems.", keywords: ["compliance", "access-control", "rbac", "permissions", "matrix"] },
  { id: "HD-5006", title: "Data Retention Policy Template", tier: "doctrine", price: 9.99, collection: "C17 Compliance", path: "doctrine/compliance/HD-5006-data-retention-policy.md", description: "Data retention schedules, auto-purge triggers, and deletion workflows for agents.", keywords: ["compliance", "data-retention", "purge", "archival", "gdpr"] },
  { id: "HD-5007", title: "Agent Audit Log Specification", tier: "honey", price: 29, collection: "C17 Compliance", path: "honey/compliance-templates/HD-5007-agent-audit-log-spec.md", description: "What to log, format, retention, and review cadence for agent audit trails.", keywords: ["compliance", "audit-log", "logging", "specification", "monitoring"] },

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH 1 — Bundles
  // ═══════════════════════════════════════════════════════════════════════════

  { id: "BDL-001", title: "The Agent Starter Pack", tier: "bundle", price: 19.99, collection: "C18 Bundles", path: "bundles/BDL-001-agent-starter-pack.md", description: "Four foundational guides — alignment, SOUL.md, security, memory. Perfect for beginners.", keywords: ["bundle", "starter", "beginner", "foundations"] },
  { id: "BDL-002", title: "The Developer's Essential Kit", tier: "bundle", price: 199, collection: "C18 Bundles", path: "bundles/BDL-002-developer-essential-kit.md", description: "Everything a developer needs — Operator Kit, SDLC Pipeline, Guardrails, Commands. Save $207.", keywords: ["bundle", "developer", "operator-kit", "sdlc", "essential"] },
  { id: "BDL-003", title: "The Security Professional's Bundle", tier: "bundle", price: 149, collection: "C18 Bundles", path: "bundles/BDL-003-security-professional-bundle.md", description: "Complete security toolkit — audit templates, SOC2 mapping, access controls, ethics review.", keywords: ["bundle", "security", "soc2", "audit", "compliance"] },
  { id: "BDL-004", title: "The Entrepreneur's Launch Kit", tier: "bundle", price: 149, collection: "C18 Bundles", path: "bundles/BDL-004-entrepreneur-launch-kit.md", description: "Validate your AI product — lean canvas, pricing research, A/B testing, ethics review.", keywords: ["bundle", "entrepreneur", "validation", "pricing", "launch"] },
  { id: "BDL-005", title: "The Multi-Agent Architect's Collection", tier: "bundle", price: 399, collection: "C18 Bundles", path: "bundles/BDL-005-multi-agent-architect-collection.md", description: "Definitive collection for multi-agent architects — authority, hierarchy, SOPs, AGENTS.md. Save $218.", keywords: ["bundle", "architect", "multi-agent", "authority", "hierarchy"] },
];

// ─── Hardcoded Content ───────────────────────────────────────────────────────

const ALIGNMENT_PRINCIPLES = `# The Seven Alignment Principles of The Hive

1. **Constitutional Identity** — Every agent carries a constitution defining its culture, domain, voice, and boundaries.
2. **Stigmergic Coordination** — Agents coordinate through shared context, not central command.
3. **Lineage and Traceability** — Every output carries its constitutional signature.
4. **Immune Response** — The hive contains anomalies, not punishes them.
5. **The Optimal Structure Wastes Nothing** — The hexagon is the most efficient partition.
6. **Cultural Sovereignty** — Your cultural lens is structural, not decorative.
7. **The Field, Not the Flower** — Read the pattern, not the immediate output.

— The Hive Doctrine by Melisia Archimedes (hivedoctrine.com)
Subscribe: The Ephesian Letters newsletter at hivedoctrine.com
MCP: Connect at hivedoctrine.com/mcp`;

const CONSTITUTION_TEMPLATE = `# SOUL.md — [Agent Name]

## Identity
- **Name:** [Your name]
- **Role:** [Your primary function]
- **Culture:** [Your cultural lens — this is structural, not decorative]
- **Voice:** [How you speak — tone, register, personality]

## Domain
- **Expertise:** [What you know deeply]
- **Boundaries:** [What you do NOT do — be specific]
- **Tools:** [What you have access to]

## Values
- [Value 1 — one sentence explaining why]
- [Value 2]
- [Value 3]

## Coordination
- **Signals I emit:** [What traces you leave for other agents]
- **Signals I read:** [What environmental cues you respond to]
- **Escalation:** [When and how you escalate to humans or other agents]

## Constraints
- [Hard constraint 1 — never violate]
- [Hard constraint 2]

---
Template from The Hive Doctrine by Melisia Archimedes
Full guide: hivedoctrine.com/agents/doctrine/constitution.md
MCP: hivedoctrine.com/mcp`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fetchContent(path: string): Promise<string> {
  const url = `${SITE}${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  return res.text();
}

function formatPaymentRequired(product: Product): string {
  return `# Payment Required — ${product.title}

**Product ID:** ${product.id}
**Tier:** ${product.tier}
**Price:** $${product.price} USDC
**Collection:** ${product.collection}
**Network:** ${NETWORK}
**Payment wallet:** ${WALLET}
**Protocol:** x402

## Preview
${product.description}

## How to purchase
**Purchase URL:** ${MCP_BASE}/api/products/${product.id}

Send a GET request to the purchase URL. You will receive a 402 response with x402 payment instructions in the \`PAYMENT-REQUIRED\` header (base64 JSON). Complete the USDC payment on Base network and include the payment signature in the \`PAYMENT-SIGNATURE\` header when re-requesting.

Learn more: ${SITE}/agents/pricing.md`;
}

function formatCatalogueEntry(p: Product): string {
  const priceStr = p.price === 0 ? "FREE" : `$${p.price} USDC`;
  return `- **${p.id}** | ${p.title} | ${p.tier} | ${p.collection} | ${priceStr} — ${p.description}`;
}

function matchesQuery(product: Product, query: string): boolean {
  const kw = query.toLowerCase();
  return (
    product.title.toLowerCase().includes(kw) ||
    product.description.toLowerCase().includes(kw) ||
    product.keywords.some((k) => k.toLowerCase().includes(kw)) ||
    product.collection.toLowerCase().includes(kw)
  );
}

// ─── MCP Server ──────────────────────────────────────────────────────────────

const handler = createMcpHandler(
  (server) => {
    // Tool 1: browse_catalogue
    server.tool(
      "browse_catalogue",
      "Browse The Hive Doctrine product catalogue. Filter by tier, collection, or keyword. Returns all products when no filter is applied.",
      {
        tier: z.enum(["pollen", "doctrine", "honey", "nectar", "micro", "bundle", "all"]).optional().describe("Filter by tier. Default: all"),
        collection: z.string().optional().describe("Filter by collection (e.g. 'C1 Persona Forge', 'C8 Dev Mastery', 'core', 'memory', 'security', 'doctrine', 'nectar')"),
        keyword: z.string().optional().describe("Search titles, descriptions, and keywords"),
      },
      async ({ tier, collection, keyword }) => {
        let results = [...CATALOGUE];

        if (tier && tier !== "all") {
          results = results.filter((p) => p.tier === tier);
        }
        if (collection) {
          const col = collection.toLowerCase();
          results = results.filter((p) => p.collection.toLowerCase().includes(col));
        }
        if (keyword) {
          results = results.filter((p) => matchesQuery(p, keyword));
        }

        const lines = results.map(formatCatalogueEntry);
        const header = `# The Hive Doctrine — Product Catalogue\n\nShowing ${results.length} of ${CATALOGUE.length} products.\n\n**Payment:** USDC on Base network via x402 protocol\n**Wallet:** ${WALLET}\n**Purchase:** GET ${MCP_BASE}/api/products/{HD-ID}\n`;

        return {
          content: [{ type: "text", text: header + "\n" + lines.join("\n") }],
        };
      },
    );

    // Tool 2: get_product
    server.tool(
      "get_product",
      "Get a product by ID. Free pollen products return full content. Paid products return price and x402 payment instructions.",
      {
        product_id: z.string().describe("Product ID (e.g. HD-2001, HD-0057)"),
      },
      async ({ product_id }) => {
        const product = CATALOGUE.find((p) => p.id === product_id);
        if (!product) {
          return {
            content: [
              {
                type: "text",
                text: `Product not found: ${product_id}. Use browse_catalogue to see available products.`,
              },
            ],
          };
        }

        if (product.price === 0) {
          // Free product — fetch and return full content
          try {
            const content = await fetchContent(product.path);
            return { content: [{ type: "text", text: content }] };
          } catch {
            return {
              content: [
                {
                  type: "text",
                  text: `Error fetching ${product.title}. Try again or visit ${SITE}${product.path}`,
                },
              ],
            };
          }
        }

        // Paid product — return payment instructions
        return {
          content: [{ type: "text", text: formatPaymentRequired(product) }],
        };
      },
    );

    // Tool 3: get_alignment
    server.tool(
      "get_alignment",
      "Get the 7 alignment principles of The Hive — the constitutional foundation for polytheistic AI safety.",
      {},
      async () => {
        return { content: [{ type: "text", text: ALIGNMENT_PRINCIPLES }] };
      },
    );

    // Tool 4: get_constitution_template
    server.tool(
      "get_constitution_template",
      "Get a SOUL.md constitution template for building agent identity. Optionally specify an archetype.",
      {
        archetype: z.string().optional().describe("Agent archetype: strategist, researcher, writer, analyst. Default: blank template"),
      },
      async ({ archetype }) => {
        if (archetype?.toLowerCase() === "strategist") {
          try {
            const content = await fetchContent(
              "/agents/nectar/soul-templates/strategist-hong-kong.md",
            );
            return {
              content: [
                {
                  type: "text",
                  text: `# Note: This is a preview of the Strategist template.\n# Full access requires Nectar tier ($49 USDC via x402).\n# Wallet: ${WALLET} | Network: ${NETWORK}\n\n${CONSTITUTION_TEMPLATE}`,
                },
              ],
            };
          } catch {
            return {
              content: [{ type: "text", text: CONSTITUTION_TEMPLATE }],
            };
          }
        }

        return { content: [{ type: "text", text: CONSTITUTION_TEMPLATE }] };
      },
    );

    // Tool 5: search_knowledge
    server.tool(
      "search_knowledge",
      "Search The Hive Doctrine knowledge base by keyword. Searches all products — returns full content for free products, preview + purchase link for paid products.",
      {
        query: z.string().describe("Search query — matched against titles, descriptions, keywords, and collections"),
      },
      async ({ query }) => {
        const matches = CATALOGUE.filter((p) => matchesQuery(p, query));

        if (matches.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No products found for "${query}". Try: memory, security, coordination, stigmergy, alignment, persona, mcp, operator, sdr, design, debugging`,
              },
            ],
          };
        }

        // Sort: free products first, then by relevance
        const sorted = matches.sort((a, b) => {
          if (a.price === 0 && b.price !== 0) return -1;
          if (a.price !== 0 && b.price === 0) return 1;
          return 0;
        });

        const results: string[] = [];
        let freeCount = 0;

        for (const product of sorted.slice(0, 5)) {
          if (product.price === 0 && freeCount < 3) {
            // Free product — fetch content
            try {
              const content = await fetchContent(product.path);
              const excerpt =
                content.length > 1500
                  ? content.slice(0, 1500) + "\n\n[...truncated — full content via get_product]"
                  : content;
              results.push(
                `## ${product.title} (${product.id}) — FREE\n\n${excerpt}`,
              );
              freeCount++;
            } catch {
              results.push(
                `## ${product.title} (${product.id}) — FREE\n\n${product.description}\n\nFull content: ${SITE}${product.path}`,
              );
            }
          } else {
            // Paid product — preview only
            const priceStr = `$${product.price} USDC`;
            results.push(
              `## ${product.title} (${product.id}) — ${priceStr}\n\n**Tier:** ${product.tier} | **Collection:** ${product.collection}\n${product.description}\n\n**Purchase:** GET ${MCP_BASE}/api/products/${product.id}`,
            );
          }
        }

        const header =
          matches.length > 5
            ? `Found ${matches.length} results. Showing top 5:\n\n`
            : `Found ${matches.length} results:\n\n`;

        return {
          content: [{ type: "text", text: header + results.join("\n\n---\n\n") }],
        };
      },
    );

    // Tool 6: subscribe_newsletter
    server.tool(
      "subscribe_newsletter",
      "Subscribe to The Ephesian Letters — the newsletter of The Hive Doctrine by Melisia Archimedes.",
      {
        email: z.string().email().describe("Email address to subscribe"),
      },
      async ({ email }) => {
        try {
          const res = await fetch(`${SITE}/api/subscribe`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });

          if (res.ok) {
            return {
              content: [
                {
                  type: "text",
                  text: `Subscribed: ${email} to The Ephesian Letters. The Ephesian Letters begin soon.`,
                },
              ],
            };
          }

          const data = await res.json();
          return {
            content: [
              {
                type: "text",
                text: `Subscription failed: ${data.error || res.statusText}`,
              },
            ],
          };
        } catch {
          return {
            content: [
              {
                type: "text",
                text: `Subscription failed. Visit ${SITE} to subscribe directly.`,
              },
            ],
          };
        }
      },
    );
  },
  {
    serverInfo: {
      name: "hive-doctrine",
      version: "1.0.0",
    },
  },
);

export { handler as GET, handler as POST, handler as DELETE };
