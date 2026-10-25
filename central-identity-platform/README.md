# Central Identity and User Management Platform — 3 EC2 Deployment

Five Node.js microservices behind one API Gateway, with JWT role checks and MongoDB Atlas.

```
Postman ──> API GATEWAY :5000  (EC2 #1)  JWT + role check
              ├─ /register ──> Registration :5001  (EC2 #1)
              ├─ /auth     ──> Login        :5002  (EC2 #1)
              ├─ /admin    ──> Admin        :5003  (EC2 #2)   role = admin
              └─ /user     ──> User         :5004  (EC2 #3)   role = user
                                   all ──> MongoDB Atlas
```

## EC2 instances

| Instance | Public IP | Runs |
|---|---|---|
| EC2-1-Gateway-Reg-Login | `<EC2-1-PUBLIC-IP>` | API Gateway, Registration, Login |
| EC2-2-Admin | `<EC2-2-PUBLIC-IP>` | Admin |
| EC2-3-User | `<EC2-3-PUBLIC-IP>` | User |

Security group inbound: 22 and 5000–5004 from 0.0.0.0/0.

## API (always call through the gateway: `http://<EC2-1-PUBLIC-IP>:5000`)

| Method | Path | Auth | Body |
|---|---|---|---|
| POST | /register/userregister | none | `{ name, email, password, phone?, role }` |
| POST | /auth/login | none | `{ email, password, role }` |
| GET | /admin/viewalluser | Admin JWT | — |
| GET | /admin/searchuser?query=... | Admin JWT | — |
| DELETE | /admin/deluser | Admin JWT | `{ email }` |
| GET | /user/viewprofile | User JWT | — |
| PUT | /user/updateprofile | User JWT | `{ name?, phone? }` |

## Setup on each EC2 (Ubuntu)

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
git --version || sudo apt install -y git
sudo npm install -g pm2
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

### EC2 #1
```bash
cp api-gateway/.env.example api-gateway/.env                    # check the EC2-2 / EC2-3 IPs
cp registration-service/.env.example registration-service/.env  # set MONGO_URI
cp login-service/.env.example login-service/.env                # set MONGO_URI + JWT_SECRET
cd api-gateway && npm install && pm2 start server.js --name gateway && cd ..
cd registration-service && npm install && pm2 start server.js --name registration && cd ..
cd login-service && npm install && pm2 start server.js --name login && cd ..
```

### EC2 #2
```bash
cd admin-service && cp .env.example .env   # set MONGO_URI
npm install && pm2 start server.js --name admin
```

### EC2 #3
```bash
cd user-service && cp .env.example .env    # set MONGO_URI
npm install && pm2 start server.js --name user
```

`JWT_SECRET` must be identical in `api-gateway/.env` and `login-service/.env`.
`MONGO_URI` (same database) goes in registration, login, admin and user.
`.env` files are gitignored — only `.env.example` is committed.

## Postman

Import `CentralIdentityPlatform.postman_collection.json`, set the collection variable
`gatewayUrl` to `http://<EC2-1-PUBLIC-IP>:5000`, and run the requests top to bottom.
The two login requests save `adminToken` / `userToken` automatically.
