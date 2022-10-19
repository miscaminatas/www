server {
        listen 80;
        server_name www.miscaminatas.com;
        access_log /var/log/nginx/www.miscaminatas.access_log;
        error_log /var/log/nginx/www.miscaminatas.error_log info;
        root /var/www/html/miscaminatas;
        # deny running scripts inside writable directories
        location ~* /(images|cache|media|logs|tmp)/.*\.(php|pl|py|jsp|asp|sh|cgi)$ {
                return 403;
                error_page 403 /403_error.html;
        }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/www.miscaminatas.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/www.miscaminatas.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot





}
server {
    if ($host = www.miscaminatas.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot
}
