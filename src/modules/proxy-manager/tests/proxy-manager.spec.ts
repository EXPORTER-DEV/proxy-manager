/* eslint-disable @typescript-eslint/no-explicit-any */
import ProxyManager from '../index';

enum PromiseState {
	PENDING = 0,
	FULFILLED = 1,
	REJECTED = 2,
}

const promiseState = async (p: Promise<any>): Promise<PromiseState> => {
	const temp = {};
	return Promise.race([p, temp])
		.then((r) => r === temp ? PromiseState.PENDING : PromiseState.FULFILLED, () => PromiseState.REJECTED);
};

describe('ProxyManager', () => {
	describe('Check base handling', () => {
		it('Check double clients take, when only 1 proxy is free', async () => {
			const proxyManager = new ProxyManager({
				proxies: ['1.1.1.1'],
			});

			const [ first, second ] = [
				proxyManager.take(),
				proxyManager.take(),
			];

			await Promise.race([first, second]);

			expect(await promiseState(second)).toStrictEqual(PromiseState.PENDING);

			const firstProxy = await first;

			expect(firstProxy).toBeDefined();

			await new Promise((resolve) => setTimeout(() => {
				proxyManager.put(firstProxy!);
				resolve(1);
			}, 1));

			expect(await promiseState(second)).toStrictEqual(PromiseState.FULFILLED);

			const secondProxy = await second;

			expect(secondProxy).toStrictEqual(firstProxy);
		});

		it('Check not waiting if proxy list is empty', async () => {
			const proxyManager = new ProxyManager({
				proxies: [],
			});

			const result = await proxyManager.take();

			expect(result).toBeUndefined();
		});

		it('Check add busy after take', async () => {
			const proxyManager = new ProxyManager({
				proxies: ['1.1.1.1'],
			});

			expect(proxyManager.busy.length).toStrictEqual(0);
			expect(proxyManager.proxies.length).toStrictEqual(1);

			const result = await proxyManager.take();

			expect(result).toBeDefined();

			expect(proxyManager.busy.length).toStrictEqual(1);
			expect(proxyManager.proxies.length).toStrictEqual(0);
		});

		it('Check add busy after take, then remove busy after put', async () => {
			const proxyManager = new ProxyManager({
				proxies: ['1.1.1.1'],
			});

			expect(proxyManager.busy.length).toStrictEqual(0);
			expect(proxyManager.proxies.length).toStrictEqual(1);

			const result = await proxyManager.take();

			expect(result).toBeDefined();

			expect(proxyManager.busy.length).toStrictEqual(1);
			expect(proxyManager.proxies.length).toStrictEqual(0);

			proxyManager.put(result!);

			expect(proxyManager.busy.length).toStrictEqual(0);
			expect(proxyManager.proxies.length).toStrictEqual(1);
		});
	});
});