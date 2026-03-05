import { Client, Databases } from "appwrite";

// Uses Vite's import.meta.env — add these to your .env.local file
const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT ?? "https://cloud.appwrite.io/v1")
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID ?? "");

export const databases = new Databases(client);
export default client;