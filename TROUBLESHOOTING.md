# Troubleshooting Guide for BallInfo Application

## Case Sensitivity Issues

There appears to be a problem with case sensitivity in import paths between `backend`/`backEnd` and `frontend`/`frontEnd`. This can cause issues with imports and routing.

## Fix WebSocket Connection Issues

The main error occurs in the backend socket service where it tries to set a read-only property:

```
TypeError: Cannot set property name of #<WebSocket> which has only a getter
```

### Fix with Patch Script

1. Run the patch script to automatically fix the socket service:

```powershell
cd "E:\Muqtasid BS Computer Science\SPRING-25\Project\ballinfo\backend"
node fix-socket.js
```

### Manual Fix (alternative)

1. Open the file `ballinfo/backend/mainServer/services/socketService.js`
2. Find this line (around line 74):
   ```javascript
   socket.conn.transport.name = 'polling';
   ```
3. Replace it with:
   ```javascript
   // Don't modify read-only property
   socket.mobileClient = true;
   ```
4. Also check for any other places where `transport.name` is being set.

## Fix Frontend Dependency Issues

### Fix Missing MUI Dependencies

If you're getting errors about missing `@mui/material` components:

```powershell
cd "E:\Muqtasid BS Computer Science\SPRING-25\Project\ballinfo\frontend"
npm install @mui/material @emotion/react @emotion/styled
```

### Fix FontAwesome Icon Import Issues

If you're getting errors about missing icons like `faBookmarkSolid`:

1. Open the file `ballinfo/frontend/src/components/news/NewsDetail.jsx`
2. Find the import statement with the problematic icon
3. Replace:
   ```javascript
   import { faShare, faBookmark, faBookmarkSolid } from '@fortawesome/free-solid-svg-icons';
   ```
   With:
   ```javascript
   import { faShare, faBookmark, faBookmark as faBookmarkSolid } from '@fortawesome/free-solid-svg-icons';
   ```

## Fix News Page Routing

The "No routes matched location '/news'" error indicates a routing problem.

1. Make sure the App.js file includes the news routes:

```javascript
{/* News Routes */}
<Route path="/news" element={<NewsPage />} />
<Route path="/news/category/:category" element={<NewsPage />} />
<Route path="/news/team/:teamId" element={<NewsPage />} />
<Route path="/news/search" element={<NewsPage />} />
<Route path="/news/article/:id" element={<NewsDetail />} />
```

2. Ensure proper imports in App.js:

```javascript
// Import news components
import NewsPage from './components/news/NewsPage.jsx';
import NewsDetail from './components/news/NewsDetail.jsx';
```

3. Check that the files exist in the correct case-sensitive paths.

## Starting the Application

1. First start the backend server:

```powershell
cd "E:\Muqtasid BS Computer Science\SPRING-25\Project\ballinfo\backend"
npm start
```

2. Then in a new PowerShell window, start the frontend:

```powershell
cd "E:\Muqtasid BS Computer Science\SPRING-25\Project\ballinfo\frontend"
npm start
```

## Additional Troubleshooting

If you still encounter issues:

1. Check the browser console for specific errors
2. Verify that both backend and frontend servers are running
3. Ensure the MongoDB connection is working
4. Check that all required components are properly imported

If connection issues persist, you might need to modify the `socketService.js` on the frontend to be more resilient to failures. 