import { redirect } from 'next/navigation';

// Placeholder target for the "Enter ATIS Demo" CTA on /atis-demo.
// The full ATIS-prefixed dashboard experience (per the /atis-* routing
// convention) is a separate build task — for now this hands off into the
// existing intelligence dashboard so the demo entry flow is not a dead link.
export default function AtisDashboardRedirect() {
  redirect('/');
}
