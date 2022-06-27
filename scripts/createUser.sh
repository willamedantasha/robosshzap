#!/bin/bash
username=$1
password=$((RANDOM% + 99999))
dias=30
sshlimiter=1

[[ -z $username ]] && {
	echo -e "Erro: Nome de usuário vazio ou invalido!"
	exit 1
}
[[ "$(grep -wc $username /etc/passwd)" != '0' ]] && {
	echo -e "Erro: Este usuário já existe. Tente outro nome!"
	exit 1
}
[[ ${username} != ?(+|-)+([a-zA-Z0-9]) ]] && {
	echo -e "Erro: Você digitou um nome de usuário inválido!\nNão use espaços, acentos ou caracteres especiais!"
	exit 1
}
sizemin=$(echo ${#username})
[[ $sizemin -lt 6 ]] && {
	echo -e "Erro: Você digitou um nome de usuário muito curto. Use no mínimo seis caracteres!"
	exit 1
}
sizemax=$(echo ${#username})
[[ $sizemax -gt 20 ]] && {
	echo -e "Erro: Você digitou um nome de usuário muito grande. Use no máximo 20 caracteres!"
	exit 1
}

final=$(date "+%Y-%m-%d" -d "+$dias days");
pass=$(perl -e 'print crypt($ARGV[0], "password")' $password)
vencimento=$(date "+%d-%m-%Y" -d "+$dias days")
useradd -e $final -M -s /bin/false -p $pass $username > /dev/null 2>&1
(echo "$password"; echo "$password") | passwd $username > /dev/null 2>&1
echo "$password" > /etc/SSHPlus/senha/$username
echo "$username $sshlimiter" >> /root/usuarios.db
echo "$(echo -e "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n         ✅ *USUÁRIO CRIADA* ✅\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n     👤 USUARIO: $username \n     🔑 SENHA: $password \n     ⏰ Expira em: $vencimento \n ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬")"