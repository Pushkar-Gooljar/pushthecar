export interface Site {
    name: string;
    url: string;
    description: string;
    tags: string[];
    emoji: string;
    status?: "coming-soon" | "under-construction";
}

export const sites: Site[] = [
    {
        name: "Physics",
        url: "https://physics.pushthecar.com",
        description:
            "Notes and resources on 9702 A Level Physics",
        tags: ["Notes", "A Level Physics", "Physics", "9702"],
        emoji: "⚛️",
        status: "under-construction",
    },
    {
        name: "Chemistry",
        url: "https://chemistry.pushthecar.com",
        description:
            "Notes and resources on 9701 A Level Chemistry",
        tags: ["Notes", "A Level Chemistry", "Chemistry", "9701"],
        emoji: "🧪",
        status: "under-construction",
    },
    {
        name: "Aliphatic Map",
        url: "https://aliphaticmap.pushthecar.com",
        description:
            "An interactive map and reference for aliphatic compound structures and reactions.",
        tags: ["Tool", "Chemistry", "A Level Chemistry", "9701"],
        emoji: "🗺️",
    },
    {
        name: "Xtra",
        url: "https://xtra.base.com",
        description: "Miscellaneous projects, experiments, and extras.",
        tags: ["Projects", "Misc"],
        emoji: "✨",
        status: "coming-soon"
    },
];

export const ownerConfig = {
    initials: "PG", // Replace with your initials
    fullName: "Pushkar Gooljar", // Replace with your full name
    quote: "If I have seen further it is by standing on the shoulders of giants.",
    quoteAuthor: "Sir Issac Newton",
    github: "https://github.com/Pushkar-Gooljar",
};