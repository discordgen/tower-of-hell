import { readFileSync, appendFile } from 'fs';
import { Worker } from 'worker_threads'

import { FoldetEmailingClient } from './mail/foldet-client.js';
import { AsariEmailingClient } from './mail/asari-client.js'
import { Proxies } from './proxy.js'

const config = JSON.parse(readFileSync('config.json').toString())
const proxies = new Proxies(config.proxy.url);

var client;
if(config.mail.type == "asari") {
    client = new AsariEmailingClient()
} else if(config.mail.type == "foldet"){
    client = new FoldetEmailingClient("ws://backend.foldet.pl:587", config.mail.key)
    await client.awaitConnection()
} else {
    throw "Unknown mail type!";
}

proxies.loadProxies(readFileSync('proxies.txt').toString())

async function createWorkir() {
    await proxies.downloadProxies()

    console.log(`info: creating new task`)
    createWorker(proxies.getProxy(), createWorkir)
}

function createWorker(proxy, exit) {
    var start = Date.now()
    var worker = new Worker(new URL('promo-worker.js'), {
        workerData: {
            noob: config.noob
        }
    }).on('error', (err) => {
        console.log(`failed: ${err}`)
        if(config.proxy.removeOnFail)
            proxies.pop(proxy)
    }).on('message', (message) => {
        if (message.type == "finish") {
            var code = message.value;
            console.log(`success: ${code} in ${Date.now() - start}ms`)
            appendFile('gifts.txt', code + '\n', err => {
                if (err)
                    console.log(`file append err: ${err}`)
            });
        } else if (message.type == "mail") {
            client.requestMail().then(mail => {
                worker.postMessage(mail.getMail())
            })
        } else if (message.type == "mail-code") {
            client.subscribeMail(message.value).then(content => {
                worker.postMessage(content)
            })
        } else if(message.type == "proxy") {
            worker.postMessage(proxies.getProxy())
        }
    }).on('exit', exit)
}

for(var i = 0; i < config.workers; i++)
    createWorkir()