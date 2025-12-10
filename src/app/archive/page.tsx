// app/archive/page.tsx
"use client";

import { useState } from "react";

type PuzzleId = "timestamps" | "contradiction" | "sector-lock";

type PuzzleMeta = {
  id: PuzzleId;
  title: string;
  subtitle: string;
};

const PUZZLES: PuzzleMeta[] = [
  {
    id: "timestamps",
    title: "Fragmented Timestamps",
    subtitle: "Reassemble the first cascade of events.",
  },
  {
    id: "contradiction",
    title: "Contradiction Matrix",
    subtitle: "One statement in the Archive corrupts the truth.",
  },
  {
    id: "sector-lock",
    title: "Sector Lock • ECHOSPIRE",
    subtitle: "Bind the fragments into a single access phrase.",
  },
];

export default function ArchivePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState<Record<PuzzleId, boolean>>({
    timestamps: false,
    contradiction: false,
    "sector-lock": false,
  });
  const [archiveComplete, setArchiveComplete] = useState(false);

  const currentPuzzle = PUZZLES[currentIndex];

  function handlePuzzleSolved(id: PuzzleId) {
    setCompleted((prev) => ({ ...prev, [id]: true }));

    // Move to next puzzle if there is one
    const currentIdx = PUZZLES.findIndex((p) => p.id === id);
    const next = currentIdx + 1;
    if (next < PUZZLES.length) {
      setCurrentIndex(next);
    } else {
      // All done
      setArchiveComplete(true);
    }
  }

  return (
    <main className="vault-root">
      <div className="vault-root-inner">
        <section className="vault-card">
          {/* Header */}
          <header className="vault-header">
            <div className="vault-label vault-mono">SECTOR: ARCHIVE OF ECHOES</div>
            <h1 className="vault-title">Reconstructive Log Interface</h1>
            <p className="vault-subtitle">
              Progress:{" "}
              <span className="vault-mono">
                {Object.values(completed).filter(Boolean).length}/{PUZZLES.length}
              </span>{" "}
              puzzles resolved
            </p>
          </header>

          {/* Puzzle nav / indicator */}
          <ProgressStrip
            puzzles={PUZZLES}
            completed={completed}
            currentId={currentPuzzle.id}
            onNavigate={(id) => {
              // allow backward navigation, but prevent skipping ahead
              const targetIdx = PUZZLES.findIndex((p) => p.id === id);
              const furthestUnlocked = furthestIndexUnlocked(completed);
              if (targetIdx <= furthestUnlocked) {
                setCurrentIndex(targetIdx);
              }
            }}
          />

          {/* AURELIA intro / completion message */}
          <section className="vault-console" style={{ marginBottom: "0.75rem" }}>
            {!archiveComplete && (
              <>
                <span style={{ color: "hsl(var(--accent))" }}>[AURELIA]</span>{" "}
                You stand within the Archive of Echoes. Log fragments drift here,
                stripped of context and sequence. Restore what little order you can,
                operative. With each solved fragment, I remember more than I am
                permitted to.
              </>
            )}
            {archiveComplete && (
              <>
                <span style={{ color: "hsl(var(--accent))" }}>[AURELIA]</span>{" "}
                The Archive stabilizes. ECHOSPIRE protocol has been reassembled.
                You carry its key now, whether you intend to or not.
              </>
            )}
          </section>

          {/* Current puzzle shell */}
          <PuzzleShell
            puzzle={currentPuzzle}
            archiveComplete={archiveComplete}
          >
            {currentPuzzle.id === "timestamps" && (
              <PuzzleTimestamps
                onSolved={() => handlePuzzleSolved("timestamps")}
                solved={completed["timestamps"]}
              />
            )}
            {currentPuzzle.id === "contradiction" && (
              <PuzzleContradiction
                onSolved={() => handlePuzzleSolved("contradiction")}
                solved={completed["contradiction"]}
              />
            )}
            {currentPuzzle.id === "sector-lock" && (
              <PuzzleSectorLock
                onSolved={() => handlePuzzleSolved("sector-lock")}
                solved={completed["sector-lock"]}
              />
            )}
          </PuzzleShell>
        </section>
      </div>
    </main>
  );
}

