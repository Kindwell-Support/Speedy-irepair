import Link from "next/link";
import { buttonClasses } from "@/components/ui/ButtonLink";

export default function NotFound() {
  return (
    <section className="container-site py-32 text-center">
      <h1 className="text-h1">Page not found</h1>
      <p className="mt-4 text-body-lg text-text-secondary">The page you are looking for does not exist or has moved.</p>
      <Link href="/" className={buttonClasses("primary", "lg", "mt-8")}>
        Back to home
      </Link>
    </section>
  );
}
