
// app/well/page.tsx
"use client";

import { useState } from "react";

type PuzzleId = "pulse" | "sigils" | "regulator";

type PuzzleMeta = {
  id: PuzzleId;
  title: string;
  subtitle: string;
  label: string;
};

const PUZZLES: PuzzleMeta[] = [
  {
    id: "pulse",
    label: "Pulse Pattern",
    title: "Pulse Pattern Recognition",
    subtitle: "Decode the heartbeat of the Well.",
  },
  {
    id: "sigils",
    label: "Rotating Sigils",
    title: "Rotating Sigils",
    subtitle: "Predict the next symbol in the mechanical rotation.",
  },
  {
    id: "regulator",
    label: "Regulator Lock",
    title: "Regulator Stabilization • PULSAR-LINEAGE",
    subtitle: "Balance the Well’s core variables to release its key.",
  },
];

export default function MechanicalWellPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState<Record<PuzzleId, boolean>>({
    pulse: false,
    sigils: false,
    regulator: false,
  });
  const [wellComplete, setWellComplete] = useState(false);

  const currentPuzzle = PUZZLES[currentIndex];

  function handlePuzzleSolved(id: PuzzleId) {
    setCompleted((prev) => ({ ...prev, [id]: true }));

    const currentIdx = PUZZLES.findIndex((p) => p.id === id);
    const next = currentIdx + 1;
    if (next < PUZZLES.length) {
      setCurrentIndex(next);
    } else {
      setWellComplete(true);
    }
  }

  return (
    <main className="vault-root">
      <div className="vault-root-inner">
        <section className="vault-card">
          {/* Header */}
          <header className="vault-header">
            <div className="vault-label vault-mono">SECTOR: MECHANICAL WELL</div>
            <h1 className="vault-title">Kinetic Control Interface</h1>
            <p className="vault-subtitle">
              Progress:{" "}
              <span className="vault-mono">
                {Object.values(completed).filter(Boolean).length}/{PUZZLES.length}
              </span>{" "}
              puzzles calibrated
            </p>
          </header>

          {/* Progress strip */}
          <ProgressStrip
            puzzles={PUZZLES}
            completed={completed}
            currentId={currentPuzzle.id}
            onNavigate={(id) => {
              const targetIdx = PUZZLES.findIndex((p) => p.id === id);
              const furthestUnlocked = furthestIndexUnlocked(completed);
              if (targetIdx <= furthestUnlocked) {
                setCurrentIndex(targetIdx);
              }
            }}
          />

          {/* AURELIA intro / completion */}
          <section className="vault-console" style={{ marginBottom: "0.75rem" }}>
            {!wellComplete && (
              <>
                <span style={{ color: "hsl(var(--accent))" }}>[AURELIA]</span>{" "}
                You have descended into the Mechanical Well. Its pistons, valves,
                and sigils are the body through which the facility breathes. Tune
                its rhythms, and the pressure will briefly favor your escape.
              </>
            )}
            {wellComplete && (
              <>
                <span style={{ color: "hsl(var(--accent))" }}>[AURELIA]</span>{" "}
                The Well hums evenly. PULSAR-LINEAGE has been restored. Its
                cadence now marches alongside your own.
              </>
            )}
          </section>

          {/* Current puzzle shell */}
          <PuzzleShell puzzle={currentPuzzle} wellComplete={wellComplete}>
            {currentPuzzle.id === "pulse" && (
              <PuzzlePulse
                onSolved={() => handlePuzzleSolved("pulse")}
                solved={completed["pulse"]}
              />
            )}
            {currentPuzzle.id === "sigils" && (
              <PuzzleSigils
                onSolved={() => handlePuzzleSolved("sigils")}
                solved={completed["sigils"]}
              />
            )}
            {currentPuzzle.id === "regulator" && (
              <PuzzleRegulator
                onSolved={() => handlePuzzleSolved("regulator")}
                solved={completed["regulator"]}
              />
            )}
          </PuzzleShell>
        </section>
      </div>
    </main>
  );
}

function furthestIndexUnlocked(completed: Record<PuzzleId, boolean>): number {
  // find the first puzzle that is NOT completed
  const firstIncomplete = PUZZLES.findIndex(p => !completed[p.id]);
  // if all are complete, they can navigate anywhere
  if (firstIncomplete === -1) return PUZZLES.length;
  // otherwise, they can navigate up to and including the first incomplete one
  return firstIncomplete;
}

/* ---------- Progress strip component ---------- */

