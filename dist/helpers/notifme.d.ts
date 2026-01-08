export declare const sendNotification: (message: string, metadata?: {
    siteName?: string;
    siteSlug?: string;
    siteUrl?: string;
    responseTime?: string;
    timestamp?: string;
    status?: string;
    issueUrl?: string;
}) => Promise<void>;
