import { Sparkles, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-stone-200 bg-stone-50 py-24 md:py-32">
      <div className="container relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl md:text-6xl">
            Truth in the Age of{" "}
            <span className="text-stone-600">Information</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-stone-600">
            AI-powered news analysis that separates fact from fiction. 
            Veritas AI delivers credible, well-sourced journalism with 
            transparency you can trust.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button 
              size="lg" 
              className="bg-stone-900 text-stone-50 hover:bg-stone-800"
              asChild
            >
              <a href="#latest">Explore Stories</a>
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-stone-300 text-stone-700 hover:bg-stone-100"
            >
              Learn More
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100">
              <Sparkles className="h-6 w-6 text-stone-700" />
            </div>
            <h3 className="mt-4 font-serif text-lg font-semibold text-stone-900">
              AI Generated
            </h3>
            <p className="mt-2 text-sm text-stone-600">
              Articles crafted by advanced language models
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100">
              <Shield className="h-6 w-6 text-stone-700" />
            </div>
            <h3 className="mt-4 font-serif text-lg font-semibold text-stone-900">
              Credibility Scored
            </h3>
            <p className="mt-2 text-sm text-stone-600">
              Every article rated for trustworthiness
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100">
              <Zap className="h-6 w-6 text-stone-700" />
            </div>
            <h3 className="mt-4 font-serif text-lg font-semibold text-stone-900">
              Breaking News
            </h3>
            <p className="mt-2 text-sm text-stone-600">
              Real-time updates on important events
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
