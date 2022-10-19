server {
    location / {
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Port 443;

        proxy_buffer_size 64k;
        proxy_buffers 8 64k;
        proxy_busy_buffers_size 64k;
        proxy_pass http://localhost:3000;
    }

    listen 443 ssl; # managed by Certbot
    server_name app.miscaminatas.com;
    ssl_certificate /etc/letsencrypt/live/app.miscaminatas.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/app.miscaminatas.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    if ($host = app.miscaminatas.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name app.miscaminatas.com;
    return 404; # managed by Certbot


}