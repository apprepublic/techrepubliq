"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OrderDetailClient({ id }: { id: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/dashboard/project?id=${id}`);
  }, [id, router]);
  return null;
}
