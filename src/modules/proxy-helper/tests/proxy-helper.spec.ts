import { getData } from '../../../tests/common';
import { IProxy } from '../../proxy-manager/proxy-manager.interface';
import ProxyHelper from '../index';

describe('ProxyHelper', () => {
	const readData = getData(`${__dirname}/data`);

	describe('Check matching', () => {
		const data: [string, boolean][] = readData('matching');

		data.forEach(([proxy, expected]) => {
			it(`Check ${proxy} -> ${expected ? 'true' : 'false'}`, () => {
				const result = ProxyHelper.validatePlainProxy(proxy);
				expect(result).toStrictEqual(expected);
			});
		});
	});

	describe('Check passing', () => {
		const data: [string, Partial<IProxy>][] = readData('parsing');

		data.forEach(([proxy, expected]) => {
			it(`Check correct parsing ${proxy}`, () => {
				const [result] = ProxyHelper.parseProxies([proxy]);
				
				expect(result).toEqual({
					...expected,
					plain: proxy,
				});
			});
		});
	});
});