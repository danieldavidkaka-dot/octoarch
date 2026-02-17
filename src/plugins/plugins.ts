import { Logger } from '../utils/logger';

export interface Plugin {
  name: string;
  description: string;
  execute: (params: any) => Promise<any>;
}

export class PluginManager {
  private static plugins: Map<string, Plugin> = new Map();

  static register(plugin: Plugin) {
    this.plugins.set(plugin.name, plugin);
    Logger.info(`🔌 Plugin registrado: ${plugin.name}`);
  }

  static get(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  static listAvailable(): string[] {
    return Array.from(this.plugins.keys());
  }

  static async execute(pluginName: string, params: any): Promise<any> {
    const plugin = this.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} no encontrado.`);
    }
    Logger.info(`▶️ Ejecutando Plugin: ${pluginName}`);
    return await plugin.execute(params);
  }
}