# Setup mongodb

```bash
docker build -t mongodb-image .
```

```bash
docker run --name my-mongodb-container -p 27017:27017 -d mongodb-image
```
