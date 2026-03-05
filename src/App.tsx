import { SiteCard } from "@/components/index/SiteCard";
import { Footer } from "@/components/index/Footer";
import { sites, ownerConfig } from "@/config/sites";

function App() {
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <header className="container mx-auto max-w-4xl px-6 pt-20 pb-12 text-center">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                    PG
                </h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    A collection of my notes, tools, and projects — all in one place.
                </p>
            </header>

            <main className="container mx-auto max-w-4xl px-6 pb-16 flex-1">
                <div className="grid gap-6 sm:grid-cols-2">
                    {sites.map((site) => (
                        <SiteCard key={site.name} site={site} />
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default App;