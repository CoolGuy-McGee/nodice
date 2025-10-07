# Farkle 3D – Team Project Plan

A structured 9-week roadmap (Weeks 4–12) for building a 3D Farkle game in Godot 4.
The final deliverable will be a stable, playable, and exportable version featuring variable gameplay modifiers such as big dice, low gravity, or missing dice.
Week 12 is intentionally lighter to allow for finals and wrap-up work.

---

## Timeline (Week 4 → Week 12)

### Week 4 — 3D Dice Prototype (read top faces)

**Goal:** Six physics dice roll on a 3D table; after settling, the game reliably knows each top value.
**Done when:**

* Six dice spawn on a table with walls; Roll button tumbles them.
* Settle detection works (no jitter loops); top-face read ≥ 95 % accurate across 30 trials.
* Auto re-roll any ambiguous die after 2 seconds.

**Team split:**
Gameplay (roll / settle), Systems (face-reading logic and thresholds), UX (basic UI and camera rig), PM / QA (test matrix and acceptance list).

---

### Week 5 — Scoring Engine Spec and Test Data

**Goal:** Formalize all scoring rules and test cases; integrate with UI readouts.
**Done when:**

* Written spec of rules (1s, 5s, three-of-a-kind, 1–6 straight, three pairs) with edge-case notes.
* Table-driven test dataset (inputs / expected outputs) prepared.
* UI shows current roll values and Farkle flag based on scoring logic.

---

### Week 6 — Full Turn Loop (Hot-Seat) + Keep / Bank

**Goal:** Play a complete round: roll → keep scorers → bank / roll again → next player.
**Done when:**

* Dice can be marked kept / unkept with clear visual feedback.
* Re-roll affects only unkept dice.
* Bank adds to player’s total; Farkle loses round points; target score ends the game.
* Two players can complete a game without manual resets.

---

### Week 7 — UX Pass + Tutorial Overlay

**Goal:** Create a self-explanatory flow for new players.
**Done when:**

* Status banners indicate current phase (Roll, Select, Bank, Farkle).
* Tutorial overlay added (3–4 simple steps).
* Basic sound effects integrated (roll, select, bank, Farkle).

---

### Week 8 — Modifier System (foundation) + 2 Modifiers

**Goal:** Implement data-driven mutators that affect gameplay.
**Done when:**

* Hooks defined: `on_round_start`, `pre_roll(dice)`, `post_roll(dice)`, `pre_score(values) → values`.
* Presets selectable (Classic, Party).
* Big Dice and Low Gravity change gameplay clearly.

---

### Week 9 — Mid-Project QA + Stability Pass

**Goal:** Ensure stable physics and consistent scoring before adding more modifiers.
**Done when:**

* Conduct QA tests across multiple play sessions.
* Physics tuned for reliable dice rolls.
* No soft locks or stuck dice after 10 or more turns.

---

### Weeks 10–11 — 5+ Modifiers + Edge-Case QA

**Goal:** Add variety while maintaining stability.
**Done when:**

* Add Missing Die, Double Ones, Same-Face Swarm (or similar).
* Playtest three full games using different presets; scoring remains correct and stable.

---

### Week 12 — Ship

**Goal:** Deliver a stable, exportable build with complete documentation.
**Done when:**

* Options and presets saved / loaded correctly.
* Performance sweep complete (CCD on dice, angular-velocity caps, memory pooling).
* Exports built for Windows, macOS, and Linux.
* Final README includes controls, rules, and preset descriptions.

*(Optional polish: skins, confetti, or basic AI.)*

---

## File and Folder Structure

This structure is **not exact and is subject to change** as development progresses.

```
/project_root
  /addons/
  /assets/
    /audio/           roll.wav, select.wav, bank.wav, farkle.wav
    /fonts/
    /materials/
    /models/           dice.glb, table.glb
    /textures/         dice_albedo.png, ui_icons.png
  /docs/
    DESIGN_OVERVIEW.md
    SCORING_SPEC.md
    TEST_CASES_SCORING.csv
    MODIFIER_CATALOG.md
    QA_CHECKLIST.md
    RELEASE_NOTES.md
  /export/
    presets.cfg
  /scenes/
    Game.tscn
    /core/            Table3D.tscn, Dice3D.tscn, CameraRig.tscn
    /ui/              HUD.tscn, TutorialOverlay.tscn, ModifiersPanel.tscn
    /effects/         ScreenShake.tscn, Confetti.tscn
  /scripts/
    GameManager.gd
    DiceController.gd
    Dice3D.gd
    Table3D.gd
    CameraRig.gd
    ScoringEngine.gd
    FarkleRules.gd
    ModifierSystem.gd
    /modifiers/       Mod_BigDice.gd, Mod_LowGravity.gd, Mod_MissingDie.gd,
                      Mod_DoubleOnes.gd, Mod_SameFaceSwarm.gd
    /ui/              HUD.gd, TutorialOverlay.gd, ModifiersPanel.gd
    /util/            SaveConfig.gd, RNG.gd, Pools.gd
  /tests/             MANUAL_ROLL_LOG.md, PERFORMANCE_NOTES.md
  project.godot
  README.md
```

