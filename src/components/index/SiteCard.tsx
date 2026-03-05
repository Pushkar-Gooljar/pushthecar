import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Construction, Clock } from "lucide-react";
import type { Site } from "@/config/sites";

interface SiteCardProps {
    site: Site;
}

const statusConfig = {
    "coming-soon": {
        label: "Coming Soon",
        icon: Clock,
        badgeClass: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    },
    "under-construction": {
        label: "Under Construction",
        icon: Construction,
        badgeClass: "bg-orange-500/15 text-orange-500 border-orange-500/30",
    },
};

export function SiteCard({ site }: SiteCardProps) {
    const isComingSoon = site.status === "coming-soon";
    const isClickable = !isComingSoon;
    const statusInfo = site.status ? statusConfig[site.status] : null;

    const cardContent = (
        <Card
            className={`h-full transition-all duration-300 ${
                isClickable
                    ? "hover:shadow-lg hover:-translate-y-1 hover:border-primary/40"
                    : "opacity-75"
            }`}
        >
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
            <span className="text-3xl" role="img" aria-label={site.name}>
              {site.emoji}
            </span>
                        <CardTitle
                            className={`text-xl ${
                                isClickable ? "group-hover:text-primary transition-colors" : ""
                            }`}
                        >
                            {site.name}
                        </CardTitle>
                    </div>
                    {statusInfo ? (
                        <Badge
                            variant="outline"
                            className={`text-xs gap-1 ${statusInfo.badgeClass}`}
                        >
                            <statusInfo.icon className="h-3 w-3" />
                            {statusInfo.label}
                        </Badge>
                    ) : (
                        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                </div>
                <CardDescription className="mt-2 text-sm leading-relaxed">
                    {site.description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {site.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                        </Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    );

    if (isClickable) {
        return (
            <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
            >
                {cardContent}
            </a>
        );
    }

    return <div className="block cursor-default">{cardContent}</div>;
}