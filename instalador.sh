#!/bin/bash

############################################################
# INSTALADOR AUTOMÁTICO - COOPERATIVA DE VIVIENDAS         #
############################################################

# LOGGING
LOG_FILE="/var/log/instalador.log"
exec > >(tee -a "$LOG_FILE") 2>&1
echo "=== Inicio de instalación: $(date) ==="

# =====================
# VERIFICACIÓN DE ROOT
# =====================

# Verifica que el script se esté ejecutando con sudo/root
if [ "$EUID" -ne 0 ]; then
    echo "Ejecute este script con sudo:"
    echo "  sudo bash $0"
    exit 1
fi

echo "[OK] Permisos de root verificados."

# =====================
# ACTUALIZACIÓN DEL SISTEMA
# =====================

# Actualiza los repositorios de paquetes
apt update && echo "[OK] apt update completado."
apt-get update && echo "[OK] apt-get update completado."

# =====================
# CONFIGURACIÓN DE TECLADO
# =====================

# Instala utilidades de configuración de teclado
apt-get install -y console-setup keyboard-configuration && echo "[OK] Paquetes de teclado instalados."

# Cambia el layout del teclado a latinoamericano
sed -i 's/^XKBLAYOUT=.*/XKBLAYOUT="latam"/' /etc/default/keyboard && echo "[OK] Layout de teclado cambiado a latam."
setupcon && echo "[OK] Configuración de teclado aplicada."

# =====================
# INSTALACIÓN DE SERVICIOS BÁSICOS
# =====================

# Instala y habilita OpenSSH para acceso remoto
apt install -y openssh-server && echo "[OK] OpenSSH instalado."

# Instala el servidor de base de datos MySQL
apt install -y mysql-server && echo "[OK] MySQL Server instalado."

# =====================
# CONFIGURACIÓN DE MYSQL PARA ACCESO REMOTO
# =====================

# Cambia bind-address a 0.0.0.0 para permitir conexiones externas
sed -i 's/^bind-address\s*=.*/bind-address = 0.0.0.0/' /etc/mysql/mysql.conf.d/mysqld.cnf && echo "[OK] bind-address cambiado a 0.0.0.0."

# Reinicia MySQL para aplicar el cambio
echo "Reiniciando MySQL para aplicar configuración..."
systemctl restart mysql && echo "[OK] MySQL reiniciado."

# Da permisos a root para conexiones remotas
echo "GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY '' WITH GRANT OPTION; FLUSH PRIVILEGES;" | mysql -u root && echo "[OK] Permisos remotos para root configurados."

# =====================
# INSTALACIÓN Y CONFIGURACIÓN DE GIT
# =====================

# Instala Git para control de versiones
apt install -y git && echo "[OK] Git instalado."

# Configura el usuario y email global de Git
read -p "Nombre de usuario de Git: " git_user
read -p "Email de Git: " git_email
git config --global user.name "$git_user"
git config --global user.email "$git_email"
git config --global --list

echo "[OK] Git configurado con usuario y email."

# =====================
# INSTALACIÓN Y CONFIGURACIÓN DE APACHE
# =====================

# Instala el servidor web Apache
apt install -y apache2 && echo "[OK] Apache instalado."

# Habilita módulos necesarios de Apache
# proxy y proxy_http para redirección, alias para rutas, php para soporte PHP
# (Asegúrate de tener php8.0 instalado en el sistema)
a2enmod proxy proxy_http && echo "[OK] Módulos proxy y proxy_http habilitados."
a2enmod alias && echo "[OK] Módulo alias habilitado."

# =====================
# CONFIGURACIÓN DE VIRTUALHOST DE APACHE
# =====================

# Crea la configuración del sitio principal de Apache
cat > /etc/apache2/sites-available/000-default.conf <<'EOF'
<VirtualHost *:80>
    ServerAdmin webmaster@localhost
    DocumentRoot /var/www/html/cooperativa-de-viviendas

    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined

    ProxyPass /endpoint http://localhost:8080/endpoint
    ProxyPassReverse /endpoint http://localhost:8080/endpoint

    <Directory /var/www/html/cooperativa-de-viviendas>
        Require all granted
        AllowOverride All
        Options Indexes FollowSymLinks
    </Directory>
</VirtualHost>
EOF

echo "[OK] VirtualHost de Apache configurado."

# Reinicia Apache para aplicar la nueva configuración
systemctl restart apache2 && echo "[OK] Apache reiniciado."

# =====================
# INSTALACIÓN Y CONFIGURACIÓN DE DOCKER
# =====================

# Instala Docker para contenedores
apt install -y docker.io && echo "[OK] Docker instalado."

# Habilita y arranca el servicio Docker
systemctl enable docker && echo "[OK] Docker habilitado."
systemctl start docker && echo "[OK] Docker iniciado."

# Crea el grupo docker si no existe y agrega el usuario actual
# Esto permite ejecutar docker sin sudo
groupadd -f docker && echo "[OK] Grupo docker verificado."
usermod -aG docker $USER && echo "[OK] Usuario agregado al grupo docker."

