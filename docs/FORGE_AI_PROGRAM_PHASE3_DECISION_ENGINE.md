# Phase 3 Summary

Phase 3 adds the scientific decision layer between the Phase 2 setup flow and the future exercise-selection engine.

It does not generate a final workout plan yet.

It decides why one structure is more appropriate than another based on:

- goal
- training age
- schedule
- session duration
- equipment
- recovery
- priority muscles
- pain or limitation context
- optional physique-analysis context

The result is a `Program Decision Blueprint` that future phases can consume safely.

----------------------------------------------------

# Scientific Decision Engine

The decision engine exists to prevent generic templates.

Instead of saying "do 3x12," it decides:

- which split best fits the user
- how many days FORGE should actually start with
- how aggressive the starting volume should be
- how recovery changes the recommendation
- how priority muscles should influence structure without breaking balance
- which alternative structures were considered and rejected
- how confident FORGE is in the decision

This keeps Phase 3 focused on structure logic, not final exercise prescription.

----------------------------------------------------

# Split Selection Rules

The split engine compares multiple valid structures, then scores them against user context.

Available structures:

- Full Body
- Upper / Lower
- Push / Pull / Legs
- Torso / Limbs
- Anterior / Posterior
- Body-part emphasis split
- Hybrid split
- Minimalist home split

Core selection rules:

- `2 days`: usually Full Body, Hybrid, or Minimalist Home.
- `3 days`: usually Full Body or Hybrid. Compressed PPL is possible but rarely the safest default.
- `4 days`: usually Upper / Lower, Torso / Limbs, Anterior / Posterior, or Hybrid.
- `5 days`: usually Hybrid, Upper / Lower + specialization, or PPL when recovery allows it.
- `6 days`: only when experience and recovery justify it.

The engine scores splits using:

- adherence fit
- fatigue management
- equipment realism
- session duration fit
- experience level
- recovery level
- goal alignment
- priority-muscle placement quality

Popularity is never a valid reason by itself.

----------------------------------------------------

# Goal Strategy Rules

`Build Muscle`

- favor recoverable weekly hypertrophy volume
- prioritize progression and stimulus quality
- avoid junk volume

`Lose Fat`

- prioritize muscle retention and adherence
- reduce volume when recovery is poor
- avoid using fatigue as a punishment tool

`Recomposition`

- balanced hypertrophy and consistency
- moderate volume and realistic progression

`Strength`

- prioritize lift practice and recoverable heavy exposure
- reduce unnecessary accessory fatigue

`Athletic Performance`

- protect movement quality
- avoid excessive soreness and non-specific fatigue

`General Fitness`

- choose the lowest-friction balanced structure
- make consistency the default win condition

`Return to Training`

- use a conservative ramp
- do not pretend old capacity is still current capacity

----------------------------------------------------

# Experience Level Rules

`Beginner`

- simpler splits
- fewer moving parts
- lower volume
- more practice frequency
- less failure exposure

`Returning`

- gradual ramp
- avoid jumping straight to old workload

`Intermediate`

- enough structure for progression
- moderate specialization allowed

`Advanced`

- higher specialization is possible
- fatigue management becomes even more important

----------------------------------------------------

# Priority Muscle Rules

Priority muscles can shape structure, but they cannot dominate everything.

Rules:

- maximum 3 priorities
- priority muscles may receive better exercise placement and slightly better frequency
- priorities should be trained when fresher when possible
- legs can never be erased just because aesthetics are upper-body focused
- push/pull balance cannot be broken for visual preference
- poor recovery limits extra priority volume

This keeps specialization useful without becoming reckless.

----------------------------------------------------

# Physique Analysis Decision Rules

Physique analysis remains a soft signal only.

Allowed:

- suggest possible emphasis areas
- support aesthetic prioritization
- enrich explanation copy

Not allowed:

- diagnosis
- exact body-fat claims
- posture diagnosis
- medical inference
- overriding explicit pain or preference inputs

If physique analysis conflicts with direct user input, user input wins unless safety is at risk.

----------------------------------------------------

# Recovery-Adjusted Decision Rules

Recovery changes aggressiveness before it changes ambition.

`Poor recovery`

- lower starting volume
- fewer near-failure exposures
- simpler split choices
- recommended days may be reduced

`Okay recovery`

- moderate volume
- controlled progression

`Great recovery`

- moderate-high volume possible
- more specialization can be allowed if the rest of the profile supports it

This prevents over-programming users whose recovery does not support it.

----------------------------------------------------

# Frequency Strategy

Frequency is driven by:

- goal
- days available
- experience
- recovery
- session duration
- priority muscles

Guiding rules:

- most muscles: 1-3 times per week depending on the chosen structure
- priority muscles: 2-3 times per week when recoverable
- beginners: higher practice frequency with lower per-session volume
- advanced: frequency depends on specialization tolerance, not dogma

----------------------------------------------------

# Effort / RIR Strategy

Phase 3 sets policy, not exact set-by-set prescriptions.

General policy:

- beginner: mostly RIR 2-4
- returning: conservative ramp, avoid repeated failure
- intermediate: mostly RIR 1-3
- advanced: strategic RIR 0-2 can appear

Fatigue modifiers:

- poor recovery reduces frequent near-failure exposure
- compounds stay more conservative than isolations

----------------------------------------------------

# Volume Direction Strategy

Phase 3 does not assign exact weekly set counts.

