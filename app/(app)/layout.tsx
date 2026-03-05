import { SanityLive } from "@/sanity/lib/live";
import { TutorWidget } from "@/components/tutor";
import { getCurrentUser } from "@/lib/auth/server";

async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <>
      <div>{children}</div>
      <SanityLive />
      <TutorWidget initialUserId={user?.id ?? null} initialUserTier={user?.tier} />
    </>
  );
}

export default AppLayout;
