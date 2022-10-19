server {
    if ($host = bigfive.miscaminatas.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot
    listen 80;
    server_name bigfive.miscaminatas.com;
    location /.well-known {
        alias /var/www/id/miscaminatas/.well-known;
    }


}

server {
    listen 443 ssl;
    server_name bigfive.miscaminatas.com;
    server_tokens off;
    ssl_certificate /etc/letsencrypt/live/bigfive.miscaminatas.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/bigfive.miscaminatas.com/privkey.pem; # managed by Certbot
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA:ECDHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES128-SHA256:DHE-RSA-AES256-SHA:DHE-RSA-AES128-SHA:ECDHE-RSA-DES-CBC3-SHA:EDH-RSA-DES-CBC3-SHA:AES256-GCM-SHA384:AES128-GCM-SHA256:AES256-SHA256:AES128-SHA256:AES256-SHA:AES128-SHA:DES-CBC3-SHA:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!MD5:!PSK:!RC4;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 5m;
    large_client_header_buffers 4 64k;

    location /.well-known {
        alias /var/www/id/miscaminatas/.well-known;
    }

    location / {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Port 443;

        proxy_buffer_size 64k;
        proxy_buffers 8 64k;
        proxy_busy_buffers_size 64k;

        proxy_pass http://localhost:3000;
    }

}

