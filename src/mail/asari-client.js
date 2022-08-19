import got from "got";

export class AsariEmailingClient {
    requestMail() {
        return Promise.resolve({
            getMail: () => `${Math.random().toString(36).substring(3)}@goon.bar`
        })
    }

    subscribeMail(mail) {
        return new Promise((resolve, reject) => {
            var waitForMails = setInterval(async () => {
                console.log(mail)
                var response = await got.get("https://asari.gay/api/v1/emails/" + mail, {
                    headers: {
                        "User-Agent": "noratelimit"
                    }
                }).json();
                
                console.log(response)

                if(response.error) {
                    clearInterval(waitForMails)
                    reject(response.message)
                    return;
                }

                if (response.emails.length > 0) {
                    clearInterval(waitForMails)
                    resolve(response.emails[0].body.match(/\d{5}/)[0])
                }
            }, 1000);
        });
    }
}