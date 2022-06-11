#! /bin/sh

/usr/sbin/telldusd 2> /var/log/telldus.log --nodaemon &
deno run --allow-read --allow-net --allow-run src/main.ts
