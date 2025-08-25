# Patient Management System

Angular 15 application for managing patient data with filtering, sorting, and editing capabilities.

## Getting Started

### Prerequisites
- Node.js 16+
- Angular CLI 15+
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Open `http://localhost:4200` in your browser

### Build for Production
```bash
ng build --prod
```

## API Configuration

The application is configured to work with:
- **Base URL**: `https://mobile.digistat.it/CandidateApi`
- **Authentication**: HTTP Basic Auth (test:TestMePlease!)
- **Endpoints Used**:
    - `GET /Patient/GetList` - Fetch all patients
    - `POST /Patient/Update` - Update patient information

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── patient-list/          # Main patient grid component
│   │   └── patient-modal/         # Patient detail/edit modal
│   ├── models/
│   │   └── filter-config.ts       # Configuration model for filtering patient data
│   │   └── parameter.ts           # Defines parameters for API requests or feature configurations
│   │   └── patient.ts             # Patient model, representing the data structure of a patient
│   │   └── sort-config .ts        # Configuration model for sorting patient data
│   │   └── sort-direction.ts      # Enum or constants for defining sort directions (e.g., ASC/DESC)
│   ├── services/
│   │   └── patient.service.ts     # API communication service
│   ├── app.component.*            # Root component
│   ├── app.module.ts              # Main application module
│   └── app-routing.module.ts      # Routing configuration
├── styles.scss                    # Global styles
└── index.html                     # Application entry point
```
