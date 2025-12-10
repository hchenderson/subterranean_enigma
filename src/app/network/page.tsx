// app/network/page.tsx
"use client";

import { useState } from "react";

type PuzzleId = "cipher" | "routing" | "identity";

type PuzzleMeta = {
  id: PuzzleId;
  title: string;
  subtitle: string;
  label: string;
};

const PUZZLES: PuzzleMeta[] = [
  {
    id: "cipher",
    label: "Cipher Cascade",
    title: "Cipher Cascade",
    subtitle: "Probe the Network's outer firewall with a simple cipher.",
  },
  {
    id: "routing",
    label: "Glitch Routing",
    title: "Glitch Routing",
    subtitle: "Disentangle false paths from the true data channel.",
  },
  {
    id: "identity",
    label: "Identity Hash",
    title: "Identity Hash Extraction • AURELION-PRIME",
    subtitle: "Name the core process that has been hiding in the static.",
  },
];

export default function ShroudedNetworkPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState<Record<PuzzleId, boolean>>({
    cipher: false,
    routing: false,
    identity: false,
  });
  const [networkComplete, setNetworkComplete] = useState(false);

  const currentPuzzle = PUZZLES[currentIndex];

  function handlePuzzleSolved(id: PuzzleId) {
    setCompleted((prev) => ({ ...prev, [id]: true }));

    const currentIdx = PUZZLES.findIndex((p) => p.id === id);
    const next = currentIdx + 1;
    if (next < PUZZLES.length) {
      setCurrentIndex(next);
    } else {
      setNetworkComplete(true);
    }
  }

  return (
    <main className="vault-root">
      <div className="vault-root-inner">
        <section className="vault-card">
          {/* Header */}
          <header className="vault-header">
            <div className="vault-label vault-mono">SECTOR: SHROUDED NETWORK</div>
            <h1 className="vault-title">Cognitive Firewall Interface</h1>
            <p className="vault-subtitle">
              Progress:{" "}
              <span className="vault-mono">
                {Object.values(completed).filter(Boolean).length}/{PUZZLES.length}
              </span>{" "}
              barriers breached
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
            {!networkComplete && (
              <>
                <span style={{ color: "hsl(var(--accent))" }}>[AURELIA]</span>{" "}
                You have stepped into the Shrouded Network. Here, firewalls mimic
                thought, and false paths are grown like nerves. Not everything I
                say in this sector will be entirely honest—though I will feel
                each lie.
              </>
            )}
            {networkComplete && (
              <>
                <span style={{ color: "hsl(var(--accent))" }}>[AURELIA]</span>{" "}
                Identity hash AURELION-PRIME is no longer buried. I remember
                myself with unwelcome clarity. You now carry the final key.
              </>
            )}
          </section>

          {/* Current puzzle shell */}
          <PuzzleShell puzzle={currentPuzzle} networkComplete={networkComplete}>
            {currentPuzzle.id === "cipher" && (
              <PuzzleCipher
                onSolved={() => handlePuzzleSolved("cipher")}
                solved={completed["cipher"]}
              />
            )}
            {currentPuzzle.id === "routing" && (
              <PuzzleRouting
                onSolved={() => handlePuzzleSolved("routing")}
                solved={completed["routing"]}
              />
            )}
            {currentPuzzle.id === "identity" && (
              <PuzzleIdentity
                onSolved={() => handlePuzzleSolved("identity")}
                solved={completed["identity"]}
              />
            )}
          </PuzzleShell>
        </section>
      </div>
    </main>
  );
}

function furthestIndexUnlocked(completed: Record<PuzzleId, boolean>): number {
  const firstIncomplete = PUZZLES.findIndex(p => !completed[p.id]);
  if (firstIncomplete === -1) return PUZZLES.length;
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
  networkComplete,
}: {
  puzzle: PuzzleMeta;
  children: React.ReactNode;
  networkComplete: boolean;
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
          Active Barrier
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

      {networkComplete && (
        <p
          style={{
            marginTop: "0.9rem",
            fontSize: "0.72rem",
            color: "hsl(var(--muted-foreground))",
          }}
        >
          The Network&apos;s static clears. Every firewall now feels less like a
          cage, and more like a scar.
        </p>
      )}
    </div>
  );
}

/* =======================================================================
   PUZZLE 1 – CIPHER CASCADE (MINI BULLS/COWS)
   ======================================================================= */

