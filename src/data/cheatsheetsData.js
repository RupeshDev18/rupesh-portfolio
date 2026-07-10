import springBootContent from '../assets/cheatsheets/spring-boot-cheatsheet.md?raw';
import reactNextjsContent from '../assets/cheatsheets/react-cheatsheet.md?raw';
import nodejsExpressContent from '../assets/cheatsheets/node-cheatsheet.md?raw';
import testingPlaywrightContent from '../assets/cheatsheets/test-playwright.md?raw';
import awsContent from '../assets/cheatsheets/aws.md?raw';

export const cheatsheets = [
  {
    id: "spring-boot",
    title: "Spring Boot Cheat Sheet",
    description: "The ultimate 1-2 YOE interview preparation handbook covering auto-configuration, IoC, DI, JPA, transactions, caching, security, and performance tuning.",
    category: "Backend Development",
    yoe: "1-2 YOE",
    readTime: "20 min read",
    icon: "spring",
    content: springBootContent
  },
  {
    id: "react-nextjs",
    title: "React & Next.js Cheat Sheet",
    description: "Deep dive into React hooks, rendering strategies (SSR, SSG, ISR), server components, state management, and web performance optimization.",
    category: "Frontend Development",
    yoe: "Junior-Senior",
    readTime: "30 min read",
    icon: "react",
    content: reactNextjsContent
  },
  {
    id: "nodejs-express",
    title: "Node.js & Express Cheat Sheet",
    description: "Asynchronous event loop, middleware patterns, authentication, clustering, database pooling, and performance monitoring.",
    category: "Backend Development",
    yoe: "Junior-Mid",
    readTime: "25 min read",
    icon: "node",
    content: nodejsExpressContent
  },
  {
    id: "testing-playwright",
    title: "Testing & Playwright Cheat Sheet",
    description: "Complete guide to frontend and backend testing, focusing on End-to-End (E2E) testing with Playwright, unit testing, integration testing, and CI/CD pipelines.",
    category: "Testing & DevOps",
    yoe: "Junior-Senior",
    readTime: "20 min read",
    icon: "playwright",
    content: testingPlaywrightContent
  },
  {
    id: "aws-cloud",
    title: "AWS Cloud Cheat Sheet",
    description: "Comprehensive AWS engineering guide covering IAM, VPC, EC2, ECS, EKS, Lambda, S3, RDS, Aurora, DynamoDB, CI/CD, and production architectures.",
    category: "Testing & DevOps",
    yoe: "Junior-Senior",
    readTime: "45 min read",
    icon: "aws",
    content: awsContent
  }
];
