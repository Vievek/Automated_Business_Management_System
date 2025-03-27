import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

function layout({ children }) {
  return (
    <>
      <Link href="/authenticated/common/issues/issuepage">
        <Button>issue page</Button>
      </Link>
      <Link href="/authenticated/common/task/taskpage">
        <Button>task page</Button>
      </Link>
      {children}
    </>
  );
}

export default layout;
