const admin = require('firebase-admin');
const csv = require('csv-parser');
const fs = require('fs');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const collectionName = 'harmfulIngredients'; // Replace with your Firestore collection name

// Function to read and upload CSV data
const importCsvToFirestore = (filePath) => {
    const data = [];

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            data.push(row); // Collect rows from the CSV
        })
        .on('end', async () => {
            console.log('CSV file successfully processed.');

            // Batch write data to Firestore
            const batch = db.batch();
            data.forEach((doc, index) => {
                const docRef = db.collection(collectionName).doc(`${index}`); // Auto-generate doc ID or use a field
                batch.set(docRef, doc);
            });

            try {
                await batch.commit();
                console.log('Data successfully imported to Firestore!');
            } catch (error) {
                console.error('Error importing data: ', error);
            }
        })
        .on('error', (error) => {
            console.error('Error reading CSV file: ', error);
        });
};

// Call the function with the path to your CSV file
importCsvToFirestore('/home/jenu/Desktop/firebase-csv-import/final-ingredients-list.csv');
