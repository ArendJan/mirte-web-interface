# mirte-web-interface

This repository contains both the backend (NodeJS) and frontend (Vue) of the robot. 

## Preparations

In order to build and run both the frontend and backend one needs an installation of NodeJS. We
prefer using nodeenv.

```sh
sudo apt install -y python3-pip python3-setuptools python3-wheel
sudo -H pip install nodeenv
nodeenv --node=16.2.0 node_env
source node_env/bin/activate
```

## Build and run the frontend

```sh
cd vue-frontend
npm install .
npm run build
```

This will build a dist folder which will be served by the backend.


## Build and run the backend

```sh
cd nodejs-backend
npm install .
npm run backend
```

## Develop for the frontend

The orange pi might not have enough power to build the backend. In order to develop on your own machine
you could also serve the frontend on your local machine (without the backend). 

```sh
cd vue-frontend
npm install .
npm run serve
```
## Stylecheck and fix

### Backend:
Check the backend code with Semistandard:
```sh
cd nodejs-backend
npm run check
```

Fix by running, it will show the remaining errors:
```sh
cd nodejs-backend
npm run fix
```

### Frontend:
Check by running:
```sh
cd vue-frontend
npm run check
```

Fix by running:
```sh
cd vue-frontend
npm run fix
```

