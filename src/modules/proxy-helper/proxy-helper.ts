import { IProxy } from '../proxy-manager/proxy-manager.interface';

const PLAIN_PROXY_REGEXP = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}(:([1-9]\d{1,4}))?(@\w+:\w+)?$/gi;

export class ProxyHelper {
	static validatePlainProxy(plainProxy: string): boolean {
		return !!plainProxy.match(PLAIN_PROXY_REGEXP);
	}

	static parseProxies(plainProxies: string[]): IProxy[] {
		return plainProxies
			.filter(this.validatePlainProxy)
			.map((plainProxy) => {
				const parts = plainProxy.split('@');
				const base = parts[0].split(':');
				const authPart = parts[1]?.split(':');

				return {
					plain: plainProxy,
					host: base[0] as string,
					port: base[1] ? parseInt(base[1], 10) : 80,
					auth: authPart ? {
						username: authPart[0] as string,
						password: authPart[1] as string,
					} : undefined,
				};
			});
	}
}