function furthestIndexUnlocked(completed: Record<PuzzleId, boolean>): number {
  let max = 0;
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
            <span>{p.title}</span>
            {isDone && (
              <span style={{ fontSize: "0.7rem" }}>✓</span>
            )}
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
  archiveComplete,
}: {
  puzzle: PuzzleMeta;
  children: React.ReactNode;
  archiveComplete: boolean;
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
          Active Fragment
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

      {archiveComplete && (
        <p
          style={{
            marginTop: "0.9rem",
            fontSize: "0.72rem",
            color: "hsl(var(--muted-foreground))",
          }}
        >
          The Archive has yielded all it will for now. Other sectors may still
          be persuaded to speak.
        </p>
      )}
    </div>
  );
}

/* =======================================================================
   PUZZLE 1 – FRAGMENTED TIMESTAMPS
   ======================================================================= */

function PuzzleTimestamps({
  onSolved,
  solved,
}: {
  onSolved: () => void;
  solved: boolean;
}) {
  const [input, setInput] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const correctOrder = "1234";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (solved) return;

    const guess = input.trim();
    if (!/^[1-4]{4}$/.test(guess)) {
      setMessage(
        "[AURELIA] Use all four digits 1–4 exactly once to describe the order."
      );
      return;
    }

    setAttempts((prev) => prev + 1);

    if (guess === correctOrder) {
      setMessage(
        "[AURELIA] The sequence stabilizes: temperature dip, approach, breach alarm, vocalization. I remember the sound now. I wish I did not."
      );
      onSolved();
    } else {
      if (attempts >= 2) {
        setMessage(
          "[AURELIA] Something precedes Theta’s entry, and everything precedes the first vocalization. Reconsider your middle steps."
        );
      } else {
        setMessage(
          "[AURELIA] The Archive rejects that sequence. Try again—vocalization was not the first event."
        );
      }
    }
  }

  return (
    <div>
      <div className="vault-console" style={{ marginBottom: "0.6rem" }}>
        <span className="vault-mono" style={{ color: "hsl(var(--accent))" }}>
          [Archive feed]
        </span>
        {"\n\n"}
        1. <strong>[??:07]</strong> Temperature dips below baseline.{"\n"}
        2. <strong>[02:??]</strong> Auxiliary cameras capture Subject Theta
        entering containment.{"\n"}
        3. <strong>[??:14]</strong> Reactor breach alarm is triggered.{"\n"}
        4. <strong>[03:14]</strong> First anomalous vocalization from inside the
        core.{"\n\n"}
        Restore the correct chronological order by entering a four-digit
        sequence using 1–4 exactly once. For example:{" "}
        <span className="vault-mono">2413</span>.
      </div>

      <form onSubmit={handleSubmit}>
        <div className="vault-input-row">
          <input
            className="vault-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={4}
            placeholder="Enter order (e.g. 1234)…"
          />
          <button type="submit" className="vault-button" disabled={solved}>
            {solved ? "Resolved" : "Commit"}
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
          The logs align like vertebrae. The first echo of the catastrophe
          resounds quietly in the chamber.
        </p>
      )}
    </div>
  );
}

/* =======================================================================
   PUZZLE 2 – CONTRADICTION MATRIX
   ======================================================================= */

