// components/LockScreen.tsx
"use client";

import { useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  AnimatePresence,
} from "framer-motion";
import {
  LockClosedIcon,
  KeyIcon,
  UserIcon,
  BackspaceIcon,
  ClockIcon, // [BARU] Ikon Jam
} from "@heroicons/react/24/solid";
import Image from "next/image";

interface LockScreenProps {
  userImage?: string | null;
  userName?: string | null;
  onUnlock: (pin: string) => Promise<boolean>;
  onUnlockComplete: () => void;
  lockoutTime: number | null; // [BARU] Prop
}

export default function LockScreen({
  userImage,
  userName,
  onUnlock,
  onUnlockComplete,
  lockoutTime,
}: LockScreenProps) {
  const [step, setStep] = useState<"drag" | "pin">("drag");
  const [pin, setPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  // [BARU] State untuk Countdown
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // --- EFFECT: COUNTDOWN TIMER ---
  useEffect(() => {
    if (!lockoutTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.ceil((lockoutTime - now) / 1000);

      if (diff <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
        // Otomatis reset UI jika waktu habis
        setPin("");
        setIsError(false);
      } else {
        setTimeLeft(diff);
      }
    }, 1000);

    // Initial run
    const initialDiff = Math.ceil((lockoutTime - Date.now()) / 1000);
    setTimeLeft(initialDiff > 0 ? initialDiff : 0);

    return () => clearInterval(interval);
  }, [lockoutTime]);

  const isLockedOut = timeLeft > 0;

  // --- 1. KEYBOARD LISTENER ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable keyboard jika Locked Out
      if (isLockedOut || step !== "pin" || isVerifying || isSuccess) return;

      if (/^[0-9]$/.test(e.key)) {
        if (pin.length < 6) {
          setPin((prev) => prev + e.key);
          setIsError(false);
        }
      } else if (e.key === "Backspace") {
        setPin((prev) => prev.slice(0, -1));
        setIsError(false);
      } else if (e.key === "Escape") {
        setStep("drag");
        setPin("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, isVerifying, isSuccess, pin, isLockedOut]);

  // --- 2. LOGIC VERIFIKASI ---
  useEffect(() => {
    if (pin.length === 6 && !isVerifying && !isSuccess && !isLockedOut) {
      const runVerify = async () => {
        setIsVerifying(true);
        await new Promise((r) => setTimeout(r, 200));

        const success = await onUnlock(pin);

        if (success) {
          setIsSuccess(true);
          setTimeout(() => {
            onUnlockComplete();
          }, 1500);
        } else {
          setIsError(true);
          setPin("");
          setIsVerifying(false);
          if (navigator.vibrate) navigator.vibrate(300);
        }
      };
      runVerify();
    }
  }, [pin, onUnlock, onUnlockComplete, isVerifying, isSuccess, isLockedOut]);

  const handleNumClick = (num: string) => {
    if (pin.length < 6 && !isVerifying && !isSuccess && !isLockedOut) {
      setPin((prev) => prev + num);
      setIsError(false);
    }
  };

  const handleBackspace = () => {
    if (!isVerifying && !isSuccess && !isLockedOut) {
      setPin((prev) => prev.slice(0, -1));
      setIsError(false);
    }
  };

  // Format MM:SS (Opsional, tapi karena cuma 1 menit, detik saja cukup atau teks deskriptif)
  const timerText = `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, "0")}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      className="fixed inset-0 z-[9999] h-[100dvh] w-full bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 overflow-hidden touch-none overscroll-none transition-colors duration-500">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-300/30 dark:bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-300/30 dark:bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-6">
        {/* User Info */}
        <div className="flex flex-col items-center space-y-4 animate-in fade-in slide-in-from-top-10 duration-700">
          <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden relative bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            {userImage ? (
              <Image src={userImage} alt="User" fill className="object-cover" />
            ) : (
              <UserIcon className="w-12 h-12 text-gray-400" />
            )}
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white tracking-wide">
              {userName || "Welcome Back"}
            </h2>
            <p
              className={`text-sm mt-1 h-5 font-medium transition-colors ${isLockedOut ? "text-red-500 animate-pulse" : "text-gray-500 dark:text-gray-400"}`}>
              {isSuccess
                ? "Access Granted"
                : isLockedOut
                  ? `Too many attempts. Wait ${timeLeft}s`
                  : step === "drag"
                    ? "Slide to unlock"
                    : "Enter your PIN"}
            </p>
          </div>
        </div>

        {/* Area Interaksi */}
        <div className="w-full min-h-[350px] flex justify-center">
          <AnimatePresence mode="wait">
            {/* KONDISI 1: LOCKED OUT (HUKUMAN) */}
            {isLockedOut ? (
              <motion.div
                key="locked-out"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full gap-4 pb-20">
                <div className="p-6 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50">
                  <ClockIcon className="w-12 h-12 text-red-500" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    Temporarily Locked
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-[200px]">
                    You've entered incorrect PIN 5 times. Please try again in:
                  </p>
                  <p className="text-3xl font-mono font-bold text-red-500 mt-4">
                    00:{timeLeft.toString().padStart(2, "0")}
                  </p>
                </div>
              </motion.div>
            ) : /* KONDISI 2: SUCCESS LOADING */
            isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full gap-6 pb-20">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-800 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <LockClosedIcon className="w-8 h-8 text-blue-500 animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white animate-pulse">
                    Loading Data
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Getting everything ready for you...
                  </p>
                </div>
              </motion.div>
            ) : /* KONDISI 3: DRAG SLIDER */
            step === "drag" ? (
              <motion.div
                key="drag"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                className="flex justify-center w-full pt-8">
                <DragSlider onSuccess={() => setStep("pin")} />
              </motion.div>
            ) : (
              /* KONDISI 4: PIN KEYPAD */
              <motion.div
                key="keypad"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="w-full pt-2">
                <PinKeypad
                  pin={pin}
                  onNumClick={handleNumClick}
                  onBackspace={handleBackspace}
                  isError={isError}
                  isVerifying={isVerifying}
                  onBackToDrag={() => {
                    setStep("drag");
                    setPin("");
                    setIsError(false);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute bottom-6 text-gray-400 dark:text-gray-600 text-xs">
        Secured by Account Manager
      </div>
    </motion.div>
  );
}

// ... (Sub-components DragSlider & PinKeypad SAMA PERSIS, Jangan lupa dicopy)
function DragSlider({ onSuccess }: { onSuccess: () => void }) {
  const x = useMotionValue(0);
  const backgroundOpacity = useTransform(x, [0, 200], [0.1, 0.5]);
  const scaleIcon = useTransform(x, [0, 200], [1, 1.2]);
  const MAX_DRAG = 220;

  const handleDragEnd = () => {
    if (x.get() > MAX_DRAG - 50) {
      animate(x, MAX_DRAG, { type: "spring" });
      setTimeout(onSuccess, 300);
    } else {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
    }
  };

  return (
    <div className="relative w-[280px] h-[64px] rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200 dark:border-gray-700/50 shadow-inner flex items-center px-1.5 overflow-hidden">
      <motion.div
        style={{ opacity: backgroundOpacity }}
        className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20"
      />
      <motion.p
        style={{ opacity: useTransform(x, [0, 50], [1, 0]) }}
        className="absolute w-full text-center text-gray-500 dark:text-gray-400 text-sm font-medium pointer-events-none pr-8">
        Slide to unlock
      </motion.p>
      <div className="absolute right-2 w-[52px] h-[52px] rounded-full flex items-center justify-center border-2 border-dashed border-gray-400/50 dark:border-gray-600/50">
        <LockClosedIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: MAX_DRAG }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="relative z-10 w-[52px] h-[52px] bg-white dark:bg-gray-200 rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing">
        <motion.div style={{ scale: scaleIcon }}>
          <KeyIcon className="w-6 h-6 text-gray-900" />
        </motion.div>
      </motion.div>
    </div>
  );
}

function PinKeypad({
  pin,
  onNumClick,
  onBackspace,
  isError,
  isVerifying,
  onBackToDrag,
}: {
  pin: string;
  onNumClick: (n: string) => void;
  onBackspace: () => void;
  isError: boolean;
  isVerifying: boolean;
  onBackToDrag: () => void;
}) {
  const nums = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

  return (
    <div className="flex flex-col items-center gap-6">
      <div className={`flex gap-4 mb-4 ${isError ? "animate-shake" : ""}`}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              i < pin.length
                ? isError
                  ? "bg-red-500 shadow-red-500/50 scale-110"
                  : "bg-blue-500 shadow-blue-500/50 scale-110"
                : "bg-gray-300 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-x-8 gap-y-6">
        {nums.map((item, idx) => {
          if (item === "")
            return (
              <div
                key={idx}
                className="w-16 h-16 flex items-center justify-center">
                <button
                  onClick={onBackToDrag}
                  className="text-xs text-gray-500 dark:text-gray-500 font-medium hover:text-gray-800 dark:hover:text-white transition-colors uppercase tracking-wider">
                  Back
                </button>
              </div>
            );
          if (item === "del")
            return (
              <button
                key={idx}
                onClick={onBackspace}
                className="w-16 h-16 rounded-full flex items-center justify-center text-gray-600 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/20 transition-all">
                <BackspaceIcon className="w-7 h-7" />
              </button>
            );
          return (
            <button
              key={idx}
              onClick={() => onNumClick(item)}
              disabled={isVerifying}
              className="w-16 h-16 rounded-full bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-700 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-2xl font-medium text-gray-800 dark:text-white shadow-sm dark:shadow-lg active:scale-95 transition-all disabled:opacity-50">
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}
