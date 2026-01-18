// components/modals/PinSetupModal.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  ShieldCheckIcon,
  XMarkIcon,
  BackspaceIcon,
  LockClosedIcon,
} from "@heroicons/react/24/solid";
import { toast } from "react-hot-toast";
import { verifyPin, setPin } from "@/actions/security";
import { motion } from "framer-motion";

interface PinSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isForceSetup?: boolean;
  hasCurrentPin?: boolean;
}

type Step = "verify_old" | "enter_new" | "confirm_new";

export default function PinSetupModal({
  isOpen,
  onClose,
  onSuccess,
  isForceSetup = false,
  hasCurrentPin = false,
}: PinSetupModalProps) {
  const [step, setStep] = useState<Step>(
    hasCurrentPin ? "verify_old" : "enter_new",
  );

  const [pin, setPinInput] = useState("");
  const [tempNewPin, setTempNewPin] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isShake, setIsShake] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(hasCurrentPin ? "verify_old" : "enter_new");
      setPinInput("");
      setTempNewPin("");
      setError("");
      setIsLoading(false);
    }
  }, [isOpen, hasCurrentPin]);

  const handlePinSubmit = useCallback(
    async (currentInput: string) => {
      setError("");
      setIsLoading(true);

      if (step === "verify_old") {
        const res = await verifyPin(currentInput);
        if (res.success) {
          setStep("enter_new");
          setPinInput("");
        } else {
          triggerError(res.message || "Incorrect current PIN");
        }
        setIsLoading(false);
        return;
      }

      if (step === "enter_new") {
        if (currentInput === "123456" || currentInput === "000000") {
          triggerError("PIN is too easy to guess");
          setIsLoading(false);
          return;
        }

        setTempNewPin(currentInput);
        setStep("confirm_new");
        setPinInput("");
        setIsLoading(false);
        return;
      }

      if (step === "confirm_new") {
        if (currentInput === tempNewPin) {
          const saveRes = await setPin(currentInput);

          if (saveRes.success) {
            toast.success("Security PIN updated successfully");
            onSuccess();
            onClose();
          } else {
            triggerError(saveRes.message || "Failed to save PIN");
            setStep("enter_new");
            setPinInput("");
          }
        } else {
          triggerError("PINs do not match. Try again.");
          setStep("enter_new");
          setPinInput("");
        }
        setIsLoading(false);
      }
    },
    [step, tempNewPin, onSuccess, onClose],
  );

  const triggerError = (msg: string) => {
    setError(msg);
    setIsShake(true);
    setTimeout(() => setIsShake(false), 400);
    setPinInput("");
  };

  const handleNumClick = (num: string) => {
    if (pin.length < 6 && !isLoading) {
      const newPin = pin + num;
      setPinInput(newPin);
      if (newPin.length === 6) handlePinSubmit(newPin);
    }
  };

  const handleBackspace = () => {
    if (!isLoading) {
      setPinInput((prev) => prev.slice(0, -1));
      setError("");
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading) return;
      if (/^[0-9]$/.test(e.key)) {
        if (pin.length < 6) {
          const newPin = pin + e.key;
          setPinInput(newPin);
          if (newPin.length === 6) handlePinSubmit(newPin);
        }
      } else if (e.key === "Backspace") {
        setPinInput((prev) => prev.slice(0, -1));
        setError("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, pin, handlePinSubmit]);

  const getTitle = () => {
    if (step === "verify_old") return "Verify Current PIN";
    if (step === "enter_new")
      return hasCurrentPin ? "Enter New PIN" : "Create Security PIN";
    if (step === "confirm_new") return "Confirm New PIN";
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[10000]"
        onClose={() => !isForceSetup && onClose()}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 text-left align-middle shadow-2xl transition-all">
                {/* Close Button */}
                {!isForceSetup && (
                  <button
                    onClick={onClose}
                    className="w-full flex justify-end items-center z-10">
                    <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-500 transition-colors" />
                  </button>
                )}

                {/* Header */}
                <div className="flex flex-col items-center justify-center mb-6 relative px-2">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-3">
                    {step === "verify_old" ? (
                      <LockClosedIcon className="w-6 h-6 text-blue-500" />
                    ) : (
                      <ShieldCheckIcon className="w-6 h-6 text-blue-500" />
                    )}
                  </div>

                  <Dialog.Title
                    as="h3"
                    className="text-lg font-bold leading-6 text-gray-900 dark:text-white">
                    {getTitle()}
                  </Dialog.Title>

                  {/* [BARU] Teks Keamanan Persuasif */}
                  <div className="mt-2 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {step === "verify_old"
                        ? "Please verify your current identity to continue."
                        : "Protect your saved accounts with an extra layer of security."}
                    </p>

                    {/* Pesan Tambahan Khusus saat Membuat PIN Baru */}
                    {step === "enter_new" && !hasCurrentPin && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
                        <p className="text-[10px] leading-relaxed text-blue-600 dark:text-blue-400 font-medium">
                          PIN ensures that even if someone accesses your device,
                          they cannot view your sensitive passwords.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* PIN Dots */}
                <div className="flex justify-center">
                  <div
                    className={`flex gap-3 ${isShake ? "animate-shake" : ""}`}>
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={false}
                        animate={{
                          scale: i < pin.length ? 1.1 : 1,
                          backgroundColor:
                            i < pin.length
                              ? error
                                ? "#EF4444"
                                : "#3B82F6"
                              : "transparent",
                        }}
                        className={`w-3 h-3 rounded-full border-2 ${
                          error
                            ? "border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Error Message */}
                <div className="h-5 mb-2 flex items-center justify-center">
                  {error && (
                    <p className="text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                      {error}
                    </p>
                  )}
                </div>

                {/* Keypad - [PERBAIKAN] Gap diperkecil (gap-3) dan Padding dirapikan */}
                <div className="grid grid-cols-3 gap-3 px-20 pb-2">
                  {[
                    "1",
                    "2",
                    "3",
                    "4",
                    "5",
                    "6",
                    "7",
                    "8",
                    "9",
                    "",
                    "0",
                    "del",
                  ].map((num, idx) => {
                    if (num === "") return <div key={idx}></div>;
                    if (num === "del")
                      return (
                        <button
                          key={idx}
                          onClick={handleBackspace}
                          className="flex items-center justify-center h-12 w-12 mx-auto rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
                          <BackspaceIcon className="w-6 h-6" />
                        </button>
                      );

                    return (
                      <button
                        key={idx}
                        onClick={() => handleNumClick(num)}
                        disabled={isLoading}
                        className="flex items-center justify-center h-12 w-12 mx-auto rounded-full text-lg font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-all shadow-sm">
                        {num}
                      </button>
                    );
                  })}
                </div>

                {/* Step Indicators */}
                <div className="mt-6 flex justify-center gap-1.5">
                  {hasCurrentPin && (
                    <div
                      className={`h-1 rounded-full transition-all duration-300 ${step === "verify_old" ? "w-6 bg-blue-500" : "w-1.5 bg-gray-200 dark:bg-gray-700"}`}
                    />
                  )}
                  <div
                    className={`h-1 rounded-full transition-all duration-300 ${step === "enter_new" ? "w-6 bg-blue-500" : "w-1.5 bg-gray-200 dark:bg-gray-700"}`}
                  />
                  <div
                    className={`h-1 rounded-full transition-all duration-300 ${step === "confirm_new" ? "w-6 bg-blue-500" : "w-1.5 bg-gray-200 dark:bg-gray-700"}`}
                  />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
