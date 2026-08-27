FROM nginx:1.31.4-alpine

LABEL org.opencontainers.image.title="Good Enough Home" \
      org.opencontainers.image.description="A calm, local-first chores tracker"

COPY index.html styles.css /usr/share/nginx/html/
COPY src /usr/share/nginx/html/src

EXPOSE 80