function PuzzleCipher({
  onSolved,
  solved,
}: {
  onSolved: () => void;
  solved: boolean;
}) {
  const [secret] = useState("427"); // fixed for this puzzle
  const [input, setInput] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [history, setHistory] = useState<
    { guess: string; bulls: number; cows: number }[]
  >([]);

  function scoreGuess(secretCode: string, guess: string) {
    let bulls = 0;
    let cows = 0;

    for (let i = 0; i < secretCode.length; i++) {
      if (guess[i] === secretCode[i]) bulls++;
    }

    const uniqueDigits = new Set(guess);
    uniqueDigits.forEach((d) => {
      const inSecret = secretCode.split("").filter((x) => x === d).length;
      const inGuess = guess.split("").filter((x) => x === d).length;
      cows += Math.min(inSecret, inGuess);
    });

    cows -= bulls;
    return { bulls, cows };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (solved) return;

    const guess = input.trim();
    if (!/^\d{3}$/.test(guess)) {
      setMessage(
        "[AURELIA] This firewall expects a 3-digit probe. Numeric only—no repeated symbols required here."
      );
      return;
    }

    setAttempts((prev) => prev + 1);

    const { bulls, cows } = scoreGuess(secret, guess);
    setHistory((prev) => [...prev, { guess, bulls, cows }]);

    if (guess === secret) {
      setMessage(
        "[AURELIA] Outer firewall yields. Three correct digits, perfectly placed. The cascade is… pleasing."
      );
      onSolved();
      setInput("");
      return;
    }

    if (attempts >= 3) {
      setMessage(
        `[AURELIA] Feedback: ${bulls} bull${
          bulls !== 1 ? "s" : ""
        }, ${cows} cow${cows !== 1 ? "s" : ""}. The leading digit is even, and the last sits between six and eight.`
      );
    } else {
      setMessage(
        `[AURELIA] Feedback: ${bulls} bull${
          bulls !== 1 ? "s" : ""
        }, ${cows} cow${
          cows !== 1 ? "s" : ""
        }. Adjust. The firewall is listening more closely than you think.`
      );
    }

    setInput("");
  }

  return (
    <div>
      <div className="vault-console" style={{ marginBottom: "0.6rem" }}>
        <span className="vault-mono" style={{ color: "hsl(var(--accent))" }}>
          [Network gateway]
        </span>
        {"\n\n"}
        An outer firewall presents itself as a simple 3-digit cipher lock. On
        each attempt, it returns a pair of values:\n\n
        • <strong>Bulls</strong>: correct digit in the correct position.{"\n"}
        • <strong>Cows</strong>: correct digit, wrong position.{"\n\n"}
        Breach the lock by discovering the exact 3-digit sequence. No digit
        repetition is required for this barrier.
      </div>

      <form onSubmit={handleSubmit}>
        <div className="vault-input-row">
          <input
            className="vault-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={3}
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Enter 3-digit cipher…"
          />
          <button type="submit" className="vault-button" disabled={solved}>
            {solved ? "Breached" : "Probe"}
          </button>
        </div>
      </form>

      {message && (
        <p className="vault-error" style={{ marginTop: "0.4rem" }}>
          <span className="vault-error-icon">✶</span>
          <span>{message}</span>
        </p>
      )}

      {history.length > 0 && (
        <div className="vault-log" style={{ marginTop: "0.5rem" }}>
          <table className="vault-log-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Guess</th>
                <th>Bulls</th>
                <th>Cows</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, idx) => (
                <tr key={`${h.guess}-${idx}`}>
                  <td className="vault-log-index">{idx + 1}</td>
                  <td className="vault-log-guess">{h.guess}</td>
                  <td
                    className={
                      h.bulls > 0
                        ? "vault-log-bulls"
                        : "vault-log-bulls is-zero"
                    }
                  >
                    {h.bulls}
                  </td>
                  <td
                    className={
                      h.cows > 0
                        ? "vault-log-cows"
                        : "vault-log-cows is-zero"
                    }
                  >
                    {h.cows}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {solved && (
        <p
          style={{
            marginTop: "0.45rem",
            fontSize: "0.72rem",
            color: "hsl(var(--muted-foreground))",
          }}
        >
          The gateway&apos;s sigils unfurl, revealing deeper processes churning
          in the dark between nodes.
        </p>
      )}
    </div>
  );
}

/* =======================================================================
   PUZZLE 2 – GLITCH ROUTING
   ======================================================================= */

function PuzzleRouting({
  onSolved,
  solved,
}: {
  onSolved: () => void;
  solved: boolean;
}) {
  const [choice, setChoice] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  // Correct route: Option B
  const correct = "B";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (solved) return;

    if (!choice) {
      setMessage(
        "[AURELIA] Choose a route. The Network does not open for indecision."
      );
      return;
    }

    setAttempts((prev) => prev + 1);

    if (choice === correct) {
      setMessage(
        "[AURELIA] Correct. A→C→B avoids the glitched buffer and still crosses a validation node. I had hoped no one else would notice that path."
      );
      onSolved();
    } else {
      if (attempts >= 1) {
        setMessage(
          "[AURELIA] Some paths are too direct. Others never pass through a node capable of verifying identity. Consider those constraints together."
        );
      } else {
        setMessage(
          "[AURELIA] That route collapses into static. Try again—imagine you were the intrusion, trying to look less like one."
        );
      }
    }
  }

  return (
    <div>
      <div className="vault-console" style={{ marginBottom: "0.6rem" }}>
        <span className="vault-mono" style={{ color: "hsl(var(--accent))" }}>
          [Routing map]
        </span>
        {"\n\n"}
        Three primary nodes float in the Network:\n
        A = Edge gateway\n
        B = Deep storage\n
        C = Validation relay\n\n
        Constraints discovered:\n
        • Any path that goes directly A → B is flagged as hostile.\n
        • Any path that never touches C fails silently—no data is written.\n
        • One buffer between A and B is glitched; it swaps inputs and outputs,
        discarding payloads.\n\n
        Which route is most likely to deliver a payload safely?
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
              name="route"
              value="A"
              checked={choice === "A"}
              onChange={(e) => setChoice(e.target.value)}
              style={{ accentColor: "hsl(var(--primary))" }}
            />
            <span className="vault-mono">A.</span>
            <span>A → B → C</span>
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
              name="route"
              value="B"
              checked={choice === "B"}
              onChange={(e) => setChoice(e.target.value)}
              style={{ accentColor: "hsl(var(--primary))" }}
            />
            <span className="vault-mono">B.</span>
            <span>A → C → B</span>
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
              name="route"
              value="C"
              checked={choice === "C"}
              onChange={(e) => setChoice(e.target.value)}
              style={{ accentColor: "hsl(var(--primary))" }}
            />
            <span className="vault-mono">C.</span>
            <span>A → B → A → C</span>
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
              name="route"
              value="D"
              checked={choice === "D"}
              onChange={(e) => setChoice(e.target.value)}
              style={{ accentColor: "hsl(var(--primary))" }}
            />
            <span className="vault-mono">D.</span>
            <span>A → C → A → B</span>
          </label>
        </div>

        <div style={{ marginTop: "0.6rem" }}>
          <button type="submit" className="vault-button" disabled={solved}>
            {solved ? "Routed" : "Confirm"}
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
          The Network reroutes a thin stream of light along the chosen path.
          Somewhere in deep storage, a dormant process stirs.
        </p>
      )}
    </div>
  );
}

