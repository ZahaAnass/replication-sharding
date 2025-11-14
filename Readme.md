# to run the database setup
javac *.java
java -cp ".:../libs/mysql-connector-j-9.5.0/mysql-connector-j-9.5.0.jar" DatabaseSetup
java -cp ".:../libs/mysql-connector-j-9.5.0/mysql-connector-j-9.5.0.jar" PhoneBookSharder

# to run the api server
node server.js

# to run the crud-cli
node crud-cli.js

# to mysql docker

## Master
docker run -d \
  --name mysql-master \
  -e MYSQL_ROOT_PASSWORD=master123 \
  -p 3308:3306 \
  mysql:8.0.23

## Slave
docker run -d \
  --name mysql-slave \
  -e MYSQL_ROOT_PASSWORD=slave123 \
  -p 3309:3306 \
  mysql:8.0.23


### Prepare Master
-- على MySQL Master (3308)
CREATE USER 'repl'@'%' IDENTIFIED BY 'replpass';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';
FLUSH PRIVILEGES;

SHOW MASTER STATUS;
-- خذ File و Position باش تستخدمهم في Slave

### Prepare Slave
-- على MySQL Slave (3309)
CHANGE MASTER TO
  MASTER_HOST='host.docker.internal',
  MASTER_PORT=3308,
  MASTER_USER='repl',
  MASTER_PASSWORD='replpass',
  MASTER_LOG_FILE='mysql-bin.000001', -- من Master
  MASTER_LOG_POS=154;                  -- من Master

START SLAVE;

