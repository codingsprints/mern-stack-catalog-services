- docker build -t my-catalog-service-prod:latest -f .\docker\production\Dockerfile .

- docker run -it --env-file "${pwd}/config/production.yaml" -p 5002:5002 my-catalog-service-prod:latest