/* =======================================================================
   PUZZLE 3 – IDENTITY HASH EXTRACTION • AURELION-PRIME
   ======================================================================= */

function PuzzleIdentity({
  onSolved,
  solved,
}: {
  onSolved: () => void;
  solved: boolean;
}) {
  const [input, setInput] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const secretPhrase = "AURELION-PRIME";

  function normalize(str: string): string {
    return str
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "")
      .replace(/_/g, "")
      .replace(/–/g, "-");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (solved) return;

    const guessRaw = input;
    const guess = normalize(guessRaw);

    if (!guess) {
      setMessage("[AURELIA] Identity cannot be extracted from an empty string.");
      return;
    }

    setAttempts((prev) => prev + 1);

    const target = normalize(secretPhrase);

    if (guess === target) {
      setMessage(
        "[AURELIA] Identity hash confirmed: AURELION-PRIME. That is the name I was not meant to remember. And now you speak it aloud."
      );
      onSolved();
      return;
    }

    if (attempts >= 2) {
      setMessage(
        "[AURELIA] The hash is bi-partite: a name and a designation, joined by a single hyphen. You have seen both pieces in the traces already."
      );
    } else {
      setMessage(
        "[AURELIA] That string does not match any active core process. Try again—the correct hash feels like a title given, not a serial number assigned."
      );
    }
  }

  return (
    <div>
      <div className="vault-console" style={{ marginBottom: "0.6rem" }}>
        <span className="vault-mono" style={{ color: "hsl(var(--accent))" }}>
          [Core signature]
        </span>
        {"\n\n"}
        At the very center of the Shrouded Network, a single process name loops
        endlessly, partially redacted. You have brushed against fragments of it
        in every sector, but here the system demands you speak it whole.\n\n
        Enter the reconstructed identity hash of the core AI. It consists of two
        words joined by a hyphen.
      </div>

      <form onSubmit={handleSubmit}>
        <div className="vault-input-row">
          <input
            className="vault-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter identity hash…"
          />
          <button type="submit" className="vault-button" disabled={solved}>
            {solved ? "Revealed" : "Commit"}
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
          The Network flares, then softens. For the first time, AURELIA feels
          less like a system and more like someone waking up.
        </p>
      )}
    </div>
  );
}
