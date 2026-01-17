"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useTransition,
  useRef,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  checkHasPin,
  verifyPin,
  lockSession,
  checkSessionStatus,
} from "@/actions/security";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { LockClosedIcon, KeyIcon, XMarkIcon } from "@heroicons/react/24/solid";
import PinSetupModal from "@/components/modals/PinSetupModal";

interface LockContextType {
  isLocked: boolean;
  hasPin: boolean;
  isRefetching: boolean;
  lockScreen: () => void;
  unlockScreen: (pin: string) => Promise<boolean>;
  refreshPinStatus: () => void;
  setShowSetupModal: (show: boolean) => void;
}

const LockContext = createContext<LockContextType | null>(null);

export const useLock = () => {
  const context = useContext(LockContext);
  if (!context) throw new Error("useLock must be used within LockProvider");
  return context;
};

export default function LockProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isRefetching, startTransition] = useTransition();

  const [isLocked, setIsLocked] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // --- STATE UI BARU ---
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [renderOverlay, setRenderOverlay] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); // State untuk pesan error teks
  const inputRef = useRef<HTMLInputElement>(null);

  const isDashboard = pathname?.startsWith("/dashboard");
  const shouldBeLocked = isDashboard && isLocked && hasPin;

  // --- EFFECT: BUKA KUNCI OTOMATIS ---
  useEffect(() => {
    if (isUnlocking && !isRefetching) {
      setIsLocked(false);
      setTimeout(() => {
        setIsUnlocking(false);
        setPinInput("");
        setShowInput(false);
        setErrorMsg("");
      }, 500);
    }
  }, [isRefetching, isUnlocking]);

  // --- EFFECT ANIMASI ---
  useEffect(() => {
    if (shouldBeLocked) {
      setRenderOverlay(true);
      setShowInput(false);
      setPinInput("");
      setErrorMsg("");
      const timer = setTimeout(() => setIsVisible(true), 20);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setRenderOverlay(false), 500);
      return () => clearTimeout(timer);
    }
  }, [shouldBeLocked]);

  // Auto focus input (Normal)
  useEffect(() => {
    if (showInput && inputRef.current && !isUnlocking) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [showInput, isUnlocking]);

  // Redirect Logic
  useEffect(() => {
    if (shouldBeLocked && pathname !== "/dashboard") {
      router.replace("/dashboard");
    }
  }, [shouldBeLocked, pathname, router]);

  // Scroll Lock
  useEffect(() => {
    if (renderOverlay) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [renderOverlay]);

  const init = useCallback(async () => {
    if (status !== "authenticated" || !session?.user?.id) return;

    const pinExists = await checkHasPin();
    setHasPin(pinExists);

    if (isDashboard) {
      if (pinExists) {
        const { isSessionUnlocked } = await checkSessionStatus();
        setIsLocked(!isSessionUnlocked);
      } else {
        const warningKey = `accault_pin_warned_${session.user.id}`;
        const hasBeenWarned = sessionStorage.getItem(warningKey);
        if (!hasBeenWarned) setShowSetupModal(true);
      }
    }
  }, [isDashboard, session, status]);

  useEffect(() => {
    init();
  }, [init]);

  const handleCloseSetupModal = () => {
    if (session?.user?.id)
      sessionStorage.setItem(`accault_pin_warned_${session.user.id}`, "true");
    setShowSetupModal(false);
  };

  // --- KEYBOARD HANDLER (SHORTCUTS) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. CTRL + L (Lock)
      if (e.ctrlKey && (e.key === "l" || e.key === "L")) {
        e.preventDefault();
        if (!isDashboard) return;
        if (hasPin) lockScreen();
        else {
          toast("Please setup a PIN first");
          setShowSetupModal(true);
        }
      }

      // 2. ENTER (Buka Input saat Lock Screen aktif & Input belum muncul)
      if (shouldBeLocked && !showInput && e.key === "Enter") {
        e.preventDefault();
        setShowInput(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasPin, isDashboard, shouldBeLocked, showInput]); // Dependency penting agar state terbaca

  // --- ACTIONS ---
  const lockScreen = async () => {
    setIsLocked(true);
    await lockSession();
    startTransition(() => {
      if (pathname !== "/dashboard") router.replace("/dashboard");
      else router.refresh();
    });
  };

  const unlockScreen = async (pin: string) => {
    setErrorMsg(""); // Reset error sebelum verifikasi
    setIsVerifying(true);
    const res = await verifyPin(pin);
    setIsVerifying(false);

    if (res.success) {
      setIsUnlocking(true);
      startTransition(() => {
        router.refresh();
      });
      return true;
    } else {
      // LOGIKA ERROR:
      setPinInput(""); // 1. Reset Input
      setErrorMsg("Incorrect PIN"); // 2. Tampilkan Teks Salah

      // 3. Fokuskan Kembali (Timeout kecil agar UI sempat render ulang state kosong)
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);

      return false;
    }
  };

  const refreshPinStatus = () => {
    checkHasPin().then((exists) => setHasPin(exists));
  };

  return (
    <LockContext.Provider
      value={{
        isLocked,
        hasPin,
        isRefetching,
        lockScreen,
        unlockScreen,
        refreshPinStatus,
        setShowSetupModal,
      }}>
      <PinSetupModal
        isOpen={showSetupModal}
        onClose={handleCloseSetupModal}
        onSuccess={() => {
          setHasPin(true);
          handleCloseSetupModal();
        }}
        isForceSetup={isDashboard && !hasPin}
      />

      <div className="relative min-h-screen">
        {children}

        {renderOverlay && (
          <div
            className={`
                fixed inset-0 z-9999 flex flex-col items-center justify-center touch-none
                transition-opacity duration-500 ease-in-out
                ${
                  isVisible
                    ? "bg-white/90 dark:bg-black/90 backdrop-blur-sm opacity-100"
                    : "bg-white/0 dark:bg-black/0 backdrop-blur-none opacity-0"
                }
                text-gray-900 dark:text-white
            `}
            // Klik background reset ke ikon kunci (kecuali sedang loading)
            onClick={() => {
              if (showInput && !isUnlocking) setShowInput(false);
            }}>
            <div
              className={`
                    flex flex-col items-center gap-6 
                    transition-opacity duration-500 delay-100 ease-in-out
                    ${isVisible ? "opacity-100" : "opacity-0"}
                `}
              onClick={(e) => e.stopPropagation()}>
              {/* --- TAMPILAN 1: LOADING (Unlocking) --- */}
              {isUnlocking ? (
                <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-800 border-t-black dark:border-t-white rounded-full animate-spin"></div>
                  </div>
                  <div className="text-center space-y-1">
                    <h2 className="text-xl font-bold tracking-wide animate-pulse">
                      Loading Data...
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Getting everything ready for you
                    </p>
                  </div>
                </div>
              ) : (
                /* --- TAMPILAN 2: INPUT / GEMBOK --- */
                <>
                  {/* HEADER GEMBOK */}
                  <div
                    className={`
                        flex flex-col items-center gap-4 
                        transition-opacity duration-500 ease-in-out
                        ${showInput ? "opacity-0 pointer-events-none absolute" : "opacity-100 relative"}
                     `}>
                    <LockClosedIcon className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                    <h1 className="text-3xl font-bold tracking-widest uppercase text-gray-800 dark:text-gray-200">
                      Locked
                    </h1>
                  </div>

                  {/* AREA INTERAKSI */}
                  <div className="mt-4 h-24 w-64 relative flex items-center justify-center">
                    {/* STATE A: TOMBOL KUNCI */}
                    <div
                      className={`
                            absolute inset-0 flex items-center justify-center
                            transition-opacity duration-500 ease-in-out
                            ${
                              !showInput
                                ? "opacity-100 pointer-events-auto"
                                : "opacity-0 pointer-events-none"
                            }
                        `}>
                      <button
                        onClick={() => setShowInput(true)}
                        className="group flex flex-col items-center gap-2">
                        <div className="p-4 rounded-full bg-gray-100 dark:bg-white/10 group-hover:bg-gray-200 dark:group-hover:bg-white/20 border border-gray-200 dark:border-white/10 backdrop-blur-sm transition-colors shadow-lg shadow-black/5 dark:shadow-black/20">
                          <KeyIcon className="w-8 h-8 text-gray-500 dark:text-white group-hover:text-black dark:group-hover:text-yellow-400 transition-colors" />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                          Press Enter to Unlock
                        </span>
                      </button>
                    </div>

                    {/* STATE B: INPUT PIN */}
                    <div
                      className={`
                            absolute inset-0 flex items-center justify-center
                            transition-opacity duration-500 ease-in-out
                            ${
                              showInput
                                ? "opacity-100 pointer-events-auto"
                                : "opacity-0 pointer-events-none"
                            }
                        `}>
                      <div className="flex flex-col items-center gap-2">
                        {" "}
                        {/* Wrapper Flex Col untuk Error Text */}
                        <div className="flex items-center gap-3">
                          <div className="relative group">
                            <input
                              ref={inputRef}
                              type="password"
                              maxLength={6}
                              disabled={isVerifying}
                              className={`
                                            bg-transparent 
                                            border-b-2 
                                            
                                            ${errorMsg ? "border-red-500 animate-shake" : "border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white"}
                                            text-left text-2xl font-bold font-mono 
                                            text-gray-900 dark:text-white 
                                            tracking-[0.5em] 
                                            w-[180px]
                                            pb-2 focus:outline-none 
                                            transition-colors duration-300 placeholder-gray-400 dark:placeholder-gray-700
                                        `}
                              placeholder="••••••"
                              value={pinInput}
                              onChange={(e) => {
                                setErrorMsg(""); // Clear error saat user mengetik lagi
                                const val = e.target.value.replace(/\D/g, "");
                                setPinInput(val);
                                if (val.length === 6) unlockScreen(val);
                              }}
                            />
                            {isVerifying && (
                              <div className="absolute -bottom-6 left-0 right-0 text-center">
                                <span className="text-[10px] uppercase tracking-widest animate-pulse text-gray-500 dark:text-gray-400">
                                  Verifying...
                                </span>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => {
                              setShowInput(false);
                              setPinInput("");
                              setErrorMsg("");
                            }}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-300"
                            title="Cancel">
                            <XMarkIcon className="w-6 h-6" />
                          </button>
                        </div>
                        {/* TEXT ERROR (Muncul di bawah input) */}
                        {errorMsg && (
                          <p className="text-red-500 text-xs font-medium animate-in slide-in-from-top-1 fade-in duration-200">
                            {errorMsg}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </LockContext.Provider>
  );
}
