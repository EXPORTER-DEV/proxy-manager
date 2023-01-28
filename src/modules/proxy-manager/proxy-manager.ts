import { EventEmitter } from 'node:events';
import { ProxyHelper } from '../proxy-helper/proxy-helper';

import { IProxy, IProxyManager } from './proxy-manager.interface';

interface IConstructorOptions {
    proxies: string[];
}

export class ProxyManager implements IProxyManager {
	proxies: IProxy[] = [];
	busy: IProxy[] = [];

	private emitter: EventEmitter = new EventEmitter();

	constructor(options: IConstructorOptions) {
		const uniqueProxies = Array.from(
			new Set(options.proxies)
				.values(),
		);

		this.proxies = ProxyHelper.parseProxies(uniqueProxies);
	}

	/**
     * Takes one proxy from free proxies list, 
     * if all proxies are busy, then returns first free one.
     * 
     * When take proxy it removes from proxies, then add to busy array.
     * Need to call put(proxy: string) to return proxy in free list.
     */
	async take(): Promise<IProxy | undefined> {
		if (this.proxies.length > 0) {
			const proxy = this.proxies.pop();
			this.busy.push(proxy!);
			return proxy;
		}

		if (this.busy.length === 0) return undefined;

		return new Promise((resolve) => this.emitter.once('proxy', (proxy: IProxy) => {
			this.proxies = this.proxies.filter(value => proxy.plain !== value.plain);
			this.busy.push(proxy);
			resolve(proxy);
		}));
	}

	/**
     * Puts proxy from busy to free list.
     */
	put(proxy: IProxy): void {
		this.busy = this.busy.filter(value => value.plain !== proxy.plain);
		this.proxies.unshift(proxy);
		this.emitter.emit('proxy', proxy);
	}
}