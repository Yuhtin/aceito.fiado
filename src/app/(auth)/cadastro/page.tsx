import { OnboardingFlow } from "./onboarding-flow";

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export default async function CadastroPage({ searchParams }: Props) {
  const params = await searchParams;
  const nextUrl = params.next ?? "/app";
  return <OnboardingFlow nextUrl={nextUrl} />;
}
