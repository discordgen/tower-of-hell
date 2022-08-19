import got from "got";
import Imap from 'imap'
import { simpleParser } from 'mailparser';

export class ImapEmailingClient {
    #domains
    #imap

    constructor(options, domains) {
        this.#imap = new ImapWrapper(options)
        this.#domains = domains
    }

    requestMail() {
        return Promise.resolve({
            getMail: () => `${Math.random().toString(36).substring(3)}@${this.#domains[Math.floor(Math.random() * this.#domains.length)]}`
        })
    }

    subscribeMail(mail) {
        return this.#imap.awaitMail(mail)
    }
}

export class ImapWrapper {
    constructor(options) {
        this.imap = new Imap(options);
        this.promises = new Map();

        ((self) => {
            self.imap.once('ready', function () {
                self.imap.openBox('INBOX', true, function (err, box) {
                    if (err) throw err;
                    self.imap.on('mail', (number) => {
                        self.imap.search(['UNSEEN'], (err, result) => { //this doesn't work - returns everything but idc
                            self.read(result)
                        })
                    })
                });
            });
        })(this);
        this.imap.connect();
    }

    async awaitMail(mailbox) {
        return Promise.race([new Promise((resolve, reject) => {
            this.promises.set(mailbox, { date: Date.now(), resolve: resolve, reject: reject })
        })]);
    }

    completeMail(mailbox, parsed) {
        var promise = this.promises.get(mailbox)
        if (promise) {
            promise.resolve(parsed.text)
            this.promises.delete(mailbox)
        }
    }

    rejectAll(cause) {
        for (var promise of this.promises)
            promise.reject(cause)
    }

    read(result) {
        var completeMail = this.completeMail.bind(this);

        var f = this.imap.fetch(result, {
            bodies: "",
            struct: true,
            markSeen: true
        });
        f.on('message', function (msg, seqno) {
            msg.on('body', function (stream, info) {
                var buffer = '';
                stream.on('data', function (chunk) {
                    buffer += chunk.toString('utf8');
                });
                stream.once('end', function () {
                    simpleParser(buffer).then(mail => {
                        completeMail(mail.to.text, mail)
                    });
                });
            });
        });
        f.once('error', function (err) {
            rejectAll(err)
        });
    }
}