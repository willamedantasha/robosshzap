#!/bin/bash
usuario=$(echo luccasnet$(( RANDOM% + 999 )))
senha=$((RANDOM% + 99999))
limite='1'
tempo='3'
tuserdate=$(date '+%C%y/%m/%d' -d " +1 days")
useradd -M -N -s /bin/false $usuario -e $tuserdate > /dev/null 2>&1
(echo "$senha";echo "$senha") | passwd $usuario > /dev/null 2>&1
echo "$senha" > /etc/SSHPlus/senha/$usuario
echo "$usuario $limite" >> /root/usuarios.db
echo "#!/bin/bash
pkill -f "$usuario"
userdel --force $usuario
grep -v ^$usuario[[:space:]] /root/usuarios.db > /tmp/ph ; cat /tmp/ph > /root/usuarios.db
rm /etc/SSHPlus/senha/$usuario > /dev/null 2>&1
rm -rf /etc/SSHPlus/userteste/$usuario.sh" > /etc/SSHPlus/userteste/$usuario.sh
chmod +x /etc/SSHPlus/userteste/$usuario.sh
at -f /etc/SSHPlus/userteste/$usuario.sh now + $tempo hour > /dev/null 2>&1
echo "$(echo -e "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n            ✅ *TESTE CRIADO* ✅\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n            👤 USUARIO: $usuario \n               🔑 SENHA: $senha \n             ⏰ Expira em: $tempo Horas \n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n ℹ️ COMO CONECTAR A INTERNET\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n • Instale e abra o aplicativo.\n • Digite o usuário e a senha recebida no app.\n• Selecione sua operadora.\n• Ligue os dados móveis e desligue Wi-fi\n• Clique em Conectar.\n• Deve aparecer Conexão Estabelecida.\n• Se apareceu, vá ao youtube e faça o teste.\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n ⚠️ SIGA EXATAMENTE COMO DIZ\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n  😍 GOSTOU? DIGITE #PIX PARA PAGAR")"
