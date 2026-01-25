#!/usr/bin/env node
/**
 * Firebase Quiz Database Initialization Script
 * 
 * This script initializes the Firebase Realtime Database with the quiz statistics structure.
 * 
 * Usage:
 *   node scripts/init-quiz-database.js
 * 
 * Prerequisites:
 *   - Firebase Admin SDK credentials (service account key)
 *   - Set GOOGLE_APPLICATION_CREDENTIALS environment variable to the path of your service account key
 *   - Or place the service account key at ./serviceAccountKey.json
 * 
 * Options:
 *   --force    Overwrite existing data (default: merge with existing)
 *   --dry-run  Show what would be written without actually writing
 */

const admin = require('firebase-admin');
const path = require('path');

// Quiz database initialization data
const quizInitData = {
    quizStats: {
        quiz1: {
            totalCompletions: 0,
            results: {
                SFE: 0,
                SFI: 0,
                SME: 0,
                SMI: 0,
                CFE: 0,
                CFI: 0,
                CME: 0,
                CMI: 0
            }
        },
        quiz2: {
            totalCompletions: 0,
            results: {
                A: 0,
                B: 0,
                C: 0,
                D: 0,
                AB: 0,
                BC: 0,
                AC: 0,
                DA: 0
            }
        }
    }
};

// Parse command line arguments
const args = process.argv.slice(2);
const forceOverwrite = args.includes('--force');
const dryRun = args.includes('--dry-run');

async function initializeDatabase() {
    console.log('🔥 Firebase Quiz Database Initialization Script');
    console.log('================================================\n');

    if (dryRun) {
        console.log('🔍 DRY RUN MODE - No changes will be made\n');
    }

    // Initialize Firebase Admin SDK
    try {
        // Try to use GOOGLE_APPLICATION_CREDENTIALS or local service account key
        const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
            path.join(__dirname, '..', 'serviceAccountKey.json');
        
        const serviceAccount = require(serviceAccountPath);
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`
        });
        
        console.log(`✅ Connected to Firebase project: ${serviceAccount.project_id}\n`);
    } catch (error) {
        console.error('❌ Failed to initialize Firebase Admin SDK');
        console.error('   Make sure you have a service account key file.');
        console.error('   Set GOOGLE_APPLICATION_CREDENTIALS environment variable or');
        console.error('   place serviceAccountKey.json in the project root.\n');
        console.error('   Error:', error.message);
        process.exit(1);
    }

    const db = admin.database();
    const quizStatsRef = db.ref('quizStats');

    // Check existing data
    console.log('📊 Checking existing data...');
    const snapshot = await quizStatsRef.once('value');
    const existingData = snapshot.val();

    if (existingData) {
        console.log('   Found existing quizStats data:');
        console.log(`   - quiz1: ${existingData.quiz1 ? 'exists' : 'missing'}`);
        console.log(`   - quiz2: ${existingData.quiz2 ? 'exists' : 'missing'}`);
        
        if (existingData.quiz1) {
            console.log(`     - totalCompletions: ${existingData.quiz1.totalCompletions || 0}`);
        }
        if (existingData.quiz2) {
            console.log(`     - totalCompletions: ${existingData.quiz2.totalCompletions || 0}`);
        }
        console.log('');

        if (!forceOverwrite) {
            console.log('⚠️  Existing data found. Use --force to overwrite.');
            console.log('   Without --force, only missing nodes will be created.\n');
        }
    } else {
        console.log('   No existing quizStats data found.\n');
    }

    // Prepare data to write
    console.log('📝 Data to be written:');
    console.log(JSON.stringify(quizInitData.quizStats, null, 2));
    console.log('');

    if (dryRun) {
        console.log('🔍 DRY RUN - Skipping actual write operation.\n');
        console.log('✅ Dry run complete. Run without --dry-run to apply changes.');
        process.exit(0);
    }

    // Write data
    try {
        if (forceOverwrite) {
            console.log('🔄 Force overwriting existing data...');
            await quizStatsRef.set(quizInitData.quizStats);
        } else {
            console.log('🔄 Merging with existing data (preserving existing values)...');
            // Use update to merge, but we need to handle nested objects
            // For a clean merge that doesn't overwrite existing counters, we check each node
            
            for (const [quizId, quizData] of Object.entries(quizInitData.quizStats)) {
                const quizRef = db.ref(`quizStats/${quizId}`);
                const quizSnapshot = await quizRef.once('value');
                
                if (!quizSnapshot.exists()) {
                    console.log(`   Creating ${quizId} node...`);
                    await quizRef.set(quizData);
                } else {
                    console.log(`   ${quizId} already exists, checking sub-nodes...`);
                    const existingQuizData = quizSnapshot.val();
                    
                    // Check totalCompletions
                    if (existingQuizData.totalCompletions === undefined) {
                        console.log(`     Creating ${quizId}/totalCompletions...`);
                        await db.ref(`quizStats/${quizId}/totalCompletions`).set(0);
                    }
                    
                    // Check results
                    if (!existingQuizData.results) {
                        console.log(`     Creating ${quizId}/results...`);
                        await db.ref(`quizStats/${quizId}/results`).set(quizData.results);
                    } else {
                        // Check individual result types
                        for (const [resultType, value] of Object.entries(quizData.results)) {
                            if (existingQuizData.results[resultType] === undefined) {
                                console.log(`     Creating ${quizId}/results/${resultType}...`);
                                await db.ref(`quizStats/${quizId}/results/${resultType}`).set(0);
                            }
                        }
                    }
                }
            }
        }
        
        console.log('\n✅ Database initialization complete!\n');
        
        // Verify the data
        console.log('🔍 Verifying written data...');
        const verifySnapshot = await quizStatsRef.once('value');
        const verifyData = verifySnapshot.val();
        
        console.log('   quiz1:');
        console.log(`     - totalCompletions: ${verifyData.quiz1?.totalCompletions}`);
        console.log(`     - result types: ${Object.keys(verifyData.quiz1?.results || {}).join(', ')}`);
        
        console.log('   quiz2:');
        console.log(`     - totalCompletions: ${verifyData.quiz2?.totalCompletions}`);
        console.log(`     - result types: ${Object.keys(verifyData.quiz2?.results || {}).join(', ')}`);
        
        console.log('\n✅ Verification complete!');
        
    } catch (error) {
        console.error('\n❌ Failed to write data:', error.message);
        process.exit(1);
    }

    process.exit(0);
}

// Run the initialization
initializeDatabase().catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
});
