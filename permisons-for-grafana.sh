#!/bin/bash

echo "HOST_UID=$(id -u)" > .env
echo "HOST_GID=$(id -g)" >> .env

echo "Archivo .env creado con HOST_UID=$(id -u) y HOST_GID=$(id -g)"