# mimic-server

## Запуск dev-сервера
```bash
python mimic_server.py
```

## Установка зависимостей
```bash
pip install -r requirements.txt
```

### URL
```
http://127.0.0.1:8001
```

## Docker
* ```docker build . ```
* ```sudo docker build -t ananasn/patrik_mimic .```
* ```docker images ```
* ```docker image rm 43434343ete```
* ```docker container prune```
* ```sudo docker push ananasn/patrik_mimic:latest```
* ```sudo docker run -p 8001:8001 --rm --name patrik_mimic ananasn/patrik_mimic```
* ```docker exec -it <mycontainer> bash``
* 