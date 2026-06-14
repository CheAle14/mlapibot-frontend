echo tags: $1
cd ~/mlapibot_frontend
sudo docker compose down
IMAGE_TAG=$1 sudo docker compose up -d
