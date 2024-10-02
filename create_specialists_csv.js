const fs = require('fs');
const { Parser } = require('json2csv');

// Paths to your JSON and output CSV files
const specialistsFilePath = 'specialists_with_service_names.json';
const outputCsvPath = 'specialists_fi.csv';

// Function to load JSON data from a file
function loadJson(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

// Function to extract relevant Finnish data from the specialist JSON
function extractFinnishData(specialists) {
  return specialists.map(specialist => {
    const finnishTitle = specialist.Title.find(t => t.TwoLetterISOLanguage === 'fi')?.Value || '';
    const finnishShortDescription = specialist.ShortDescription.find(d => d.TwoLetterISOLanguage === 'fi')?.Value || '';
    const finnishPresentation = specialist.Presentation.find(p => p.TwoLetterISOLanguage === 'fi')?.Value || '';

    return {
      Id: specialist.Id,
      FirstName: specialist.FirstName,
      LastName: specialist.LastName,
      Title: finnishTitle,
      ShortDescription: finnishShortDescription,
      Presentation: finnishPresentation,
      ServiceIds: specialist.ServiceIds.join(', ') // Joining array of ServiceIds into a single string
    };
  });
}

// Main function to extract the data and generate the CSV
function main() {
  // Load specialists data
  const specialists = loadJson(specialistsFilePath);

  // Extract Finnish data
  const data = extractFinnishData(specialists);

  // Define the fields for CSV
  const fields = ['Id', 'FirstName', 'LastName', 'Title', 'ShortDescription', 'Presentation', 'ServiceIds'];
  
  // Create a CSV parser
  const json2csvParser = new Parser({ fields });
  
  // Convert JSON to CSV
  const csv = json2csvParser.parse(data);

  // Write the CSV to a file
  fs.writeFileSync(outputCsvPath, csv);
  console.log(`CSV file has been saved to ${outputCsvPath}`);
}

// Run the main function
main();