function ProgressStrip({
  puzzles,
  completed,
  currentId,
  onNavigate,
}: {
  puzzles: PuzzleMeta[];
  completed: Record<PuzzleId, boolean>;
  currentId: PuzzleId;
  onNavigate: (id: PuzzleId) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "0.4rem",
        marginBottom: "0.9rem",
        marginTop: "0.2rem",
        flexWrap: "wrap",
      }}
    >
      {puzzles.map((p, index) => {
        const isActive = p.id === currentId;
        const isDone = completed[p.id];
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onNavigate(p.id)}
            style={{
              borderRadius: 999,
              border: `1px solid ${
                isDone
                  ? "hsl(var(--primary))"
                  : "hsl(var(--border))"
              }`,
              background: isActive
                ? "hsl(var(--primary) / 0.2)"
                : "hsl(var(--card) / 0.5)",
              color: isDone
                ? "hsl(var(--primary))"
                : "hsl(var(--muted-foreground))",
              fontSize: "0.7rem",
              padding: "0.4rem 0.75rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              cursor: "pointer",
            }}
          >
            <span className="vault-mono" style={{ fontSize: "0.68rem" }}>
              {index + 1}
            </span>
            <span>{p.label}</span>
            {isDone && <span style={{ fontSize: "0.7rem" }}>✓</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Puzzle shell ---------- */

function PuzzleShell({
  puzzle,
  children,
  wellComplete,
}: {
  puzzle: PuzzleMeta;
  children: React.ReactNode;
  wellComplete: boolean;
}) {
  return (
    <div className="vault-puzzle-shell">
      <div style={{ marginBottom: "0.5rem" }}>
        <div
          className="vault-mono"
          style={{
            fontSize: "0.85rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "hsl(var(--muted-foreground))",
          }}
        >
          Active Mechanism
        </div>
        <h2
          style={{
            margin: "0.15rem 0 0.2rem",
            fontSize: "1.05rem",
            fontWeight: 600,
            color: "hsl(var(--foreground))",
          }}
        >
          {puzzle.title}
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: "0.8rem",
            color: "hsl(var(--muted-foreground))",
          }}
        >
          {puzzle.subtitle}
        </p>
      </div>

      <div>{children}</div>

      {wellComplete && (
        <p
          style={{
            marginTop: "0.9rem",
            fontSize: "0.72rem",
            color: "hsl(var(--muted-foreground))",
          }}
        >
          The Well&apos;s rhythms now run clean. Only the deeper sectors remain
          out of reach.
        </p>
      )}
    </div>
  );
}

/* =======================================================================
   PUZZLE 1 – PULSE PATTERN RECOGNITION
   ======================================================================= */

function PuzzlePulse({
  onSolved,
  solved,
}: {
  onSolved: () => void;
  solved: boolean;
}) {
  const [input, setInput] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  // thrum thrum pause thrum pause -> 1 1 0 1 0
  const correctPattern = "11010";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (solved) return;

    const guess = input.trim();
    if (!/^[01]{5}$/.test(guess)) {
      setMessage(
        "[AURELIA] Use exactly five characters of 1s and 0s. 1 for a thrum, 0 for a pause."
      );
      return;
    }

    setAttempts((prev) => prev + 1);

    if (guess === correctPattern) {
      setMessage(
        "[AURELIA] Correct. The Well’s heartbeat for this cycle is 1-1-0-1-0. You are listening more closely than most engineers ever did."
      );
      onSolved();
    } else {
      if (attempts >= 2) {
        setMessage(
          "[AURELIA] Watch carefully: the double-thrum always opens the pattern. The pauses are never adjacent."
        );
      } else {
        setMessage(
          "[AURELIA] The translation is incorrect. Hear it again: thrum, thrum, pause, thrum, pause."
        );
      }
    }
  }

  return (
    <div>
      <div className="vault-console" style={{ marginBottom: "0.6rem" }}>
        <span className="vault-mono" style={{ color: "hsl(var(--accent))" }}>
          [Well telemetry]
        </span>
        {"\n\n"}
        A repeating pattern beats through the Well:{"\n\n"}
        thrum — thrum — pause — thrum — pause{"\n\n"}
        Translate this into a 5-symbol numeric sequence where{" "}
        <span className="vault-mono">1</span> = thrum and{" "}
        <span className="vault-mono">0</span> = pause. For example:{" "}
        <span className="vault-mono">10101</span>.
      </div>

      <form onSubmit={handleSubmit}>
        <div className="vault-input-row">
          <input
            className="vault-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={5}
            placeholder="Enter pattern (e.g. 11010)…"
          />
          <button type="submit" className="vault-button" disabled={solved}>
            {solved ? "Calibrated" : "Translate"}
          </button>
        </div>
      </form>

      {message && (
        <p className="vault-error" style={{ marginTop: "0.4rem" }}>
          <span className="vault-error-icon">✶</span>
          <span>{message}</span>
        </p>
      )}

      {solved && (
        <p
          style={{
            marginTop: "0.45rem",
            fontSize: "0.72rem",
            color: "hsl(var(--muted-foreground))",
          }}
        >
          The pulse display steadies, acknowledging your translation. For a
          moment, the machinery seems to breathe with you.
        </p>
      )}
    </div>
  );
}

