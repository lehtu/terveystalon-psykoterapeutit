const fs = require('fs');

// Path to the input file with distinct service IDs
const inputFilePath = 'distinct_service_ids.json';
const outputFilePath = 'service_details.json';
const delay = 400; // Delay in milliseconds between requests

// Headers to be used for the API requests
const headers = {
  'accept': 'application/json, text/plain, */*',
  'accept-language': 'fi-FI',
  'ocp-apim-subscription-key': '2f4955f5db0e42a4888035d0b1629a03',
  'origin': 'https://ajanvaraus.terveystalo.com',
  'priority': 'u=1, i',
  'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-site',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
};

// Function to delay execution for a set amount of time
function delayExecution(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to fetch service details from the API
async function fetchServiceDetails(serviceId) {
  const url = `https://api-prod.api.terveystalo.com/service/v2/v2/services/${serviceId}`;
  
  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Failed to fetch details for service ID: ${serviceId}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching details for service ID: ${serviceId}:`, error);
    return null;
  }
}

// Function to read the service IDs from the input JSON file
function readServiceIdsFromFile() {
  const data = fs.readFileSync(inputFilePath, 'utf8');
  return JSON.parse(data);
}

// Function to append the new service details to the output file
function appendToFile(serviceDetails, serviceId) {
  let existingData = [];

  // Check if the output file already exists and read its content
  if (fs.existsSync(outputFilePath)) {
    existingData = JSON.parse(fs.readFileSync(outputFilePath, 'utf8'));
  }

  // Append new service details
  existingData.push({...serviceDetails, id: serviceId});

  // Save updated data back to the output file
  fs.writeFileSync(outputFilePath, JSON.stringify(existingData, null, 2));
  console.log(`Details saved for service ID: ${serviceId}`);
}

// Main function to fetch and save service details
async function main() {
  const serviceIds = readServiceIdsFromFile();

  // Loop through each service ID, fetch details, and save them
  for (const serviceId of serviceIds) {
    console.log(`Fetching details for service ID: ${serviceId}`);

    const serviceDetails = await fetchServiceDetails(serviceId);
    if (serviceDetails) {
      appendToFile(serviceDetails, serviceId);
    }

    // Wait for 300ms before making the next request
    await delayExecution(delay);
  }

  console.log('All service details have been fetched and saved.');
}

// Run the main function
main();
