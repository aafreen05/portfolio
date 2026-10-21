import { MessagesInbox } from "@/app/admin/(dashboard)/messages/messages-inbox";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { adminGetMessages } from "@/lib/admin/queries";

export const metadata = { title: "Messages" };

export default async function AdminMessagesPage() {
  const messages = await adminGetMessages();
  const unread = messages.filter((message) => message.status === "new").length;

  return (
    <PageBody>
      <PageHeader
        title="Messages"
        description={
          unread > 0
            ? `${unread} new ${unread === 1 ? "message" : "messages"} waiting.`
            : "Everything sent through the contact form on the site."
        }
      />
      <MessagesInbox messages={messages} />
    </PageBody>
  );
}
