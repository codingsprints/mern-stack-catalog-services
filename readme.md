- docker build -t my-catalog-service-prod:latest -f .\docker\production\Dockerfile .

- docker run -it --name catalog-service -p 5002:5002 -v "$(pwd)/config:/home/node/app/config" my-catalog-service-prod:latest
