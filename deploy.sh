echo tags: $1
cd ~/mlapibot_frontend
docker compose down
IMAGE_TAG=$1 docker compose up -d
