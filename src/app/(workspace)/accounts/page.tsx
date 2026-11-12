import type { Metadata } from "next";

import { AccountsView } from "@/components/accounts/accounts-view";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Accounts",
};

export default function AccountsPage() {
  return (
    <>
      <PageHeader
        title="Accounts"
        description="The social accounts this workspace can publish to."
      />
      <AccountsView />
    </>
  );
}
