#!/usr/bin/env node
/**
 * Script to create MongoDB user for MCP server
 * Run: node create-user.js
 * 
 * Make sure MongoDB is running first!
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'college_portal';
const USERNAME = 'vigneshGoud';
const PASSWORD = process.env.MCP_PASSWORD || '23831a05a2';

async function createUser() {
  let client;
  
  try {
    // Connect without authentication first
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(DB_NAME);
    const adminDb = client.db('admin');

    // Try to create user
    try {
      await db.command({
        createUser: USERNAME,
        pwd: PASSWORD,
        roles: [
          { role: 'readWrite', db: DB_NAME }
        ]
      });
      console.log(`✅ User '${USERNAME}' created successfully`);
    } catch (error) {
      if (error.code === 51003) {
        // User already exists, update password
        await db.command({
          updateUser: USERNAME,
          pwd: PASSWORD,
          roles: [
            { role: 'readWrite', db: DB_NAME }
          ]
        });
        console.log(`✅ Password updated for user '${USERNAME}'`);
      } else {
        throw error;
      }
    }

    console.log('\n📋 MongoDB User Details:');
    console.log(`   Username: ${USERNAME}`);
    console.log(`   Password: ${PASSWORD}`);
    console.log(`   Database: ${DB_NAME}`);
    console.log(`   Role: readWrite`);
    
    console.log('\n📝 Update mcp-mongodb/.env with:');
    console.log(`MONGODB_URI=mongodb://${USERNAME}:${PASSWORD}@localhost:27017/${DB_NAME}?authSource=${DB_NAME}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('authentication')) {
      console.error('\n💡 MongoDB authentication is already enabled.');
      console.error('   You may need to connect with admin credentials first.');
    }
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

createUser();

