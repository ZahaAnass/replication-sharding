import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class DatabaseSetup {

    // Database connection details
    private static final String DB_URL = "jdbc:mysql://localhost:3307/";
    private static final String USERNAME = "root"; // Replace with your DB username
    private static final String PASSWORD = ""; // Replace with your DB password

    public static void main(String[] args) {
        DatabaseSetup setup = new DatabaseSetup();
        setup.createDatabasesAndTables();
    }

    public void createDatabasesAndTables() {
        try (Connection connection = DriverManager.getConnection(DB_URL, USERNAME, PASSWORD);
             Statement statement = connection.createStatement()) {

            // Create shard1 database and table
            String createShard1Database = "CREATE DATABASE IF NOT EXISTS shard1";
            String createShard1Table = """
                CREATE TABLE IF NOT EXISTS shard1.phone_book (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    phone_number VARCHAR(15) NOT NULL
                )
            """;

            // Create shard2 database and table
            String createShard2Database = "CREATE DATABASE IF NOT EXISTS shard2";
            String createShard2Table = """
                CREATE TABLE IF NOT EXISTS shard2.phone_book (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    phone_number VARCHAR(15) NOT NULL
                )
            """;

            // Execute statements
            statement.executeUpdate(createShard1Database);
            statement.executeUpdate(createShard1Table);
            statement.executeUpdate(createShard2Database);
            statement.executeUpdate(createShard2Table);

            System.out.println("Databases and tables created successfully!");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
