import { Client } from 'https://deno.land/x/mqtt@0.1.2/deno/mod.ts';

async function main(serverurl:string, topicname:string = 'tellstick', tool:string = 'tdtool') {
    
    console.log(`Listening on ${serverurl}/${topicname}/#, using ${tool} for exec`)
   
    const client = new Client({
        url: serverurl,
    })

    await client.connect()

    const decoder = new TextDecoder()

    client.on('message', async (topic: string, payload: Uint8Array) => {

        const jsondata = decoder.decode(payload)

        switch (topic) {
            case topicname:
                const data = JSON.parse(jsondata)
                console.log(`Running ${tool} with cmd:${data.cmd}, on id:${data.id}`)
                const p = Deno.run({ cmd: [tool, data.cmd, data.id], stdout: 'piped', stderr: 'piped' })
                const { code } = await p.status()
                if(code == 0) {
                    const rawOutput = await p.output()
                    console.log('Result', decoder.decode(rawOutput))
                }
                break
            default:
                break
        }
    });

    await client.subscribe('#')
}

// Expecting config.json with url to mqtt-server
const config = JSON.parse(await Deno.readTextFile("./config.json"));

main(config.mqttserver, config.topic, config.toolname)
