declare module '@ioc:Adonis/Core/HttpContext' {
  interface HttpContextContract {
    inertia: any;
  }
}

declare module '@ioc:Adonis/Addons/Redis' {
  const Redis: any;
  export default Redis;
}

declare module '@ioc:Adonis/Core/Validator' {
  interface Rules {
    file(options?: { size?: string; extnames?: string[] }): any;
  }
}

declare module '@ioc:Adonis/Core/Drive' {
  interface MultipartFileContract {
    moveToDisk(folder: string): Promise<string>;
  }
}

declare module '@ioc:Adonis/Lucid/Model' {
  interface ModelQueryBuilderContract<Model extends LucidModel, Result = InstanceType<Model>> {
    preload(relation: string): this;
    serialize(): any;
  }

  interface ModelContract {
    merge(data: any): this;
    save(): Promise<this>;
    delete(): Promise<void>;
    related(relation: string): any;
  }
}

declare module '@ioc:Adonis/Core/Route' {
  interface BriskRouteContract {
    renderInertia(page: string): void;
  }
} 