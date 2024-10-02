const fs = require('fs');

// Base URL for Terveystalo API and service ID
const baseUrl = 'https://www.terveystalo.com/api/specialist/search';
const serviceId = '52dad52f-4d04-405c-812d-aa261dd0c038';
const delay = 300; // Delay in milliseconds

// Function to fetch data from a specific page
async function getPageData(page) {
  const url = `${baseUrl}?twoLetterIsoLanguage=fi&page=${page}&serviceid=${serviceId}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.Specialists;
  } catch (error) {
    console.error(`Error fetching page ${page}:`, error);
    return [];
  }
}

// Function to delay execution for a set amount of time
function delayExecution(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to get all specialists across all pages and save data after each request
async function getAllSpecialists() {
  let currentPage = 1;
  let totalPages = 1;

  // Initialize the JSON file with an empty array if it doesn't exist
  if (!fs.existsSync('specialists.json')) {
    fs.writeFileSync('specialists.json', JSON.stringify([]));
  }

  // Read the existing data from the JSON file (in case we want to resume)
  let allSpecialists = JSON.parse(fs.readFileSync('specialists.json', 'utf8'));

  do {
    console.log(`Fetching page ${currentPage} of ${totalPages}...`);
    
    const specialists = await getPageData(currentPage);

    if (specialists.length > 0) {
      // Append the new specialists to the array
      allSpecialists = allSpecialists.concat(specialists);

      // Write the updated list of specialists to the file
      fs.writeFileSync('specialists.json', JSON.stringify(allSpecialists, null, 2));

      // Calculate the total number of pages on the first request
      if (currentPage === 1) {
        totalPages = Math.ceil(278 / specialists.length); // Adjust based on total results
      }
    }

    currentPage++;

    // Wait for 300ms before making the next request
    await delayExecution(delay);
  } while (currentPage <= totalPages);

  console.log('All specialists fetched and saved to specialists.json');
}

// Main function to execute the script
(async function main() {
  await getAllSpecialists();
})();