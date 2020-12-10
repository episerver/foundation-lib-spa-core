export declare type IOAuthResponse = {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    client_id: string;
    username: string;
    '.issued': string;
    '.expires': string;
};
export declare type IOAuthRequest = {
    client_id: 'Default';
} & ({
    grant_type: 'password';
    username: string;
    password: string;
} | {
    grant_type: 'refresh_token';
    refresh_token: string;
});
