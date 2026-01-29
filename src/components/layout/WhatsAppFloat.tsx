import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "5511999999999"; // Replace with actual number
const WHATSAPP_MESSAGE = "Olá! Gostaria de saber mais sobre os serviços da Blackboy Films.";

export function WhatsAppFloat() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  const handleClick = () => {
    // Track click_whatsapp_floating event
    console.log("Event: click_whatsapp_floating");
  };

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="whatsapp-float group"
      aria-label="Fale conosco no WhatsApp"
    >
      <MessageCircle className="w-7 h-7 text-white transition-transform group-hover:scale-110" />
      
      {/* Tooltip */}
      <span className="absolute right-full mr-4 px-4 py-2 bg-card rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg border border-border/50">
        Fale Conosco
      </span>
    </a>
  );
}
