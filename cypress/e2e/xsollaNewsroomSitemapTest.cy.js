describe('Newsroom sitemap test for Xsolla.com', () => {
    const baseUrl = 'https://xsolla.com'; // Define the webpage being tested
  
    it('Testing the newsroom sitemap registry for the Xsolla website', () => {
      // Request the sitemap file
      cy.request(`${baseUrl}/sitemap/newsroom.xml`)
        .its('body')  // Get the response body (XML content)
        .then((body) => {
          // Parse the XML response body
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(body, 'text/xml');
          
          // Extract all URLs from the <loc> tags and remove duplicates
          const urls = Array.from(xmlDoc.getElementsByTagName('loc'))
            .map((loc) => loc.textContent.trim())
            .filter((url, index, self) => self.indexOf(url) === index); // Deduplicate URLs
  
          // Assert that there are more than 1 URL
          expect(urls).to.have.length.greaterThan(1);
  
          // Array to store URLs that fail
          const failedUrls = [];
  
          // Iterate over all unique URLs
          urls.forEach((url) => {
            cy.log(`Testing URL: ${url}`);  // Log each URL for inspection
  
            cy.request({
              url,
              failOnStatusCode: false, // Prevent test failure on non-2xx status codes
            }).then((response) => {
              if (response.status < 200 || response.status >= 300) {
                cy.log(`URL failed: ${url} (Status: ${response.status})`); // Log failed URL
                failedUrls.push({ url, status: response.status }); // Store failed URL and status
              }
            }).wait(1000, { log: false }); // Add a small delay between requests
          });
  
          // After all requests are complete, log failed URLs
          cy.then(() => {
            if (failedUrls.length > 0) {
              cy.log('The following URLs failed:');
              failedUrls.forEach((item) => {
                cy.log(`URL: ${item.url}, Status: ${item.status}`);
              });
              throw new Error(`Some URLs failed: ${[...new Set(failedUrls.map(item => item.url))].join(', ')}`);
            } else {
              cy.log('All URLs were successfully tested!');
            }
          });
        });
    });
  });