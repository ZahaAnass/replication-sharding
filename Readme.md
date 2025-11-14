# 📌 Sharding + Replication — Full Setup Guide

This project demonstrates two database concepts:

* **Sharding** → Splitting data across multiple databases for horizontal scaling
* **Replication** → Duplicating data from a **Master** to **Slave** for high availability

You will run:

* **Two MySQL Docker containers:**

  * Master → port **3308**
  * Slave → port **3309**

* **Java Sharding Logic**

* **Node.js API (Express)**

* **Node CLI Tool**

---

## 🚀 1. Clone the Project & Install Dependencies

```bash
git clone git@github.com:ZahaAnass/replication-sharding.git
cd replication-sharding
npm install
```

---

## 🐋 2. Setup MySQL Docker Containers

## Master Container (Port 3308)

```bash
docker run -d \
  --name mysql-master \
  -e MYSQL_ROOT_PASSWORD=master123 \
  -p 3308:3306 \
  mysql:8.0.23
```

## Slave Container (Port 3309)

```bash
docker run -d \
  --name mysql-slave \
  -e MYSQL_ROOT_PASSWORD=slave123 \
  -p 3309:3306 \
  mysql:8.0.23
```

---

## 🛠️ 3. Configure MySQL Master for Replication

Enter the master:

```bash
docker exec -it mysql-master mysql -u root -p
-- password: master123
```

Run:

```sql
CREATE USER 'repl'@'%' IDENTIFIED BY 'replpass';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';
FLUSH PRIVILEGES;

SHOW MASTER STATUS;
```

📌 **IMPORTANT:**
Copy the values returned:

* `File` → example: `mysql-bin.000001`
* `Position` → example: `154`

You will use them in the Slave configuration.

---

## 🛠️ 4. Configure MySQL Slave

Enter the slave:

```bash
docker exec -it mysql-slave mysql -u root -p
-- password: slave123
```

Run:

```sql
CHANGE MASTER TO
  MASTER_HOST='host.docker.internal',
  MASTER_PORT=3308,
  MASTER_USER='repl',
  MASTER_PASSWORD='replpass',
  MASTER_LOG_FILE='mysql-bin.000001', -- from Master
  MASTER_LOG_POS=154;                 -- from Master

START SLAVE;
```

Check status:

```sql
SHOW SLAVE STATUS\G
```

You must see:

```bash
Slave_IO_Running: Yes
Slave_SQL_Running: Yes
```

---

## 🍱 5. Setup Sharding Databases

You will create:

* `shard_1`
* `shard_2`

These are created automatically by the **Java setup script** below.

---

## 🧩 6. Install the JDBC Connector

Place **mysql-connector-j-9.5.0.jar** inside:

```bash
/libs/mysql-connector-j-9.5.0/
```

Make sure the path matches:

```bash
../libs/mysql-connector-j-9.5.0/mysql-connector-j-9.5.0.jar
```

---

## 🔧 7. Run Java Database Setup (Creates Databases + Tables)

```bash
javac *.java

java -cp ".:../libs/mysql-connector-j-9.5.0/mysql-connector-j-9.5.0.jar" DatabaseSetup
```

---

## 📱 8. Run the Java Sharding Layer

```bash
java -cp ".:../libs/mysql-connector-j-9.5.0/mysql-connector-j-9.5.0.jar" PhoneBookSharder
```

This process handles:

* Hashing logic
* Selecting which shard to write to
* Forwarding writes to the master (replication syncs slave automatically)

---

## 🌐 9. Run the Node.js API Server

```bash
node server.js
```

This service will talk to your Java sharding service.

---

## 🖥️ 10. Run the CLI CRUD Tool

```bash
node crud-cli.js
```

---

## 📌 Summary of All Ports Used

| Service       | Port                           |
| ------------- | ------------------------------ |
| MySQL Master  | **3308**                       |
| MySQL Slave   | **3309**                       |
| Express API   | **3000** (or your custom port) |
| Java Sharding | Custom (inside Java)           |
