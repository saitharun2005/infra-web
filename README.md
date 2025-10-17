# B&G Infrastructures Expense Tracker

A modern React and Firebase expense tracking application designed specifically for infrastructure companies managing electricity poles projects.

## Features

### 🏗️ Site Management
- Create and manage multiple project sites
- Site-specific expense tracking
- Location and description management

### 💰 Expense Categories
Based on your infrastructure company needs, the app includes all major expense categories:

- **Material Purchase** - Construction materials
- **Tools Purchase** - Tools and equipment
- **Wear & Tear Purchase** - Items that degrade over time
- **Labour Account** - Labor costs and wages
- **Staff Account** - Staff-related expenses
- **Machines Rental & Tools Rental** - Equipment rental
- **Repairs** - Repair and maintenance costs
- **Accommodation & Food Expenses** - Lodging and meals
- **Petrol & Diesel Expenses** - Fuel costs
- **Percentages** - Commissions and overheads
- **Losses & Discarded Tools** - Financial losses and unusable tools
- **Misc. Expenses** - Miscellaneous expenses

### 📊 Dashboard & Analytics
- Real-time expense statistics
- Category-wise breakdown
- Recent expenses overview
- Total and average amounts
- Visual charts and summaries

### 🎨 Modern UI/UX
- Consistent theme with gradient backgrounds
- Animated icons throughout the application
- Responsive design for all devices
- Smooth transitions and hover effects
- Glass-morphism design elements

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Firebase Configuration
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Copy your Firebase configuration
4. Update `src/firebase/config.js` with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 3. Firestore Rules
Set up your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // For development only
    }
  }
}
```

### 4. Run the Application
```bash
npm start
```

The application will open at `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   ├── Header.js          # Navigation header
│   ├── SiteSelector.js    # Site selection page
│   ├── Dashboard.js       # Main dashboard
│   ├── ExpenseForm.js     # Add/edit expense form
│   └── ExpenseList.js      # Expenses listing
├── firebase/
│   └── config.js          # Firebase configuration
├── App.js                 # Main app component
├── App.css                # Application styles
├── index.js               # Entry point
└── index.css              # Global styles
```

## Usage

1. **Select Site**: Choose or create a project site
2. **Add Expenses**: Use the comprehensive form to add expenses
3. **View Dashboard**: Monitor expenses and statistics
4. **Manage Expenses**: Edit, delete, and search expenses
5. **Track Categories**: Monitor spending by category

## Technologies Used

- **React 18** - Frontend framework
- **Firebase Firestore** - Database
- **React Router** - Navigation
- **Lucide React** - Icons
- **Framer Motion** - Animations
- **React Hot Toast** - Notifications
- **React Hook Form** - Form handling

## Features Highlights

### Consistent Animations
All icons throughout the application have consistent animations:
- Pulse animation on load
- Scale and rotate on hover
- Smooth transitions
- Drop shadow effects

### Responsive Design
- Mobile-first approach
- Adaptive grid layouts
- Touch-friendly interfaces
- Optimized for all screen sizes

### Data Management
- Real-time data synchronization
- Offline-first approach
- Efficient queries and filtering
- Data validation and error handling

## Customization

The application is designed to be easily customizable:

- **Colors**: Modify the gradient colors in `App.css`
- **Categories**: Add/remove expense categories in components
- **Animations**: Adjust animation timings in `index.css`
- **Layout**: Modify grid layouts and spacing

## Support

For any issues or questions, please refer to the Firebase documentation or React documentation.

---

Built with ❤️ for B&G Infrastructures

