import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// COLORS (per requirements)
const COLORS = {
  accent: "#ff9800",
  primary: "#1976d2",
  secondary: "#90caf9",
  lightBg: "#fff",
  surface: "#f8fafc",
  border: "#e0e0e0",
  display: "#262626",
  displayBg: "#f5f7fb",
  buttonBg: "#f3f4f6",
  buttonOpBg: "#1976d2",
  buttonOpText: "#fff",
  buttonEqBg: "#ff9800",
  buttonEqText: "#fff",
  buttonFnBg: "#90caf9",
  buttonFnText: "#1976d2",
  shadow: "rgba(0,0,0,0.04)",
};

// PUBLIC_INTERFACE
function App() {
  // Calculator state
  const [expression, setExpression] = useState("0");
  const [acc, setAcc] = useState(""); // to flash result momentarily
  const [overwrite, setOverwrite] = useState(false);

  const containerRef = useRef(null);

  // Keyboard event handler
  useEffect(() => {
    function handleKeyDown(e) {
      if (
        ["0","1","2","3","4","5","6","7","8","9",".","/","*","+","-"].includes(
          e.key
        )
      ) {
        e.preventDefault();
        input(e.key);
      } else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        calculate();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        backspace();
      } else if (e.key === "Delete") {
        e.preventDefault();
        clearAll();
      }
    }
    window.addEventListener("keydown", handleKeyDown, { passive: false });
    return () =>
      window.removeEventListener("keydown", handleKeyDown, { passive: false });
    // eslint-disable-next-line
  }, [expression, overwrite]);

  // Focus-able container for a11y
  useEffect(() => {
    if (containerRef.current) containerRef.current.focus();
  }, []);

  // Input handler for digits and operators
  // PUBLIC_INTERFACE
  function input(val) {
    if (overwrite) {
      // start new expression after result
      if (isDigitOrDot(val)) {
        setExpression(val === "." ? "0." : val);
      } else if (isOperator(val)) {
        setExpression(acc + val);
      }
      setOverwrite(false);
      return;
    }

    if (isDigit(val)) {
      // no leading zeros
      if (expression === "0") setExpression(val);
      else setExpression(expression + val);
    } else if (val === ".") {
      // Prevent multiple dots in the current number
      const parts = splitExpr(expression);
      const last = parts[parts.length - 1];
      if (!last.includes(".")) setExpression(expression + ".");
    } else if (isOperator(val)) {
      if (
        expression === "" &&
        (val === "+" || val === "*" || val === "/" || val === "%")
      )
        return; // Don't start with these operators
      // Allow negative sign as first char
      if (expression === "" && val === "-") {
        setExpression("-");
        return;
      }
      // Prevent duplicate operators, except allowing negative after operator for neg numbers
      if (isOperator(expression.slice(-1))) {
        if (
          !(val === "-" && expression.slice(-1) !== "-") // allow e.g. 5*-2
        ) {
          if (
            !(
              val === "-" &&
              ["+","*","/"].includes(expression.slice(-1)) &&
              expression[expression.length - 2] !== "-"
            )
          ) {
            setExpression(expression.slice(0, -1) + val);
            return;
          }
        }
      }
      setExpression(expression + val);
    }
  }

  // PUBLIC_INTERFACE
  function clearAll() {
    setExpression("0");
    setAcc("");
    setOverwrite(false);
  }

  // PUBLIC_INTERFACE
  function backspace() {
    if (overwrite) {
      setExpression("0");
      setOverwrite(false);
      return;
    }
    if (expression.length <= 1 || (expression.length === 2 && expression.startsWith("-"))) {
      setExpression("0");
    } else {
      setExpression(expression.slice(0, -1));
    }
  }

  // PUBLIC_INTERFACE
  function calculate() {
    let exp = expression;
    // Remove trailing operator if any
    if (isOperator(exp.slice(-1))) exp = exp.slice(0, -1);

    try {
      // eslint-disable-next-line no-eval
      let result = eval(exp.replace(/--/g, "+")); // 5--2 => 5+2
      if (typeof result === "number" && !isNaN(result) && isFinite(result)) {
        result = Math.round((result + Number.EPSILON) * 1e10) / 1e10; // up to 10 decimal places
        setAcc(result.toString());
        setExpression(result.toString());
        setOverwrite(true);
      }
    } catch (err) {
      setAcc("Err");
      setOverwrite(true);
    }
  }

  // PUBLIC_INTERFACE
  function handleButton(val) {
    if (
      ["0","1","2","3","4","5","6","7","8","9",".","/","*","+","-"].includes(val)
    ) {
      input(val);
    } else if (val === "C") {
      clearAll();
    } else if (val === "⌫") {
      backspace();
    } else if (val === "=") {
      calculate();
    }
  }

  // BUTTONS
  const btns = [
    { label: "C", value: "C", type: "func" },
    { label: "⌫", value: "⌫", type: "func" },
    { label: "÷", value: "/", type: "op" },
    { label: "×", value: "*", type: "op" },
    { label: "7", value: "7", type: "num" },
    { label: "8", value: "8", type: "num" },
    { label: "9", value: "9", type: "num" },
    { label: "−", value: "-", type: "op" },
    { label: "4", value: "4", type: "num" },
    { label: "5", value: "5", type: "num" },
    { label: "6", value: "6", type: "num" },
    { label: "+", value: "+", type: "op" },
    { label: "1", value: "1", type: "num" },
    { label: "2", value: "2", type: "num" },
    { label: "3", value: "3", type: "num" },
    { label: "=", value: "=", type: "eq" },
    { label: "0", value: "0", type: "num", span: 2 },
    { label: ".", value: ".", type: "num" },
  ];

  // Style helpers
  function btnStyle(type, label) {
    switch (type) {
      case "op":
        return {
          background: COLORS.buttonOpBg,
          color: COLORS.buttonOpText,
        };
      case "eq":
        return {
          background: COLORS.buttonEqBg,
          color: COLORS.buttonEqText,
          gridRow: "span 2",
        };
      case "func":
        return {
          background: COLORS.buttonFnBg,
          color: COLORS.buttonFnText,
        };
      default:
        return {
          background: COLORS.buttonBg,
          color: COLORS.display,
        };
    }
  }

  // Accessibility
  function btnAriaLabel(btn) {
    if (btn.value === "/") return "divide";
    if (btn.value === "*") return "multiply";
    if (btn.value === "-") return "subtract";
    if (btn.value === "+") return "add";
    if (btn.value === "C") return "clear";
    if (btn.value === "⌫") return "backspace";
    if (btn.value === "=") return "equals";
    return btn.label;
  }

  // Calculator layout
  return (
    <div
      ref={containerRef}
      className="calculator-root"
      tabIndex={0}
      style={{
        minHeight: "100vh",
        background: COLORS.lightBg,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      aria-label="Calculator Application"
    >
      <div
        className="calculator"
        style={{
          background: COLORS.surface,
          borderRadius: "2.2rem",
          padding: "2rem 1.5rem 1.5rem 1.5rem",
          boxShadow:
            "0 2px 24px 0 rgba(25, 118, 210, 0.12), 0 0.5px 2px 0 rgba(0,0,0,0.03)",
          width: "100%",
          maxWidth: "420px",
          minWidth: "296px",
          transition: "box-shadow 0.2s",
        }}
      >
        {/* Display */}
        <div
          className="calculator-display"
          aria-live="polite"
          style={{
            background: COLORS.displayBg,
            color: COLORS.display,
            borderRadius: "1rem",
            marginBottom: "1.4rem",
            padding: "1.15rem 1.2rem 0.65rem 1.2rem",
            textAlign: "right",
            minHeight: "3.7rem",
            fontSize: "2.18rem",
            fontFamily: "monospace, 'Menlo', 'Consolas', 'Courier New', monospace",
            letterSpacing: "0.1rem",
            boxShadow: `0 1px 2px 0 ${COLORS.shadow}`,
            border: `1px solid ${COLORS.border}`,
            overflowX: "auto",
            whiteSpace: "pre",
            userSelect: "all",
            wordBreak: "break-all",
          }}
        >
          {expression}
        </div>
        {/* Buttons Grid */}
        <div
          className="calculator-buttons"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gridGap: "1rem",
          }}
        >
          {btns.map((btn, i) => (
            <button
              key={btn.label + i}
              className="calculator-btn"
              style={{
                ...btnStyle(btn.type, btn.label),
                fontSize: "1.23rem",
                fontWeight: btn.type === "num" ? 500 : 600,
                padding: "1rem 0",
                gridColumn:
                  btn.span !== undefined ? `span ${btn.span}` : undefined,
                border: "none",
                borderRadius: "0.8rem",
                boxShadow: `0 0.5px 1.5px 0 ${COLORS.shadow}`,
                cursor: "pointer",
                transition: "background 0.2s, color 0.2s, box-shadow 0.15s",
                outline: "none",
              }}
              aria-label={btnAriaLabel(btn)}
              tabIndex={0}
              onClick={() => handleButton(btn.value)}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  handleButton(btn.value);
                }
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
        {/* Brand footer (optional, modern style) */}
        <div
          className="calc-footer"
          style={{
            marginTop: "1.7rem",
            fontSize: "0.94rem",
            color: COLORS.secondary,
            textAlign: "center",
            letterSpacing: ".04rem",
          }}
        >
          Minimal Calculator · <span style={{ color: COLORS.accent }}>KAVIA</span>
        </div>
      </div>
    </div>
  );
}

// --- Helpers ---
function isDigit(val) {
  return /[0-9]/.test(val);
}
function isDigitOrDot(val) {
  return /[0-9.]/.test(val);
}
function isOperator(val) {
  return ["+", "-", "*", "/"].includes(val);
}
// Split expression into tokens (for decimal check)
function splitExpr(expr) {
  return expr.split(/[\+\-\*\/]/g);
}

export default App;
