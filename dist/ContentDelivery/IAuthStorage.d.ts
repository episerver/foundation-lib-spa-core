import { IOAuthSuccessResponse } from './IAuthService';
export type IAuthStorage = {
    clearToken: () => boolean;
    storeToken: (token: IOAuthSuccessResponse) => boolean;
    hasToken: () => boolean;
    getToken: () => IOAuthSuccessResponse | null;
};
export default IAuthStorage;
