# URANIO

## Uranio submodules

```
git submodule add <link> <folder>
```


## Uranio docker general settings

### For each repository

Docker must be 18.09 or higher

To enable docker BuildKit by default, set daemon configuration in 
`/etc/docker/daemon.json` feature to true and restart the daemon:

```
{
	"debug": true,
	"experimental": true,
	"features": { "buildkit": true }
}
```

Also possible to set manually every time before building with:
```
export DOCKER_BUILDKIT=1
```

#### First time

Build image without Docker Compose

The command `--ssh default` will pass to the installer the default ssh key of the client
```
docker build --ssh default -t urn-xxx:0.0.1 .
```

Create and start a container with its own node_modules folder
```
docker run -it -v $(pwd):/app -v /app/node_modules/ --network="host" urn-xxx:0.0.1
```

#### Start container

##### Start the container with Docker
```
docker start -i container_name
```

##### Start the container with Docker Compose

Docker compose must be version 1.25.1 or higher

In order to start developing use:

```
docker-compose up --build
```

After built
```
docker-compose up
```
