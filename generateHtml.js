const fs = require('fs');

// Path to your specialists JSON file
const specialistsFilePath = 'specialists_with_service_names.json';
const outputHtmlPath = 'specialists.html';

// Function to check if a string is a UUID
function isUUID(str) {
  // A UUID is 36 characters long and follows the 8-4-4-4-12 pattern
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Function to load JSON data from a file
function loadJson(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

// Function to extract Finnish data and unique service names
function extractData(specialists) {
  const serviceSet = new Set();
  const processedSpecialists = specialists.map(specialist => {
    // Extract Finnish Title
    const finnishTitle = specialist.Title.find(t => t.TwoLetterISOLanguage === 'fi')?.Value || '';

    // Extract Finnish ShortDescription
    const finnishShortDescription = specialist.ShortDescription.find(sd => sd.TwoLetterISOLanguage === 'fi')?.Value || '';

    // Extract Finnish Presentation
    const finnishPresentation = specialist.Presentation.find(p => p.TwoLetterISOLanguage === 'fi')?.Value || '';

    // Collect service names (ServiceIds) and add to the set for the service list, excluding UUIDs
    const serviceNames = specialist.ServiceIds.filter(sid => {
      // Ensure sid is a string and not a UUID
      return typeof sid === 'string' && sid.trim() !== '' && !isUUID(sid);
    });
    serviceNames.forEach(service => serviceSet.add(service));

    return {
      Id: specialist.Id,
      FirstName: specialist.FirstName,
      LastName: specialist.LastName,
      ImageUri: specialist.ImageUri,
      Title: finnishTitle,
      ShortDescription: finnishShortDescription,
      Presentation: finnishPresentation,
      ServiceIds: serviceNames,
    };
  });

  // Debug: Log the services to check if they're populated correctly
  if (serviceSet.size === 0) {
    console.warn('No services found after filtering. Check if all services are being excluded incorrectly.');
  }

  return {
    specialists: processedSpecialists,
    services: Array.from(serviceSet).sort(),
  };
}

// Function to generate the HTML content
function generateHtml(specialists, services) {
  // Handle the case when no services are available
  if (services.length === 0) {
    return `
      <!DOCTYPE html>
      <html lang="fi">
      <head>
        <meta charset="UTF-8">
        <title>Asiantuntijahaku</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f9f9f9;
          }
          h1 {
            text-align: center;
          }
          .warning {
            color: red;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <h1>Asiantuntijahaku</h1>
        <p class="warning">Ei palveluita saatavilla suodatukseen.</p>
        <div id="specialists-list">
          ${generateSpecialistsHtml(specialists)}
        </div>
      </body>
      </html>
    `;
  }

  // Generate the HTML for the service checkboxes, grouped into columns
  const servicesPerColumn = Math.ceil(services.length / 3) || 1; // Ensure it's at least 1
  const serviceColumns = [[], [], []];
  services.forEach((service, index) => {
    const columnIndex = Math.floor(index / servicesPerColumn);
    serviceColumns[columnIndex].push(`
      <label>
        <input type="checkbox" name="service" value="${service}" onchange="filterSpecialists()">
        ${service}
      </label>
    `);
  });

  const serviceCheckboxesHtml = `
    <div class="service-columns">
      ${serviceColumns.map(column => `<div class="service-column">${column.join('<br>')}</div>`).join('')}
    </div>
  `;

  // Generate the HTML for the specialists
  const specialistsHtml = generateSpecialistsHtml(specialists);

  // JavaScript code for filtering specialists
  const script = `
    <script>
      function filterSpecialists() {
        const checkboxes = document.querySelectorAll('input[name="service"]:checked');
        const selectedServices = Array.from(checkboxes).map(cb => cb.value);
        const specialists = document.querySelectorAll('.specialist');
        
        specialists.forEach(spec => {
          const specServices = spec.getAttribute('data-services').split('|');
          const hasAllSelectedServices = selectedServices.every(svc => specServices.includes(svc));
          const isNoServiceSelected = selectedServices.length === 0;
          const isMatch = isNoServiceSelected || hasAllSelectedServices;
          spec.style.display = isMatch ? '' : 'none';
        });
      }
    </script>
  `;

  // Combine all parts into the final HTML
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fi">
    <head>
      <meta charset="UTF-8">
      <title>Asiantuntijahaku</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          background-color: #f9f9f9;
        }
        h1 {
          text-align: center;
        }
        .service-columns {
          display: flex;
          justify-content: space-between;
        }
        .service-column {
          flex: 1;
          margin: 0 10px;
        }
        .specialist {
          background-color: #fff;
          padding: 15px;
          margin: 15px 0;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .specialist-info {
          display: flex;
        }
        .specialist img {
          max-width: 150px;
          margin-right: 15px;
          border-radius: 5px;
        }
        .specialist-details h3 {
          margin-top: 0;
        }
        .specialist-details p {
          margin: 5px 0;
        }
        #service-filters {
          margin-bottom: 20px;
        }
        label {
          display: block;
          margin-bottom: 5px;
        }
      </style>
    </head>
    <body>
      <h1>Asiantuntijahaku</h1>
      <div id="service-filters">
        <h2>Valitse palvelut</h2>
        ${serviceCheckboxesHtml}
      </div>
      <hr>
      <div id="specialists-list">
        ${specialistsHtml}
      </div>
      ${script}
    </body>
    </html>
  `;

  return htmlContent;
}

// Function to generate specialists HTML
function generateSpecialistsHtml(specialists) {
  return specialists.map(spec => `
    <div class="specialist" data-services="${spec.ServiceIds.join('|')}">
      <div class="specialist-info">
        ${spec.ImageUri ? `<img src="${spec.ImageUri}" alt="${spec.FirstName} ${spec.LastName}">` : ''}
        <div class="specialist-details">
          <h3>${spec.FirstName} ${spec.LastName}</h3>
          <p><strong>${spec.Title}</strong></p>
          <p>${spec.ShortDescription}</p>
          <p>${spec.Presentation}</p>
        </div>
      </div>
      <p><strong>Palvelut:</strong> ${spec.ServiceIds.join(', ')}</p>
    </div>
  `).join('\n');
}

// Main function to execute the script
function main() {
  // Load specialists data
  const specialists = loadJson(specialistsFilePath);

  // Extract Finnish data and unique services
  const { specialists: processedSpecialists, services } = extractData(specialists);

  // Generate HTML content
  const htmlContent = generateHtml(processedSpecialists, services);

  // Write the HTML content to a file
  fs.writeFileSync(outputHtmlPath, htmlContent, 'utf8');

  console.log(`HTML file has been generated at ${outputHtmlPath}`);
}

// Run the script
main();