It decides the starting direction:

- conservative
- moderate
- moderate-high
- specialization

The decision is driven by:

- goal
- experience
- recovery
- session duration
- number of priorities

The engine explicitly tries to avoid:

- junk volume
- beginner overkill
- sudden volume spikes
- high volume plus high failure as a default combination

----------------------------------------------------

# Alternative Structure Comparison

The engine compares at least two structures before choosing one.

Example:

- `4 days + build muscle + intermediate + gym + shoulders/upper back priority`
- alternatives: Upper / Lower, Torso / Limbs, Hybrid
- selected: Torso / Limbs

Reason:

- stronger upper-body priority placement
- good fatigue separation
- better freshness for shoulder and upper-back work
- still easier to recover from than more extreme specialization

This comparison step is what makes the system feel reasoned rather than templated.

----------------------------------------------------

# Program Decision Blueprint

```ts
type AIProgramDecisionBlueprint = {
  recommendedSplit: AIProgramSplitKey;
  recommendedSplitLabel: string;
  recommendedTrainingDays: number;
  weeklyStructure: string[];
  rationale: string[];
  goalStrategy: string[];
  priorityMuscleStrategy: string[];
  recoveryStrategy: string[];
  volumeDirection: 'conservative' | 'moderate' | 'moderate_high' | 'specialization';
  effortStrategy: string[];
  frequencyStrategy: string[];
  safetyConstraints: string[];
  assumptions: string[];
  confidence: 'low' | 'medium' | 'high';
  confidenceRationale: string[];
  alternativesConsidered: {
    split: AIProgramSplitKey;
    label: string;
    weeklyStructure: string[];
    score: number;
    rationale: string[];
    tradeoffs: string[];
    rejectedReason?: string;
  }[];
  evidenceCategories: string[];
  whyThisPlan: string[];
  futureExerciseConstraints: string[];
};
```

----------------------------------------------------

# Safety Override Rules

The engine can modify unsafe intent instead of obeying it literally.

Examples:

- beginner + 6 days -> reduce recommended starting days
- poor recovery + 5-6 days -> lower frequency and simplify structure
- pain reported -> add conservative exercise-selection flags for Phase 4
- return to training + high ambition -> rebuild gradually first

The message style should remain calm:

"FORGE will start with a safer version and progress if recovery stays strong."

----------------------------------------------------

# Confidence Evaluation

Confidence increases when:

- primary goal is clear
- equipment is clear
- recovery is clear
- schedule is realistic
- priorities are limited

Confidence drops when:

- pain details are vague
- important profile fields are incomplete
- requested frequency is unrealistic
- recovery is poor
- three priorities create too much complexity
- physique context exists without enough profile depth

Confidence affects how conservative the future generator should be.

----------------------------------------------------

# UI / UX Presentation Strategy

The user should not see a wall of sports-science text.

Later UI should show:

- `Why this plan?`
- selected split
- starting training days
- short explanation bullets
- confidence level
- a compact note saying alternatives were considered

Best pattern:

- plain language
- short bullets
- no fake citations
- no "best program ever" tone

----------------------------------------------------

# Proposed Files / Modules

- [src/types/aiProgramDecision.ts](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/types/aiProgramDecision.ts)
- [src/services/aiProgramDecisionEngine.ts](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/services/aiProgramDecisionEngine.ts)
- [src/services/aiProgramSplitRules.ts](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/services/aiProgramSplitRules.ts)
- [src/services/aiProgramGoalRules.ts](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/services/aiProgramGoalRules.ts)
- [src/services/aiProgramRecoveryRules.ts](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/services/aiProgramRecoveryRules.ts)
- [src/services/aiProgramPriorityRules.ts](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/services/aiProgramPriorityRules.ts)
- [src/services/aiProgramDecisionValidator.ts](C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/services/aiProgramDecisionValidator.ts)

----------------------------------------------------

# Integration Points With Phase 2

Phase 3 consumes the existing Phase 2 `AIProgramDecisionContext`.

Integration behavior:

- Phase 2 still owns profiling and validation
- Phase 3 consumes that context and returns a blueprint
- the builder saves this blueprint into the local AI program draft
- no chat surface is introduced
- no new top-level navigation is introduced

----------------------------------------------------

# Out of Scope For Phase 3

- exact exercise selection
- set and rep prescription
- final RIR per exercise
- progression tables
- deload logic
- monetization
- chatbot behavior
- store-ready premium logic

----------------------------------------------------

# Risks / Open Questions

- Some future exercise-selection rules will need stronger limitation-specific mapping.
- Confidence is only as good as the honesty and completeness of user inputs.
- Physique-analysis wording must stay soft so users do not mistake it for diagnosis.
- Phase 4 must respect the blueprint instead of silently replacing it with generic exercise templates.

----------------------------------------------------

Would this decision engine prevent generic "3x12" programs?

YES

Because it decides structure from constraints, recovery, goal, and alternatives before any set-rep prescription exists. That makes one-size-fits-all defaults much harder to slip in unnoticed.

Would this decision engine produce safer and more individualized programs?

YES

Because it applies safety overrides, reduces aggressiveness when recovery is weak, limits unrealistic frequency, and uses priorities without letting them break balance.

Is this ready for Phase 4 Exercise Selection Engine?

YES

Because Phase 4 now has a stable blueprint that defines split, weekly structure, aggressiveness, confidence, and safety constraints before choosing actual exercises.
