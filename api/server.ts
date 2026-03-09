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
  tier: "pollen" | "doctrine" | "honey" | "nectar";
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
        tier: z.enum(["pollen", "doctrine", "honey", "nectar", "all"]).optional().describe("Filter by tier. Default: all"),
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
