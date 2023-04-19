export type IAuthToken = {
    access_token: string;
    token_type: string;
    username: string;
};
export type IAuthTokenProvider = {
    getCurrentToken(): Promise<IAuthToken | undefined>;
};
export default IAuthTokenProvider;
