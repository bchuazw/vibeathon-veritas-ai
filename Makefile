.PHONY: dev build test deploy

dev:
	docker-compose up

build:
	docker-compose build

test:
	cd backend && python -m pytest
	cd web && npm test

deploy-backend:
	railway up --service backend

deploy-frontend:
	cd web && vercel --prod
