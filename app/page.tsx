"use client";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import type { JSX } from "react";
import iconRefresh from "./img/icon/refresh.png"

const DEFAULT_TIME = 30;
const COLUMN_WIDTH = 65;
const INITIAL_TEXT_LENGTH = 200;

export default function App(): JSX.Element {
  const [language, setLanguage] = useState<"EN" | "LAO">("EN");
  const [mode, setMode] = useState<"time" | "words">("time");

  // Time mode
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME);
  const [timerActive, setTimerActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Words mode
  const [wordsMode, setWordsMode] = useState(25);

  // Shared settings
  const [punctuationMode, setPunctuationMode] = useState(false);
  const [numbersMode, setNumbersMode] = useState(false);
  const [timeMode, setTimeMode] = useState(DEFAULT_TIME);

  // Typing text and progress
  const [text, setText] = useState<string>(
    generateModeText(
      mode,
      INITIAL_TEXT_LENGTH,
      wordsMode,
      language,
      punctuationMode,
      numbersMode
    )
  );
  const [chars, setChars] = useState<string[]>(text.split(""));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<(boolean | null)[]>(
    Array(text.length).fill(null)
  );
  const [showResults, setShowResults] = useState(false);

  // Language modal
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Hide controls once typing starts
  const [hasStarted, setHasStarted] = useState(false);

  const textContainerRef = useRef<HTMLDivElement>(null);

  // Regenerate text on settings change
  useEffect(() => {
    const newText = generateModeText(
      mode,
      INITIAL_TEXT_LENGTH,
      wordsMode,
      language,
      punctuationMode,
      numbersMode
    );
    setText(newText);
    setChars(newText.split(""));
    setResults(Array(newText.length).fill(null));
    setCurrentIndex(0);
    setTimeLeft(timeMode);
    setTimerActive(false);
    setStartTime(null);
    setShowResults(false);
    setHasStarted(false);
  }, [mode, language, punctuationMode, numbersMode, timeMode, wordsMode]);

  // Auto‐append more text in time mode
  useEffect(() => {
    if (mode === "time" && timerActive && currentIndex >= chars.length - 100) {
      const more = generateRandomText(
        100,
        language,
        punctuationMode,
        numbersMode
      );
      const updated = text + " " + more;
      setText(updated);
      setChars(updated.split(""));
      setResults((r) => [...r, ...Array(more.length + 1).fill(null)]);
    }
  }, [
    currentIndex,
    timerActive,
    text,
    chars.length,
    mode,
    language,
    punctuationMode,
    numbersMode,
  ]);

  // Smooth scroll
  useEffect(() => {
    if (!textContainerRef.current || currentIndex === 0) return;
    const col = Math.floor(currentIndex / COLUMN_WIDTH);
    const y = col * 50 - textContainerRef.current.clientHeight / 3;
    textContainerRef.current.scrollTo({ top: y, behavior: "smooth" });
  }, [currentIndex]);

  // Timer ticking
  useEffect(() => {
    if (!timerActive || mode !== "time") return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          setTimerActive(false);
          setShowResults(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerActive, mode]);


  // Keystroke handling
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (showResults) return;
      const k = e.key;
      if (!timerActive && k.length === 1) {
        setHasStarted(true);
        setTimerActive(true);
        setStartTime(Date.now());
      }
      if (k === "Backspace") {
        setCurrentIndex((i) => Math.max(0, i - 1));
        setResults((r) => {
          const copy = [...r];
          copy[Math.max(0, currentIndex - 1)] = null;
          return copy;
        });
      } else if (k.length === 1) {
        setResults((r) => {
          const copy = [...r];
          copy[currentIndex] = k === chars[currentIndex];
          return copy;
        });
        const next = currentIndex + 1;
        setCurrentIndex(next);
        if (mode === "words" && next >= chars.length) {
          setTimerActive(false);
          setShowResults(true);
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [timerActive, currentIndex, chars, showResults, mode]);
// Keystroke handling
useEffect(() => {
  const handleTabReset = (e: KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();        // stop default focus movement
      // regenerate text according to current settings
      const fresh = generateModeText(
        mode,
        INITIAL_TEXT_LENGTH,
        wordsMode,
        language,
        punctuationMode,
        numbersMode
      );
      setText(fresh);
      setChars(fresh.split(""));
      setResults(Array(fresh.length).fill(null));
      setCurrentIndex(0);

      // reset timer & progress flags
      setTimeLeft(timeMode);
      setTimerActive(false);
      setStartTime(null);
      setShowResults(false);

      // important: flip hasStarted back to false
      setHasStarted(false);
    }
  };

  document.addEventListener("keydown", handleTabReset);
  return () => {
    document.removeEventListener("keydown", handleTabReset);
  };
}, [
  mode,
  wordsMode,
  language,
  punctuationMode,
  numbersMode,
  timeMode,
]);




  // Metrics calculation
  const { wpm, accuracy } = React.useMemo(() => {
    if (!startTime) return { wpm: 0, accuracy: 0 };
    const correct = results.filter((r) => r).length;
    const total = results.filter((r) => r !== null).length;
    const mins = (Date.now() - startTime!) / 1000 / 60;
    return {
      wpm: mins > 0 ? Math.round(correct / 5 / mins) : 0,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    };
  }, [results, startTime]);

  // Helpers
  function resetTest() {
    const fresh = generateModeText(
      mode,
      INITIAL_TEXT_LENGTH,
      wordsMode,
      language,
      punctuationMode,
      numbersMode
    );
    setText(fresh);
    setChars(fresh.split(""));
    setResults(Array(fresh.length).fill(null));
    setCurrentIndex(0);
    setTimeLeft(timeMode);
    setTimerActive(false);
    setStartTime(null);
    setShowResults(false);
    setHasStarted(false);
  }
  function handleTimeChange(t: number) {
    setTimeMode(t);
  }
  function handleWordsChange(n: number) {
    setWordsMode(n);
  }

  function formatTextWithColumns(): JSX.Element[] {
    const blocks: JSX.Element[] = [];
    let start = 0;
    while (start < chars.length) {
      let end = Math.min(start + COLUMN_WIDTH, chars.length);
      if (end < chars.length) {
        const lastSpace = chars.slice(start, end).lastIndexOf(" ");
        if (lastSpace > COLUMN_WIDTH * 0.7) end = start + lastSpace + 1;
      }
      const slice = chars.slice(start, end);
      blocks.push(
        <div key={start} className="leading-relaxed">
          {slice.map((ch, i) => {
            const idx = start + i;
            let cls = "text-gray-500";
            if (idx < currentIndex)
              cls = results[idx] ? "text-green-400" : "text-red-400";
            else if (idx === currentIndex)  
              cls = "border-l border-white bg-opacity-50 text-white";
            return (
              <span
                key={idx}
                className={`${cls} transition-colors duration-100`}
              >
                {ch === " " ? "\u00A0" : ch}
              </span>
            );
          })}
        </div>
      );
      start = end;
    }
    return blocks;
  }

  return (
    <div className="min-h-screen  bg-gray-900 text-gray-100 flex flex-col items-center p-6  ">
      {/* HEADER */}
      <header className="w-full max-w-4/5 mb-8 flex justify-between items-center *:cursor-pointer">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-700 bg-clip-text text-transparent">
          BitTyping
        </h1>
      </header>

      {/* CONTROLS: hidden once typing starts */}

      <div
        className={`"w-full max-w-4/5 mb-6 grid grid-cols-6 gap-2 text-center transition-opacity duration-300 bg-gray-700   rounded-4xl " ${
          hasStarted ? "opacity-10 pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="col-span-2 flex gap-2 justify-center  *:cursor-pointer">
          <button
            onClick={() => {
              setPunctuationMode((p) => !p);
              resetTest();
            }}
            className={`px-3 py-1 rounded-full text-sm hover:text-white ${
              punctuationMode ? "text-white " : "text-gray-500"
            }`}
          >
            @ punctuation
          </button>
          <button
            onClick={() => {
              setNumbersMode((n) => !n);
              resetTest();
            }}
            className={`px-3 py-1 rounded-full text-sm hover:text-white ${
              numbersMode ? "text-white " : "text-gray-500"
            }`}
          >
            # numbers
          </button>
        </div>
        <div className=" *:cursor-pointer">
          <button
            onClick={() => setMode("time")}
            className={`px-3 py-1 rounded-full text-sm hover:text-white ${
              mode === "time" ? "text-white " : "text-gray-500"
            }`}
          >
            time
          </button>
          <button
            onClick={() => setMode("words")}
            className={`px-3 py-1 rounded-full text-sm hover:text-white ${
              mode === "words" ? "text-white " : "text-gray-500"
            }`}
          >
            Words
          </button>
        </div>
        {mode === "time" ? (
          <div className="col-span-2 flex gap-2 justify-center">
            {[15, 30, 60, 120].map((t) => (
              <button
                key={t}
                onClick={() => handleTimeChange(t)}
                className={`px-2 py-1 text-xs rounded cursor-pointer ${
                  timeMode === t ? " text-white" : "text-gray-500"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        ) : (
          <div className="col-span-2 flex gap-2 justify-center">
            {[10, 25, 50, 100].map((n) => (
              <button
                key={n}
                onClick={() => handleWordsChange(n)}
                className={`px-2 py-1 text-xs rounded cursor-pointer ${
                  wordsMode === n ? " text-white" : "text-gray-500"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TIMER & language */}
      <div className="w-full max-w-4/5 mb-4 p-6 flex justify-between items-center relative">
        <div className="text-3xl font-mono text-gray-500  ">
          {mode === "time"
            ? `${timeLeft}s`
            : `${wordsMode - countTypedWords(chars, results)}`}
        </div>

        <button
          onClick={() => setShowLanguageModal(true)}
          className={`"px-3 py-1 rounded  hover:text-white text-gray-500 mx-auto cursor-pointer text-3xl transition-opacity  duration-300 "${
            hasStarted ? "opacity-5" : " opacity-100"
          }`}
        >
          {language}
        </button>
      </div>

      {/* TEXT DISPLAY */}
      <div className="w-full">
        {!showResults ? (
          <div
            ref={textContainerRef}
            className="bg-gray-900 p-6 rounded-lg  h-auto font-mono tracking-wide max-w-4/5 mx-auto  "
          >
            <div className=" flex flex-col gap-2 text-4xl">
              {formatTextWithColumns().slice(
                Math.floor(currentIndex / COLUMN_WIDTH),
                Math.floor(currentIndex / COLUMN_WIDTH) + 3
              )}
            </div>
          </div>
        ) : (
          <div className="mt-6 p-6 bg-gray-800 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Test Complete!</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-gray-400 text-sm">WPM</div>
                <div className="text-3xl text-white">{wpm}</div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-gray-400 text-sm">Accuracy</div>
                <div className="text-3xl text-white">{accuracy}%</div>
              </div>
            </div>
            <button
              onClick={resetTest}
              className="px-6 py-3 bg-white hover:bg-gray-500 rounded-lg font-medium"
            >
              Try Again
            </button>
          </div>
        )}
        <div className="w-full mx-auto  flex justify-center mt-4">
          <button
            onClick={resetTest}
            className="px-4 py-2 bg-gray-500 hover:bg-white hover:text-gray-500 cursor-pointer rounded text-sm mx-auto"
          >
            <Image 
            src={iconRefresh}
            alt="reset"
            width={20}
            height={20}
            />
          </button>
        </div>
      </div>

      {/* LANGUAGE MODAL */}
      {showLanguageModal && (
        <LanguageModal
          onClose={() => setShowLanguageModal(false)}
          onSelect={(lang) => {
            setLanguage(lang);
            resetTest();
          }}
        />
      )}
    </div>
  );
}

// Text generators & helpers
function generateModeText(
  mode: "time" | "words",
  length: number,
  wordCount: number,
  lang: "EN" | "LAO",
  withPunc: boolean,
  withNums: boolean
): string {
  return mode === "time"
    ? generateRandomText(length, lang, withPunc, withNums)
    : generateRandomWords(wordCount, lang, withPunc, withNums);
}

function generateRandomText(
  length: number,
  lang: "EN" | "LAO",
  withPunctuation: boolean,
  withNumbers: boolean
): string {
  const lao = ["ດີ", "ນາງ", "ເຂົ້າ", "ສະບາຍ", "ນາ", "ຂອບໃຈ"];
  const eng = ["hello", "world", "welcome", "typing", "test", "react"];
  const words = lang === "LAO" ? lao : eng;
  const punct = [".", ",", "!", "?", ";", ":"];
  const nums = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
  let res = "",
    len = 0;
  while (len < length) {
    const w = words[Math.floor(Math.random() * words.length)];
    res += (len ? " " : "") + w;
    len += w.length + 1;
    if (withPunctuation && Math.random() > 0.7) {
      res += punct[Math.floor(Math.random() * punct.length)];
      len++;
    }
    if (withNumbers && Math.random() > 0.8) {
      const n = nums[Math.floor(Math.random() * nums.length)];
      res += " " + n;
      len += n.length + 1;
    }
  }
  return res;
}

function generateRandomWords(
  count: number,
  lang: "EN" | "LAO",
  withPunctuation: boolean,
  withNumbers: boolean
): string {
  const lao = ["ດີ", "ນາງ", "ເຂົ້າ", "ບາຍ", "ນາ", "ຂອບໃຈ"];

  const eng = ["hello", "world", "welcome", "typing", "test", "react"];

  const words = lang === "LAO" ? lao : eng;

  const punct = [".", ",", "!", "?", ";", ":"];


  const nums = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

  const arr: string[] = [];
  while (arr.length < count) {
    let w = words[Math.floor(Math.random() * words.length)];
    if (withPunctuation && Math.random() > 0.7)
      w += punct[Math.floor(Math.random() * punct.length)];
    if (withNumbers && Math.random() > 0.8)
      w += " " + nums[Math.floor(Math.random() * nums.length)];
    arr.push(w);
  }
  return arr.join(" ");
}

function countTypedWords(chars: string[], results: (boolean | null)[]): number {
  const typed = results.filter((r) => r !== null).length;
  const textSoFar = chars.slice(0, typed).join("");
  return textSoFar.trim().split(/\s+/).length;
}

function LanguageModal({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (lang: "EN" | "LAO") => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-700 text-white p-6 rounded shadow-lg w-80"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => {
            onSelect("EN");
            onClose();
          }}
          className="w-full py-2 mb-2  hover:text-gray-200 rounded"
        >
          English
        </button>
        <button
          onClick={() => {
            onSelect("LAO");
            onClose();
          }}
          className="w-full py-2  hover:text-gray-200 rounded opacti"
        >
          Lao
        </button>
      </div>
    </div>
  );
}
