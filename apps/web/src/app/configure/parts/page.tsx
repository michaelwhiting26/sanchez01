import { redirect } from "next/navigation";

/** The parts viewer is not part of the launch path: send anyone who lands here to the build step. */
export default function PartsPage(): never {
  redirect("/configure");
}
