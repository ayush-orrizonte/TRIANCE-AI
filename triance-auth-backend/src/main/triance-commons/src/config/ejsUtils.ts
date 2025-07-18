import ejs from "ejs";

export class EjsUtils {

  private static instance: EjsUtils | null = null;

  public static getInstance(): EjsUtils {
    if (!EjsUtils.instance) {
      EjsUtils.instance = new EjsUtils();
    }
    return EjsUtils.instance;
  }

  public static async generateHtml(ejsPath: string, body: object): Promise<string> {
    try {
      const html = await ejs.renderFile(ejsPath, body, { async: true });
      return html;
    } catch (error) {
      throw error;
    }
  }
}