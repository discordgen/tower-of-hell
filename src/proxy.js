import got from "got";

export class Proxies {
    #proxies = [];
    #url
    #proxyIndex = 0

    constructor(url) {
        this.#url = url
        this.downloadProxies()
    }

    async downloadProxies() {
        if (this.#proxies.length == 0 && this.#url) {
            console.log(`warrning: dont have any proxies, downloading new ones...`)
            this.loadProxies((await (await got.get(this.#url)).body))
        }
    }

    loadProxies(body) {
        this.#proxies = body.replace(/\r\n/g, '\n').split("\n").filter(x => x).map(x => {
            if (x && !x.startsWith("http://"))
                return "http://" + x
            return x
        })
    }

    getProxy() {
        return this.#proxies[this.#proxyIndex++ % this.#proxies.length];
    }

    pop(proxy) {
        this.#proxies.pop(proxy)
    }
}

