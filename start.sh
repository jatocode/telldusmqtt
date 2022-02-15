#! /bin/sh

/usr/sbin/telldusd 2> /var/log/telldus.log --nodaemon &
deno run --allow-net --allow-run main.ts
