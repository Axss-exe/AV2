import { redirect } from 'next/navigation';

// The pilot briefing now lives at the app root ("/"). This route is kept as
// a redirect so any existing /atis-demo links (e.g. shared before this
// change) still resolve correctly.
export default function AtisDemoRedirect() {
  redirect('/');
}
