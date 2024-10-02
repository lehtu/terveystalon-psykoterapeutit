const fs = require('fs');

// Paths to your JSON files
const specialistsFilePath = 'specialists_details.json';
const servicesFilePath = 'service_details.json';
const outputFilePath = 'specialists_with_service_names.json';

// Function to load JSON data from a file
function loadJson(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

// Function to map service IDs to Finnish service names
function createServiceIdToNameMap(services) {
  const serviceIdToNameMap = {};
  
  services.forEach(service => {
    const finnishNameObj = service.Name.find(name => name.TwoLetterISOLanguage === 'fi');
    if (finnishNameObj && finnishNameObj.Value) {
      serviceIdToNameMap[service.id] = finnishNameObj.Value;
    }
  });

  return serviceIdToNameMap;
}

// Function to replace service IDs with Finnish service names
function replaceServiceIdsWithNames(specialists, serviceIdToNameMap) {
  return specialists.map(specialist => {
    const updatedServiceIds = specialist.ServiceIds.map(serviceId => {
      return serviceIdToNameMap[serviceId] || serviceId; // Replace with name if available, else keep ID
    });
    return { ...specialist, ServiceIds: updatedServiceIds }; // Update the ServiceIds
  });
}

// Main function to execute the transformation
function main() {
  // Load specialists and services data
  const specialists = loadJson(specialistsFilePath);
  const services = loadJson(servicesFilePath).filter(service => !!service.MasterServices.find(ms => ms.ServiceID === '50fa826b-8e93-4c55-bc2c-988fa3e021cc' || ms.ServiceID === 'd5c76d66-52a0-4ad1-8fdf-59dafc976c97'));

  // Create a map of service IDs to Finnish names
  const serviceIdToNameMap = createServiceIdToNameMap(services);

  // Replace service IDs with Finnish service names in specialists data
  const updatedSpecialists = replaceServiceIdsWithNames(specialists, serviceIdToNameMap);

  // Save the updated specialists data to a new JSON file
  fs.writeFileSync(outputFilePath, JSON.stringify(updatedSpecialists, null, 2));
  console.log(`Specialists with service names have been saved to ${outputFilePath}`);
}

// Run the main function
main();
