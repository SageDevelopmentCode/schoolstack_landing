// THROWAWAY verification lab — delete before committing.
import { listSchoolDemos } from "@/data/school-demos";
import LabClient from "./LabClient";
export default function Page() {
  return <LabClient demos={listSchoolDemos()} />;
}
