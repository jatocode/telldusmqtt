import { Client } from 'https://deno.land/x/mqtt/deno/mod.ts'; // Deno (ESM)

async function main() {
    const client = new Client({
        url: 'mqtt://mqtt.taklamakan.se',
    });

    await client.connect();

    const decoder = new TextDecoder();

    client.on('message', async (topic: string, payload: Uint8Array) => {

        const jsondata = decoder.decode(payload);

        switch (topic) {
            case 'tellstick':
                const data = JSON.parse(jsondata)
                console.log(data)
                const p=Deno.run({ cmd: ["echo", data.cmd, data.id] });
                await p.status();
                break
            default:
                break
        }
    });

    await client.subscribe('#');
}

main();