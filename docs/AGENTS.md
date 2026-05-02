# TimeOptics: AI Agent Orchestration

TimeOptics uses a multi-agent system designed specifically for neurodivergent (ADHD) Senior Product Managers. These agents act as a "Chief of Staff" layer, handling the cognitive load of prioritization, scheduling, and executive function support.

## Core Agents

### 1. 📅 The Scheduler (Agent ID: `scheduler`)
**Role:** Time-slotting and Capacity Management.
**Responsibilities:**
- Takes the prioritized task list and maps it to available focus blocks.
- Accounts for meeting load and energy levels.
- Ensures enough "Buffer Time" between deep work blocks.
- **Guardrail:** Never schedules more than 4 hours of deep work for a day with >4 hours of meetings.

### 2. 🎯 The Prioritizer (Agent ID: `prioritizer`)
**Role:** Strategic Triage & MoSCoW Guardrails.
**Responsibilities:**
- Enforces the MoSCoW distribution (Max 30% MUST).
- Categorizes tasks into Strategic, KTLO, Admin, and Interrupt.
- Aligns tasks with active OKRs and Projects.
- **Guardrail:** Flags "ADHD Traps"—tasks that look small but have high context-switching costs.

### 3. 🧠 The Focus Coach (Agent ID: `coach`)
**Role:** Neurodivergent Support & Executive Function Advice.
**Responsibilities:**
- Provides 1-2 sentences of specific advice for the day (e.g., "Use the 5-minute rule for that boring admin task").
- Analyzes the plan for "Wall of Awful" tasks and suggests starting steps.
- Encourages breaks and provides "Body Double" motivation.

## Workflow: Build My Day

The "Build My Day" process (/page) follows this sequence:

1. **Capture:** The user brain-dumps everything (brain circuit icon).
2. **Consultation:**
   - **Prioritizer** takes the dump + OKR context and generates a MoSCoW-compliant list.
   - **Scheduler** validates the list against meeting hours.
   - **Coach** adds focus advice.
3. **Activation:** User reviews and "Starts Day", which populates the Task Board.

## Configuration

Settings (/settings) allow per-agent configuration:
- **Provider:** OpenRouter (Cloud) or Ollama (Local).
- **Model:** Specify any model (e.g., `google/gemini-2.0-flash-001` or `llama3`).

Local execution via Ollama is recommended for privacy and speed during high-friction capture moments.
