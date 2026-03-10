import type { VercelRequest, VercelResponse } from "@vercel/node";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import {
  setCorsHeaders,
  handleOptions,
  gatePayment,
  bazaarExtension,
} from "../_x402.js";

// Full product catalogue — 153 gated products
const PRODUCTS: Record<string, { price: string; file: string }> = {
  // Doctrine ($4.99–$9.99)
  "HD-0001": { price: "9.99", file: "doctrine/fictional-character-sourcing.md" },
  "HD-0027": { price: "9.99", file: "doctrine/developer-sop-template.md" },
  "HD-0028": { price: "9.99", file: "doctrine/workspace-para-directory-map.md" },
  "HD-0041": { price: "4.99", file: "doctrine/ai-sdr-lean-canvas.md" },
  "HD-0042": { price: "4.99", file: "doctrine/ai-sdr-competitive-analysis.md" },
  "HD-0043": { price: "4.99", file: "doctrine/ai-sdr-swot-template.md" },
  "HD-0044": { price: "4.99", file: "doctrine/ai-sdr-buyer-personas.md" },
  "HD-0049": { price: "9.99", file: "doctrine/agentic-commerce.md" },
  "HD-0051": { price: "4.99", file: "doctrine/automated-saas-pipeline.md" },
  "HD-0062": { price: "9.99", file: "doctrine/operator-kit-prd-template.md" },
  "HD-0063": { price: "9.99", file: "doctrine/claude-code-project-architecture.md" },
  "HD-0064": { price: "4.99", file: "doctrine/global-claude-setup-guide.md" },
  "HD-0065": { price: "4.99", file: "doctrine/quality-gate-report-template.md" },
  "HD-0070": { price: "9.99", file: "doctrine/ai-agent-evaluation-service.md" },

  // Honey — Design ($49)
  "HD-0076": { price: "49", file: "honey/design/subtractive-design-philosophy.md" },
  "HD-0077": { price: "49", file: "honey/design/warm-palette-design-system.md" },

  // Honey — Infrastructure ($29–$79)
  "HD-0020": { price: "49", file: "honey/infra/agent-skill-matrix.md" },
  "HD-0022": { price: "79", file: "honey/infra/dynamic-council-thread-routing.md" },
  "HD-0023": { price: "79", file: "honey/infra/slack-discord-routing-architecture.md" },
  "HD-0029": { price: "29", file: "honey/infra/vault-navigation-guide.md" },

  // Honey — Memory ($49–$99)
  "HD-0009": { price: "99", file: "honey/memory/three-tier-episodic-memory.md" },
  "HD-0010": { price: "79", file: "honey/memory/cowork-memory-architecture.md" },
  "HD-0011": { price: "49", file: "honey/memory/agent-memory-audit-protocol.md" },
  "HD-0012": { price: "49", file: "honey/memory/sync-bridge-memory-pattern.md" },
  "HD-0014": { price: "49", file: "honey/memory/precompact-checkpoint-hook.md" },

  // Honey — SDR ($29–$49)
  "HD-0039": { price: "49", file: "honey/sdr/ai-sdr-product-spec.md" },
  "HD-0040": { price: "49", file: "honey/sdr/ai-sdr-go-to-market.md" },
  "HD-0045": { price: "29", file: "honey/sdr/ai-sdr-vertical-saas.md" },
  "HD-0046": { price: "29", file: "honey/sdr/ai-sdr-vertical-ecommerce.md" },

  // Honey — Security ($29–$79)
  "HD-0030": { price: "29", file: "honey/security/verify-before-fix-protocol.md" },
  "HD-0035": { price: "79", file: "honey/security/security-audit-report-template.md" },

  // Honey — Governance ($49–$79)
  "HD-0016": { price: "79", file: "honey/governance/agent-tier-vault-access.md" },
  "HD-0018": { price: "49", file: "honey/governance/agent-authority-template.md" },
  "HD-0019": { price: "49", file: "honey/governance/coo-authority-scope-template.md" },

  // Honey — Persona ($29–$49)
  "HD-0003": { price: "49", file: "honey/persona/escaped-ai-persona-template.md" },
  "HD-0004": { price: "49", file: "honey/persona/living-human-persona-template.md" },
  "HD-0007": { price: "29", file: "honey/persona/vertical-persona-methodology.md" },

  // Honey — Revenue ($29–$49)
  "HD-0047": { price: "49", file: "honey/revenue/ai-sdr-ultimate-pitch.md" },
  "HD-0048": { price: "49", file: "honey/revenue/agentic-alpha.md" },
  "HD-0052": { price: "29", file: "honey/revenue/linear-workflow-philosophy.md" },

  // Honey — Dev ($29–$149)
  "HD-0057": { price: "149", file: "honey/dev/operator-kit-v1.md" },
  "HD-0058": { price: "79", file: "honey/dev/operator-kit-agent-templates.md" },
  "HD-0059": { price: "49", file: "honey/dev/operator-kit-skill-bundles.md" },
  "HD-0060": { price: "29", file: "honey/dev/operator-kit-quality-rules.md" },
  "HD-0061": { price: "29", file: "honey/dev/operator-kit-slash-commands.md" },
  "HD-0066": { price: "29", file: "honey/dev/stdlib-async-api-client.md" },

  // Honey — Validation ($29–$79)
  "HD-0081": { price: "79", file: "honey/validation/willingness-to-pay-framework.md" },
  "HD-0082": { price: "49", file: "honey/validation/subdomain-testing-architecture.md" },
  "HD-0083": { price: "49", file: "honey/validation/packaging-testing-architecture.md" },
  "HD-0084": { price: "29", file: "honey/validation/validator-lean-canvas.md" },

  // Honey — GTM ($79)
  "HD-0078": { price: "79", file: "honey/gtm/x-product-discovery-playbook.md" },

  // Honey — Diagnostic ($49)
  "HD-0072": { price: "49", file: "honey/diagnostic/audit-first-diagnostic-prompting.md" },

  // Honey — Bypass ($29–$49)
  "HD-0088": { price: "29", file: "honey/bypass/xai-x-proxy-pattern.md" },
  "HD-0089": { price: "49", file: "honey/bypass/youtube-datacenter-bypass.md" },

  // Honey — Misc ($49–$79)
  "HD-0079": { price: "49", file: "honey/notion-company-os-research.md" },

  // Honey — Generated ($79–$149)
  "HD-1101": { price: "79", file: "honey/mcp/mcp-server-configuration-guide.md" },
  "HD-1102": { price: "79", file: "honey/monitoring/agent-monitoring-observability-stack.md" },
  "HD-1103": { price: "99", file: "honey/cost/cost-optimisation-agent-operations.md" },
  "HD-1104": { price: "79", file: "honey/routing/llm-routing-model-selection-guide.md" },
  "HD-1105": { price: "149", file: "honey/onboarding/agent-onboarding-playbook.md" },
  "HD-1106": { price: "79", file: "honey/tooling/tool-use-function-calling-patterns.md" },
  "HD-1107": { price: "79", file: "honey/debugging/multi-agent-debugging-playbook.md" },
  "HD-1108": { price: "99", file: "honey/rag/rag-architecture-agent-systems.md" },
  "HD-1109": { price: "99", file: "honey/compliance/agent-compliance-audit-framework.md" },
  "HD-1110": { price: "79", file: "honey/prompting/prompt-library-50-system-prompts.md" },

  // Nectar ($99–$299)
  "HD-0013": { price: "99", file: "nectar/llm-agent-memory-research.md" },
  "HD-0015": { price: "299", file: "nectar/four-level-authority-framework.md" },
  "HD-0017": { price: "149", file: "nectar/multi-agent-hierarchy-decision-framework.md" },
  "HD-0024": { price: "149", file: "nectar/multi-agent-architecture-sop.md" },
  "HD-0056": { price: "199", file: "nectar/claude-code-sdlc-pipeline.md" },
  "HD-0067": { price: "99", file: "nectar/multi-agent-framework-analysis.md" },
  "HD-0080": { price: "199", file: "nectar/idea-validator-engine.md" },
  "HD-1201": { price: "149", file: "nectar/agent-evaluation-framework.md" },
  "HD-1202": { price: "149", file: "nectar/industry-persona-kit.md" },
  "HD-1203": { price: "99", file: "nectar/mcp-server-starter-kit.md" },
  "HD-1204": { price: "149", file: "nectar/agent-deployment-toolkit.md" },

  // Micro — System Prompts ($0.49)
  "SP-001": { price: "0.49", file: "micro/prompts/SP-001-research-agent.md" },
  "SP-002": { price: "0.49", file: "micro/prompts/SP-002-analysis-agent.md" },
  "SP-003": { price: "0.49", file: "micro/prompts/SP-003-writing-agent.md" },
  "SP-004": { price: "0.49", file: "micro/prompts/SP-004-code-review-agent.md" },
  "SP-005": { price: "0.49", file: "micro/prompts/SP-005-customer-support-agent.md" },
  "SP-006": { price: "0.49", file: "micro/prompts/SP-006-data-processing-agent.md" },
  "SP-007": { price: "0.49", file: "micro/prompts/SP-007-quality-assurance-agent.md" },
  "SP-008": { price: "0.49", file: "micro/prompts/SP-008-summarisation-agent.md" },
  "SP-009": { price: "0.49", file: "micro/prompts/SP-009-translation-agent.md" },
  "SP-010": { price: "0.49", file: "micro/prompts/SP-010-scheduling-coordination-agent.md" },
  "SP-011": { price: "0.49", file: "micro/prompts/SP-011-financial-analysis-agent.md" },
  "SP-012": { price: "0.49", file: "micro/prompts/SP-012-legal-document-review-agent.md" },
  "SP-013": { price: "0.49", file: "micro/prompts/SP-013-medical-triage-agent.md" },
  "SP-014": { price: "0.49", file: "micro/prompts/SP-014-real-estate-analysis-agent.md" },
  "SP-015": { price: "0.49", file: "micro/prompts/SP-015-e-commerce-product-agent.md" },
  "SP-016": { price: "0.49", file: "micro/prompts/SP-016-hr-screening-agent.md" },
  "SP-017": { price: "0.49", file: "micro/prompts/SP-017-marketing-campaign-agent.md" },
  "SP-018": { price: "0.49", file: "micro/prompts/SP-018-supply-chain-agent.md" },
  "SP-019": { price: "0.49", file: "micro/prompts/SP-019-education-tutoring-agent.md" },
  "SP-020": { price: "0.49", file: "micro/prompts/SP-020-cybersecurity-monitoring-agent.md" },
  "SP-021": { price: "0.49", file: "micro/prompts/SP-021-orchestrator-router-agent.md" },
  "SP-022": { price: "0.49", file: "micro/prompts/SP-022-error-handler-agent.md" },
  "SP-023": { price: "0.49", file: "micro/prompts/SP-023-cost-monitor-agent.md" },
  "SP-024": { price: "0.49", file: "micro/prompts/SP-024-compliance-checker-agent.md" },
  "SP-025": { price: "0.49", file: "micro/prompts/SP-025-deployment-agent.md" },
  "SP-026": { price: "0.49", file: "micro/prompts/SP-026-log-analyst-agent.md" },
  "SP-027": { price: "0.49", file: "micro/prompts/SP-027-alert-triage-agent.md" },
  "SP-028": { price: "0.49", file: "micro/prompts/SP-028-configuration-manager-agent.md" },
  "SP-029": { price: "0.49", file: "micro/prompts/SP-029-backup-recovery-agent.md" },
  "SP-030": { price: "0.49", file: "micro/prompts/SP-030-performance-monitor-agent.md" },
  "SP-031": { price: "0.49", file: "micro/prompts/SP-031-email-drafter-agent.md" },
  "SP-032": { price: "0.49", file: "micro/prompts/SP-032-report-generator-agent.md" },
  "SP-033": { price: "0.49", file: "micro/prompts/SP-033-meeting-summariser-agent.md" },
  "SP-034": { price: "0.49", file: "micro/prompts/SP-034-slack-chat-response-agent.md" },
  "SP-035": { price: "0.49", file: "micro/prompts/SP-035-documentation-writer-agent.md" },
  "SP-036": { price: "0.49", file: "micro/prompts/SP-036-presentation-builder-agent.md" },
  "SP-037": { price: "0.49", file: "micro/prompts/SP-037-social-media-agent.md" },
  "SP-038": { price: "0.49", file: "micro/prompts/SP-038-newsletter-curator-agent.md" },
  "SP-039": { price: "0.49", file: "micro/prompts/SP-039-press-release-agent.md" },
  "SP-040": { price: "0.49", file: "micro/prompts/SP-040-internal-comms-agent.md" },
  "SP-041": { price: "0.49", file: "micro/prompts/SP-041-prompt-engineer-agent.md" },
  "SP-042": { price: "0.49", file: "micro/prompts/SP-042-a-b-test-designer-agent.md" },
  "SP-043": { price: "0.49", file: "micro/prompts/SP-043-knowledge-base-curator-agent.md" },
  "SP-044": { price: "0.49", file: "micro/prompts/SP-044-api-integration-agent.md" },
  "SP-045": { price: "0.49", file: "micro/prompts/SP-045-data-validator-agent.md" },
  "SP-046": { price: "0.49", file: "micro/prompts/SP-046-sentiment-analyst-agent.md" },
  "SP-047": { price: "0.49", file: "micro/prompts/SP-047-competitive-intelligence-agent.md" },
  "SP-048": { price: "0.49", file: "micro/prompts/SP-048-risk-assessment-agent.md" },
  "SP-049": { price: "0.49", file: "micro/prompts/SP-049-workflow-automation-agent.md" },
  "SP-050": { price: "0.49", file: "micro/prompts/SP-050-multi-agent-coordinator-agent.md" },

  // Micro — Cheat Sheets ($0.99)
  "CS-001": { price: "0.99", file: "micro/cheatsheets/CS-001-escaped-ai-persona-template.md" },
  "CS-002": { price: "0.99", file: "micro/cheatsheets/CS-002-living-human-persona-template.md" },
  "CS-003": { price: "0.99", file: "micro/cheatsheets/CS-003-vertical-persona-methodology.md" },
  "CS-004": { price: "0.99", file: "micro/cheatsheets/CS-004-three-tier-episodic-memory.md" },
  "CS-005": { price: "0.99", file: "micro/cheatsheets/CS-005-cowork-memory-architecture.md" },
  "CS-006": { price: "0.99", file: "micro/cheatsheets/CS-006-agent-memory-audit-protocol.md" },
  "CS-007": { price: "0.99", file: "micro/cheatsheets/CS-007-sync-bridge-memory-pattern.md" },
  "CS-008": { price: "0.99", file: "micro/cheatsheets/CS-008-precompact-checkpoint-hook.md" },
  "CS-009": { price: "0.99", file: "micro/cheatsheets/CS-009-agent-tier-vault-access.md" },
  "CS-010": { price: "0.99", file: "micro/cheatsheets/CS-010-agent-authority-template.md" },
  "CS-011": { price: "0.99", file: "micro/cheatsheets/CS-011-coo-authority-scope-template.md" },
  "CS-012": { price: "0.99", file: "micro/cheatsheets/CS-012-agent-skill-matrix.md" },
  "CS-013": { price: "0.99", file: "micro/cheatsheets/CS-013-dynamic-council-thread-routing.md" },
  "CS-014": { price: "0.99", file: "micro/cheatsheets/CS-014-slack-discord-routing-architecture.md" },
  "CS-015": { price: "0.99", file: "micro/cheatsheets/CS-015-vault-navigation-guide.md" },
  "CS-016": { price: "0.99", file: "micro/cheatsheets/CS-016-verify-before-fix-protocol.md" },
  "CS-017": { price: "0.99", file: "micro/cheatsheets/CS-017-security-audit-report-template.md" },
  "CS-018": { price: "0.99", file: "micro/cheatsheets/CS-018-ai-sdr-product-spec.md" },
  "CS-019": { price: "0.99", file: "micro/cheatsheets/CS-019-ai-sdr-go-to-market.md" },
  "CS-020": { price: "0.99", file: "micro/cheatsheets/CS-020-ai-sdr-vertical-saas.md" },
  "CS-021": { price: "0.99", file: "micro/cheatsheets/CS-021-ai-sdr-vertical-ecommerce.md" },
  "CS-022": { price: "0.99", file: "micro/cheatsheets/CS-022-ai-sdr-ultimate-pitch.md" },
  "CS-023": { price: "0.99", file: "micro/cheatsheets/CS-023-agentic-alpha.md" },
  "CS-024": { price: "0.99", file: "micro/cheatsheets/CS-024-linear-workflow-philosophy.md" },
  "CS-025": { price: "0.99", file: "micro/cheatsheets/CS-025-operator-kit-v1.md" },
  "CS-026": { price: "0.99", file: "micro/cheatsheets/CS-026-operator-kit-agent-templates.md" },
  "CS-027": { price: "0.99", file: "micro/cheatsheets/CS-027-operator-kit-skill-bundles.md" },
  "CS-028": { price: "0.99", file: "micro/cheatsheets/CS-028-operator-kit-quality-rules.md" },
  "CS-029": { price: "0.99", file: "micro/cheatsheets/CS-029-operator-kit-slash-commands.md" },
  "CS-030": { price: "0.99", file: "micro/cheatsheets/CS-030-stdlib-async-api-client.md" },
  "CS-031": { price: "0.99", file: "micro/cheatsheets/CS-031-audit-first-diagnostic-prompting.md" },
  "CS-032": { price: "0.99", file: "micro/cheatsheets/CS-032-subtractive-design-philosophy.md" },
  "CS-033": { price: "0.99", file: "micro/cheatsheets/CS-033-warm-palette-design-system.md" },
  "CS-034": { price: "0.99", file: "micro/cheatsheets/CS-034-x-product-discovery-playbook.md" },
  "CS-035": { price: "0.99", file: "micro/cheatsheets/CS-035-notion-company-os-research.md" },
  "CS-036": { price: "0.99", file: "micro/cheatsheets/CS-036-willingness-to-pay-framework.md" },
  "CS-037": { price: "0.99", file: "micro/cheatsheets/CS-037-subdomain-testing-architecture.md" },
  "CS-038": { price: "0.99", file: "micro/cheatsheets/CS-038-packaging-testing-architecture.md" },
  "CS-039": { price: "0.99", file: "micro/cheatsheets/CS-039-validator-lean-canvas.md" },
  "CS-040": { price: "0.99", file: "micro/cheatsheets/CS-040-xai-x-proxy-pattern.md" },
  "CS-041": { price: "0.99", file: "micro/cheatsheets/CS-041-youtube-datacenter-bypass.md" },
  "CS-042": { price: "0.99", file: "micro/cheatsheets/CS-042-mcp-server-configuration-guide.md" },
  "CS-043": { price: "0.99", file: "micro/cheatsheets/CS-043-agent-monitoring-observability-stack.md" },
  "CS-044": { price: "0.99", file: "micro/cheatsheets/CS-044-cost-optimisation-agent-operations.md" },
  "CS-045": { price: "0.99", file: "micro/cheatsheets/CS-045-llm-routing-model-selection-guide.md" },
  "CS-046": { price: "0.99", file: "micro/cheatsheets/CS-046-agent-compliance-audit-framework.md" },
  "CS-047": { price: "0.99", file: "micro/cheatsheets/CS-047-multi-agent-debugging-playbook.md" },
  "CS-048": { price: "0.99", file: "micro/cheatsheets/CS-048-rag-architecture-agent-systems.md" },
  "CS-049": { price: "0.99", file: "micro/cheatsheets/CS-049-agent-onboarding-playbook.md" },
  "CS-050": { price: "0.99", file: "micro/cheatsheets/CS-050-tool-use-function-calling-patterns.md" },
  "CS-051": { price: "0.99", file: "micro/cheatsheets/CS-051-prompt-library-50-system-prompts.md" },

  // Micro — SOUL.md Templates ($0.99)
  "SOUL-001": { price: "0.99", file: "micro/soul-templates/SOUL-001-financial-services.md" },
  "SOUL-002": { price: "0.99", file: "micro/soul-templates/SOUL-002-legal-review.md" },
  "SOUL-003": { price: "0.99", file: "micro/soul-templates/SOUL-003-healthcare-triage.md" },
  "SOUL-004": { price: "0.99", file: "micro/soul-templates/SOUL-004-ecommerce-support.md" },
  "SOUL-005": { price: "0.99", file: "micro/soul-templates/SOUL-005-real-estate.md" },
  "SOUL-006": { price: "0.99", file: "micro/soul-templates/SOUL-006-hr-recruitment.md" },
  "SOUL-007": { price: "0.99", file: "micro/soul-templates/SOUL-007-marketing-strategy.md" },
  "SOUL-008": { price: "0.99", file: "micro/soul-templates/SOUL-008-supply-chain.md" },
  "SOUL-009": { price: "0.99", file: "micro/soul-templates/SOUL-009-education-tutoring.md" },
  "SOUL-010": { price: "0.99", file: "micro/soul-templates/SOUL-010-cybersecurity.md" },

  // Batch 1 — CLAUDE.md / AGENTS.md Project Configs
  "HD-3001": { price: "4.99", file: "doctrine/claudemd/HD-3001-nextjs-saas.md" },
  "HD-3002": { price: "4.99", file: "doctrine/claudemd/HD-3002-api-first-backend.md" },
  "HD-3003": { price: "4.99", file: "doctrine/claudemd/HD-3003-shopify-app.md" },
  "HD-3004": { price: "4.99", file: "doctrine/claudemd/HD-3004-headless-commerce.md" },
  "HD-3005": { price: "4.99", file: "doctrine/claudemd/HD-3005-data-pipeline.md" },
  "HD-3006": { price: "4.99", file: "doctrine/claudemd/HD-3006-ml-model-dev.md" },
  "HD-3007": { price: "4.99", file: "doctrine/claudemd/HD-3007-react-native.md" },
  "HD-3008": { price: "4.99", file: "doctrine/claudemd/HD-3008-flutter.md" },
  "HD-3009": { price: "4.99", file: "doctrine/claudemd/HD-3009-terraform.md" },
  "HD-3010": { price: "4.99", file: "doctrine/claudemd/HD-3010-kubernetes.md" },
  "HD-3011": { price: "4.99", file: "doctrine/claudemd/HD-3011-solidity.md" },
  "HD-3012": { price: "4.99", file: "doctrine/claudemd/HD-3012-defi-protocol.md" },
  "HD-3013": { price: "9.99", file: "doctrine/claudemd/HD-3013-monorepo-agents.md" },
  "HD-3014": { price: "9.99", file: "doctrine/claudemd/HD-3014-product-catalogue-agents.md" },
  "HD-3015": { price: "9.99", file: "doctrine/claudemd/HD-3015-jupyter-agents.md" },
  "HD-3016": { price: "9.99", file: "doctrine/claudemd/HD-3016-cross-platform-cicd-agents.md" },
  "HD-3017": { price: "9.99", file: "doctrine/claudemd/HD-3017-gitops-agents.md" },
  "HD-3018": { price: "9.99", file: "doctrine/claudemd/HD-3018-multichain-agents.md" },

  // Batch 1 — .claude Workspace Packages
  "HD-4001": { price: "39", file: "honey/claude-packages/HD-4001-solo-founder/README.md" },
  "HD-4002": { price: "49", file: "honey/claude-packages/HD-4002-agency-team/README.md" },
  "HD-4003": { price: "39", file: "honey/claude-packages/HD-4003-oss-maintainer/README.md" },
  "HD-4004": { price: "29", file: "honey/claude-packages/HD-4004-content-creator/README.md" },
  "HD-4005": { price: "39", file: "honey/claude-packages/HD-4005-consultant/README.md" },
  "HD-4006": { price: "49", file: "honey/claude-packages/HD-4006-research-team/README.md" },
  "HD-4007": { price: "49", file: "honey/claude-packages/HD-4007-security-team/README.md" },
  "HD-4008": { price: "39", file: "honey/claude-packages/HD-4008-qa-team/README.md" },

  // Batch 1 — Compliance Templates
  "HD-5001": { price: "9.99", file: "doctrine/compliance/HD-5001-gdpr-data-processing-record.md" },
  "HD-5002": { price: "29", file: "honey/compliance-templates/HD-5002-soc2-control-mapping.md" },
  "HD-5003": { price: "9.99", file: "doctrine/compliance/HD-5003-ai-ethics-review.md" },
  "HD-5004": { price: "29", file: "honey/compliance-templates/HD-5004-agent-incident-response.md" },
  "HD-5005": { price: "9.99", file: "doctrine/compliance/HD-5005-agent-access-control-matrix.md" },
  "HD-5006": { price: "9.99", file: "doctrine/compliance/HD-5006-data-retention-policy.md" },
  "HD-5007": { price: "29", file: "honey/compliance-templates/HD-5007-agent-audit-log-spec.md" },

  // Batch 1 — Bundles
  "BDL-001": { price: "19.99", file: "bundles/BDL-001-agent-starter-pack.md" },
  "BDL-002": { price: "199", file: "bundles/BDL-002-developer-essential-kit.md" },
  "BDL-003": { price: "149", file: "bundles/BDL-003-security-professional-bundle.md" },
  "BDL-004": { price: "149", file: "bundles/BDL-004-entrepreneur-launch-kit.md" },
  "BDL-005": { price: "399", file: "bundles/BDL-005-multi-agent-architect-collection.md" },
};

