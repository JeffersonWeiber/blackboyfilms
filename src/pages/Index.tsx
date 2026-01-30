import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { NichosSection } from "@/components/home/NichosSection";
import { ProcessoPreview } from "@/components/home/ProcessoPreview";
import { CTASection } from "@/components/home/CTASection";
import { ClientsSection } from "@/components/home/ClientsSection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <NichosSection />
      <ProcessoPreview />
      <CTASection />
      <ClientsSection />
    </Layout>
  );
};

export default Index;
