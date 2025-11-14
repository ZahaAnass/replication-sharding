import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.util.Random;

public class PhoneBookSharder {
    // Database connection details
    private static final String SHARD_1_MASTER_URL = "jdbc:mysql://localhost:3308/shard1";
    private static final String SHARD_2_MASTER_URL = "jdbc:mysql://localhost:3308/shard2";
    
    private static final String SHARD_1_SLAVE_URL = "jdbc:mysql://localhost:3309/shard1";
    private static final String SHARD_2_SLAVE_URL = "jdbc:mysql://localhost:3309/shard2";
    
    private static final String USERNAME = "root"; // Replace with your DB username
    private static final String MASTER_PASSWORD = "master123"; // Replace with your DB password
    private static final String SLAVE_PASSWORD = "slave123";

    // Predefined first names and last names
    private static final String[] FIRST_NAMES = {
            "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Aryan", "Rudra", "Krishna", "Dhruv",
            "Ishaan", "Kabir", "Om", "Reyansh", "Shiv", "Yuvan", "Moksh", "Advait", "Kiaan", "Rohan",
            "Akshay", "Manan", "Parth", "Siddharth", "Yash", "Pranav", "Armaan", "Ritik", "Kunal", "Neil",
            "Nirav", "Harsh", "Raj", "Sahil", "Vishal", "Karthik", "Shreyas", "Tanish", "Dev", "Ayan",
            "Samarth", "Soham", "Laksh", "Ankit", "Hrithik", "Keshav", "Vivan", "Advaith", "Raghav", "Ansh"
    };

    private static final String[] LAST_NAMES = {
            "Sharma", "Gupta", "Patel", "Mehta", "Jain", "Agarwal", "Kapoor", "Bhatia", "Singh", "Kumar",
            "Reddy", "Iyer", "Chopra", "Bansal", "Joshi", "Naik", "Desai", "Pillai", "Menon", "Verma",
            "Pandey", "Thakur", "Rana", "Saxena", "Malhotra", "Nair", "Dubey", "Tiwari", "Ghosh", "Chatterjee",
            "Roy", "Banerjee", "Sen", "Das", "Chandra", "Prasad", "Shukla", "Yadav", "Mishra", "Rao",
            "Pathak", "Pawar", "Khan", "Shaikh", "Ansari", "Ahmed", "Mirza", "Qureshi", "Ali", "Hussain"
    };

    public static void main(String[] args) {
        PhoneBookSharder sharder = new PhoneBookSharder();
        sharder.populateDatabases(300); // Generate 300 random entries
    }

    public void populateDatabases(int count) {
        Random random = new Random();
        String[] names = generateRandomNames(count);

        for (String name : names) {
            String phoneNumber = generateRandomPhoneNumber();
            String shardMasterUrl = getShardMasterUrl(name);
            String shardSlaveUrl = getShardSlaveUrl(name);

            // Insert data into the appropriate shard
            try (Connection connection = DriverManager.getConnection(shardMasterUrl, USERNAME, MASTER_PASSWORD)) {
                String query = "INSERT INTO phone_book (name, phone_number) VALUES (?, ?)";
                PreparedStatement statement = connection.prepareStatement(query);
                statement.setString(1, name);
                statement.setString(2, phoneNumber);
                statement.executeUpdate();
            } catch (Exception e) {
                e.printStackTrace();
            }
            
            // Read data from the appropriate shard
            try (Connection connection = DriverManager.getConnection(shardSlaveUrl, USERNAME, SLAVE_PASSWORD)) {
                String query = "SELECT * FROM phone_book WHERE name = ?";
                PreparedStatement statement = connection.prepareStatement(query);
                statement.setString(1, name);
                statement.executeQuery();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        System.out.println("Database populated successfully with " + count + " entries!");
    }

    private String[] generateRandomNames(int count) {
        String[] names = new String[count];
        Random random = new Random();

        for (int i = 0; i < count; i++) {
            String firstName = FIRST_NAMES[random.nextInt(FIRST_NAMES.length)];
            String lastName = LAST_NAMES[random.nextInt(LAST_NAMES.length)];
            names[i] = firstName + " " + lastName; // Combine first and last name
        }
        return names;
    }

    private String generateRandomPhoneNumber() {
        Random random = new Random();
        return String.format("+212-%010d", random.nextInt(1_000_000_000));
    }

    private String getShardMasterUrl(String name) {
        char firstChar = Character.toLowerCase(name.charAt(0));
        return (firstChar >= 'a' && firstChar <= 'm') ? SHARD_1_MASTER_URL : SHARD_2_MASTER_URL;
    }

    private String getShardSlaveUrl(String name) {
        char firstChar = Character.toLowerCase(name.charAt(0));
        return (firstChar >= 'a' && firstChar <= 'm') ? SHARD_1_SLAVE_URL : SHARD_2_SLAVE_URL;
    }
}
