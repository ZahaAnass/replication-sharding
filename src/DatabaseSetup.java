import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class DatabaseSetup {

    // Database connection details
    private static final String MASTER_URL = "jdbc:mysql://localhost:3308/";
    private static final String SLAVE_URL  = "jdbc:mysql://localhost:3309/";
    private static final String USERNAME = "root"; // Replace with your DB username
    private static final String PASSWORD = "master123"; // Replace with your DB password

    public static void main(String[] args) {
        DatabaseSetup setup = new DatabaseSetup();
        setup.createDatabasesAndTables();
    }

    public void createDatabasesAndTables() {
        try (Connection connection = DriverManager.getConnection(MASTER_URL, USERNAME, PASSWORD);
            Statement statement = connection.createStatement()) {

            // Create shard1 database and table
            statement.executeUpdate("CREATE DATABASE IF NOT EXISTS shard1");
            statement.executeUpdate("CREATE TABLE IF NOT EXISTS shard1.phone_book (\n            id INT AUTO_INCREMENT PRIMARY KEY,\n            name VARCHAR(255) NOT NULL,\n            phone_number VARCHAR(15) NOT NULL\n        )");

            // Create shard2 database and table
            statement.executeUpdate("CREATE DATABASE IF NOT EXISTS shard2");
            statement.executeUpdate("CREATE TABLE IF NOT EXISTS shard2.phone_book (\n            id INT AUTO_INCREMENT PRIMARY KEY,\n            name VARCHAR(255) NOT NULL,\n            phone_number VARCHAR(15) NOT NULL\n        )");

            System.out.println("Databases and tables created on Master successfully!");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
