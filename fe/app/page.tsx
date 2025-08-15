import AuthGate from "@/components/Authgate";
import HomePage from "@/components/homepage"

export default function Home() {
  return <AuthGate fallback={<HomePage />} />;
}