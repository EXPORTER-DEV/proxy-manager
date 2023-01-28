# proxy-manager

Proxy Manager creates queue for proxy list usage and allow for parallel requests to use one proxy per request, disallowing using the same proxies for different request at same time.

If there are no free proxy (that are in use by other process) - `ProxyManager.take()` function will wait when other process return it back to free list with `ProxyManager.put(proxy)`.

It also provides `ProxyHelper` for parsing plain proxies in format `host:port@username:password` - where `port` is optional (by default is `80`), and `username:password` is optional part to (then return `auth` as undefined).

### Usage example

**Install first:**

```bash
$ npm i https://github.com/EXPORTER-DEV/proxy-manager
```

*Then construct `ProxyManager` with plain array of proxies in supporting format `host:port@username:password`:*

```typescript
import { ProxyManager } from 'proxy-manager';

const manager = new ProxyManager({
	proxies: [
        '1.1.1.1@demo:pass',
    ]
});

async function start() {
    /**
     * Will resolve '1.1.1.1@demo:pass' parsed proxy IProxy interface:
     * {
     *      "plain": "1.1.1.1@demo:pass",
     *      "host": "1.1.1.1",
     *      "port": 80,
     *      "auth": {
     *          "username": "demo",
     *          "password": "pass"
     *      }
     * }
     */
    const firstProxy = await manager.take();
    /*
     * When another process will try to access proxy,
     * it will be waiting for firstProxy appears at free list,
     * after manager.put(firstProxy).
    */
    const secondProxy = manager.take();

    /*
     * Will output: Promise { <pending> }
    */
    console.log(secondProxy);

    /*
     * Now put firstProxy to a free list.
     * Preffered to do in finally scope in try / catch
     * or as last then in promise chain.
    */
    manager.put(firstProxy!);

    /**
     * Will output: 
     * {
     *      "plain": "1.1.1.1@demo:pass",
     *      "host": "1.1.1.1",
     *      "port": 80,
     *      "auth": {
     *          "username": "demo",
     *          "password": "pass"
     *      }
     * }
    */ 
    console.log(await secondProxy);
}

start();
```