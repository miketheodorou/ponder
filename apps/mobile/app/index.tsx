import { Redirect } from "expo-router";

// Dev escape hatch — set EXPO_PUBLIC_BYPASS_AUTH=1 in apps/mobile/.env.local
// to skip the auth flow and land on /home with hardcoded data. Real auth
// will replace this once the API is wired up.
const bypassAuth = process.env.EXPO_PUBLIC_BYPASS_AUTH === "1";

export default function Index() {
  return <Redirect href={bypassAuth ? "/home" : "/welcome"} />;
}
