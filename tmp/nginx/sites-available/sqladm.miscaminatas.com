server {
    server_name sqladm.miscaminatas.com;
    root /var/www/html/phpmyadmin;
    index index.php index.html index.htm index.nginx-debian.html;
    access_log /var/log/nginx/phpmyadmin_access.log;
    error_log /var/log/nginx/phpmyadmin_error.log;
    location / {
    try_files $uri $uri/ /index.php;
    }
    location ~ ^/(doc|sql|setup)/ {
    deny all;
    }
location ~ \.php$ {
    fastcgi_pass unix:/run/php/php7.4-fpm.sock;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
    include snippets/fastcgi-php.conf;
    }
    location ~ /\.ht {
    deny all;
    }

    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/sqladm.miscaminatas.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/sqladm.miscaminatas.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    if ($host = sqladm.miscaminatas.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    listen [::]:80;
    server_name sqladm.miscaminatas.com;
    return 404; # managed by Certbot


}