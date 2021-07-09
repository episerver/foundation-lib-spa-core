export type IServerSideRenderingResponse = {
  Body: string;
  HtmlAttributes?: string;
  Title?: string;
  Meta?: string;
  Link?: string;
  Script?: string;
  Style?: string;
  BodyAttributes?: string;
}
export class ServerSideRenderingResponse implements IServerSideRenderingResponse {
  public Body = ""
  public HtmlAttributes?: string;
  public Title?: string;
  public Meta?: string;
  public Link?: string;
  public Script?: string;
  public Style?: string;
  public BodyAttributes?: string;
}
export default ServerSideRenderingResponse;