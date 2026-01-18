// components/providers/LockProvider.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useTransition,
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
import PinSetupModal from "@/components/modals/PinSetupModal";
import LockScreen from "@/components/LockScreen";
import { AnimatePresence } from "framer-motion";

interface LockContextType {
  isLocked: boolean;
  hasPin: boolean;
  isRefetching: boolean;
  lockScreen: () => void;
  unlockScreen: (pin: string) => Promise<boolean>;
  refreshPinStatus: () => void;
  setShowSetupModal: (show: boolean) => void;
  lockoutTime: number | null;
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

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);

  const isDashboard = pathname?.startsWith("/dashboard");
  const shouldBeLocked = isDashboard && isLocked && hasPin;

  // --- Load State Rate Limit ---
  useEffect(() => {
    const storedAttempts = localStorage.getItem("pin_attempts");
    const storedLockout = localStorage.getItem("pin_lockout");

    if (storedAttempts) setFailedAttempts(parseInt(storedAttempts));

    if (storedLockout) {
      const lockoutTimestamp = parseInt(storedLockout);
      if (lockoutTimestamp > Date.now()) {
        setLockoutTime(lockoutTimestamp);
      } else {
        localStorage.removeItem("pin_lockout");
        localStorage.removeItem("pin_attempts");
        setFailedAttempts(0);
        setLockoutTime(null);
      }
    }
  }, []);

  // --- Scroll Lock ---
  useEffect(() => {
    if (shouldBeLocked) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      document.documentElement.style.overflow = "";
    };
  }, [shouldBeLocked]);

  useEffect(() => {
    if (shouldBeLocked && pathname !== "/dashboard") {
      router.replace("/dashboard");
    }
  }, [shouldBeLocked, pathname, router]);

  const init = useCallback(async () => {
    if (status !== "authenticated" || !session?.user?.id) return;

    const pinExists = await checkHasPin();
    setHasPin(pinExists);

    if (isDashboard) {
      if (pinExists) {
        const { isSessionUnlocked } = await checkSessionStatus();
        setIsLocked(!isSessionUnlocked);
      } else {
        // [LOGIC SESSION] Cek apakah user sudah di-warn di sesi ini
        const warningKey = `accault_pin_warned_${session.user.id}`;
        const hasBeenWarned = sessionStorage.getItem(warningKey);

        // Jika belum ada PIN dan belum diperingatkan di sesi ini, tampilkan modal
        if (!hasBeenWarned) setShowSetupModal(true);
      }
    }
  }, [isDashboard, session, status]);

  useEffect(() => {
    init();
  }, [init]);

  const handleCloseSetupModal = () => {
    // [LOGIC SESSION] Set flag bahwa user sudah melihat modal di sesi ini
    if (session?.user?.id)
      sessionStorage.setItem(`accault_pin_warned_${session.user.id}`, "true");
    setShowSetupModal(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === "l" || e.key === "L")) {
        e.preventDefault();
        if (!isDashboard) return;
        if (hasPin) lockScreen();
        else {
          toast("Please setup a PIN first");
          setShowSetupModal(true);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasPin, isDashboard]);

  const lockScreen = async () => {
    setIsLocked(true);
    await lockSession();
    startTransition(() => {
      if (pathname !== "/dashboard") router.replace("/dashboard");
      else router.refresh();
    });
  };

  const unlockScreen = async (pin: string): Promise<boolean> => {
    if (lockoutTime && Date.now() < lockoutTime) {
      return false;
    }

    const res = await verifyPin(pin);

    if (res.success) {
      setFailedAttempts(0);
      setLockoutTime(null);
      localStorage.removeItem("pin_attempts");
      localStorage.removeItem("pin_lockout");
      return true;
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      localStorage.setItem("pin_attempts", newAttempts.toString());

      if (newAttempts >= 5) {
        const lockDuration = 60 * 1000;
        const lockUntil = Date.now() + lockDuration;

        setLockoutTime(lockUntil);
        localStorage.setItem("pin_lockout", lockUntil.toString());
      }
      return false;
    }
  };

  const handleUnlockComplete = () => {
    setIsLocked(false);
    startTransition(() => {
      router.refresh();
    });
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
        lockoutTime,
      }}>
      <PinSetupModal
        isOpen={showSetupModal}
        onClose={handleCloseSetupModal}
        onSuccess={() => {
          setHasPin(true);
          handleCloseSetupModal();
        }}
        // [PERUBAHAN]: Ubah isForceSetup jadi false agar bisa diclose.
        // Logika sessionStorage di handleCloseSetupModal akan menangani "muncul sekali per sesi".
        isForceSetup={false}
        hasCurrentPin={hasPin}
      />

      <div className="relative min-h-screen">
        {children}

        <AnimatePresence>
          {shouldBeLocked && (
            <LockScreen
              key="lock-screen"
              userImage={session?.user?.image}
              userName={session?.user?.name}
              onUnlock={unlockScreen}
              onUnlockComplete={handleUnlockComplete}
              lockoutTime={lockoutTime}
            />
          )}
        </AnimatePresence>
      </div>
    </LockContext.Provider>
  );
}
