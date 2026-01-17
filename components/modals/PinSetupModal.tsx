"use client";

import { useState } from "react";
import { setPin } from "@/actions/security";
import { toast } from "react-hot-toast";
import Portal from "@/components/Portal";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isForceSetup?: boolean; // Tetap kita pakai untuk membedakan teks "Setup" vs "Change"
}

export default function PinSetupModal({
  isOpen,
  onClose,
  onSuccess,
  isForceSetup,
}: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [firstPin, setFirstPin] = useState("");
  const [secondPin, setSecondPin] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (firstPin !== secondPin) {
      toast.error("PINs do not match!");
      setSecondPin("");
      return;
    }
    setLoading(true);
    const res = await setPin(firstPin);
    setLoading(false);

    if (res.success) {
      toast.success(res.message);
      onSuccess();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center pb-4 dark:border-gray-800">
            <h3 className="font-bold text-lg dark:text-white">
              {/* Judul tetap dinamis */}
              {isForceSetup ? "Setup Security PIN" : "Change Security PIN"}
            </h3>

            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {step === 1 ? "Create 6-digit PIN" : "Confirm your PIN"}
            </p>

            {/* Pesan tambahan jika ini peringatan awal (opsional, agar UX lebih jelas) */}
            {isForceSetup && step === 1 && (
              <p className="text-xs text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                Recommended: Secure your dashboard by setting up a PIN. You can
                do this later.
              </p>
            )}
          </div>

          <input
            type="password"
            maxLength={6}
            autoFocus
            className="w-full bg-gray-100 dark:bg-gray-800 border dark:text-white rounded-lg text-center text-2xl tracking-[0.5em] py-3 font-mono focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
            value={step === 1 ? firstPin : secondPin}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              step === 1 ? setFirstPin(val) : setSecondPin(val);
            }}
          />

          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition">
              {isForceSetup ? "Skip" : "Cancel"}
            </button>

            {step === 1 ? (
              <button
                disabled={firstPin.length !== 6}
                onClick={() => setStep(2)}
                className="px-4 py-2 text-sm bg-black dark:bg-white text-white dark:text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition font-medium">
                Next
              </button>
            ) : (
              <button
                disabled={secondPin.length !== 6 || loading}
                onClick={handleSubmit}
                className="px-4 py-2 text-sm bg-black dark:bg-white text-white dark:text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition font-medium">
                {loading ? "Saving..." : "Confirm"}
              </button>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}
