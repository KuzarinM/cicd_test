#!/bin/bash
source ~/.nvm/nvm.sh
# Остановить процесс nuxt-prod в PM2
pm2 stop nuxt-prod

# Выполнить git pull для обновления кода
git pull

# Собрать проект и запустить его с помощью PM2
npm run build && pm2 start ecosystem.config.cjs --only nuxt-prod
