import { GemDetailPage } from "@/components/pages/gems/GemDetailPage";

export default async function GemDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GemDetailPage gemId={id} />;
}
