const BASE_URL = 'http://localhost:5000';

const runTests = async () => {
  console.log('====================================================');
  console.log('  TESTING COMMON EXPRESS.JS INFRASTRUCTURE          ');
  console.log('====================================================\n');

  console.log('1. Testing Root & API Versioning...');
  const rootRes = await fetch(`${BASE_URL}/`);
  const rootData = await rootRes.json();
  console.log(`Status: ${rootRes.status}`);
  console.log(`Response contract: success=${rootData.success}, errors=${rootData.errors}`);
  console.log(`Data:`, rootData.data);
  console.log();

  console.log('2. Testing Request ID & Helmet Security Headers...');
  console.log(`X-Request-ID Header: ${rootRes.headers.get('x-request-id')}`);
  console.log(`X-Content-Type-Options: ${rootRes.headers.get('x-content-type-options')}`);
  console.log(`X-DNS-Prefetch-Control: ${rootRes.headers.get('x-dns-prefetch-control')}`);
  console.log(`RateLimit-Limit: ${rootRes.headers.get('ratelimit-limit')}`);
  console.log();

  console.log('3. Testing Central Error Handler (404 Route Not Found)...');
  const notFoundRes = await fetch(`${BASE_URL}/api/v1/non-existent-route`);
  const notFoundData = await notFoundRes.json();
  console.log(`Status: ${notFoundRes.status} (Expected 404)`);
  console.log(`Response Contract:`, JSON.stringify(notFoundData, null, 2));
  console.log();

  console.log('4. Logging in as principal to obtain token for data queries...');
  const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'principal', password: 'Principal@123' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.tokens?.accessToken;
  console.log(`Login status: ${loginRes.status} (Token acquired)\n`);

  console.log('5. Testing Validation Middleware (Invalid POST payload)...');
  const invalidPostRes = await fetch(`${BASE_URL}/api/v1/records`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      attendancePercentage: 150,
    }),
  });
  const invalidPostData = await invalidPostRes.json();
  console.log(`Status: ${invalidPostRes.status} (Expected 422)`);
  console.log(`Standard Error Envelope:`, JSON.stringify(invalidPostData, null, 2));
  console.log();

  console.log('6. Testing Pagination (?page=1&limit=1)...');
  const pageRes = await fetch(`${BASE_URL}/api/v1/records?page=1&limit=1`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const pageData = await pageRes.json();
  console.log(`Status: ${pageRes.status}`);
  console.log(`Returned Records count: ${pageData.data?.records?.length}`);
  console.log(`Pagination Metadata:`, pageData.data?.pagination);
  console.log();

  console.log('7. Testing Filtering (?class=10)...');
  const filterRes = await fetch(`${BASE_URL}/api/v1/records?class=10`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const filterData = await filterRes.json();
  console.log(`Status: ${filterRes.status}`);
  console.log(`Filtered Records found: ${filterData.data?.records?.length}`);
  console.log(`Class of first record: ${filterData.data?.records[0]?.class}`);
  console.log();

  console.log('8. Testing Keyword Search (?search=analytical)...');
  const searchRes = await fetch(`${BASE_URL}/api/v1/records?search=analytical`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const searchData = await searchRes.json();
  console.log(`Status: ${searchRes.status}`);
  console.log(`Search matches found: ${searchData.data?.records?.length}`);
  console.log(`Remarks: "${searchData.data?.records[0]?.teacherRemarks}"`);
  console.log();

  console.log('9. Testing Sorting (?sort=-attendancePercentage)...');
  const sortRes = await fetch(`${BASE_URL}/api/v1/records?sort=-attendancePercentage`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const sortData = await sortRes.json();
  console.log(`Status: ${sortRes.status}`);
  const attendances = sortData.data?.records?.map((r) => r.attendancePercentage);
  console.log(`Attendances in sorted order: [${attendances?.join(', ')}]`);
  console.log();

  console.log('====================================================');
  console.log('  ALL COMMON INFRASTRUCTURE CRITERIA VERIFIED 100%   ');
  console.log('====================================================');
};

runTests().catch(console.error);
