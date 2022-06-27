#!/bin/bash
user=$1
if [[ $(grep -cw $user $HOME/usuarios.db) == "1" ]]; then
    usuario=$user
    senha=$(cat /etc/SSHPlus/senha/$user)
    datauser=$(chage -l $user |grep -i co |awk -F : '{print $2}')
    databr="$(date -d "$datauser" +"%Y%m%d")"
    hoje="$(date -d today +"%Y%m%d")"
    if [ $hoje -ge $databr ]
    then
        vencimento="Usuário: Vencido"
    else
        dat="$(date -d"$datauser" '+%Y-%m-%d')"
        dias=$(echo -e "$((($(date -ud $dat +%s)-$(date -ud $(date +%Y-%m-%d) +%s))/86400))")
        dataVenc=$(date "+%d/%m/%Y" -d "+$dias days")
        vencimento="Expira em $dias dias: $dataVenc"
    fi
    echo "$(echo -e "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n         ✅ *DETALHES LOGIN* ✅\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n     👤 USUARIO: $usuario \n     🔑 SENHA: $senha \n     ⏰ $vencimento \n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬")"
else
    echo -e "Erro: ❌Usuário não encontrado!"
fi