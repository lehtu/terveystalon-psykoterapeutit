const fs = require('fs');

// Path to your local specialists JSON file
const inputFilePath = 'specialists_details.json';
const outputFilePath = 'distinct_service_ids.json';

// Function to extract all distinct service IDs from the specialists data
function extractDistinctServiceIds(specialists) {
  const serviceIdsSet = new Set(); // Use a set to ensure distinct IDs

  specialists.forEach(specialist => {
    if (specialist.ServiceIds && Array.isArray(specialist.ServiceIds)) {
      specialist.ServiceIds.forEach(serviceId => {
        serviceIdsSet.add(serviceId); // Add each serviceId to the set
      });
    }
  });

  return Array.from(serviceIdsSet); // Convert the set back to an array
}

// Function to read specialists from the input JSON file
function readSpecialistsFromFile() {
  const data = fs.readFileSync(inputFilePath, 'utf8');
  return JSON.parse(data);
}

// Function to save the distinct service IDs to a new file
function saveServiceIdsToFile(serviceIds) {
  fs.writeFileSync(outputFilePath, JSON.stringify(serviceIds, null, 2));
  console.log(`Distinct service IDs have been saved to ${outputFilePath}`);
}

// Main function to extract and save the distinct service IDs
function main() {
  // Read the specialists data from the file
  const specialists = readSpecialistsFromFile();

  // Extract the distinct service IDs
  const distinctServiceIds = extractDistinctServiceIds(specialists);

  // Save the distinct service IDs to the output file
  saveServiceIdsToFile(distinctServiceIds);
}

// Run the main function
main();