/* =======================================================================
   PUZZLE 2 – ROTATING SIGILS
   ======================================================================= */

function PuzzleSigils({
  onSolved,
  solved,
}: {
  onSolved: () => void;
  solved: boolean;
}) {
  const [choice, setChoice] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  // Cycle: A (⬟), B (⬢), C (⬣) repeating; the 8th is B (option 2)
  const correct = "B";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (solved) return;

    if (!choice) {
      setMessage("[AURELIA] Select the sigil that will manifest eighth.");
      return;
    }

    setAttempts((prev) => prev + 1);

    if (choice === correct) {
      setMessage(
        "[AURELIA] Precisely. The cycle’s eighth position returns to the second glyph. The engineers never tired of symmetry."
      );
      onSolved();
    } else {
      if (attempts >= 1) {
        setMessage(
          "[AURELIA] Trace the sequence: first, second, third, then it repeats. Consider where eight falls within that pattern."
        );
      } else {
        setMessage(
          "[AURELIA] The Well disagrees. Watch the rotation again; it cares little for guesswork."
        );
      }
    }
  }

  return (
    <div>
      <div className="vault-console" style={{ marginBottom: "0.6rem" }}>
        <span className="vault-mono" style={{ color: "hsl(var(--accent))" }}>
          [Well sigil-ring]
        </span>
        {"\n\n"}
        A ring of mechanical sigils rotates in a fixed sequence. Recorded
        frames:\n\n
        Frame 1: ⬟{"\n"}
        Frame 2: ⬢{"\n"}
        Frame 3: ⬣{"\n"}
        Frame 4: ⬟ (sequence repeats){"\n\n"}
        Which sigil appears in the <strong>8th</strong> position of this cycle?
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.8rem",
              color: "hsl(var(--muted-foreground))",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="sigil"
              value="A"
              checked={choice === "A"}
              onChange={(e) => setChoice(e.target.value)}
              style={{ accentColor: "hsl(var(--primary))" }}
            />
            <span className="vault-mono">A.</span>
            <span>⬟</span>
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.8rem",
              color: "hsl(var(--muted-foreground))",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="sigil"
              value="B"
              checked={choice === "B"}
              onChange={(e) => setChoice(e.target.value)}
              style={{ accentColor: "hsl(var(--primary))" }}
            />
            <span className="vault-mono">B.</span>
            <span>⬢</span>
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.8rem",
              color: "hsl(var(--muted-foreground))",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="sigil"
              value="C"
              checked={choice === "C"}
              onChange={(e) => setChoice(e.target.value)}
              style={{ accentColor: "hsl(var(--primary))" }}
            />
            <span className="vault-mono">C.</span>
            <span>⬣</span>
          </label>
        </div>

        <div style={{ marginTop: "0.6rem" }}>
          <button type="submit" className="vault-button" disabled={solved}>
            {solved ? "Locked In" : "Confirm"}
          </button>
        </div>
      </form>

      {message && (
        <p className="vault-error" style={{ marginTop: "0.4rem" }}>
          <span className="vault-error-icon">✶</span>
          <span>{message}</span>
        </p>
      )}

      {solved && (
        <p
          style={{
            marginTop: "0.45rem",
            fontSize: "0.72rem",
            color: "hsl(var(--muted-foreground))",
          }}
        >
          The sigil ring flickers, then slows. For a breath, every symbol points
          inward, as though listening.
        </p>
      )}
    </div>
  );
}

/* =======================================================================
   PUZZLE 3 – REGULATOR STABILIZATION • PULSAR-LINEAGE
   ======================================================================= */

