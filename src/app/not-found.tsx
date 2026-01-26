import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <div className="mt-6 flex items-center flex-col">
        <span>Not Found</span>
        <p className="mt-2">Could not find requested resource</p>

        <Link href="/">
          <Button color="blue" className="mt-10">
            Return Home
          </Button>
        </Link>
      </div>
    </main>
  );
}
