export declare const sendNotification: (message: string, metadata?: {
    siteName?: string;
    siteUrl?: string;
    responseTime?: string;
    timestamp?: string;
    status?: string;
}) => Promise<void>;
