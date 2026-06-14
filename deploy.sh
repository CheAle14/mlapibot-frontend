echo tags: $1

docker compose down
IMAGE_TAG=$1 docker compose up -d
