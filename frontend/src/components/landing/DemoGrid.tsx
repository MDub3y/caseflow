import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils"; // Ensure utility exists

interface RowData {
  id: number;
  name: string;
  email: string;
  status: "Valid" | "Error";
  date: string;
}

const INITIAL_DATA: RowData[] = [
  {
    id: 1,
    name: "Alex Rivera",
    email: "alex@example.com",
    status: "Valid",
    date: "2023-10-01",
  },
  {
    id: 2,
    name: "Sarah Chen",
    email: "sarah.chen@company",
    status: "Error",
    date: "2023-10-02",
  },
  {
    id: 3,
    name: "Mike Ross",
    email: "mike.ross@pearson.com",
    status: "Valid",
    date: "2023-10-03",
  },
  {
    id: 4,
    name: "Jessica P.",
    email: "jp@firm.net",
    status: "Valid",
    date: "2023-10-04",
  },
  {
    id: 5,
    name: "Louis Litt",
    email: "louis@litt",
    status: "Error",
    date: "2023-10-05",
  },
];

export function DemoGrid() {
  const [rows, setRows] = useState<RowData[]>(INITIAL_DATA);
  const [editingCell, setEditingCell] = useState<{
    id: number;
    field: keyof RowData;
  } | null>(null);

  const [typingAnimation, setTypingAnimation] = useState<{
    active: boolean;
    rowId: number;
    currentText: string;
    targetText: string;
    phase: "waiting" | "typing" | "completed";
  }>({
    active: false,
    rowId: 0,
    currentText: "",
    targetText: "",
    phase: "waiting",
  });

  // Loop Animation Logic
  useEffect(() => {
    const runAnimationCycle = async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setRows([...INITIAL_DATA]); // Reset

      const errorRow = INITIAL_DATA.find((r) => r.status === "Error");
      if (!errorRow) return;

      setTypingAnimation({
        active: true,
        rowId: errorRow.id,
        currentText: errorRow.email,
        targetText: errorRow.email + ".com",
        phase: "typing",
      });
    };

    if (!typingAnimation.active) {
      runAnimationCycle();
    }
  }, [typingAnimation.active]);

  // Typing Effect Logic
  useEffect(() => {
    if (typingAnimation.phase !== "typing") return;

    const { currentText, targetText, rowId } = typingAnimation;

    if (currentText === targetText) {
      // Finished typing this cell
      setTimeout(() => {
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === rowId
              ? { ...row, email: targetText, status: "Valid" }
              : row
          )
        );

        // Look for next error
        setTimeout(() => {
          const nextError = rows.find(
            (r) => r.status === "Error" && r.id !== rowId
          );
          if (nextError) {
            setTypingAnimation({
              active: true,
              rowId: nextError.id,
              currentText: nextError.email,
              targetText: nextError.email + ".com", // Simulating fix
              phase: "typing",
            });
          } else {
            // All fixed, restart loop
            setTypingAnimation({
              active: false,
              rowId: 0,
              currentText: "",
              targetText: "",
              phase: "waiting",
            });
          }
        }, 1500);
      }, 500);
      return;
    }

    // Type next char
    const timer = setTimeout(() => {
      const nextText = targetText.slice(0, currentText.length + 1);
      setTypingAnimation((prev) => ({ ...prev, currentText: nextText }));
    }, 100); // Typing speed

    return () => clearTimeout(timer);
  }, [typingAnimation, rows]);

  // Manual Interactions (Optional for demo)
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleCellClick = (id: number, field: keyof RowData) => {
    if (field === "id" || field === "status" || typingAnimation.active) return;
    setEditingCell({ id, field });
  };

  const handleUpdate = (id: number, field: keyof RowData, value: string) => {
    const newRows = rows.map((row) => {
      if (row.id === id) {
        const updated = { ...row, [field]: value };
        if (field === "email") {
          updated.status = isValidEmail(value) ? "Valid" : "Error";
        }
        return updated;
      }
      return row;
    });
    setRows(newRows);
    setEditingCell(null);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    id: number,
    field: keyof RowData,
    value: string
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleUpdate(id, field, value);
    }
    if (e.key === "Escape") {
      setEditingCell(null);
    }
  };

  return (
    <div className="w-full bg-card border border-border/50 rounded-xl overflow-hidden shadow-2xl relative group">
      {/* Top Bar Decoration */}
      <div className="h-1 w-full bg-gradient-to-r from-primary via-blue-400 to-primary opacity-75" />

      {/* Fake Browser Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="text-xs font-mono text-muted-foreground select-none">
          import_preview.csv
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
            Live Validation
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/40 font-medium border-b border-border">
            <tr>
              <th className="px-6 py-3 font-semibold">ID</th>
              <th className="px-6 py-3 font-semibold">Name</th>
              <th className="px-6 py-3 font-semibold">Email</th>
              <th className="px-6 py-3 font-semibold">Date</th>
              <th className="px-6 py-3 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {rows.map((row) => {
              const isAnimating =
                typingAnimation.active && typingAnimation.rowId === row.id;
              const displayEmail = isAnimating
                ? typingAnimation.currentText
                : row.email;

              return (
                <tr
                  key={row.id}
                  className={cn(
                    "transition-colors duration-200",
                    row.status === "Error"
                      ? "bg-red-500/5 hover:bg-red-500/10"
                      : "hover:bg-muted/30"
                  )}
                >
                  <td className="px-6 py-4 font-mono text-muted-foreground">
                    {row.id}
                  </td>

                  <td className="px-6 py-4 text-foreground font-medium">
                    {row.name}
                  </td>

                  <td
                    className="px-6 py-4 cursor-text font-mono text-foreground relative"
                    onClick={() => handleCellClick(row.id, "email")}
                  >
                    {editingCell?.id === row.id &&
                    editingCell?.field === "email" ? (
                      <input
                        autoFocus
                        className="bg-background border border-primary rounded px-2 py-1 w-full focus:outline-none text-foreground shadow-sm"
                        defaultValue={row.email}
                        onBlur={(e) =>
                          handleUpdate(row.id, "email", e.target.value)
                        }
                        onKeyDown={(e) =>
                          handleKeyDown(
                            e,
                            row.id,
                            "email",
                            e.currentTarget.value
                          )
                        }
                      />
                    ) : (
                      <div className="flex items-center gap-1">
                        <span
                          className={cn(
                            isAnimating && "text-primary font-bold"
                          )}
                        >
                          {displayEmail}
                        </span>
                        {isAnimating && (
                          <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-cursor-blink" />
                        )}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 text-muted-foreground text-xs">
                    {row.date}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border",
                        row.status === "Valid"
                          ? "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400"
                          : "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400"
                      )}
                    >
                      {row.status === "Valid" ? "Valid" : "Error"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
