import { Link } from "react-router-dom";
import { Instagram, Youtube, Linkedin, Mail, MapPin } from "lucide-react";
import logoBlackboy from "@/assets/logo-blackboy-films.svg";

const socialLinks = [
  { href: "https://instagram.com/blackboyfilms", icon: Instagram, label: "Instagram" },
  { href: "https://youtube.com/@blackboyfilms", icon: Youtube, label: "YouTube" },
  { href: "https://linkedin.com/company/blackboyfilms", icon: Linkedin, label: "LinkedIn" },
];

const footerLinks = {
  servicos: [
    { href: "/nicho/casamento", label: "Casamento" },
    { href: "/nicho/eventos", label: "Eventos" },
    { href: "/nicho/clinicas", label: "Clínicas" },
    { href: "/nicho/marcas", label: "Marcas & Ads" },
    { href: "/nicho/food", label: "Food" },
    { href: "/nicho/imobiliario", label: "Imobiliário" },
  ],
  empresa: [
    { href: "/sobre", label: "Sobre Nós" },
    { href: "/processo", label: "Nosso Processo" },
    { href: "/works", label: "Portfólio" },
    { href: "/contato", label: "Contato" },
  ],
  legal: [
    { href: "/termos", label: "Termos de Uso" },
    { href: "/privacidade", label: "Política de Privacidade" },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border/50">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/">
              <img src={logoBlackboy} alt="Blackboy Films" className="h-10 w-auto" />
            </Link>
            <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
              Transformamos histórias em experiências cinematográficas inesquecíveis. 
              Produção audiovisual premium para marcas e momentos que importam.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-gold hover:text-primary-foreground transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display text-lg tracking-wider mb-4">Serviços</h4>
            <ul className="space-y-3">
              {footerLinks.servicos.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display text-lg tracking-wider mb-4">Empresa</h4>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg tracking-wider mb-4">Contato</h4>
            <div className="space-y-4">
              <a
                href="mailto:contato@blackboyfilms.com"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-gold transition-colors"
              >
                <Mail className="w-4 h-4" />
                contato@blackboyfilms.com
              </a>
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>São Paulo, SP - Brasil</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Blackboy Films. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm text-muted-foreground hover:text-gold transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