# =====================
# CLONADO DE REPOSITORIOS EN SUS CARPETAS DESTINO
# =====================

# Limpia la carpeta pública de Apache y clona frontend
rm -rf /var/www/html/* && echo "[OK] Carpeta /var/www/html limpiada."
git clone https://github.com/AlphaTechnology-ESI/cooperativa-de-viviendas.git /var/www/html/cooperativa-de-viviendas && echo "[OK] Frontend clonado en /var/www/html/cooperativa-de-viviendas."

# Limpia carpeta de backend y clona backend
rm -rf /var/www/cooperativa-de-viviendas-apis && echo "[OK] Carpeta /var/www/cooperativa-de-viviendas-apis limpiada."
git clone https://github.com/AlphaTechnology-ESI/cooperativa-de-viviendas-apis.git /var/www/cooperativa-de-viviendas-apis && echo "[OK] Backend clonado en /var/www/cooperativa-de-viviendas-apis."

# Crear archivo .env
ENV_PATH="/var/www/cooperativa-de-viviendas-apis/config/.env"

cat > "$ENV_PATH" <<EOF
host=localhost
db=cooperativa_cooptrack
user=root
pass=
port=3306
EOF

echo "[OK] Archivo .env creado."

# =====================
# DESPLIEGUE DEL BACKEND CON DOCKER
# =====================

# Construye la imagen Docker del backend y la ejecuta en el puerto 8080
cd /var/www/cooperativa-de-viviendas-apis
docker build -t coop . && echo "[OK] Imagen Docker del backend construida."
docker run -d -p 8080:80 --restart unless-stopped --name coop_apis coop && echo "[OK] Contenedor backend ejecutándose."

# =====================
# INSTALACIÓN Y CONFIGURACIÓN DE NGROK
# =====================

# Descargar ngrok v3 tar.gz
wget -O /tmp/ngrok.tgz https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz && echo "[OK] Ngrok descargado."

# Descomprimir directamente en /usr/local/bin
tar -xzf /tmp/ngrok.tgz -C /usr/local/bin && echo "[OK] Ngrok descomprimido en /usr/local/bin."

# Dar permisos de ejecución
chmod +x /usr/local/bin/ngrok && echo "[OK] Permisos de ejecución dados a Ngrok."

# Obtiene el nombre de usuario actual para usar en servicios
USER_NAME=$(logname)

# Crea el servicio systemd para Ngrok
cat > /etc/systemd/system/ngrok.service <<EOF
[Unit]
Description=Ngrok Tunnel
After=network-online.target

[Service]
ExecStart=/usr/local/bin/ngrok http 80 --authtoken __TOKEN__
Restart=always
User=$USER_NAME
WorkingDirectory=/home/$USER_NAME
Environment=NGROK_CONFIG=/home/$USER_NAME/.config/ngrok/ngrok.yml

[Install]
WantedBy=multi-user.target
EOF

echo "[OK] Servicio systemd de Ngrok creado."

# Solicita el token de Ngrok al usuario
read -p "Ingrese su authtoken de ngrok (o presione Enter para omitir por ahora): " NGROK_TOKEN

# Si no se ingresa token, muestra instrucciones
if [ -z "$NGROK_TOKEN" ]; then
    echo "No se agregó token. Podrá añadirlo luego con:"
    echo "    ngrok config add-authtoken SU_TOKEN"
else
    # Inserta el token en el servicio systemd
    sed -i "s/__TOKEN__/$NGROK_TOKEN/" /etc/systemd/system/ngrok.service
    echo "[OK] Token de Ngrok insertado en el servicio."
fi

# Recarga y habilita el servicio de Ngrok
systemctl daemon-reload && echo "[OK] systemd recargado."
systemctl enable ngrok && echo "[OK] Servicio Ngrok habilitado."
systemctl start ngrok && echo "[OK] Servicio Ngrok iniciado."

# =====================
# SCRIPTS DE ACTUALIZACIÓN AUTOMÁTICA
# =====================

# Crea el script principal de actualización para actualizar host y ngrok
cat > /usr/local/bin/actualizar.sh <<'EOF'
#!/bin/bash

bash /usr/local/bin/update_db_host.sh
bash /usr/local/bin/update_ngrok.sh

echo "== Finalizado =="
EOF

echo "[OK] Script principal de actualización creado."

# Da permisos de ejecución al script principal
chmod +x /usr/local/bin/actualizar.sh && echo "[OK] Permisos de ejecución dados a actualizar.sh."

# =====================
# SERVICIO Y TIMER PARA ACTUALIZACIÓN AUTOMÁTICA
# =====================

# Crea el servicio systemd para ejecutar el script de actualización
cat <<EOF >/etc/systemd/system/actualizar.service
[Unit]
Description=Ejecutar actualizar.sh

[Service]
Type=oneshot
ExecStart=/usr/local/bin/actualizar.sh
EOF

echo "[OK] Servicio systemd de actualización creado."

# Crea el timer systemd para ejecutar el servicio 20 segundos después de arrancar
cat <<EOF >/etc/systemd/system/actualizar.timer
[Unit]
Description=Ejecutar actualizar.sh 20 segundos después de arrancar

[Timer]
OnBootSec=20s
Unit=actualizar.service

[Install]
WantedBy=timers.target
EOF

echo "[OK] Timer systemd de actualización creado."

# Da permisos y habilita el timer de actualización
chmod +x /usr/local/bin/actualizar.sh && echo "[OK] Permisos de ejecución verificados para actualizar.sh."
systemctl daemon-reload && echo "[OK] systemd recargado tras crear timer."
systemctl enable --now actualizar.timer && echo "[OK] Timer de actualización habilitado y ejecutándose."

# =====================
# SCRIPT PARA ACTUALIZAR HOST DE BASE DE DATOS EN EL CONTENEDOR
# =====================

# Crea el script que actualiza la IP del host en el archivo .env y dentro del contenedor Docker
cat > /usr/local/bin/update_db_host.sh <<'EOF'
#!/bin/bash

NEW_IP=$(hostname -I | awk '{print $1}')
ENV_FILE="/var/www/cooperativa-de-viviendas-apis/config/.env"b 
CONTAINER_NAME="coop_apis"

sed -i "s/^host *= *.*/host = $NEW_IP/" "$ENV_FILE"

