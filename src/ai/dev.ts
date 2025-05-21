import { config } from 'dotenv';
config();

// Ensure this path is correct if the file is moved or renamed.
// import '@/ai/flows/stylewright-style-guide-suggestions.ts'; 
import '@/ai/flows/stylewright-style-check.ts';

// Note: stylewright-style-guide-suggestions.ts might be redundant now
// if the primary goal is to use a fixed internal guide.
// Consider removing or refactoring if it's no longer used.
// For now, I've commented out its import if it's not essential for the new flow.
// If you still need the `generateStyleGuideSuggestions` flow for other purposes, you can uncomment it.
