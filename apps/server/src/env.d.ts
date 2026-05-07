declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    USER_ID: string;
    CLERK_PUBLISHABLE_KEY: string;
    CLERK_SECRET_KEY: string;
  }
}
