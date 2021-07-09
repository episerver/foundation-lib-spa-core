export declare type IServerSideRenderingResponse = {
    Body: string;
    HtmlAttributes?: string;
    Title?: string;
    Meta?: string;
    Link?: string;
    Script?: string;
    Style?: string;
    BodyAttributes?: string;
};
export declare class ServerSideRenderingResponse implements IServerSideRenderingResponse {
    Body: string;
    HtmlAttributes?: string;
    Title?: string;
    Meta?: string;
    Link?: string;
    Script?: string;
    Style?: string;
    BodyAttributes?: string;
}
export default ServerSideRenderingResponse;
