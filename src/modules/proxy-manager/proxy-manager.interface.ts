export interface IProxy {
    plain: string;
    host: string;
    port: number;
    auth?: {
        username: string;
        password: string;
    }
}

export interface IProxyManager {
    proxies: IProxy[];
    busy: IProxy[];
    take(): Promise<IProxy | undefined>;
    put(proxy: IProxy): void;
}