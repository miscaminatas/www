server {
    server_name info.miscaminatas.com;
    root /var/www/html/miscaminatas/info;
    index index.php index.html index.html;
    access_log /var/log/nginx/info.access_log;
    error_log /var/log/nginx/info.error_log;
    location / {
    try_files $uri $uri/ /index.php;
  }

  location ~ \.php$ {
    fastcgi_pass unix:/run/php/php7.4-fpm.sock;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
    include snippets/fastcgi-php.conf;
  }

 # A long browser cache lifetime can speed up repeat visits to your page
  location ~* \.(jpg|jpeg|gif|png|webp|svg|woff|woff2|ttf|css|js|ico|xml)$ {
       access_log        off;
       log_not_found     off;
       expires           360d;
  }


    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/info.miscaminatas.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/info.miscaminatas.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}
server {
    if ($host = info.miscaminatas.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    listen [::]:80;
    server_name info.miscaminatas.com;
    return 404; # managed by Certbot


}
