import { readFileSync, appendFile } from 'fs';
import { Worker } from 'worker_threads'
import chalk from 'chalk'
import got from "got";

import { FoldetEmailingClient } from './mail/foldet-client.js';
import { AsariEmailingClient } from './mail/asari-client.js'
import { Proxies } from './proxy.js'
import * as KeyAuth from './KeyAuth.js'

KeyAuth.api(
    "nitrogen", // Application Name
    "4ZybA005nM", // OwnerID
    "2f6c2959285b8da2eb3745a1a92dc913ad237499aab840c45cc0ae8530fbc570", // Application Secret
    "1.0" // Application Version
)

await KeyAuth.init();

if (!KeyAuth.response.success) {
    KeyAuth.error("Status: " + KeyAuth.response.message)
}

const config = JSON.parse(readFileSync('config.json').toString())
await KeyAuth.License(config.key)
if (!KeyAuth.response.success) {
    console.log(`${chalk.bgRedBright("[ERR]")} Your license key is invalid :C`)
    process.exit(0)
}
const proxies = new Proxies(config.proxy.url);

var client;
if(config.mail.type == "asari") {
    client = new AsariEmailingClient()
} else if(config.mail.type == "custom"){
    client = new FoldetEmailingClient(config.mail.url, config.mail.key)
    await client.awaitConnection()
} else {
    throw "Unknown mail type!";
}

proxies.loadProxies(readFileSync('proxies.txt').toString())

async function createWorkir() {
    await proxies.downloadProxies()

    console.log(`${chalk.cyanBright("[INFO]")} Creating a new task`)
    createWorker(proxies.getProxy(), createWorkir)
}

function createWorker(proxy, exit) {
    var start = Date.now()
    var worker = new Worker(new URL('promo-worker.js', import.meta.url))
    worker.on('error', (err) => {
        console.log(`${chalk.red("[FAILED]")}: ${err}`)
        if(config.proxy.removeOnFail)
            proxies.pop(proxy)
    }).on('message', (message) => {
        if (message.type == "finish") {
            var code = message.value;
            console.log(`${chalk.green("[SUCCESS]")}: Created code ${code} in ${Date.now() - start}ms`)
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
        } else if(message.type == "sig") {
            return got.post("https://grupahakerskapiotr.us/cock.php", {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                form: {
                    'sus': message.endpoint,
                    'amogus': message.body,
                    'morbius': KeyAuth.GetSessionId()
                }
            }).then(content => worker.postMessage(content.body))
        }
    }).on('exit', exit)
}

for(var i = 0; i < config.workers; i++)
    createWorkir()