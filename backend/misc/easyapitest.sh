#!/bin/bash

curl -X $1 http://localhost:5175/$2 -H "Content-Type: application/json" -H "x-user-id: 1" -d $3
