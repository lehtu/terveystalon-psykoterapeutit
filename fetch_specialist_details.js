const fs = require('fs');

// Path to your local specialists JSON file
const inputFilePath = 'specialists.json';
const outputFilePath = 'specialists_details.json';
const delay = 300; // Delay in milliseconds

// Function to delay execution for a set amount of time
function delayExecution(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to fetch more information about a specialist from the API with necessary headers
async function getSpecialistDetails(id) {
  const url = `https://api-prod.api.terveystalo.com/specialist/v2/v2/specialists/${id}`;
  
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

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Failed to fetch details for specialist ID: ${id}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching details for specialist ID: ${id}:`, error);
    return null; // Return null in case of an error
  }
}

// Function to read specialists from the input JSON file
function readSpecialistsFromFile() {
  const data = fs.readFileSync(inputFilePath, 'utf8');
  return JSON.parse(data);
}

// Function to append the new specialist details to the output file
function appendToFile(specialistDetails) {
  let existingData = [];

  // Check if the output file already exists, and read its content
  if (fs.existsSync(outputFilePath)) {
    existingData = JSON.parse(fs.readFileSync(outputFilePath, 'utf8'));
  }

  // Append new specialist details
  existingData.push(specialistDetails);

  // Save updated data back to the output file
  fs.writeFileSync(outputFilePath, JSON.stringify(existingData, null, 2));
}

// Main function to read specialists, fetch details, and save them
async function main() {
  const specialists = readSpecialistsFromFile();

  // Loop through each specialist, fetch more details, and save them
  for (const specialist of specialists) {
    console.log(`Fetching details for: ${specialist.FirstName} ${specialist.LastName}`);

    const specialistDetails = await getSpecialistDetails(specialist.Id);
    if (specialistDetails) {
      appendToFile(specialistDetails);
      console.log(`Details fetched and saved for: ${specialist.FirstName} ${specialist.LastName}`);
    }

    // Wait for 300ms before making the next request
    await delayExecution(delay);
  }

  console.log('All specialists details have been fetched and saved.');
}

// Run the main function
main();
