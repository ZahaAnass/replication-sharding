const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const baseUrl = 'http://localhost:3000/phonebook';

// Function to create a phonebook entry
const createPhoneBookEntry = async () => {
    rl.question('Enter Name: ', (name) => {
        rl.question('Enter Phone Number: ', async (phone_number) => {
            try {
                const response = await axios.post(baseUrl, { name, phone_number });
                console.log('Phonebook Entry Created:', response.data);
            } catch (error) {
                console.error('Error creating phonebook entry:', error.response ? error.response.data : error.message);
            }
            promptMenu();
        });
    });
};

// Function to get all phonebook entries
const getPhoneBookEntries = async () => {
    try {
        const response = await axios.get(baseUrl);
        console.log('All Phonebook Entries:', response.data);
    } catch (error) {
        console.error('Error fetching phonebook entries:', error.response ? error.response.data : error.message);
    }
    promptMenu();
};

// Function to get a phonebook entry by Name
const getPhoneBookEntry = async () => {
    rl.question('Enter Name to fetch: ', async (name) => {
        try {
            const response = await axios.get(`${baseUrl}?name=${name}`);
            console.log('Phonebook Entry:', response.data);
        } catch (error) {
            console.error('Error fetching phonebook entry:', error.response ? error.response.data : error.message);
        }
        promptMenu();
    });
};

// Function to update a phonebook entry
const updatePhoneBookEntry = async () => {
    rl.question('Enter ID of the entry to update: ', (id) => {
        rl.question('Enter New Name: ', (name) => {
            rl.question('Enter New Phone Number: ', async (phone_number) => {
                try {
                    const response = await axios.put(`${baseUrl}/${id}`, { name, phone_number });
                    console.log('Phonebook Entry Updated:', response.data);
                } catch (error) {
                    console.error('Error updating phonebook entry:', error.response ? error.response.data : error.message);
                }
                promptMenu();
            });
        });
    });
};

// Function to delete a phonebook entry
const deletePhoneBookEntry = async () => {
    rl.question('Enter ID of the entry to delete: ', async (id) => {
        rl.question('Enter Name: ', async (name) => {
            try {
                const response = await axios.delete(`${baseUrl}/${id}?name=${name}`);
                console.log('Phonebook Entry Deleted:', response.data);
            } catch (error) {
                console.error('Error deleting phonebook entry:', error.response ? error.response.data : error.message);
            }
            promptMenu();
        });
    });
};

const promptMenu = () => {
    console.log('\nChoose an option:');
    console.log('1. Create Phonebook Entry');
    console.log('2. Get All Phonebook Entries');
    console.log('3. Get Phonebook Entry by Name');
    console.log('4. Update Phonebook Entry');
    console.log('5. Delete Phonebook Entry');
    console.log('0. Exit');

    rl.question('Select an option (0-5): ', (option) => {
        switch (option) {
            case '1':
                createPhoneBookEntry();
                break;
            case '2':
                getPhoneBookEntries();
                break;
            case '3':
                getPhoneBookEntry();
                break;
            case '4':
                updatePhoneBookEntry();
                break;
            case '5':
                deletePhoneBookEntry();
                break;
            case '0':
                console.log('Exiting...');
                rl.close();
                break;
            default:
                console.log('Invalid option, please select again.');
                promptMenu();
                break;
        }
    });
};

promptMenu();
