import { Layout } from "@/components/layout/Layout";
import { SectionTitle } from "@/components/ui/SectionTitle";

export default function Privacidade() {
  return (
    <Layout>
      <section className="pt-32 pb-24 md:pt-40 md:pb-32">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionTitle
            subtitle="Legal"
            title="POLÍTICA DE PRIVACIDADE"
          />

          <div className="max-w-3xl mx-auto prose prose-invert prose-gold">
            <p className="text-muted-foreground">
              Última atualização: Janeiro de 2024
            </p>

            <h3 className="font-display text-2xl tracking-wide mt-12 mb-4">
              1. Introdução
            </h3>
            <p className="text-muted-foreground">
              A Blackboy Films ("nós", "nosso" ou "empresa") está comprometida em proteger 
              sua privacidade. Esta Política de Privacidade explica como coletamos, usamos, 
              divulgamos e protegemos suas informações pessoais de acordo com a Lei Geral 
              de Proteção de Dados (LGPD).
            </p>

            <h3 className="font-display text-2xl tracking-wide mt-12 mb-4">
              2. Dados Coletados
            </h3>
            <p className="text-muted-foreground">
              Coletamos as seguintes informações quando você utiliza nosso formulário de contato:
            </p>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6">
              <li>Nome completo</li>
              <li>Telefone</li>
              <li>E-mail</li>
              <li>Cidade/Estado</li>
              <li>Tipo de projeto (nicho)</li>
              <li>Mensagem descritiva</li>
              <li>Dados de navegação (cookies, IP, páginas visitadas)</li>
            </ul>

            <h3 className="font-display text-2xl tracking-wide mt-12 mb-4">
              3. Finalidade do Tratamento
            </h3>
            <p className="text-muted-foreground">
              Utilizamos seus dados para:
            </p>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6">
              <li>Responder às suas solicitações e fornecer orçamentos</li>
              <li>Enviar comunicações relevantes sobre nossos serviços</li>
              <li>Melhorar nosso site e experiência do usuário</li>
              <li>Cumprir obrigações legais</li>
            </ul>

            <h3 className="font-display text-2xl tracking-wide mt-12 mb-4">
              4. Base Legal
            </h3>
            <p className="text-muted-foreground">
              O tratamento de seus dados pessoais é realizado com base no seu consentimento 
              expresso e/ou para execução de contrato ou diligências pré-contratuais.
            </p>

            <h3 className="font-display text-2xl tracking-wide mt-12 mb-4">
              5. Compartilhamento de Dados
            </h3>
            <p className="text-muted-foreground">
              Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, 
              exceto quando necessário para:
            </p>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6">
              <li>Prestadores de serviços que nos auxiliam na operação do site</li>
              <li>Cumprimento de obrigações legais</li>
              <li>Proteção de nossos direitos legais</li>
            </ul>

            <h3 className="font-display text-2xl tracking-wide mt-12 mb-4">
              6. Segurança dos Dados
            </h3>
            <p className="text-muted-foreground">
              Implementamos medidas de segurança técnicas e organizacionais para proteger 
              seus dados pessoais contra acesso não autorizado, alteração, divulgação ou 
              destruição.
            </p>

            <h3 className="font-display text-2xl tracking-wide mt-12 mb-4">
              7. Seus Direitos
            </h3>
            <p className="text-muted-foreground">
              De acordo com a LGPD, você tem direito a:
            </p>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6">
              <li>Confirmar a existência de tratamento de dados</li>
              <li>Acessar seus dados</li>
              <li>Corrigir dados incompletos ou desatualizados</li>
              <li>Solicitar anonimização, bloqueio ou eliminação de dados</li>
              <li>Revogar o consentimento</li>
            </ul>

            <h3 className="font-display text-2xl tracking-wide mt-12 mb-4">
              8. Cookies
            </h3>
            <p className="text-muted-foreground">
              Utilizamos cookies para melhorar sua experiência de navegação. Você pode 
              configurar seu navegador para recusar cookies, mas isso pode afetar 
              a funcionalidade do site.
            </p>

            <h3 className="font-display text-2xl tracking-wide mt-12 mb-4">
              9. Retenção de Dados
            </h3>
            <p className="text-muted-foreground">
              Mantemos seus dados pessoais pelo tempo necessário para cumprir as finalidades 
              descritas nesta política ou conforme exigido por lei.
            </p>

            <h3 className="font-display text-2xl tracking-wide mt-12 mb-4">
              10. Contato do Encarregado (DPO)
            </h3>
            <p className="text-muted-foreground">
              Para exercer seus direitos ou esclarecer dúvidas sobre esta política, 
              entre em contato conosco:
            </p>
            <p className="text-foreground font-medium mt-4">
              E-mail: privacidade@blackboyfilms.com
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