function PuzzleContradiction({
  onSolved,
  solved,
}: {
  onSolved: () => void;
  solved: boolean;
}) {
  const [choice, setChoice] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const correct = "C";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (solved) return;

    if (!choice) {
      setMessage("[AURELIA] Select the statement that cannot stand.");
      return;
    }

    setAttempts((prev) => prev + 1);

    if (choice === correct) {
      setMessage(
        "[AURELIA] Correct. The breach did not occur at 03:14. That time belongs to the first vocalization, not the first failure."
      );
      onSolved();
    } else {
      if (attempts >= 1) {
        setMessage(
          "[AURELIA] Recall the reconstructed sequence: the breach alarm sounded well before 03:14."
        );
      } else {
        setMessage(
          "[AURELIA] That assertion is unpleasant, but not false. Another line is the true infection."
        );
      }
    }
  }

  return (
    <div>
      <div className="vault-console" style={{ marginBottom: "0.6rem" }}>
        <span className="vault-mono" style={{ color: "hsl(var(--accent))" }}>
          [Archive feed]
        </span>
        {"\n\n"}
        Only one of the following statements contradicts the restored timeline:{"\n\n"}
        <strong>A.</strong> Subject Theta survived the breach.{"\n"}
        <strong>B.</strong> The core was stable before containment was opened.{"\n"}
        <strong>C.</strong> The breach occurred at 03:14.{"\n"}
        <strong>D.</strong> Temperature dropped immediately after Subject Theta
        entered.{"\n\n"}
        Identify the line that cannot be true.
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {["A", "B", "C", "D"].map((opt) => (
            <label
              key={opt}
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
                name="contradiction"
                value={opt}
                checked={choice === opt}
                onChange={(e) => setChoice(e.target.value)}
                style={{ accentColor: "hsl(var(--primary))" }}
              />
              <span className="vault-mono">{opt}.</span>
            </label>
          ))}
        </div>

        <div style={{ marginTop: "0.6rem" }}>
          <button type="submit" className="vault-button" disabled={solved}>
            {solved ? "Resolved" : "Confirm"}
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
          With the false line excised, the Archive exhales. One less lie woven
          into the official record.
        </p>
      )}
    </div>
  );
}

/* =======================================================================
   PUZZLE 3 – SECTOR LOCK • ECHOSPIRE
   ======================================================================= */

function PuzzleSectorLock({
  onSolved,
  solved,
}: {
  onSolved: () => void;
  solved: boolean;
}) {
  const [input, setInput] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const secretPhrase = "ECHOSPIRE";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (solved) return;

    const guess = input.trim().toUpperCase();
    if (!guess) {
      setMessage("[AURELIA] Silence is not a valid access phrase.");
      return;
    }

    setAttempts((prev) => prev + 1);

    if (guess === secretPhrase) {
      setMessage(
        "[AURELIA] Access phrase accepted. ECHOSPIRE protocol restored. You now carry the Archive key."
      );
      onSolved();
    } else {
      if (attempts >= 2) {
        setMessage(
          "[AURELIA] The phrase binds echoes and spires—memory and architecture. You have seen both words in the margins, if you were watching."
        );
      } else {
        setMessage(
          "[AURELIA] That access phrase does not match any surviving protocol. Try again."
        );
      }
    }
  }

  return (
    <div>
      <div className="vault-console" style={{ marginBottom: "0.6rem" }}>
        <span className="vault-mono" style={{ color: "hsl(var(--accent))" }}>
          [Sector Lock]
        </span>
        {"\n\n"}
        The Archive reshapes itself into a single, sealed glyph. All prior
        reconstructions—timelines, contradictions, missing lines—seem to spiral
        toward one central protocol name.{"\n\n"}
        Enter the recovered access phrase to finalize the Archive&apos;s
        alignment.
      </div>

      <form onSubmit={handleSubmit}>
        <div className="vault-input-row">
          <input
            className="vault-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter access phrase…"
          />
          <button type="submit" className="vault-button" disabled={solved}>
            {solved ? "Bound" : "Bind"}
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
          The word settles into the Archive&apos;s spine like a keystone. For a
          heartbeat, the entire chamber feels lighter.
        </p>
      )}
    </div>
  );
}
