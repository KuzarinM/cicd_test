#!/bin/bash
#!/bin/sh

database_connection_string="-h db.dev-moio.online -P 32636 -u root -pgavri1lA123!"

ssh_user_and_host=$(mysql $database_connection_string --silent -N -D cicd -e "Select value from configuration where \`key\` = 'ssh_user_and_host' LIMIT 1")
ssh_user_password=$(mysql $database_connection_string --silent -N -D cicd -e "Select value from configuration where \`key\` = 'ssh_user_password' LIMIT 1")
docker_username=$(mysql $database_connection_string --silent -N -D cicd -e "Select value from configuration where \`key\` = 'docker_username' LIMIT 1")
docker_password=$(mysql $database_connection_string --silent -N -D cicd -e "Select value from configuration where \`key\` = 'docker_password' LIMIT 1")

chech_dir_summ(){
	
	checked_dir=$1
	service_name=$2
	project_name=$3
	need_set_checksum=$4
	
	record_id=$(mysql $database_connection_string --silent -N -D cicd -e "Select id from services where project = '${project_name}' and name = '${service_name}' ORDER BY version DESC LIMIT 1")
	checksum_value=$(find "${checked_dir}" -type f -print0 | sort -z | xargs -0 sha1sum | sha1sum)
	
	if [[ "${record_id}" == "" ]]; then
		mysql $database_connection_string --silent -N -D cicd -e "INSERT INTO services (project, name, version, check_sum) VALUES ('${project_name}' , '${service_name}', 0	, '${checksum_value}' )"
		
		echo 1
	else
		old_checksum_value=$(mysql $database_connection_string --silent -N -D cicd -e "Select check_sum from services where id = ${record_id}")
	
		if [ "$old_checksum_value" != "$checksum_value" ]; then
			
			if [ "${need_set_checksum}" = "1" ]; then
				mysql $database_connection_string --silent -N -D cicd -e "UPDATE services SET check_sum = '${checksum_value}' where id = ${record_id}"
			fi

			#printf  "Update ChS"
			echo 1
		else
			echo 0
		fi
	fi
}

update_env(){
	base_path=$1
	envs=$2
	
	echo "${envs}" > "${base_path}/.env"
	
}

