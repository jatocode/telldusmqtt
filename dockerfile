FROM denoland/deno:debian

RUN apt-get update && apt-get upgrade -y && apt-get install curl gnupg unzip -y

# Add public key for telldus
RUN curl http://download.telldus.com/debian/telldus-public.key | apt-key add -

# Add source
RUN echo "deb http://download.telldus.com/debian/ stable main" >> /etc/apt/sources.list

# Baserat på:
# https://forum.telldus.com/viewtopic.php?f=8&t=4&p=49723&hilit=telldus+core+ubuntu&sid=55e6f99e8ed8d235aec93253a25213e6#p49723

# And install
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libftdi1 \
    libtelldus-core2

RUN apt-get download telldus-core

# The port that your application listens to.
EXPOSE 1993

WORKDIR /app

USER deno

# These steps will be re-run upon each file change in your working directory:
ADD . .
# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache main.ts

CMD ["run", "--allow-net", "--allow-run", "main.ts"]