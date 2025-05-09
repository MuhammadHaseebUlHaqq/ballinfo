/**
 * Test script for LaLiga News API
 * 
 * This script tests all the news API endpoints implemented in Milestone 1
 * Run with: node testNewsApi.js
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const TEST_TEAM_ID = '65f0d7c5e32b1a2e3c4d5e6f'; // Replace with an actual team ID from your database

// Test results tracking
let passedTests = 0;
let failedTests = 0;
let totalTests = 0;

/**
 * Run a test and log results
 * @param {string} name - Test name
 * @param {Function} testFn - Async test function to run
 */
async function runTest(name, testFn) {
  totalTests++;
  console.log(`\n📋 Running test: ${name}`);
  
  try {
    await testFn();
    console.log(`✅ PASSED: ${name}`);
    passedTests++;
  } catch (error) {
    console.log(`❌ FAILED: ${name}`);
    console.error(`   Error: ${error.message}`);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    failedTests++;
  }
}

/**
 * Test fetching all news with pagination
 */
async function testGetAllNews() {
  const response = await axios.get(`${API_BASE_URL}/news?page=1&limit=5`);
  
  if (!response.data.success) {
    throw new Error('API did not return success status');
  }
  
  if (!Array.isArray(response.data.data)) {
    throw new Error('Data is not an array');
  }
  
  if (!response.data.pagination) {
    throw new Error('Pagination information is missing');
  }
  
  console.log(`   Retrieved ${response.data.count} news articles`);
}

/**
 * Test fetching news by ID
 */
async function testGetNewsById() {
  // First, get an ID from the list endpoint
  const listResponse = await axios.get(`${API_BASE_URL}/news?limit=1`);
  
  if (!listResponse.data.data || listResponse.data.data.length === 0) {
    throw new Error('No news articles available to test with');
  }
  
  const newsId = listResponse.data.data[0]._id;
  const response = await axios.get(`${API_BASE_URL}/news/${newsId}`);
  
  if (!response.data.success) {
    throw new Error('API did not return success status');
  }
  
  if (!response.data.data || !response.data.data.title) {
    throw new Error('News article data is incomplete');
  }
  
  console.log(`   Retrieved article: "${response.data.data.title}"`);
}

/**
 * Test fetching news by category
 */
async function testGetNewsByCategory() {
  const categories = ['transfer', 'match_report', 'injury', 'preview', 'general'];
  const category = categories[Math.floor(Math.random() * categories.length)];
  
  const response = await axios.get(`${API_BASE_URL}/news/category/${category}?limit=3`);
  
  if (!response.data.success) {
    throw new Error('API did not return success status');
  }
  
  console.log(`   Retrieved ${response.data.count} articles in '${category}' category`);
}

/**
 * Test news search functionality
 */
async function testSearchNews() {
  const searchTerm = 'Madrid';
  const response = await axios.get(`${API_BASE_URL}/news/search?query=${searchTerm}&limit=3`);
  
  if (!response.data.success) {
    throw new Error('API did not return success status');
  }
  
  console.log(`   Search for '${searchTerm}' returned ${response.data.count} results`);
}

/**
 * Test fetching news by team
 */
async function testGetNewsByTeam() {
  try {
    const response = await axios.get(`${API_BASE_URL}/news/team/${TEST_TEAM_ID}?limit=3`);
    
    if (!response.data.success) {
      throw new Error('API did not return success status');
    }
    
    console.log(`   Retrieved ${response.data.count} team-specific articles`);
  } catch (error) {
    // If the test team ID doesn't exist, this is expected to fail
    if (error.response && error.response.status === 404) {
      console.log(`   Note: No team found with ID ${TEST_TEAM_ID}. This is expected if using a placeholder ID.`);
      // Skip the error since this is expected with a placeholder team ID
      return;
    }
    throw error;
  }
}

/**
 * Test fetching latest news (requires admin access)
 */
async function testFetchLatestNews() {
  try {
    const response = await axios.post(`${API_BASE_URL}/news/fetch/latest`);
    
    if (!response.data.success) {
      throw new Error('API did not return success status');
    }
    
    console.log(`   Fetched and saved ${response.data.count} new articles`);
  } catch (error) {
    // This might require authentication in production
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log('   Note: Authentication required for this endpoint. Test skipped.');
      // Skip the error for this optional test
      return;
    }
    throw error;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🔍 STARTING NEWS API TESTS 🔍');
  console.log('==============================');
  
  await runTest('Get All News', testGetAllNews);
  await runTest('Get News by ID', testGetNewsById);
  await runTest('Get News by Category', testGetNewsByCategory);
  await runTest('Search News', testSearchNews);
  await runTest('Get News by Team', testGetNewsByTeam);
  await runTest('Fetch Latest News', testFetchLatestNews);
  
  // Print summary
  console.log('\n==============================');
  console.log('📊 TEST SUMMARY 📊');
  console.log('==============================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  
  if (failedTests === 0) {
    console.log('\n✨ ALL TESTS PASSED! ✨');
  } else {
    console.log(`\n❌ ${failedTests} TEST(S) FAILED ❌`);
    process.exit(1);
  }
}

// Run all tests if this script is executed directly
if (process.argv[1] === import.meta.url) {
  runAllTests().catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
}

export {
  runAllTests,
  testGetAllNews,
  testGetNewsById,
  testGetNewsByCategory,
  testSearchNews,
  testGetNewsByTeam,
  testFetchLatestNews
}; 