/**
 * Sri Vidya E.M High School - Unified Full-Stack Application Server
 * Runs always on Port 5000:
 *   - /                           -> Public Website (frontend/public-website/index.html)
 *   - /platform-admin             -> Platform Admin Portal (frontend/platform-admin/index.html)
 *   - /management                 -> Executive Management Portal (frontend/administration-portal/index.html)
 *   - /teacher                    -> Faculty & Teacher Portal (frontend/faculty-portal/index.html)
 *   - /student                    -> Student Self-Service Portal (frontend/future-portals/student-portal/index.html)
 *   - /parent                     -> Parent & Guardian Portal (frontend/future-portals/parent-portal/index.html)
 *   - /api/v1/*                   -> Complete Backend REST API Suite (Auth, Students, Teachers, Fees, etc.)
 */
process.env.PORT = process.env.PORT || '5000';
require('./backend/src/server.js');
