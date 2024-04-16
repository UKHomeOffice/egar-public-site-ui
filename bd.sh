echo ” cd data-access-api”
cd ../data-access-api
echo “docker compose build”
docker compose build
  wait
echo “cd egar-public-site ui and docker run”
cd ../egar-public-site-ui
docker-compose up --build