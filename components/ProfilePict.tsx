"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function ProfilePict() {
  const { data: dataSession } = useSession();
  if (!dataSession || !dataSession.user) return null;
  return (
    <Link href="/dashboard/profile" className="shrink-0 group relative">
      <div className="w-15 h-15 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 group-hover:border-blue-500 transition-colors shadow-sm">
        {/* Gunakan placeholder Google atau URL statis aman */}
        <Image
          src={
            dataSession.user.image
              ? dataSession.user.image
              : "https://lh3.googleusercontent.com/a/default-user"
          }
          alt={dataSession.user.name || "User"}
          width={100}
          height={100}
          className="object-cover w-full h-full"
        />
      </div>
    </Link>
  );
}
