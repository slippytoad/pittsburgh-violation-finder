
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedContainer from "@/components/AnimatedContainer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 px-6 py-12 flex items-center justify-center">
        <AnimatedContainer className="max-w-md w-full text-center">
          <h1 className="text-6xl font-bold mb-6">404</h1>
          <p className="text-xl text-muted-foreground mb-8">The page you're looking for doesn't exist.</p>
          <Button asChild className="transition-all duration-300">
            <a href="/">Return to Home</a>
          </Button>
        </AnimatedContainer>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
