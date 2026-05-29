import portfolioData from "./data.json";

export const projectdata = portfolioData.projects;
export const experiences = portfolioData.experiences;
export const educations = portfolioData.education;
export const achievements = portfolioData.achievements;

export const GitHub = portfolioData.socials.github;
export const LinkedIn = portfolioData.socials.linkedin;
export const Instagram = portfolioData.socials.instagram;
export const Twitter = portfolioData.socials.twitter;
export const Facebook = portfolioData.socials.linkedin; // Fallback
export const Email = portfolioData.socials.email;

export const Name = portfolioData.name;

// Typewriter keywords formatted for react-typewriter or typewriter-effect
export const typewriterKeywords = portfolioData.typewriterKeywords;