docker cp "$ENV_FILE" "$CONTAINER_NAME":/var/www/cooperativa-de-viviendas-apis/config/.env

CONFIG_JS="/var/www/html/cooperativa-de-viviendas/assets/js/config.js"
NGROK_URL=$(curl -s localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url')

sed -i "s|^\s*API_URL:.*|  API_URL: \"$NGROK_URL\"|g" "$CONFIG_JS"
echo "Actualizado API_URL en $CONFIG_JS a $NGROK_URL"

echo "Host actualizado a $NEW_IP."
EOF

echo "[OK] Script update_db_host.sh creado."

# Da permisos de ejecución al script de actualización de host
chmod +x /usr/local/bin/update_db_host.sh && echo "[OK] Permisos de ejecución dados a update_db_host.sh."

# =====================
# SCRIPT PARA ACTUALIZAR ENLACE DE NGROK EN REPOSITORIO
# =====================

USER_NAME=$(logname)

# Crea el script que actualiza el enlace de Ngrok en el repositorio de redirección
cat > /usr/local/bin/update_ngrok.sh <<EOF
#!/bin/bash

REPO_DIR="/home/$USER_NAME/ngrok-redirect/cooperativa-de-viviendas"
BRANCH="ngrok-redirect"

cd "$REPO_DIR" || exit 1

NGROK_URL=$(curl -s localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url')

if [ -z "$NGROK_URL" ]; then
    echo "No se pudo obtener la URL de Ngrok."
    exit 1
fi

cat > index.html <<HTML
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="refresh" content="0;url=$NGROK_URL">
</head>
<body>
Redirigiendo...
</body>
</html>
HTML

git checkout "$BRANCH"
git add index.html

FECHA=$(date +"%Y-%m-%d %H:%M:%S")
git commit -m "Actualizar enlace Ngrok $FECHA"

git push origin "$BRANCH"
EOF

echo "[OK] Script update_ngrok.sh creado."

# Da permisos de ejecución al script de actualización de Ngrok
chmod +x /usr/local/bin/update_ngrok.sh && echo "[OK] Permisos de ejecución dados a update_ngrok.sh."

# Preguntar si el usuario pertenece a Atech
echo "¿Perteneces a Atech? (s/n): "
read -p "¿Perteneces a Atech? (s/n): " ES_ATECH

# Crear carpeta destino para la clonación
mkdir -p "/home/$USER_NAME/ngrok-redirect" && echo "[OK] Carpeta ngrok-redirect creada."

if [[ "$ES_ATECH" == "s" || "$ES_ATECH" == "S" ]]; then
    # Clonar el repo de Atech
    GIT_URL="https://github.com/AlphaTechnology-ESI/cooperativa-de-viviendas.git"
else
    # Pedir otro repo indicado en el manual
    read -p "Ingresa el enlace del repositorio a clonar: " GIT_URL
fi

# Clonar en carpeta final
git clone --single-branch --branch ngrok-redirect "$GIT_URL" "/home/$USER_NAME/ngrok-redirect/cooperativa-de-viviendas" && echo "[OK] Repositorio ngrok-redirect clonado."

# Ejecutar actualizar.sh una vez al finalizar la instalación
/usr/local/bin/actualizar.sh && echo "[OK] Script de actualización ejecutado."

# =====================
# TAREA PROGRAMADA PARA BACKUP DE BASE DE DATOS
# =====================

# Agrega una tarea programada semanal para backup de la base de datos
(crontab -l 2>/dev/null; echo "0 2 * * 1 /var/www/cooperativa-de-viviendas-apis/backup_bd.sh") | crontab - && echo "[OK] Tarea programada de backup creada."