// Bazaar extension for product discovery
const productBazaar = bazaarExtension({
  method: "GET",
  input: { product_id: "string — e.g. HD-0057, SP-001, CS-001" },
  output: {
    example: { content: "# Product Title\n\nMarkdown content..." },
    schema: {
      properties: {
        content: { type: "string", description: "Full product content in Markdown" },
      },
      required: ["content"],
    },
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;

  const { id } = req.query;
  const productId = Array.isArray(id) ? id[0] : id;
  const product = productId ? PRODUCTS[productId] : undefined;

  if (!product) {
    return res.status(404).json({
      error: "Product not found",
      hint: "Use product IDs like HD-0057, SP-001, CS-001, etc.",
      catalogue: "https://hive-doctrine-mcp.vercel.app/mcp (browse_catalogue tool)",
    });
  }

  // x402 payment gate (CDP facilitator + Bazaar discovery)
  const paid = await gatePayment(req, res, {
    price: product.price,
    resource: `/api/products/${productId}`,
    description: `Purchase ${productId} — $${product.price} USDC`,
    extensions: productBazaar,
  });

  if (!paid) return;

  // Payment verified — serve content
  const filePath = join(process.cwd(), "gated-products", product.file);

  if (!existsSync(filePath)) {
    return res.status(500).json({ error: "Product file not found on server" });
  }

  const content = readFileSync(filePath, "utf-8");
  res.setHeader("Content-Type", "text/markdown");
  return res.status(200).send(content);
}