---

## Scene Graphs (High-Level)

### Game.tscn

```
Game
 ├─ Table3D
 ├─ DiceRoot (contains 6 Dice3D)
 ├─ CameraRig
 └─ UI (HUD + TutorialOverlay)
```

### Dice3D.tscn

```
Dice3D (RigidBody3D)
 ├─ MeshInstance3D
 ├─ CollisionShape3D
 └─ FaceAnchors
     ├─ Face1 (Marker3D)
     ├─ Face2
     ├─ Face3
     ├─ Face4
     ├─ Face5
     └─ Face6
```

### HUD.tscn

```
HUD (Control)
 ├─ StatusLabel
 ├─ ValuesLabel
 ├─ Buttons
 │   ├─ RollButton
 │   ├─ BankButton
 │   └─ EndTurnButton
 └─ ModifiersPanel
```

---

## Naming and Conventions

* **Scenes:** PascalCase (e.g. `Game.tscn`, `Dice3D.tscn`)
* **Scripts:** PascalCase matching scene (e.g. `GameManager.gd`)
* **Nodes:** PascalCase; variables use snake_case
* **Signals:** past-tense (e.g. `roll_started`, `dice_settled`)
* **Folders:** lowercase_snake (`/assets/models`, `/scripts/modifiers`)
* **Modifiers:** `Mod_*` prefix, one hook section per file with brief description

---

## Roles and Cadence

* **PM / QA:** Performs weekly acceptance checks and tracks progress.
* **Gameplay:** Handles dice physics, settle / read logic, reroll flow.
* **Systems:** Implements scoring, turn state machine, modifiers.
* **UX:** Designs HUD, tutorial, and accessibility elements.

**Weekly Schedule**

* Monday: planning (6–10 small tasks ≤ 1 day each)
* Wednesday: midpoint demo or check-in
* Friday: QA review and weekly release tag

---

## Acceptance Checklists

**Week 4 (Dice prototype)**

* 6 dice spawn and stay on table.
* Settle detection pauses input until complete.
* Top face read ≥ 95 % accurate across 30 trials.
* Camera orbit / pan / zoom functional.

**Week 6 (Turn loop)**

* Keep / unkeep states visible and persistent.
* Reroll only unkept dice.
* Bank and Farkle states function correctly.
* Two-player game fully playable.

**Week 8 (Modifiers foundation)**

* Preset selection persists into round.
* Big Dice and Low Gravity modifiers work as intended.
* Modifier banner displays active effects.

**Week 12 (Final build)**

* Options save and load properly.
* Exports built for all platforms.
* Ten consecutive games run without crash or performance drop.

---

## Modifier Backlog (Prioritized)

1. **Big Dice** – increase die size and roll impulse.
2. **Low Gravity** – reduce gravity for dice this round.
3. **Missing Die** – spawn five dice instead of six.
4. **Double Ones** – double the score value for ones.
5. **Same-Face** Swarm – chance for all dice to match after roll.
6. **Sticky Edges** – dice near rails auto-mark kept.
7. **Exploding Sixes** – each six adds a temporary bonus die.
8. **Heavy Fives** – fives worth 75, ones worth 50.
9. **Reverse Straight** – straight from 2–6 counts; one ignored.

Target ≥ 5 stable modifiers by Week 11.

---

## Risks and Scope Adjustments

* If Week 4 accuracy < 95 %: add re-roll for ambiguous dice and continue.
* If Week 6 slips: freeze rule set and defer complex scoring.
* If Week 8 slips: limit to three modifiers.
* If Week 11 slips: skip visual polish to focus on stability.

---

## Minimum Assets

* One dice mesh and collision shape.
* One table mesh with walls.
* Four sound effects.
* One readable UI font.
* Simple text-based buttons or icons.

---

## Task Board (Week 4)

* Create Table3D scene with walls and physics materials.
* Create Dice3D scene with six normalized face markers.
* Define roll impulse presets.
* Set settle criteria and ambiguous-detection plan.
* Implement CameraRig orbit / pan / zoom limits.
* Add HUD with roll button and values display.
* QA: perform 30 test rolls and record results.