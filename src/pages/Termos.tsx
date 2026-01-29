import { Layout } from "@/components/layout/Layout";
import { SectionTitle } from "@/components/ui/SectionTitle";

export default function Termos() {
  return (
    <Layout>
      <section className="pt-32 pb-24 md:pt-40 md:pb-32">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionTitle
            subtitle="Legal"
            title="TERMOS DE USO"
          />

          <div className="max-w-3xl mx-auto prose prose-invert prose-gold">
            <p className="text-muted-foreground">
              Última atualização: Janeiro de 2024
            </p>

            <h3 className="font-display text-2xl tracking-wide mt-12 mb-4">
              1. Aceitação dos Termos
            </h3>
            <p className="text-muted-foreground">
              Ao acessar e utilizar o site da Blackboy Films, você concorda em cumprir e estar 
              vinculado aos seguintes termos e condições de uso. Se você não concordar com 
              qualquer parte destes termos, não deverá utilizar nosso site.
            </p>

            <h3 className="font-display text-2xl tracking-wide mt-12 mb-4">
              2. Uso do Site
            </h3>
            <p className="text-muted-foreground">
              O conteúdo deste site é apenas para fins informativos. Reservamo-nos o direito 
              de modificar ou descontinuar qualquer aspecto do site a qualquer momento, 
              sem aviso prévio.
            </p>

            <h3 className="font-display text-2xl tracking-wide mt-12 mb-4">
              3. Propriedade Intelectual
            </h3>
            <p className="text-muted-foreground">
              Todo o conteúdo presente neste site, incluindo mas não limitado a textos, 
              gráficos, logos, imagens, vídeos e software, é propriedade da Blackboy Films 
              ou de seus licenciadores e está protegido por leis de direitos autorais.
            </p>

            <h3 className="font-display text-2xl tracking-wide mt-12 mb-4">
              4. Serviços
            </h3>
            <p className="text-muted-foreground">
              Os serviços oferecidos pela Blackboy Films estão sujeitos a disponibilidade 
              e podem ser modificados a qualquer momento. Orçamentos e propostas são válidos 
              por 30 dias a partir da data de emissão.
            </p>

            <h3 className="font-display text-2xl tracking-wide mt-12 mb-4">
              5. Limitação de Responsabilidade
            </h3>
            <p className="text-muted-foreground">
              A Blackboy Films não será responsável por quaisquer danos diretos, indiretos, 
              incidentais ou consequenciais resultantes do uso ou incapacidade de uso 
              deste site ou nossos serviços.
            </p>

            <h3 className="font-display text-2xl tracking-wide mt-12 mb-4">
              6. Links Externos
            </h3>
            <p className="text-muted-foreground">
              Este site pode conter links para sites de terceiros. Não somos responsáveis 
              pelo conteúdo ou práticas de privacidade desses sites.
            </p>

            <h3 className="font-display text-2xl tracking-wide mt-12 mb-4">
              7. Alterações nos Termos
            </h3>
            <p className="text-muted-foreground">
              Reservamo-nos o direito de atualizar estes termos a qualquer momento. 
              Alterações entram em vigor imediatamente após publicação no site.
            </p>

            <h3 className="font-display text-2xl tracking-wide mt-12 mb-4">
              8. Contato
            </h3>
            <p className="text-muted-foreground">
              Para questões sobre estes termos, entre em contato conosco através do 
              e-mail contato@blackboyfilms.com.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
