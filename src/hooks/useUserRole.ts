import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useUserRole() {
  const { data, isLoading } = useSWR("/api/auth/me", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return {
    role: data?.role as "STUDENT" | "PYME" | null ?? null,
    isLoading,
  };
}