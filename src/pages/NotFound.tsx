import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center px-4">
          <span className="font-display text-8xl md:text-9xl text-gradient opacity-50">
            404
          </span>
          <h1 className="font-display text-4xl md:text-5xl tracking-wide mt-4 mb-6">
            PÁGINA NÃO ENCONTRADA
          </h1>
          <p className="text-muted-foreground text-lg mb-10 max-w-md mx-auto">
            A página que você está procurando não existe ou foi movida.
          </p>
          <Button
            asChild
            size="lg"
            className="btn-glow bg-gold hover:bg-gold-light text-primary-foreground font-semibold px-8 py-6"
          >
            <Link to="/">
              <Home className="w-5 h-5 mr-2" />
              Voltar para Home
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
