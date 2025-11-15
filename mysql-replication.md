# MySQL Replication

## **Server 1 (Master)** → uses port **3308**

## **Server 2 (Slave)** → uses port **3309**

Here is the clean, correct way.

---

## ✅ **1. Run MySQL MASTER container (port 3308)**

```bash
docker run -d \
  --name mysql-master \
  -e MYSQL_ROOT_PASSWORD=master123 \
  -p 3308:3306 \
  mysql:8.0.23
```

This gives you:

* Host port: **3308**
* Container port: **3306**

---

## ✅ **2. Run MySQL SLAVE container (port 3309)**

```bash
docker run -d \
  --name mysql-slave \
  -e MYSQL_ROOT_PASSWORD=slave123 \
  -p 3309:3306 \
  mysql:8.0.23
```

This gives you:

* Host port: **3309**
* Container port: **3306**

---

## 🎯 **Now you have two isolated MySQL servers**

🟢 mysql-master → 127.0.0.1:3308
🟢 mysql-slave → 127.0.0.1:3309

Both are running in separate containers, simulating **different servers**.

---

## 🔌 **3. Connect using MySQL Workbench**

### MASTER

```bash
Hostname: 127.0.0.1
Port: 3308
User: root
Password: master123
```

### SLAVE

```bash
Hostname: 127.0.0.1
Port: 3309
User: root
Password: slave123
```

---

## 📡 **4. Make replication work (Full Guide)**

If you want replication to actually work, follow these steps:

---

## 🟢 Step A — Configure MASTER

Enter master:

```bash
docker exec -it mysql-master mysql -u root -p
```

Run:

```sql
SET GLOBAL server_id=1;
SHOW MASTER STATUS;
```

Copy:

* File (binary log file)
* Position

---

## 🔵 Step B — Configure SLAVE

Enter slave:

```bash
docker exec -it mysql-slave mysql -u root -p
```

Then set server ID:

```sql
SET GLOBAL server_id=2;
```

Configure replication:

```sql
CHANGE MASTER TO
    MASTER_HOST='host.docker.internal',
    MASTER_PORT=3308,
    MASTER_USER='root',
    MASTER_PASSWORD='master123',
    MASTER_LOG_FILE='mysql-bin.000001',
    MASTER_LOG_POS=1234;
```

Start slave:

```sql
START SLAVE;
```

Check status:

```sql
SHOW SLAVE STATUS\G
```
