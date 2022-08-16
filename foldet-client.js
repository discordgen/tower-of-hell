import WebSocket from 'ws';

export class FoldetEmailingClient {
    #ws;
    #promises;
    #connect;

    constructor(address, token) {
        this.#ws = new WebSocket(address, {
            headers: {
                "Authorization": token
            }
        });
        this.#promises = new Map();
        this.#connect = new Promise((resolve, reject) => {
            this.#ws.on('open', resolve)
            this.#ws.on('error', reject)
        })
        this.#ws.on('message', this.#handleMessage.bind(this))
    }

    async awaitConnection() {
        return this.#connect;
    }

    #handleMessage(message) {
        var json = JSON.parse(message)
        var promise = this.#promises.get(json.tx)
        this.#promises.delete(json.tx)
        if (json.type == "responseMail") {
            this.#handleMailResponse(promise, json.content)
        } else if(json.type == "subscribeMail") {
            this.#handleMailSubscription(promise, json.content)
        }
    }

    requestMail() {
        return new Promise((resolve, reject) => {
            var num = Math.random();
            this.#ws.send(JSON.stringify({
                type: "requestMail",
                tx: num
            }));
            this.#promises.set(num, { resolve: resolve, reject: reject })
        });
    }

    #handleMailResponse(promise, response) {
        if (response.success) {
            promise.resolve(new MailBox(this, response.message))
        } else {
            promise.reject(new Error(response.message))
        }
    }

    #handleMailSubscription(promise, response) {
        if (response.success) {
            promise.resolve(response.message)
        } else {
            promise.reject(new Error(response.message))
        }
    }

    subscribeMail(mail) {
        return new Promise((resolve, reject) => {
            var num = Math.random();
            this.#ws.send(JSON.stringify({
                type: "subscribeMail",
                tx: num,
                mail: mail
            }));
            this.#promises.set(num, { resolve: resolve, reject: reject })
        });
    }
}

class MailBox {
    #client;
    #mail;

    constructor(client, mail) {
        this.#client = client;
        this.#mail = mail;
    }

    subscribe() {
        return this.#client.subscribeMail(this.#mail)
    }

    getMail() {
        return this.#mail;
    }

    toString() {
        return this.#mail;
    }
}