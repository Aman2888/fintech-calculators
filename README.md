# Fintech Calculators

A modern and user-friendly financial calculator platform designed to help users make smarter financial decisions.

## Features

- Loan Calculator
- Loan Payment Calculator
- Loan Interest Calculator
- Loan Amortization Calculator
- Auto Loan Calculator
- HELOC Calculator
- Compound Interest Calculator
- Multiple currency display options
- Responsive design for desktop, tablet, and mobile
- Interactive financial calculations and visualizations

## Getting Started

Follow these steps to run the project locally.

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Aman2888/fintech-calculators.git
   ```

2. Navigate to the project directory:

   ```bash
   cd fintech-calculators
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Configure environment variables.

   If your project uses the Gemini API, create a `.env.local` file in the root directory and add:

   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open your browser and visit:

   `http://localhost:3000`

## Build for Production

To create a production build:

```bash
npm run build
```

To run the production build:

```bash
npm run start
```

## Project Structure

```text
fintech-calculators/
├── public/
├── src/
├── .env.local
├── package.json
├── README.md
└── ...
```

## Security

- Keep API keys and sensitive credentials private.
- Never commit `.env.local` to GitHub.
- Use environment variables for sensitive configuration.

## License

This project is available for personal and educational use.
