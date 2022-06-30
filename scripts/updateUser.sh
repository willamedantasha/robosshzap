#!/bin/bash
user=$1
renovacao=30
if [[ -z $user ]]
then
    echo "Erro: ❌Nome de usuário vazio ou inválido!!!"
    exit 1
else
    if [[ `grep -c /$user: /etc/passwd` -ne 0 ]]
    then
        dataUser=$(chage -l $user |grep -i co |awk -F : '{print $2}')
        databr="$(date -d "$dataUser" +"%Y%m%d")"
        hoje="$(date -d today +"%Y%m%d")"
        if [ $hoje -ge $databr ]
        then
            novoVencimento=$(date "+%Y-%m-%d" -d "+$renovacao days")
            dataVenc=$(date "+%d/%m/%Y" -d "+$renovacao days")
            chage -E $novoVencimento $user
            dataVenc=$(date "+%d/%m/%Y" -d "+$renovacao days")
            vencimento="Expira em $renovacao dias: $dataVenc"
            echo "$(echo -e "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n      ✅ *USUÁRIO RENOVADO* ✅\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n     👤 USUARIO: $user \n     ⏰ $vencimento \n ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬")"
            exit 1
        else
            dataUserGlobal=$(date -d"$dataUser" '+%Y-%m-%d')
            diasAtual=$(echo -e "$((($(date -ud $dataUserGlobal +%s)-$(date -ud $(date +%Y-%m-%d) +%s))/86400))")
            diasFinal=$(($diasAtual+$renovacao))
            novoVencimento=$(date "+%Y-%m-%d" -d "+$diasFinal days")
            chage -E $novoVencimento $user
            
            dataVenc=$(date "+%d/%m/%Y" -d "+$diasFinal days")
            vencimento="Expira em $diasFinal dias: $dataVenc"
            echo "$(echo -e "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n        ✅ USUARIO RENOVADO ✅\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n     👤 USUARIO: $user \n     ⏰ $vencimento \n ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬")"
            exit 1
        fi
    else
        echo "Erro: ❌O usuário $user não existe! \n_Solicite um novo login digitando #meulogin_"
        exit 1
    fi
fi