function PuzzleRegulator({
  onSolved,
  solved,
}: {
  onSolved: () => void;
  solved: boolean;
}) {
  const [p, setP] = useState<string>("");
  const [h, setH] = useState<string>("");
  const [r, setR] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  // Correct: P = 3, H = 4, R = 4
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (solved) return;

    const P = parseInt(p, 10);
    const H = parseInt(h, 10);
    const R = parseInt(r, 10);

    if (Number.isNaN(P) || Number.isNaN(H) || Number.isNaN(R)) {
      setMessage(
        "[AURELIA] All three channels require numeric input. The valves do not respond to abstractions."
      );
      return;
    }

    setAttempts((prev) => prev + 1);

    const total = P + H + R;
    const conditions = {
      evenSum: (P + H) % 2 === 0,
      rOffset: R === P + 1,
      hLimit: H <= 4,
      total: total === 10,
    };

    const allGood =
      conditions.evenSum && conditions.rOffset && conditions.hLimit && conditions.total;

    if (allGood && P === 3 && H === 4 && R === 4) {
      setMessage(
        "[AURELIA] Balance achieved. Pressure, heat, and rotation fall into a soft harmonic. PULSAR-LINEAGE unlocks and threads itself into your access pattern."
      );
      onSolved();
      return;
    }

    // If not correct, give progressive hints
    if (!conditions.total) {
      setMessage(
        "[AURELIA] The Well protests: the sum of P, H, and R must equal ten. It is very particular about that."
      );
    } else if (!conditions.evenSum) {
      setMessage(
        "[AURELIA] The regulators demand that pressure and heat add up to an even value. This configuration is off by one."
      );
    } else if (!conditions.rOffset) {
      setMessage(
        "[AURELIA] Rotational speed must always lead pressure by exactly one unit. You have set them out of step."
      );
    } else if (!conditions.hLimit) {
      setMessage(
        "[AURELIA] Heat cannot exceed four in this cycle. The metal remembers the last time it did."
      );
    } else {
      // conditions satisfied but wrong triple (very unlikely, but safe fallback)
      setMessage(
        "[AURELIA] The equations balance on paper, but the Well remains uneasy. Try a different combination."
      );
    }
  }

  return (
    <div>
      <div className="vault-console" style={{ marginBottom: "0.6rem" }}>
        <span className="vault-mono" style={{ color: "hsl(var(--accent))" }}>
          [Regulator array]
        </span>
        {"\n\n"}
        Three variables govern the Mechanical Well&apos;s core cycle:\n\n
        P = Pressure{"\n"}
        H = Heat{"\n"}
        R = Rotational speed{"\n\n"}
        The Well will only stabilize under a configuration where:\n
        • P + H is even.{"\n"}
        • R is exactly 1 more than P.{"\n"}
        • H does not exceed 4.{"\n"}
        • P + H + R = 10.{"\n\n"}
        Enter integer values for P, H, and R that satisfy all constraints.
      </div>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "0.5rem",
          }}
        >
          <div>
            <div
              className="vault-mono"
              style={{
                fontSize: "0.7rem",
                color: "hsl(var(--muted-foreground))",
                marginBottom: "0.2rem",
              }}
            >
              P (Pressure)
            </div>
            <input
              className="vault-input"
              value={p}
              onChange={(e) => setP(e.target.value)}
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="3"
            />
          </div>
          <div>
            <div
              className="vault-mono"
              style={{
                fontSize: "0.7rem",
                color: "hsl(var(--muted-foreground))",
                marginBottom: "0.2rem",
              }}
            >
              H (Heat)
            </div>
            <input
              className="vault-input"
              value={h}
              onChange={(e) => setH(e.target.value)}
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="4"
            />
          </div>
          <div>
            <div
              className="vault-mono"
              style={{
                fontSize: "0.7rem",
                color: "hsl(var(--muted-foreground))",
                marginBottom: "0.2rem",
              }}
            >
              R (Rotation)
            </div>
            <input
              className="vault-input"
              value={r}
              onChange={(e) => setR(e.target.value)}
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="4"
            />
          </div>
        </div>

        <div style={{ marginTop: "0.7rem" }}>
          <button type="submit" className="vault-button" disabled={solved}>
            {solved ? "Stabilized" : "Engage"}
          </button>
        </div>
      </form>

      {message && (
        <p className="vault-error" style={{ marginTop: "0.4rem" }}>
          <span className="vault-error-icon">✶</span>
          <span>{message}</span>
        </p>
      )}

      {solved && (
        <p
          style={{
            marginTop: "0.45rem",
            fontSize: "0.72rem",
            color: "hsl(var(--muted-foreground))",
          }}
        >
          Deep below, immense pistons fall into step. The Well no longer fights
          you; for this cycle, at least, you are moving with its pulse.
        </p>
      )}
    </div>
  );
}

    