deploy_servicce(){

	service_dir=$1
	service_name=$2
	service_contour=$3
	k8s_namespace=$4
	k8s_deployment_name=$5
	k8s_container_name=$6
	project_name=$7

	#Грузим список комманд из манифеста. Мало ли, может быть будет полезно
	readarray -t commands <<< "$(yq e '.service.commands.[]' "${file}")"
	
	current_path=$(pwd) # Сохраняем текущий путь, чтобы в конце вернуться
	cd "${service_dir}" # Перемещаемся в папку сервиса
	
	EXIT_STATUS=0 # Переменная последовательностного контроля
	
	for c in "${commands[@]}" 
	do
		if [ "$EXIT_STATUS" = "1" ]; then 
			return 1 # Если что-то пошло не так, то нужно остановить всё
		fi
		
		echo "Command: ${c}" 
		$c || EXIT_STATUS=$? # Выполняем все действия 
	done
	
	if [ "$EXIT_STATUS" = "1" ]; then 
		return 1
	fi
	
	# Получаем Id записи из БД
	current_record_id=$(mysql $database_connection_string --silent -N -D cicd -e "Select id from services where project = '${project_name}' and name = '${service_name}_${service_contour}' ORDER BY version DESC LIMIT 1") || EXIT_STATUS=$?
	
	echo "${current_record_id}"
	
	if [ "$EXIT_STATUS" = "1" ]; then 
		return 1
	fi
	
	# получаем новую версию докер образа 
	docker_image_version=$(mysql $database_connection_string --silent -N -D cicd -e "Select version+1 from services where id = ${current_record_id}") || EXIT_STATUS=$?
	
	echo "${docker_image_version}"
	
	if [ "$EXIT_STATUS" = "1" ]; then 
		return 1
	fi
	
	# Формируем имена образов
	docker_image_name="${docker_username}/${service_name}:v${docker_image_version}" || EXIT_STATUS=$?
	docker_build_command="docker build . -t ${docker_image_name}" || EXIT_STATUS=$?
	docker_push_command="docker push ${docker_image_name}" || EXIT_STATUS=$?
	
	if [ "$EXIT_STATUS" = "1" ]; then 
		return 1
	fi
	
	# Собираем образ
	$docker_build_command || EXIT_STATUS=$?
	
	if [ "$EXIT_STATUS" = "1" ]; then 
		return 1
	fi
	
	#Пушим его на хаб
	$docker_push_command || EXIT_STATUS=$?
	
	if [ "$EXIT_STATUS" = "1" ]; then 
		return 1
	fi
	
	# меняем его в деплойменте
	sshpass -p "${ssh_user_password}" ssh -o StrictHostKeyChecking=no $ssh_user_and_host "kubectl set image -n ${k8s_namespace} deploy ${k8s_deployment_name} ${k8s_container_name}=${docker_image_name}" || EXIT_STATUS=$?
	
	if [ "$EXIT_STATUS" = "1" ]; then 
		return 1
	fi
	
	# рестартим деплоймент
	sshpass -p "${ssh_user_password}" ssh -o StrictHostKeyChecking=no $ssh_user_and_host "kubectl rollout restart -n ${k8s_namespace} deploy ${k8s_deployment_name}" || EXIT_STATUS=$?
	
	if [ "$EXIT_STATUS" = "1" ]; then 
		return 1
	fi
	
	cd "${current_path}" || EXIT_STATUS=$?
	
	if [ "$EXIT_STATUS" = "1" ]; then 
		return 1
	fi
	
	# Пересчитываем КС сервиса
	checksum_value=$(find "${service_dir}" -type f -print0 | sort -z | xargs -0 sha1sum | sha1sum)
	
	# Обновляем версию, на текуюую
	mysql $database_connection_string --silent -N -D cicd -e "UPDATE services SET version=version+1, check_sum = '${checksum_value}'  where id = ${current_record_id}" || EXIT_STATUS=$?
}

echo "${docker_password}" | docker login --username $docker_username --password-stdin

rm -r tmp
git clone -b $2 --single-branch $1 tmp

manifest_name="manifest-$3.yaml"

find . -type f -name "${manifest_name}" -print0 |
while IFS= read -r -d '' file; do
	
	service_dir=$(dirname "${file}")
	service_name=$(yq '.service.name' "${file}")
	service_contour=$3
	service_build_env=$(yq '.service.env' "${file}")
	project_name=$4
	
	k8s_deployment_name=$(yq '.service.deployment-name' "${file}")
	k8s_container_name=$(yq '.service.container-name' "${file}")
	k8s_namespace=$(yq '.service.deployment-namespace' "${file}")
	
	need_update=0
	
	var=$(chech_dir_summ "${service_dir}" "${service_name}_${service_contour}" "${project_name}" "0")
	if [ "${var}" = "1" ]; then
		need_update=1
	fi
	
	
	readarray -t arr <<< "$(yq e '.service.dependencies.[]' "${file}")"
	for i in "${arr[@]}" 
	do
		if [ "${i}" != "" ]; then
			var=$(chech_dir_summ "${service_dir}/${i}" "${service_name}_${service_contour}_${i##*/}" "dependencies" "1")
			if [ "${var}" = "1" ]; then
				need_update=1
			fi
		fi
	done
	
	echo ">${need_update}<"
	
	if [ "$need_update" = "1" ]; then
	
		if [[ "${service_build_env}" != "" ]]; then
		
			echo "Udating .env"
			update_env "${service_dir}" "${service_build_env}"
		fi
		
		deploy_servicce "${service_dir}" "${service_name}" "${service_contour}" "${k8s_namespace}" "${k8s_deployment_name}" "${k8s_container_name}" "${project_name}" 
	fi
done

rm -r tmp