import { Client } from './deps.ts'
import IDevice from './IDevice.ts'

// Expecting config.json with url to mqtt-server
const config = JSON.parse(await Deno.readTextFile("./config.json"));


async function main(serverurl: string, topic_in: string = 'tellstick', topic_out:string = 'tellstick/out', tool: string = 'tdtool') {

    console.log(`Listening on ${serverurl}/${topic_in}/#, using ${tool} for exec`)

    const client = new Client({
        url: serverurl,
    })

    await client.connect()

    const decoder = new TextDecoder()

    client.on('message', async (topic: string, payload: Uint8Array) => {

        const jsondata = decoder.decode(payload)
        let data : any;
        try {
            data = JSON.parse(jsondata)
        } catch (e) {
            console.error('Failed to parse ', jsondata);
            return;
        }

        switch (topic) {
            case topic_in:
                console.log(`Running ${tool} with cmd:${data.cmd}, on id:${data.id}`)
                
                // Run shellcommand
                const p = Deno.run({ cmd: [tool, data.cmd, data.id], stdout: 'piped', stderr: 'piped' })
                const { code } = await p.status()

                if (code == 0) {
                    const rawOutput = await p.output()
                    const output = decoder.decode(rawOutput);
                    if (data.cmd == '--list') {
                        let devices = await handleListCommand(output);
                        await client.publish(topic_out, JSON.stringify(devices));
                    }
                } else {
                    const  error  = await p.stderrOutput()
                    console.error('Error code', code)
                    console.error(decoder.decode(error))
                }
                break
            default:
                break
        }
    });

    await client.subscribe(`${topic_in}/#`)
}

async function handleListCommand(cmdOutput:string):Promise<IDevice[]> {
    let devices = [];
    for (const row of cmdOutput.split('\n')) {
        let m = row.match(/(\d+)\t(.*)\t(OFF|ON)/);
        if (m && m.length > 0) {
            let device:IDevice = {
                id: m[1],
                name: m[2],
                state: m[3] == 'ON'
            };
            devices.push(device);
        }
    }
    console.log(devices);

    return devices;
}

main(config.mqttserver, config.topic_in, config.topic_out, config.toolname)

