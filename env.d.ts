declare namespace NodeJS {
    interface ProcessEnv {
        PORT: any;
        DB: string;
        BASE_URL: string;
        NODE_ENV: 'development' | 'product';
        JWT_SECRET_KEY: string;
        JWT_RESET_SECRET_KEY: string;
        EXPIRED_TIME: string;
        EXPIRED_RESET_TIME: string;
        EMAIL_HOST: string;
        EMAIL_PORT: any;
        EMAIL_SECURE: any;
        EMAIL_USERNAME: string;
        EMAIL_PASSWORD: string;
        APP_NAME: string;
    }
}
