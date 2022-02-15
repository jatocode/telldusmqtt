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

# Laddade ner de här manuellt
COPY libconfuse-common_3.2+really3.0+dfsg-1_all.deb libconfuse-common_3.2+really3.0+dfsg-1_all.deb
COPY libconfuse1_3.2+really3.0+dfsg-1_amd64.deb libconfuse1_3.2+really3.0+dfsg-1_amd64.deb

RUN dpkg -i libconfuse-common_3.2+really3.0+dfsg-1_all.deb && \
    dpkg -i libconfuse1_3.2+really3.0+dfsg-1_amd64.deb && \
    dpkg --ignore-depends=libconfuse0 -i telldus-core_2.1.2-1_amd64.deb

RUN sed -i 's/\(Depends:.*\)libconfuse0[^,]*/\1libconfuse1 (>= 3.0)/' /var/lib/dpkg/status
RUN ln -s /usr/lib/x86_64-linux-gnu/libconfuse.so.1 /usr/lib/x86_64-linux-gnu/libconfuse.so.0

RUN apt-get --fix-broken install -y

RUN apt-mark hold libconfuse1 && apt-mark hold telldus-core
COPY tellstick.conf /etc/tellstick.conf

# The port that your application listens to.
EXPOSE 1993

WORKDIR /app

USER deno

# These steps will be re-run upon each file change in your working directory:
ADD . .
# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache main.ts

CMD ["run", "--allow-net", "--allow-run", "main.ts"]