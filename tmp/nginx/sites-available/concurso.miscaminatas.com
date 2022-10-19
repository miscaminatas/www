server {
        listen 80;
        server_name concurso.miscaminatas.com;
        access_log /var/log/nginx/concurso.access_log;
        error_log /var/log/nginx/concurso.error_log info;
        root /var/www/html/concurso;
        # deny running scripts inside writable directories
        location ~* /(images|cache|media|logs|tmp)/.*\.(php|pl|py|jsp|asp|sh|cgi)$ {
                return 403;
                error_page 403 /403_error.html;
        }

    listen 443 ssl; # managed by Certbot
#    ssl_certificate /etc/letsencrypt/live/www.miscaminatas.com/fullchain.pem; # managed by Certbot
#    ssl_certificate_key /etc/letsencrypt/live/www.miscaminatas.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}