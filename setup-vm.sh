#!/bin/bash

set -e

echo "[+] Updating system"

apt update
apt upgrade -y

echo "[+] Installing Docker"

apt install -y 
docker.io 
docker-compose 
openssh-server 
curl

systemctl enable docker
systemctl start docker

echo "[+] Creating analyst account"

id analyst >/dev/null 2>&1 || 
useradd -m -s /bin/bash analyst

echo "analyst:blue_team_rocks" | chpasswd

echo "[+] Configuring SSH"

sed -i 's/^#Port 22/Port 2275/' /etc/ssh/sshd_config
sed -i 's/^Port 22/Port 2275/' /etc/ssh/sshd_config

systemctl restart ssh
systemctl enable ssh

echo "[+] Opening firewall ports"

if command -v ufw >/dev/null 2>&1
then
ufw allow 2275/tcp
ufw allow 3075/tcp
fi

echo "[+] Provisioning complete"

echo ""
echo "SSH:"
echo "  analyst / blue_team_rocks"
echo ""
echo "Web:"
echo "  http://<VM-IP>:3075"
