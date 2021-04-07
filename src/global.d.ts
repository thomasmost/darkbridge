declare namespace NodeJS {
  interface Global {
    config: {
      env: {
        NODE_ENV: string | undefined;
        STRIPE_PUBLIC_KEY: string | undefined;
      };
    };
  }
}
