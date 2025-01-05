import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";

export default function Home() {
  return (
    <div className="spce-y-4">
      <h1>Hi</h1>
      <Button>Rakib</Button>
      <UserButton />
    </div>
  );
}
