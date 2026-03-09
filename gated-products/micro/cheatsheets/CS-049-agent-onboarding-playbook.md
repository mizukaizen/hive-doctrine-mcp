---
title: "Agent Onboarding Playbook — Cheat Sheet"
hive_doctrine_id: HD-1108
price: 0.99
tier: micro
collection: "Cheat Sheets"
author: "Melisia Archimedes"
full_product: HD-1108
full_product_price: 49
---

# Agent Onboarding Playbook — Cheat Sheet

## What It Is

A 30-day framework for deploying a new AI agent into production. 4 weeks from foundation to launch, with checklists and rollback plans.

## 4-Week Framework

### Week 1: Foundation
- [ ] Define agent role, authority level, and boundaries (use Authority Template)
- [ ] Write system prompt / SOUL.md
- [ ] Set up development environment
- [ ] Configure tools and integrations
- [ ] Write 10 test cases covering expected inputs
- [ ] Run agent in isolation — verify basic functionality

### Week 2: Integration
- [ ] Connect to communication channels (Slack, Discord, Telegram)
- [ ] Configure routing rules (which messages reach this agent)
- [ ] Test handoffs with other agents
- [ ] Verify memory system works (reads and writes correctly)
- [ ] Run 50 test interactions with realistic inputs
- [ ] Fix integration bugs

### Week 3: Optimisation
- [ ] Tune system prompt based on Week 2 results
- [ ] Optimise for cost (model routing, caching)
- [ ] Add error handling for edge cases discovered
- [ ] Set up monitoring and alerting
- [ ] Run load test (simulate expected traffic)
- [ ] Review logs for unexpected behaviour

### Week 4: Launch Readiness
- [ ] Final review of authority scope
- [ ] Rollback plan documented and tested
- [ ] Monitoring dashboards live
- [ ] On-call rotation set for first 2 weeks post-launch
- [ ] Soft launch to 10% of traffic
- [ ] Monitor for 48 hours before full rollout

## Pre-Launch Checklist

- [ ] System prompt reviewed by a human
- [ ] Authority template signed off
- [ ] All tools tested individually
- [ ] Error handling covers top 10 failure modes
- [ ] Monitoring and alerting configured
- [ ] Rollback procedure tested
- [ ] Daily budget limit set

## Baseline Metrics (Capture Before Launch)

| Metric | Target | Measure After |
|--------|--------|---------------|
| Response accuracy | >90% | Week 1 post-launch |
| Latency (p95) | <5 seconds | Daily |
| Error rate | <5% | Daily |
| Cost per interaction | <$0.10 | Weekly |
| User satisfaction | >4/5 | Monthly |

## Rollback Plan

1. Disable agent routing (stop incoming messages)
2. Redirect traffic to fallback (human or backup agent)
3. Preserve logs for post-mortem
4. Fix issue in development environment
5. Re-run Week 2 integration tests before re-deploying

---

*This is the condensed version. The full guide (HD-1108, $49) covers the complete 30-day onboarding framework with detailed checklists, baseline metrics, and rollback procedures. Purchase via MCP: hive-doctrine-mcp.vercel.app/mcp*
