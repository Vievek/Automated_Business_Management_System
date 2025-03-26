import ProtectedRoute from "@/app/_components/protectedRoute";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function HRDashboardPage() {
  return (
    <ProtectedRoute roles={["hr"]}>
      <h1>HR Dashboard</h1>
      <Link href="/authenticated/hr/addEmployee">
        <Button>Add New Employee</Button>
      </Link>
    </ProtectedRoute>
  );
}

export default HRDashboardPage;
